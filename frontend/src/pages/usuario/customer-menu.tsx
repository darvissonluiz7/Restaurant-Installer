import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UtensilsCrossed, 
  Bell, 
  Receipt, 
  ShoppingCart, 
  Plus, 
  Minus, 
  CreditCard,
  Menu as MenuIcon,
  X,
  History,
  User,
  Info,
  Home,
  ChevronLeft,
  Utensils,
  Phone,
  MapPin,
  Star,
  Gift,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api, formatBRL, type CustomerMenuData, type MenuItemShort } from "@/lib/api";

// ── Sidebar Navigation Items ────────────────────────────────────────────
const navItems = [
  { icon: Home, label: "Cardápio", id: "menu", active: true },
  { icon: ShoppingCart, label: "Meu Pedido", id: "cart" },
  { icon: History, label: "Meus Pedidos", id: "orders" },
  { icon: Bell, label: "Chamar Garçom", id: "waiter" },
  { icon: Receipt, label: "Pedir Conta", id: "bill" },
];

const infoItems = [
  { icon: Star, label: "Avaliações", id: "reviews" },
  { icon: Gift, label: "Fidelidade", id: "loyalty" },
  { icon: Info, label: "Sobre Nós", id: "about" },
  { icon: Phone, label: "Contato", id: "contact" },
];

// ── Sidebar Content (shared between desktop and mobile) ─────────────────
function SidebarContent({ 
  tableId, 
  cartCount,
  total,
  isCallingWaiter,
  onCallWaiter,
  onRequestBill,
  onNavigate,
}: {
  tableId: string | undefined;
  cartCount: number;
  total: number;
  isCallingWaiter: boolean;
  onCallWaiter: () => void;
  onRequestBill: () => void;
  onNavigate: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo + Table */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-2.5 text-primary font-bold text-xl">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          RestoPro
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs bg-primary/5 text-primary border-primary/20 px-2.5 py-1">
            <MapPin className="w-3 h-3 mr-1" />
            Mesa {tableId}
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-2">
            Principal
          </p>
          <nav className="space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${item.active 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.id === "cart" && cartCount > 0 && (
                  <span className="ml-auto bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <Separator className="my-4" />

          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-2">
            Restaurante
          </p>
          <nav className="space-y-0.5">
            {infoItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </ScrollArea>

      {/* Bottom: Quick actions + cart summary */}
      <div className="p-4 border-t border-border/50 space-y-3">
        {cartCount > 0 && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">{cartCount} {cartCount === 1 ? "item" : "itens"}</span>
              <span className="text-sm font-bold text-primary">{formatBRL(total)}</span>
            </div>
            <Button 
              size="sm" 
              className="w-full h-9 bg-primary text-white text-xs font-semibold mt-1.5"
              onClick={onRequestBill}
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              Ver Pedido
            </Button>
          </div>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full h-9 text-xs"
          onClick={onCallWaiter}
          disabled={isCallingWaiter}
        >
          <Bell className={`w-3.5 h-3.5 mr-1.5 ${isCallingWaiter ? "animate-bounce text-primary" : ""}`} />
          {isCallingWaiter ? "Chamando..." : "Chamar Garçom"}
        </Button>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────
export default function CustomerMenu() {
  const { tableId } = useParams();
  const tableNumber = parseInt(tableId || "0", 10);
  const [cart, setCart] = useState<{id: string, qty: number, name: string, emoji: string, price: number}[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data, isLoading } = useQuery<CustomerMenuData>({
    queryKey: ["/api/customer/menu/", tableNumber],
    queryFn: () => api.getCustomerMenu(tableNumber),
    enabled: tableNumber > 0,
  });

  const orderMutation = useMutation({
    mutationFn: (items: { menu_item: string; quantity: number }[]) =>
      api.customerOrder(tableNumber, items),
    onSuccess: () => {
      setCart([]);
      setIsPaymentOpen(false);
      toast({ title: "Pedido Enviado!", description: "Seu pedido foi enviado para a cozinha." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível enviar o pedido.", variant: "destructive" });
    },
  });

  const callWaiterMutation = useMutation({
    mutationFn: () => api.customerCallWaiter(tableNumber),
    onSuccess: () => {
      toast({ title: "Garçom Chamado!", description: "Um atendente virá até a sua mesa em breve." });
    },
  });

  const billMutation = useMutation({
    mutationFn: () => api.customerRequestBill(tableNumber),
    onSuccess: (billData) => {
      toast({ title: "Conta Solicitada", description: `Total: ${formatBRL(billData.total)}. O garçom trará a maquininha.` });
    },
  });

  const categories = data?.categories ?? [];

  const addToCart = (item: MenuItemShort) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: item.id, qty: 1, name: item.name, emoji: item.emoji, price: parseFloat(item.price) }];
    });
    toast({ title: "Adicionado!", description: "Item adicionado ao seu pedido." });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(0, item.qty - 1) } : item).filter(item => item.qty > 0));
  };

  const cartCount = cart.reduce((a, b) => a + b.qty, 0);
  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleCallWaiter = () => {
    setIsCallingWaiter(true);
    setIsMobileSidebarOpen(false);
    callWaiterMutation.mutate(undefined, {
      onSettled: () => setTimeout(() => setIsCallingWaiter(false), 1500),
    });
  };

  const handleSendOrder = () => {
    const items = cart.map(c => ({ menu_item: c.id, quantity: c.qty }));
    orderMutation.mutate(items);
  };

  const handleNavigate = (id: string) => {
    setIsMobileSidebarOpen(false);
    switch (id) {
      case "waiter":
        handleCallWaiter();
        break;
      case "bill":
        billMutation.mutate();
        break;
      case "cart":
        setIsPaymentOpen(true);
        break;
      default:
        break;
    }
  };

  const sidebarProps = {
    tableId,
    cartCount,
    total,
    isCallingWaiter,
    onCallWaiter: handleCallWaiter,
    onRequestBill: () => setIsPaymentOpen(true),
    onNavigate: handleNavigate,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/10">
      {/* ── Desktop Sidebar (fixed, visible on lg+) ──────────────────── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[260px] flex-col bg-card border-r border-border/50 shadow-sm">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Mobile Sidebar (Sheet drawer) ────────────────────────────── */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0 border-r border-border/50">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <SidebarContent {...sidebarProps} />
        </SheetContent>
      </Sheet>

      {/* ── Main content area (offset on lg for sidebar) ─────────────── */}
      <div className="lg:pl-[260px] min-h-screen pb-32 lg:pb-6">
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-20 px-4 py-3 shadow-sm">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden -ml-2 h-9 w-9"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <MenuIcon className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2 text-primary font-bold text-lg lg:text-xl">
                <UtensilsCrossed className="w-5 h-5 lg:hidden" />
                <span>Cardápio</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs bg-primary/5 text-primary border-primary/20 lg:hidden">
                Mesa {tableId}
              </Badge>
              {cartCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 gap-2 border-primary/20 text-primary"
                  onClick={() => setIsPaymentOpen(true)}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="font-bold text-xs">{cartCount}</span>
                  <span className="hidden sm:inline text-xs font-semibold">{formatBRL(total)}</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Quick Actions (mobile only) */}
        <div className="lg:hidden max-w-3xl mx-auto px-4 pt-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 h-11 bg-card border-border/50 shadow-sm text-sm"
              onClick={handleCallWaiter}
              disabled={isCallingWaiter}
            >
              <Bell className={`w-4 h-4 mr-2 ${isCallingWaiter ? "animate-bounce text-primary" : ""}`} />
              {isCallingWaiter ? "Chamando..." : "Chamar Garçom"}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-11 bg-card border-border/50 shadow-sm text-sm"
              onClick={() => billMutation.mutate()}
            >
              <Receipt className="w-4 h-4 mr-2" />
              Pedir Conta
            </Button>
          </div>
        </div>

        {/* Menu Content */}
        <main className="max-w-3xl mx-auto p-4 space-y-6">
          {categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Cardápio indisponível no momento.</p>
          ) : (
            <Tabs defaultValue={categories[0]?.name} className="w-full">
              <TabsList className="w-full grid bg-secondary/50 p-1" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)` }}>
                {categories.map(cat => (
                  <TabsTrigger key={cat.id} value={cat.name}>{cat.name}</TabsTrigger>
                ))}
              </TabsList>

              {categories.map(cat => (
                <TabsContent key={cat.id} value={cat.name} className="space-y-3 pt-4">
                  {cat.items.filter(i => i.status !== "out_of_stock").map(item => {
                    const cartItem = cart.find(ci => ci.id === item.id);
                    return (
                      <Card key={item.id} className="border-border/40 shadow-sm overflow-hidden group active:scale-[0.99] transition-all hover:shadow-md">
                        <CardContent className="p-0 flex h-[120px] sm:h-28">
                          <div className="w-28 sm:w-32 bg-secondary flex items-center justify-center text-5xl shrink-0">
                            {item.emoji || "🍽️"}
                          </div>
                          <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
                            <div>
                              <h3 className="font-semibold text-sm sm:text-base leading-tight truncate">{item.name}</h3>
                              <p className="text-primary font-bold mt-1 text-sm">{formatBRL(item.price)}</p>
                            </div>
                            <div className="flex justify-end items-center gap-2 sm:gap-3">
                              {cartItem && (
                                <div className="flex items-center gap-2 sm:gap-3 animate-in slide-in-from-right-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-7 w-7 rounded-full" 
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="font-bold text-sm w-4 text-center">{cartItem.qty}</span>
                                </div>
                              )}
                              <Button 
                                size="icon" 
                                className="h-8 w-8 rounded-full bg-primary text-white shadow-sm shadow-primary/25" 
                                onClick={() => addToCart(item)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {cat.items.filter(i => i.status !== "out_of_stock").length === 0 && (
                    <p className="text-center text-muted-foreground py-8 text-sm">Nenhum item disponível nesta categoria.</p>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </main>
      </div>

      {/* Footer / Cart Summary (mobile only) */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-10 z-30">
          <div className="max-w-3xl mx-auto">
            <Button 
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 flex justify-between px-6 rounded-2xl"
              onClick={() => setIsPaymentOpen(true)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 px-2.5 py-0.5 rounded-md text-xs font-bold">
                  {cartCount}
                </div>
                <span className="font-bold">Ver Pedido</span>
              </div>
              <span className="font-bold">{formatBRL(total)}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Payment/Checkout Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-md rounded-t-3xl sm:rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Seu Pedido</DialogTitle>
            <DialogDescription>Confira seus itens e envie para a cozinha.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4 max-h-[50vh] overflow-y-auto pr-2">
            {cart.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">Nenhum item no pedido ainda.</p>
            )}
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm py-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.emoji || "🍽️"}</span>
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <p className="text-xs text-muted-foreground">{item.qty}x {formatBRL(item.price)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatBRL(item.price * item.qty)}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl text-primary">{formatBRL(total)}</span>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="flex flex-col gap-2 pt-2">
              <Button
                className="w-full h-12 bg-primary text-white"
                onClick={handleSendOrder}
                disabled={orderMutation.isPending}
              >
                {orderMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Utensils className="w-4 h-4 mr-2" />
                )}
                {orderMutation.isPending ? "Enviando..." : "Enviar Pedido para Cozinha"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}