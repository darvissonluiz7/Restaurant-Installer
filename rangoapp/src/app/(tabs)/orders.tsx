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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../../lib/theme";
import { getOrders, updateOrderStatus } from "../../lib/api";

interface OrderItem {
  id: string;
  menu_item_name?: string;
  quantity: number;
  price: string;
  notes?: string;
}

interface Order {
  id: string;
  display_id: number;
  table: string | null;
  table_number?: number;
  origin: string;
  status: string;
  total: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
}

type FilterStatus = "all" | "new" | "preparing" | "ready" | "delivered" | "cancelled";

const STATUS_FLOW: Record<string, string> = {
  new: "preparing",
  preparing: "ready",
  ready: "delivered",
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("all");

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      const list = Array.isArray(data) ? data : data.results || [];
      setOrders(list);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  function onRefresh() {
    setRefreshing(true);
    fetchOrders();
  }

  async function handleAdvanceStatus(order: Order) {
    const nextStatus = STATUS_FLOW[order.status];
    if (!nextStatus) return;

    const labels: Record<string, string> = {
      preparing: "Preparando",
      ready: "Pronto",
      delivered: "Entregue",
    };

    Alert.alert(
      "Atualizar Pedido",
      `Marcar pedido #${order.display_id} como "${labels[nextStatus]}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              await updateOrderStatus(order.id, nextStatus);
              fetchOrders();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível atualizar o pedido");
            }
          },
        },
      ]
    );
  }

  async function handleCancelOrder(order: Order) {
    Alert.alert(
      "Cancelar Pedido",
      `Deseja cancelar o pedido #${order.display_id}?`,
      [
        { text: "Não", style: "cancel" },
        {
          text: "Cancelar Pedido",
          style: "destructive",
          onPress: async () => {
            try {
              await updateOrderStatus(order.id, "cancelled");
              fetchOrders();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível cancelar o pedido");
            }
          },
        },
      ]
    );
  }

  const filteredOrders = orders.filter(
    (o) => filter === "all" || o.status === filter
  );

  function getStatusColor(status: string): string {
    switch (status) {
      case "new": return Colors.info;
      case "preparing": return Colors.accent;
      case "ready": return Colors.success;
      case "delivered": return Colors.textSecondary;
      case "cancelled": return Colors.error;
      default: return Colors.textLight;
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case "new": return "Novo";
      case "preparing": return "Preparando";
      case "ready": return "Pronto";
      case "delivered": return "Entregue";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  }

  function getNextStatusLabel(status: string): string | null {
    const next = STATUS_FLOW[status];
    if (!next) return null;
    switch (next) {
      case "preparing": return "Iniciar Preparo";
      case "ready": return "Marcar Pronto";
      case "delivered": return "Marcar Entregue";
      default: return null;
    }
  }

  function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function renderOrder({ item: order }: { item: Order }) {
    const nextLabel = getNextStatusLabel(order.status);

    return (
      <View style={styles.orderCard}>
        {/* Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderId}>#{order.display_id}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusLabel(order.status)}
              </Text>
            </View>
          </View>
          <View style={styles.orderHeaderRight}>
            <Text style={styles.orderTime}>{formatTime(order.created_at)}</Text>
            <Text style={styles.orderOrigin}>
              {order.origin === "table"
                ? `Mesa ${order.table_number || "?"}`
                : order.origin === "delivery"
                ? "Delivery"
                : "Balcão"}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.orderItems}>
          {order.items?.map((item, idx) => (
            <View key={idx} style={styles.orderItemRow}>
              <Text style={styles.itemQty}>{item.quantity}x</Text>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.menu_item_name || "Item"}
              </Text>
              <Text style={styles.itemPrice}>
                R$ {parseFloat(item.price).toFixed(2).replace(".", ",")}
              </Text>
            </View>
          ))}
        </View>

        {order.notes ? (
          <View style={styles.notesContainer}>
            <Ionicons name="chatbubble-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.orderFooter}>
          <Text style={styles.orderTotal}>
            Total: R$ {parseFloat(order.total).toFixed(2).replace(".", ",")}
          </Text>

          <View style={styles.orderActions}>
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelOrder(order)}
              >
                <Ionicons name="close" size={18} color={Colors.error} />
              </TouchableOpacity>
            )}

            {nextLabel && (
              <TouchableOpacity
                style={[
                  styles.advanceButton,
                  { backgroundColor: getStatusColor(STATUS_FLOW[order.status]) },
                ]}
                onPress={() => handleAdvanceStatus(order)}
              >
                <Ionicons name="arrow-forward" size={16} color={Colors.white} />
                <Text style={styles.advanceText}>{nextLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const filters: { key: FilterStatus; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: orders.length },
    { key: "new", label: "Novos", count: orders.filter((o) => o.status === "new").length },
    { key: "preparing", label: "Preparo", count: orders.filter((o) => o.status === "preparing").length },
    { key: "ready", label: "Prontos", count: orders.filter((o) => o.status === "ready").length },
    { key: "delivered", label: "Entregues", count: orders.filter((o) => o.status === "delivered").length },
  ];

  return (
    <View style={styles.container}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingHorizontal: Spacing.md, gap: Spacing.sm }}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                filter === f.key && styles.filterChipActive,
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === f.key && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
              {f.count > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    filter === f.key && styles.filterBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      filter === f.key && styles.filterBadgeTextActive,
                    ]}
                  >
                    {f.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color={Colors.textLight} />
            <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  filterBar: {
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceVariant,
    gap: Spacing.xs,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  filterBadge: {
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  filterBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  filterBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  filterBadgeTextActive: {
    color: Colors.white,
  },
  list: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  orderId: {
    fontSize: FontSize.xl,
    fontWeight: "800",
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.white,
  },
  orderHeaderRight: {
    alignItems: "flex-end",
  },
  orderTime: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
  },
  orderOrigin: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceVariant,
    paddingTop: Spacing.sm,
    gap: 4,
  },
  orderItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  itemQty: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.primary,
    width: 30,
  },
  itemName: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  itemPrice: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.sm,
  },
  notesText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceVariant,
  },
  orderTotal: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.text,
  },
  orderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.errorLight,
    justifyContent: "center",
    alignItems: "center",
  },
  advanceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  advanceText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.white,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
  },
});
