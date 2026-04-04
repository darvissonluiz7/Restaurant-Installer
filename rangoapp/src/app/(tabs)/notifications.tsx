import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  AppState,
  AppStateStatus,
  Vibration,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../../lib/theme";
import { getOrders, getWaiterCalls, acknowledgeWaiterCall } from "../../lib/api";

interface Notification {
  id: string;
  type: "new_order" | "payment" | "waiter_call";
  title: string;
  message: string;
  time: Date;
  read: boolean;
  data?: any;
}

interface WaiterCall {
  id: string;
  table_number?: number;
  table: { number: number };
  status: string;
  created_at: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastOrderCountRef = useRef<number | null>(null);
  const lastWaiterCountRef = useRef<number | null>(null);
  const appState = useRef(AppState.currentState);

  const checkForNewEvents = useCallback(async () => {
    try {
      const [ordersData, waiterData] = await Promise.all([
        getOrders({ today_only: true }),
        getWaiterCalls(true),
      ]);

      const orders = Array.isArray(ordersData) ? ordersData : ordersData.results || [];
      const waiterCalls: WaiterCall[] = Array.isArray(waiterData) ? waiterData : waiterData.results || [];

      const newNotifications: Notification[] = [];

      // Detectar novos pedidos
      const newOrders = orders.filter((o: any) => o.status === "new");
      if (lastOrderCountRef.current !== null && newOrders.length > lastOrderCountRef.current) {
        const diff = newOrders.length - lastOrderCountRef.current;
        for (let i = 0; i < diff; i++) {
          const order = newOrders[i];
          newNotifications.push({
            id: `order-${order.id}-${Date.now()}`,
            type: "new_order",
            title: "Novo Pedido!",
            message: `Pedido #${order.display_id} - ${
              order.origin === "table"
                ? `Mesa ${order.table_number || "?"}`
                : order.origin === "delivery"
                ? "Delivery"
                : "Balcão"
            } - R$ ${parseFloat(order.total).toFixed(2).replace(".", ",")}`,
            time: new Date(order.created_at),
            read: false,
            data: order,
          });
        }
      }
      lastOrderCountRef.current = newOrders.length;

      // Detectar pagamentos (pedidos entregues)
      const deliveredOrders = orders.filter((o: any) => o.status === "delivered");
      // Gerar notificações de pagamento dos últimos pedidos entregues recentemente
      deliveredOrders.slice(0, 3).forEach((order: any) => {
        const orderTime = new Date(order.updated_at || order.created_at);
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (orderTime > fiveMinAgo) {
          const existingId = `payment-${order.id}`;
          if (!notifications.find((n) => n.id === existingId)) {
            newNotifications.push({
              id: existingId,
              type: "payment",
              title: "Pagamento Recebido",
              message: `Pedido #${order.display_id} - R$ ${parseFloat(order.total)
                .toFixed(2)
                .replace(".", ",")}`,
              time: orderTime,
              read: false,
              data: order,
            });
          }
        }
      });

      // Chamados de garçom pendentes
      if (lastWaiterCountRef.current !== null && waiterCalls.length > lastWaiterCountRef.current) {
        const diff = waiterCalls.length - lastWaiterCountRef.current;
        for (let i = 0; i < diff; i++) {
          const call = waiterCalls[i];
          newNotifications.push({
            id: `waiter-${call.id}`,
            type: "waiter_call",
            title: "Chamado de Garçom",
            message: `Mesa ${call.table_number || call.table?.number || "?"} está chamando`,
            time: new Date(call.created_at),
            read: false,
            data: call,
          });
        }
      }
      lastWaiterCountRef.current = waiterCalls.length;

      // Para o carregamento inicial, mostrar os pedidos de hoje como histórico
      if (notifications.length === 0 && newNotifications.length === 0) {
        const historyNotifications: Notification[] = [];

        orders.slice(0, 20).forEach((order: any) => {
          historyNotifications.push({
            id: `order-history-${order.id}`,
            type: order.status === "delivered" ? "payment" : "new_order",
            title:
              order.status === "delivered"
                ? "Pagamento Recebido"
                : "Novo Pedido",
            message: `Pedido #${order.display_id} - ${
              order.origin === "table"
                ? `Mesa ${order.table_number || "?"}`
                : order.origin === "delivery"
                ? "Delivery"
                : "Balcão"
            } - R$ ${parseFloat(order.total).toFixed(2).replace(".", ",")}`,
            time: new Date(order.created_at),
            read: true,
            data: order,
          });
        });

        waiterCalls.forEach((call: WaiterCall) => {
          historyNotifications.push({
            id: `waiter-history-${call.id}`,
            type: "waiter_call",
            title: "Chamado de Garçom",
            message: `Mesa ${call.table_number || call.table?.number || "?"} está chamando`,
            time: new Date(call.created_at),
            read: call.status === "acknowledged",
            data: call,
          });
        });

        historyNotifications.sort((a, b) => b.time.getTime() - a.time.getTime());
        setNotifications(historyNotifications);
      }

      if (newNotifications.length > 0) {
        Vibration.vibrate([0, 250, 100, 250]);
        setNotifications((prev) => [...newNotifications, ...prev]);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [notifications]);

  useEffect(() => {
    checkForNewEvents();
    const interval = setInterval(checkForNewEvents, 10000); // Poll a cada 10s

    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        checkForNewEvents();
      }
      appState.current = nextState;
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  function onRefresh() {
    setRefreshing(true);
    checkForNewEvents();
  }

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function handleAcknowledgeWaiter(notification: Notification) {
    if (notification.type !== "waiter_call" || !notification.data?.id) return;
    try {
      await acknowledgeWaiterCall(notification.data.id);
      markAsRead(notification.id);
      Alert.alert("Sucesso", "Chamado atendido!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atender o chamado");
    }
  }

  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "Agora";
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return date.toLocaleDateString("pt-BR");
  }

  function getTypeIcon(type: string): string {
    switch (type) {
      case "new_order": return "receipt";
      case "payment": return "card";
      case "waiter_call": return "hand-left";
      default: return "notifications";
    }
  }

  function getTypeColor(type: string): string {
    switch (type) {
      case "new_order": return Colors.info;
      case "payment": return Colors.success;
      case "waiter_call": return Colors.accent;
      default: return Colors.textSecondary;
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerCount}>
            {unreadCount > 0 ? `${unreadCount} não lidas` : "Tudo lido ✓"}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={60} color={Colors.textLight} />
            <Text style={styles.emptyText}>Nenhuma notificação</Text>
            <Text style={styles.emptySubtext}>
              As notificações de novos pedidos e pagamentos aparecerão aqui
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.notifCard,
              !item.read && styles.notifCardUnread,
            ]}
            onPress={() => {
              markAsRead(item.id);
              if (item.type === "waiter_call" && item.data?.status !== "acknowledged") {
                handleAcknowledgeWaiter(item);
              }
            }}
          >
            <View
              style={[
                styles.notifIcon,
                { backgroundColor: getTypeColor(item.type) + "20" },
              ]}
            >
              <Ionicons
                name={getTypeIcon(item.type) as any}
                size={22}
                color={getTypeColor(item.type)}
              />
            </View>
            <View style={styles.notifContent}>
              <View style={styles.notifHeader}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifTime}>{formatTimeAgo(item.time)}</Text>
              </View>
              <Text style={styles.notifMessage} numberOfLines={2}>
                {item.message}
              </Text>
              {item.type === "waiter_call" && item.data?.status !== "acknowledged" && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleAcknowledgeWaiter(item)}
                >
                  <Ionicons name="checkmark" size={16} color={Colors.white} />
                  <Text style={styles.actionBtnText}>Atender</Text>
                </TouchableOpacity>
              )}
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
      />
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
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  headerCount: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
  },
  markAllText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.primary,
  },
  list: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  notifCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  notifCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    backgroundColor: "#FFF8F8",
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  notifContent: { flex: 1 },
  notifHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  notifTitle: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.text,
  },
  notifTime: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  notifMessage: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginTop: Spacing.xs,
  },
  actionBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.white,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: Spacing.xxl * 2,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
});
