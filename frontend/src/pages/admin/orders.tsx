import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Plus, MoreVertical, CheckCircle2, Loader2 } from "lucide-react";
import { api, formatBRL, type Order, type PaginatedResponse } from "@/lib/api";

export default function Orders() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<Order>>({
    queryKey: ["/api/orders/", { today_only: "true" }],
    queryFn: () => api.getOrders({ today_only: "true" }),
    refetchInterval: 10_000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/orders/"] }),
  });

  const orders = data?.results ?? [];

  const Column = ({ title, status, colorClass }: { title: string; status: string; colorClass: string }) => {
    const columnOrders = orders.filter((o) => o.status === status);

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colorClass}`} />
            <h2 className="font-semibold text-foreground">{title}</h2>
          </div>
          <Badge variant="secondary" className="font-mono">{columnOrders.length}</Badge>
        </div>

        <div className="flex-1 min-h-[500px] bg-secondary/30 rounded-xl p-3 border border-border/50 flex flex-col gap-3">
          {columnOrders.map((order) => (
            <Card key={order.id} className="border border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-display">#{order.display_id}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {order.table_number ? `Mesa ${String(order.table_number).padStart(2, "0")}` : order.origin_display}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1.5">
                    <Clock className="w-3 h-3 mr-1" /> {order.time_elapsed}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  {order.items.map((item) => (
                    <li key={item.id} className="line-clamp-1 flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-border mt-1.5 shrink-0" />
                      {item.quantity}x {item.menu_item_name}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="font-semibold text-sm">{formatBRL(order.total)}</span>

                  {status === "new" && (
                    <Button
                      size="sm"
                      onClick={() => statusMutation.mutate({ id: order.id, status: "preparing" })}
                      className="h-8 text-xs bg-orange-500 hover:bg-orange-600 text-white"
                      disabled={statusMutation.isPending}
                    >
                      Preparar
                    </Button>
                  )}
                  {status === "preparing" && (
                    <Button
                      size="sm"
                      onClick={() => statusMutation.mutate({ id: order.id, status: "ready" })}
                      className="h-8 text-xs bg-green-500 hover:bg-green-600 text-white"
                      disabled={statusMutation.isPending}
                    >
                      Pronto
                    </Button>
                  )}
                  {status === "ready" && (
                    <Button
                      size="sm"
                      onClick={() => statusMutation.mutate({ id: order.id, status: "delivered" })}
                      variant="outline"
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      disabled={statusMutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Entregue
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {columnOrders.length === 0 && (
            <div className="h-32 flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg m-2">
              Nenhum pedido
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Gestão de Pedidos</h1>
          <p className="text-muted-foreground mt-1">Acompanhe e mova os pedidos pelo fluxo.</p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Novo Pedido
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <Column title="Novos Pedidos" status="new" colorClass="bg-blue-500" />
        <Column title="Em Preparo" status="preparing" colorClass="bg-orange-500" />
        <Column title="Prontos" status="ready" colorClass="bg-green-500" />
      </div>
    </div>
  );
}