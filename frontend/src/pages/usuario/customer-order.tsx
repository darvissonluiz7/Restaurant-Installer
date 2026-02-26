import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  UtensilsCrossed,
  Bell,
  Receipt,
  ShoppingCart,
  Plus,
  Minus,
  Loader2,
  Utensils,
  Clock,
  CheckCircle2,
  CookingPot,
  ChefHat,
  Package,
  XCircle,
  Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api, formatBRL, type Order } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CustomerShell from "@/components/usuario/CustomerShell";

// ── Cart item shape (from localStorage or parent) ───────────────────────
export interface CartItem {
  id: string;
  qty: number;
  name: string;
  emoji: string;
  image: string | null;
  price: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────

const CART_KEY = (tableId: string) => `restopro_cart_${tableId}`;

export function getCart(tableId: string): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY(tableId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCart(tableId: string, items: CartItem[]) {
  localStorage.setItem(CART_KEY(tableId), JSON.stringify(items));
}

export function clearCart(tableId: string) {
  localStorage.removeItem(CART_KEY(tableId));
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  new: { label: "Novo", icon: Clock, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  preparing: { label: "Preparando", icon: ChefHat, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  ready: { label: "Pronto", icon: Package, color: "text-green-600", bg: "bg-green-50 border-green-200" },
  delivered: { label: "Entregue", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200" },
};

// ── Main Component ──────────────────────────────────────────────────────

export default function CustomerOrder() {
  const { tableId } = useParams();
  const [, navigate] = useLocation();
  const tableNumber = parseInt(tableId || "0", 10);

  // Cart state from localStorage
  const [cart, setCartState] = useState<CartItem[]>(() => getCart(tableId || "0"));
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [billData, setBillData] = useState<{ total: string; orders: Order[] } | null>(null);

  const updateCart = (newCart: CartItem[]) => {
    const filtered = newCart.filter(i => i.qty > 0);
    setCartState(filtered);
    setCart(tableId || "0", filtered);
    // Dispatch event so customer-menu can sync
    window.dispatchEvent(new Event("cart-updated"));
  };

  const addQty = (id: string) => {
    updateCart(cart.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  };

  const removeQty = (id: string) => {
    updateCart(cart.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i));
  };

  const removeItem = (id: string) => {
    updateCart(cart.filter(i => i.id !== id));
  };

  const cartCount = cart.reduce((a, b) => a + b.qty, 0);
  const total = cart.reduce((acc, i) => acc + i.price * i.qty, 0);

  // Fetch past orders for this table
  const { data: pastOrders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery<Order[]>({
    queryKey: ["/api/customer/orders/", tableNumber],
    queryFn: () => api.customerGetOrders(tableNumber),
    enabled: tableNumber > 0,
    refetchInterval: 15000, // Poll every 15s for status updates
  });

  // Send order mutation
  const orderMutation = useMutation({
    mutationFn: (items: { menu_item: string; quantity: number }[]) =>
      api.customerOrder(tableNumber, items),
    onSuccess: () => {
      updateCart([]);
      refetchOrders();
      toast({ title: "Pedido Enviado! 🎉", description: "Seu pedido foi enviado para a cozinha." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível enviar o pedido.", variant: "destructive" });
    },
  });

  // Call waiter mutation
  const callWaiterMutation = useMutation({
    mutationFn: () => api.customerCallWaiter(tableNumber),
    onSuccess: () => {
      toast({ title: "Garçom Chamado! 🔔", description: "Um atendente virá até a sua mesa em breve." });
    },
    onError: (err: any) => {
      const msg = err?.message?.includes("409")
        ? "Já existe uma chamada pendente para sua mesa."
        : "Não foi possível chamar o garçom.";
      toast({ title: "Aviso", description: msg, variant: "destructive" });
    },
  });

  // Request bill mutation
  const billMutation = useMutation({
    mutationFn: () => api.customerRequestBill(tableNumber),
    onSuccess: (data) => {
      setBillData(data);
      setShowBillDialog(true);
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível solicitar a conta.", variant: "destructive" });
    },
  });

  const handleCallWaiter = () => {
    setIsCallingWaiter(true);
    callWaiterMutation.mutate(undefined, {
      onSettled: () => setTimeout(() => setIsCallingWaiter(false), 2000),
    });
  };

  const handleSendOrder = () => {
    const items = cart.map(c => ({ menu_item: c.id, quantity: c.qty }));
    orderMutation.mutate(items);
  };

  const activeOrders = pastOrders?.filter(o => !["delivered", "cancelled"].includes(o.status)) ?? [];
  const completedOrders = pastOrders?.filter(o => ["delivered", "cancelled"].includes(o.status)) ?? [];

  return (
    <CustomerShell
      activeId="orders"
      title="Meu Pedido"
      titleIcon={<ShoppingCart className="w-5 h-5 lg:hidden" />}
      noPadBottom={cart.length > 0}
    >
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-40">
        {/* ── Quick Actions: Chamar Garçom + Pedir Conta ──────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-16 flex-col gap-1.5 bg-card border-border/50 shadow-sm hover:border-amber-300 hover:bg-amber-50/50 transition-all"
            onClick={handleCallWaiter}
            disabled={isCallingWaiter}
          >
            <Bell className={`w-5 h-5 ${isCallingWaiter ? "animate-bounce text-amber-500" : "text-amber-600"}`} />
            <span className="text-xs font-semibold">
              {isCallingWaiter ? "Chamando..." : "Chamar Garçom"}
            </span>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex-col gap-1.5 bg-card border-border/50 shadow-sm hover:border-green-300 hover:bg-green-50/50 transition-all"
            onClick={() => billMutation.mutate()}
            disabled={billMutation.isPending}
          >
            <Receipt className={`w-5 h-5 ${billMutation.isPending ? "animate-pulse" : "text-green-600"}`} />
            <span className="text-xs font-semibold">
              {billMutation.isPending ? "Carregando..." : "Pedir Conta"}
            </span>
          </Button>
        </div>

        {/* ── Current Cart ────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-base">Carrinho</h2>
            {cartCount > 0 && (
              <Badge variant="secondary" className="text-[10px] font-bold">{cartCount} {cartCount === 1 ? "item" : "itens"}</Badge>
            )}
          </div>

          {cart.length === 0 ? (
            <Card className="border-dashed border-2 border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <ShoppingCart className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">Seu carrinho está vazio</p>
                <p className="text-xs mt-1">Volte ao cardápio para adicionar itens</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate(`/m/${tableId}`)}
                >
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Ver Cardápio
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/40 shadow-sm">
              <CardContent className="p-0 divide-y divide-border/30">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3.5">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{item.emoji || "🍽️"}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBRL(item.price)} cada</p>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => removeQty(item.id)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="font-bold text-sm w-5 text-center">{item.qty}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => addQty(item.id)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Subtotal + remove */}
                    <div className="flex flex-col items-end gap-1 ml-1">
                      <span className="font-bold text-sm text-primary">{formatBRL(item.price * item.qty)}</span>
                      <button
                        className="text-muted-foreground/50 hover:text-destructive transition-colors"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between p-4 bg-secondary/30">
                  <span className="font-bold text-base">Total</span>
                  <span className="font-bold text-xl text-primary">{formatBRL(total)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* ── Active Orders (Em andamento) ────────────────────────────── */}
        {activeOrders.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CookingPot className="w-4 h-4 text-orange-500" />
              <h2 className="font-bold text-base">Em Andamento</h2>
              <Badge variant="secondary" className="text-[10px] font-bold">{activeOrders.length}</Badge>
            </div>

            <div className="space-y-3">
              {activeOrders.map(order => {
                const sc = statusConfig[order.status] || statusConfig.new;
                const StatusIcon = sc.icon;
                return (
                  <Card key={order.id} className={`border shadow-sm ${sc.bg}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${sc.color}`} />
                          <span className={`text-sm font-bold ${sc.color}`}>{sc.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{order.time_elapsed}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{item.menu_item_emoji || "🍽️"}</span>
                              <span className="font-medium">{item.menu_item_name}</span>
                              <span className="text-muted-foreground">x{item.quantity}</span>
                            </div>
                            <span className="font-medium">{formatBRL(item.price)}</span>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-2.5" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Pedido #{order.display_id}</span>
                        <span className="font-bold text-sm">{formatBRL(order.total)}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Past Completed Orders ───────────────────────────────────── */}
        {completedOrders.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h2 className="font-bold text-base">Pedidos Anteriores</h2>
            </div>

            <div className="space-y-3">
              {completedOrders.map(order => {
                const sc = statusConfig[order.status] || statusConfig.delivered;
                const StatusIcon = sc.icon;
                return (
                  <Card key={order.id} className="border-border/30 shadow-sm opacity-75">
                    <CardContent className="p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-3.5 h-3.5 ${sc.color}`} />
                          <span className={`text-xs font-semibold ${sc.color}`}>{sc.label}</span>
                          <span className="text-xs text-muted-foreground">#{order.display_id}</span>
                        </div>
                        <span className="font-semibold text-sm">{formatBRL(order.total)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map(item => (
                          <span key={item.id} className="text-xs text-muted-foreground">
                            {item.menu_item_emoji} {item.menu_item_name} x{item.quantity}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Loading state for orders */}
        {ordersLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {/* Empty state — no orders and no cart */}
        {!ordersLoading && cart.length === 0 && (pastOrders?.length ?? 0) === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Utensils className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhum pedido ainda</p>
            <p className="text-xs mt-1">Adicione itens do cardápio para começar</p>
          </div>
        )}
      </main>

      {/* ── Fixed Bottom Bar: Send Order ──────────────────────────────── */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-10 z-30">
          <div className="max-w-2xl mx-auto space-y-2">
            <Button
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 flex justify-between px-6 rounded-2xl"
              onClick={handleSendOrder}
              disabled={orderMutation.isPending}
            >
              <div className="flex items-center gap-3">
                {orderMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Utensils className="w-5 h-5" />
                )}
                <span className="font-bold">
                  {orderMutation.isPending ? "Enviando..." : "Enviar Pedido"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 px-2.5 py-0.5 rounded-md text-xs font-bold">
                  {cartCount}
                </div>
                <span className="font-bold">{formatBRL(total)}</span>
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* ── Bill Dialog ───────────────────────────────────────────────── */}
      <AlertDialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-green-600" />
              Conta Solicitada
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2">
                <p className="text-sm text-muted-foreground">
                  O garçom trará a maquininha até a sua mesa.
                </p>
                {billData && (
                  <>
                    {billData.orders.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {billData.orders.map(order => (
                          <div key={order.id} className="text-sm border rounded-lg p-2.5 bg-secondary/30">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Pedido #{order.display_id}</span>
                              <span>{order.status_display}</span>
                            </div>
                            {order.items.map(item => (
                              <div key={item.id} className="flex justify-between text-xs">
                                <span>{item.menu_item_emoji} {item.menu_item_name} x{item.quantity}</span>
                                <span>{formatBRL(item.price)}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-2xl text-primary">{formatBRL(billData.total)}</span>
                    </div>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Entendi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CustomerShell>
  );
}
