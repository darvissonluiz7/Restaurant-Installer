import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../../lib/theme";
import { getDashboard, getOrders } from "../../lib/api";

const screenWidth = Dimensions.get("window").width;
const STAT_CARD_WIDTH = (screenWidth - 16 * 2 - 8) / 2 - 1;

type Period = "today" | "week" | "month";

interface DashboardData {
  revenue: number;
  orders_count: number;
  tables_occupied: number;
  tables_total: number;
  popular_items: Array<{ name: string; count: number; emoji?: string }>;
  recent_orders: Array<any>;
}

interface OrderData {
  id: string;
  display_id: number;
  total: string;
  status: string;
  created_at: string;
  origin: string;
}

export default function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [allOrders, setAllOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>("today");

  const fetchData = useCallback(async () => {
    try {
      const [dashboard, orders] = await Promise.all([
        getDashboard(),
        getOrders(),
      ]);
      setData(dashboard);
      setAllOrders(Array.isArray(orders) ? orders : orders.results || []);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Polling a cada 30s
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  function onRefresh() {
    setRefreshing(true);
    fetchData();
  }

  // Calcular métricas por período
  function getFilteredOrders(): OrderData[] {
    const now = new Date();
    return allOrders.filter((order) => {
      const orderDate = new Date(order.created_at);
      if (period === "today") {
        return orderDate.toDateString() === now.toDateString();
      } else if (period === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo;
      } else {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return orderDate >= monthAgo;
      }
    });
  }

  function calcRevenue(): number {
    if (period === "today" && data?.revenue) return data.revenue;
    const filtered = getFilteredOrders();
    return filtered.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);
  }

  function calcOrdersCount(): number {
    if (period === "today" && data?.orders_count) return data.orders_count;
    return getFilteredOrders().length;
  }

  function calcAvgTicket(): number {
    const revenue = calcRevenue();
    const count = calcOrdersCount();
    return count > 0 ? revenue / count : 0;
  }

  function formatCurrency(value: number): string {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  }

  function getPeriodLabel(): string {
    switch (period) {
      case "today":
        return "Hoje";
      case "week":
        return "Esta Semana";
      case "month":
        return "Este Mês";
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  const revenue = calcRevenue();
  const ordersCount = calcOrdersCount();
  const avgTicket = calcAvgTicket();
  const deliveredOrders = getFilteredOrders().filter(
    (o) => o.status === "delivered"
  );
  const cancelledOrders = getFilteredOrders().filter(
    (o) => o.status === "cancelled"
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(["today", "week", "month"] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.periodButton,
              period === p && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === p && styles.periodButtonTextActive,
              ]}
            >
              {p === "today" ? "Hoje" : p === "week" ? "Semana" : "Mês"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Revenue Card - Hero */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>
          Faturamento {getPeriodLabel()}
        </Text>
        <Text style={styles.heroValue}>{formatCurrency(revenue)}</Text>
        <View style={styles.heroSubRow}>
          <View style={styles.heroSubItem}>
            <Ionicons name="receipt-outline" size={16} color={Colors.white} />
            <Text style={styles.heroSubText}>
              {ordersCount} pedidos
            </Text>
          </View>
          <View style={styles.heroSubItem}>
            <Ionicons name="pricetag-outline" size={16} color={Colors.white} />
            <Text style={styles.heroSubText}>
              Ticket médio: {formatCurrency(avgTicket)}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: Colors.successLight }]}>
          <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
          <Text style={styles.statValue}>{deliveredOrders.length}</Text>
          <Text style={styles.statLabel}>Entregues</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: Colors.errorLight }]}>
          <Ionicons name="close-circle" size={28} color={Colors.error} />
          <Text style={styles.statValue}>{cancelledOrders.length}</Text>
          <Text style={styles.statLabel}>Cancelados</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: Colors.infoLight }]}>
          <Ionicons name="people" size={28} color={Colors.info} />
          <Text style={styles.statValue}>
            {data?.tables_occupied || 0}/{data?.tables_total || 0}
          </Text>
          <Text style={styles.statLabel}>Mesas</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: Colors.warningLight }]}>
          <Ionicons name="trending-up" size={28} color="#D4A017" />
          <Text style={styles.statValue}>
            {ordersCount > 0
              ? `${((deliveredOrders.length / ordersCount) * 100).toFixed(0)}%`
              : "0%"}
          </Text>
          <Text style={styles.statLabel}>Conversão</Text>
        </View>
      </View>

      {/* Itens Populares */}
      {data?.popular_items && data.popular_items.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="flame" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Itens Mais Vendidos</Text>
          </View>
          {data.popular_items.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.popularItem}>
              <View style={styles.popularRank}>
                <Text style={styles.popularRankText}>#{index + 1}</Text>
              </View>
              <Ionicons name="restaurant-outline" size={20} color={Colors.primary} />
              <Text style={styles.popularName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.popularCountBadge}>
                <Text style={styles.popularCountText}>{item.count}x</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Pedidos Recentes */}
      {data?.recent_orders && data.recent_orders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="time" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Pedidos Recentes</Text>
          </View>
          {data.recent_orders.slice(0, 5).map((order: any, index: number) => (
            <View key={index} style={styles.recentOrder}>
              <View style={styles.recentOrderLeft}>
                <Text style={styles.recentOrderId}>
                  #{order.display_id}
                </Text>
                <Text style={styles.recentOrderOrigin}>
                  {order.origin === "table"
                    ? `Mesa ${order.table_number || "?"}`
                    : order.origin === "delivery"
                    ? "Delivery"
                    : "Balcão"}
                </Text>
              </View>
              <View style={styles.recentOrderRight}>
                <Text style={styles.recentOrderTotal}>
                  R$ {parseFloat(order.total).toFixed(2).replace(".", ",")}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusColor(order.status),
                    },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {getStatusLabel(order.status)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case "new":
      return Colors.info;
    case "preparing":
      return Colors.accent;
    case "ready":
      return Colors.success;
    case "delivered":
      return Colors.textSecondary;
    case "cancelled":
      return Colors.error;
    default:
      return Colors.textLight;
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "new":
      return "Novo";
    case "preparing":
      return "Preparando";
    case "ready":
      return "Pronto";
    case "delivered":
      return "Entregue";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  periodButtonTextActive: {
    color: Colors.white,
  },
  heroCard: {
    backgroundColor: Colors.secondaryDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  heroLabel: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    fontWeight: "500",
  },
  heroValue: {
    fontSize: FontSize.display,
    fontWeight: "800",
    color: Colors.white,
    marginTop: Spacing.xs,
  },
  heroSubRow: {
    flexDirection: "row",
    marginTop: Spacing.md,
    gap: Spacing.lg,
  },
  heroSubItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  heroSubText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    width: STAT_CARD_WIDTH,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  popularItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
    gap: Spacing.sm,
  },
  popularRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  popularRankText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  popularName: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: "500",
  },
  popularCountBadge: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  popularCountText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  recentOrder: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
  },
  recentOrderLeft: {
    gap: 2,
  },
  recentOrderId: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  recentOrderOrigin: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  recentOrderRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  recentOrderTotal: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.white,
  },
});
