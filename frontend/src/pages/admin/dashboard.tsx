import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Users, ShoppingBag, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, formatBRL, type DashboardData } from "@/lib/api";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard/"],
    queryFn: api.getDashboard,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Erro ao carregar dashboard.
      </div>
    );
  }

  const stats = [
    { title: "Vendas de Hoje", value: formatBRL(data.today_revenue), icon: DollarSign },
    { title: "Pedidos Feitos", value: String(data.today_orders), icon: ShoppingBag },
    { title: "Mesas Ocupadas", value: `${data.tables_occupied} / ${data.tables_total}`, icon: Users },
    { title: "Tempo Médio", value: `${data.avg_time_minutes} min`, icon: Clock },
  ];

  const statusColorMap: Record<string, string> = {
    Novo: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
    Preparando: "bg-orange-100 text-orange-700 dark:bg-orange-900/30",
    Pronto: "bg-green-100 text-green-700 dark:bg-green-900/30",
    Entregue: "bg-gray-100 text-gray-700 dark:bg-gray-800",
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Bem-vindo de volta, aqui está o resumo de hoje.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25" onClick={() => setLocation("/admin/orders")}>
          + Novo Pedido
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pedidos Recentes</CardTitle>
                <CardDescription>Acompanhe o fluxo da cozinha em tempo real.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setLocation("/admin/orders")}>Ver todos</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 rounded-lg">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg font-medium">Pedido</th>
                    <th className="px-4 py-3 font-medium">Local</th>
                    <th className="px-4 py-3 font-medium">Itens</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 rounded-r-lg font-medium">Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_orders.map((order) => (
                    <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">#{order.display_id}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {order.table_number ? `Mesa ${String(order.table_number).padStart(2, "0")}` : order.origin_display}
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">
                        {order.items.map((i) => `${i.quantity}x ${i.menu_item_name}`).join(", ")}
                      </td>
                      <td className="px-4 py-3 font-medium">{formatBRL(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColorMap[order.status_display] || "bg-gray-100 text-gray-700"}`}>
                          {order.status_display}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {order.time_elapsed}
                      </td>
                    </tr>
                  ))}
                  {data.recent_orders.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum pedido hoje.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Pratos Populares</CardTitle>
            <CardDescription>Mais vendidos hoje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.popular_items.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Sem dados ainda hoje.</p>
            )}
            {data.popular_items.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
                    {item.emoji || (i + 1)}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.sales} pedidos</p>
                  </div>
                </div>
                <div className="text-sm font-medium">{formatBRL(item.revenue)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}