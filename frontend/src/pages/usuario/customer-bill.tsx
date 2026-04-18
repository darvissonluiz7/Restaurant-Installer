import { useParams } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
  Copy,
  Bell,
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

type PaymentMethod = "cartao" | "dinheiro" | "pix" | null;

// Pix key do restaurante — pode ser configurado
const PIX_KEY = "restopro@email.com";
const PIX_BENEFICIARY = "Zenny Food Restaurante";

export default function CustomerBill() {
  const { tableId } = useParams();
  const tableNumber = parseInt(tableId || "0", 10);
  const [billData, setBillData] = useState<BillData | null>(null);
  const [requested, setRequested] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);

  const billMutation = useMutation({
    mutationFn: () => api.customerRequestBill(tableNumber),
    onSuccess: (data) => {
      setBillData(data);
      setRequested(true);
      toast({ title: "Conta Solicitada!", description: "Escolha a forma de pagamento abaixo." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível solicitar a conta.", variant: "destructive" });
    },
  });

  const callWaiterMutation = useMutation({
    mutationFn: () => api.customerCallWaiter(tableNumber),
    onSuccess: () => {
      setWaiterCalled(true);
      toast({ title: "Garçom Chamado! 🔔", description: "Um atendente virá até a sua mesa em breve." });
    },
    onError: (err: any) => {
      const msg = err?.message?.includes("409")
        ? "Já existe uma chamada pendente para sua mesa."
        : "Não foi possível chamar o garçom.";
      setWaiterCalled(true); // still show as called even if 409 (already pending)
      toast({ title: "Aviso", description: msg, variant: "destructive" });
    },
  });

  const handleSelectPayment = (method: PaymentMethod) => {
    setSelectedPayment(method);
    if (method === "cartao" || method === "dinheiro") {
      setWaiterCalled(false);
      callWaiterMutation.mutate();
    }
  };

  const billTotal = billData ? parseFloat(billData.total) : 0;

  const copyPixKey = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setPixCopied(true);
      toast({ title: "Copiado!", description: "Chave Pix copiada para a área de transferência." });
      setTimeout(() => setPixCopied(false), 3000);
    } catch {
      toast({ title: "Erro", description: "Não foi possível copiar.", variant: "destructive" });
    }
  };

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
                <p className="text-muted-foreground">Escolha como deseja pagar abaixo.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Hora de fechar a conta?</h1>
                <p className="text-muted-foreground">
                  Solicite a conta e escolha a forma de pagamento.
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
          {!requested && (
            <Button
              size="lg"
              className="w-full h-16 text-lg font-bold rounded-2xl shadow-lg bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 transition-all"
              onClick={() => billMutation.mutate()}
              disabled={billMutation.isPending}
            >
              {billMutation.isPending ? (
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
              ) : (
                <Receipt className="w-6 h-6 mr-3" />
              )}
              {billMutation.isPending ? "Carregando..." : "Solicitar Conta"}
            </Button>
          )}

          {/* Payment methods — shown after requesting */}
          {requested && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground text-center">
                Como deseja pagar?
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: "pix" as PaymentMethod, icon: QrCode, label: "Pix", color: "purple", desc: "Pague agora" },
                  { id: "cartao" as PaymentMethod, icon: CreditCard, label: "Cartão", color: "blue", desc: "Chamar garçom" },
                  { id: "dinheiro" as PaymentMethod, icon: Banknote, label: "Dinheiro", color: "green", desc: "Chamar garçom" },
                ]).map(({ id, icon: Icon, label, color, desc }) => {
                  const isSelected = selectedPayment === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleSelectPayment(id)}
                      className={`rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${
                        isSelected
                          ? `border-${color}-500 bg-${color}-50 shadow-md scale-[1.02]`
                          : "border-border/40 bg-card hover:border-border hover:shadow-sm"
                      }`}
                    >
                      <Icon className={`w-7 h-7 ${isSelected ? `text-${color}-600` : "text-muted-foreground"}`} />
                      <span className={`text-sm font-semibold ${isSelected ? `text-${color}-700` : "text-muted-foreground"}`}>
                        {label}
                      </span>
                      <span className={`text-[10px] ${isSelected ? `text-${color}-600` : "text-muted-foreground/70"}`}>
                        {desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Cartão — garçom chamado automaticamente */}
              {selectedPayment === "cartao" && (
                <Card className="border-blue-200 bg-blue-50/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <CardContent className="p-5 text-center space-y-3">
                    <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                      {callWaiterMutation.isPending ? (
                        <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                      ) : (
                        <Bell className="w-7 h-7 text-blue-600" />
                      )}
                    </div>
                    <h4 className="font-bold text-blue-800">Pagamento com Cartão</h4>
                    <p className="text-sm text-blue-700">
                      {waiterCalled
                        ? <>O garçom já foi <strong>chamado</strong> e levará a maquininha até sua mesa.</>
                        : <>Chamando o garçom para levar a <strong>maquininha</strong> até sua mesa...</>}
                    </p>
                    <Badge className={`shadow-none ${
                      waiterCalled
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-blue-100 text-blue-700 border-blue-200"
                    }`}>
                      {waiterCalled ? (
                        <><CheckCircle2 className="w-3 h-3 mr-1" /> Garçom chamado!</>
                      ) : (
                        <><Clock className="w-3 h-3 mr-1" /> Chamando garçom...</>
                      )}
                    </Badge>
                  </CardContent>
                </Card>
              )}

              {/* Dinheiro — garçom chamado automaticamente */}
              {selectedPayment === "dinheiro" && (
                <Card className="border-green-200 bg-green-50/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <CardContent className="p-5 text-center space-y-3">
                    <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                      {callWaiterMutation.isPending ? (
                        <Loader2 className="w-7 h-7 text-green-600 animate-spin" />
                      ) : (
                        <Bell className="w-7 h-7 text-green-600" />
                      )}
                    </div>
                    <h4 className="font-bold text-green-800">Pagamento em Dinheiro</h4>
                    <p className="text-sm text-green-700">
                      {waiterCalled
                        ? <>O garçom já foi <strong>chamado</strong> e virá até sua mesa para receber o pagamento.</>
                        : <>Chamando o garçom para <strong>receber o pagamento</strong> na sua mesa...</>}
                    </p>
                    <Badge className={`shadow-none ${
                      waiterCalled
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-yellow-100 text-yellow-700 border-yellow-200"
                    }`}>
                      {waiterCalled ? (
                        <><CheckCircle2 className="w-3 h-3 mr-1" /> Garçom chamado!</>
                      ) : (
                        <><Clock className="w-3 h-3 mr-1" /> Chamando garçom...</>
                      )}
                    </Badge>
                  </CardContent>
                </Card>
              )}

              {/* Pix — paga direto */}
              {selectedPayment === "pix" && (
                <Card className="border-purple-200 bg-purple-50/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <CardContent className="p-5 space-y-4">
                    <div className="text-center space-y-2">
                      <div className="mx-auto w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                        <QrCode className="w-7 h-7 text-purple-600" />
                      </div>
                      <h4 className="font-bold text-purple-800">Pague via Pix</h4>
                      <p className="text-sm text-purple-700">
                        Pague agora mesmo pelo seu celular. Copie a chave Pix abaixo:
                      </p>
                    </div>

                    <Separator className="bg-purple-200" />

                    {/* Pix key */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide text-center">
                        Chave Pix (E-mail)
                      </p>
                      <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-lg px-4 py-3">
                        <span className="flex-1 text-sm font-mono text-purple-900 truncate">{PIX_KEY}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-purple-600 hover:bg-purple-100 shrink-0"
                          onClick={copyPixKey}
                        >
                          {pixCopied ? (
                            <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 mr-1" />
                          )}
                          {pixCopied ? "Copiado!" : "Copiar"}
                        </Button>
                      </div>
                    </div>

                    {/* Beneficiary + Amount */}
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-white border border-purple-200 rounded-lg p-3">
                        <p className="text-[10px] text-purple-500 uppercase font-semibold">Beneficiário</p>
                        <p className="text-xs font-bold text-purple-800 mt-1">{PIX_BENEFICIARY}</p>
                      </div>
                      <div className="bg-white border border-purple-200 rounded-lg p-3">
                        <p className="text-[10px] text-purple-500 uppercase font-semibold">Valor</p>
                        <p className="text-lg font-bold text-purple-800 mt-0.5">{formatBRL(billTotal)}</p>
                      </div>
                    </div>

                    <div className="bg-purple-100/50 border border-purple-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-purple-700">
                        Após o pagamento, o <strong>comprovante</strong> será confirmado automaticamente pelo garçom.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chamar garçom novamente — só cartão/dinheiro */}
              {selectedPayment && (selectedPayment === "cartao" || selectedPayment === "dinheiro") && waiterCalled && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-14 text-base font-semibold rounded-2xl border-2"
                  onClick={() => {
                    setWaiterCalled(false);
                    callWaiterMutation.mutate();
                  }}
                  disabled={callWaiterMutation.isPending}
                >
                  {callWaiterMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Bell className="w-5 h-5 mr-2" />
                  )}
                  {callWaiterMutation.isPending ? "Chamando..." : "Chamar Garçom Novamente"}
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </CustomerShell>
  );
}
