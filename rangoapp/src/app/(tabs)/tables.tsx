import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../../lib/theme";
import {
  getTables,
  createTable,
  updateTableStatus,
  deleteTable,
} from "../../lib/api";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
  occupied_by: number | null;
  current_amount?: string;
  reservation_time?: string;
}

const STATUS_COLORS: Record<string, string> = {
  free: Colors.success,
  occupied: Colors.primary,
  reserved: Colors.accent,
  cleaning: Colors.info,
};

const STATUS_LABELS: Record<string, string> = {
  free: "Livre",
  occupied: "Ocupada",
  reserved: "Reservada",
  cleaning: "Limpeza",
};

const STATUS_BG: Record<string, string> = {
  free: Colors.successLight,
  occupied: Colors.errorLight,
  reserved: Colors.warningLight,
  cleaning: Colors.infoLight,
};

export default function TablesScreen() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("4");

  const fetchTables = useCallback(async () => {
    try {
      const data = await getTables();
      const list = Array.isArray(data) ? data : data.results || [];
      setTables(list.sort((a: Table, b: Table) => a.number - b.number));
    } catch (error) {
      console.error("Erro ao carregar mesas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 15000);
    return () => clearInterval(interval);
  }, [fetchTables]);

  function onRefresh() {
    setRefreshing(true);
    fetchTables();
  }

  async function handleCreateTable() {
    const num = parseInt(newTableNumber);
    if (!num || num < 1) {
      Alert.alert("Erro", "Número da mesa inválido");
      return;
    }

    try {
      await createTable({
        number: num,
        capacity: parseInt(newTableCapacity) || 4,
      });
      setShowModal(false);
      setNewTableNumber("");
      setNewTableCapacity("4");
      fetchTables();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível criar a mesa");
    }
  }

  function handleChangeStatus(table: Table) {
    const statuses = ["free", "occupied", "reserved", "cleaning"];
    const options = statuses
      .filter((s) => s !== table.status)
      .map((s) => ({
        text: STATUS_LABELS[s].replace(/^[^ ]+ /, ""),
        onPress: async () => {
          try {
            await updateTableStatus(table.id, s);
            fetchTables();
          } catch (error) {
            Alert.alert("Erro", "Não foi possível atualizar o status");
          }
        },
      }));

    Alert.alert(
      `Mesa ${table.number}`,
      `Status atual: ${STATUS_LABELS[table.status]}`,
      [...options, { text: "Cancelar", style: "cancel" } as any]
    );
  }

  function handleDeleteTable(table: Table) {
    Alert.alert("Remover Mesa", `Remover mesa ${table.number}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTable(table.id);
            fetchTables();
          } catch (error) {
            Alert.alert("Erro", "Não foi possível remover a mesa");
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Summary
  const summary = {
    total: tables.length,
    free: tables.filter((t) => t.status === "free").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
  };

  return (
    <View style={styles.container}>
      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{summary.total}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: Colors.success }]}>
            {summary.free}
          </Text>
          <Text style={styles.summaryLabel}>Livres</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: Colors.primary }]}>
            {summary.occupied}
          </Text>
          <Text style={styles.summaryLabel}>Ocupadas</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: Colors.accent }]}>
            {summary.reserved}
          </Text>
          <Text style={styles.summaryLabel}>Reservadas</Text>
        </View>
      </View>

      <FlatList
        data={tables}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="grid-outline" size={60} color={Colors.textLight} />
            <Text style={styles.emptyText}>Nenhuma mesa cadastrada</Text>
          </View>
        }
        renderItem={({ item: table }) => (
          <TouchableOpacity
            style={[
              styles.tableCard,
              { backgroundColor: STATUS_BG[table.status] || Colors.surface },
            ]}
            onPress={() => handleChangeStatus(table)}
            onLongPress={() => handleDeleteTable(table)}
          >
            <View
              style={[
                styles.tableNumberBadge,
                { backgroundColor: STATUS_COLORS[table.status] || Colors.textLight },
              ]}
            >
              <Text style={styles.tableNumber}>{table.number}</Text>
            </View>
            <Text style={styles.tableStatus}>
              {STATUS_LABELS[table.status] || table.status}
            </Text>
            <Text style={styles.tableCapacity}>
              <Ionicons name="people-outline" size={12} color={Colors.textSecondary} />{" "}
              {table.capacity} lugares
            </Text>
            {table.current_amount && parseFloat(table.current_amount) > 0 && (
              <Text style={styles.tableAmount}>
                R$ {parseFloat(table.current_amount).toFixed(2).replace(".", ",")}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>

      {/* Create Table Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Mesa</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Número da Mesa *</Text>
            <TextInput
              style={styles.fieldInput}
              value={newTableNumber}
              onChangeText={setNewTableNumber}
              placeholder="Ex: 1"
              keyboardType="number-pad"
            />

            <Text style={styles.fieldLabel}>Capacidade</Text>
            <TextInput
              style={styles.fieldInput}
              value={newTableCapacity}
              onChangeText={setNewTableCapacity}
              placeholder="4"
              keyboardType="number-pad"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleCreateTable}>
              <Text style={styles.saveButtonText}>Criar Mesa</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  summaryBar: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: { alignItems: "center" },
  summaryNum: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  grid: { padding: Spacing.md, paddingBottom: 100 },
  gridRow: { gap: Spacing.sm, marginBottom: Spacing.sm },
  tableCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    gap: Spacing.xs,
    minHeight: 140,
    justifyContent: "center",
  },
  tableNumberBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  tableNumber: {
    fontSize: FontSize.xl,
    fontWeight: "800",
    color: Colors.white,
  },
  tableStatus: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
  },
  tableCapacity: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  tableAmount: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 2,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyContainer: { alignItems: "center", paddingTop: Spacing.xxl * 2, gap: Spacing.md },
  emptyText: { fontSize: FontSize.lg, color: Colors.textSecondary },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: { fontSize: FontSize.xxl, fontWeight: "700", color: Colors.text },
  fieldLabel: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  fieldInput: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  saveButtonText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: "700" },
});
