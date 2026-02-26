import { useParams } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Receipt,
  Loader2,
  Clock,
  CheckCircle2,
  CreditCard,
  Banknote,
  QrCode,
  ChefHat,
  Package,
  XCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api, formatBRL, type Order, type BillData } from "@/lib/api";
import CustomerShell from "@/components/usuario/CustomerShell";
import { useState } from "react";

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  new: { label: "Novo", icon: Clock, color: "text-blue-600" },
  preparing: { label: "Preparando", icon: ChefHat, color: "text-orange-600" },
  ready: { label: "Pronto", icon: Package, color: "text-green-600" },
  delivered: { label: "Entregue", icon: CheckCircle2, color: "text-emerald-600" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "text-red-600" },
};

export default function CustomerBill() {
  const { tableId } = useParams();
  const tableNumber = parseInt(tableId || "0", 10);
  const [billData, setBillData] = useState<BillData | null>(null);
  const [requested, setRequested] = useState(false);

  const billMutation = useMutation({
    mutationFn: () => api.customerRequestBill(tableNumber),
    onSuccess: (data) => {
      setBillData(data);
      setRequested(true);
      toast({ title: "Conta Solicitada!", description: "O garçom trará a maquininha." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível solicitar a conta.", variant: "destructive" });
    },
  });

  const billTotal = billData ? parseFloat(billData.total) : 0;

  return (
    <CustomerShell activeId="bill" title="Pedir Conta" titleIcon={<Receipt className="w-5 h-5 lg:hidden" />}>
      <main className="max-w-lg mx-auto px-4 py-10">
        <div className="space-y-8">
          {/* Header illustration */}
          <div className="text-center space-y-4">
            <div className={`mx-auto w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 ${
              requested
                ? "bg-green-100 border-4 border-green-300"
                : "bg-emerald-50 border-4 border-emerald-200"
            }`}>
              {requested ? (
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              ) : (
                <Receipt className="w-12 h-12 text-emerald-500" />
              )}
            </div>

            {requested ? (
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-green-700">Conta Solicitada!</h1>
                <p className="text-muted-foreground">O garçom trará a maquininha até sua mesa.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Hora de fechar a conta?</h1>
                <p className="text-muted-foreground">
                  Solicite a conta e o garçom trará a maquininha para pagamento.
                </p>
              </div>
            )}
          </div>

          {/* Bill details */}
          {billData && billData.orders.length > 0 && (
            <Card className="border-border/40 shadow-sm">
              <CardContent className="p-0">
                <div className="p-4 border-b border-border/30">
                  <h3 className="font-semibold text-sm">Resumo dos Pedidos</h3>
                </div>
                <div className="divide-y divide-border/30">
                  {billData.orders.map(order => {
                    const sc = statusConfig[order.status] || statusConfig.new;
                    const StatusIcon = sc.icon;
                    return (
                      <div key={order.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-3.5 h-3.5 ${sc.color}`} />
                            <span className={`text-xs font-semibold ${sc.color}`}>{sc.label}</span>
                            <span className="text-xs text-muted-foreground">#{order.display_id}</span>
                          </div>
                          <span className="font-semibold text-sm">{formatBRL(order.total)}</span>
                        </div>
                        <div className="space-y-1">
                          {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                              <span>{item.menu_item_emoji || "🍽️"} {item.menu_item_name} x{item.quantity}</span>
                              <span>{formatBRL(item.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Total */}
                <div className="p-4 bg-secondary/30 border-t border-border/30 flex items-center justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">{formatBRL(billTotal)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No orders */}
          {billData && billData.orders.length === 0 && (
            <Card className="border-dashed border-2 border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Receipt className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">Nenhum pedido em aberto</p>
                <p className="text-xs mt-1">Faça um pedido no cardápio primeiro</p>
              </CardContent>
            </Card>
          )}

          {/* Request button */}
          <Button
            size="lg"
            className={`w-full h-16 text-lg font-bold rounded-2xl shadow-lg transition-all ${
              requested
                ? "bg-green-600 hover:bg-green-700 shadow-green-200"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
            }`}
            onClick={() => billMutation.mutate()}
            disabled={billMutation.isPending}
          >
            {billMutation.isPending ? (
              <Loader2 className="w-6 h-6 mr-3 animate-spin" />
            ) : requested ? (
              <CheckCircle2 className="w-6 h-6 mr-3" />
            ) : (
              <Receipt className="w-6 h-6 mr-3" />
            )}
            {billMutation.isPending
              ? "Carregando..."
              : requested
              ? "Solicitar Novamente"
              : "Solicitar Conta"}
          </Button>

          {/* Payment methods info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Formas de Pagamento</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: CreditCard, label: "Cartão" },
                { icon: Banknote, label: "Dinheiro" },
                { icon: QrCode, label: "Pix" },
              ].map(({ icon: Icon, label }) => (
                <Card key={label} className="border-border/30">
                  <CardContent className="flex flex-col items-center justify-center py-4 gap-2">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </CustomerShell>
  );
}
