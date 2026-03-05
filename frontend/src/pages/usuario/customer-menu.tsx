import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UtensilsCrossed,
  ShoppingCart,
  Plus,
  Minus,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api, formatBRL, type CustomerMenuData, type MenuItemShort } from "@/lib/api";
import { getCart, setCart as saveCart, type CartItem } from "./customer-order";
import CustomerShell from "@/components/usuario/CustomerShell";

export default function CustomerMenu() {
  const { tableId } = useParams();
  const [, navigate] = useLocation();
  const tableNumber = parseInt(tableId || "0", 10);
  const [cart, setCartState] = useState<CartItem[]>(() => getCart(tableId || "0"));

  // Listen for cart updates from other pages
  useEffect(() => {
    const onCartUpdate = () => setCartState(getCart(tableId || "0"));
    window.addEventListener("cart-updated", onCartUpdate);
    return () => window.removeEventListener("cart-updated", onCartUpdate);
  }, [tableId]);

  const setCart = (updater: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
    setCartState(prev => {
      const newCart = typeof updater === "function" ? updater(prev) : updater;
      saveCart(tableId || "0", newCart);
      return newCart;
    });
  };

  const { data, isLoading } = useQuery<CustomerMenuData>({
    queryKey: ["/api/customer/menu/", tableNumber],
    queryFn: () => api.getCustomerMenu(tableNumber),
    enabled: tableNumber > 0,
  });

  const categories = data?.categories ?? [];

  const addToCart = (item: MenuItemShort) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: item.id, qty: 1, name: item.name, emoji: item.emoji, image: item.image, price: parseFloat(item.price) }];
    });
    toast({ title: "Adicionado!", description: "Item adicionado ao seu pedido." });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(0, item.qty - 1) } : item).filter(item => item.qty > 0));
  };

  const cartCount = cart.reduce((a, b) => a + b.qty, 0);
  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const goToOrder = () => navigate(`/m/${tableId}/pedido`);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CustomerShell
      activeId="menu"
      title="Cardápio"
      titleIcon={<UtensilsCrossed className="w-5 h-5 lg:hidden" />}
      noPadBottom={cart.length > 0}
      headerRight={
        cartCount > 0 ? (
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-primary/20 text-primary"
            onClick={goToOrder}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="font-bold text-xs">{cartCount}</span>
            <span className="hidden sm:inline text-xs font-semibold">{formatBRL(total)}</span>
          </Button>
        ) : undefined
      }
    >
      {/* Menu Content */}
      <main className="max-w-3xl mx-auto p-4 space-y-6 pb-32 lg:pb-6">
        {categories.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Cardápio indisponível no momento.</p>
        ) : (
          <Tabs defaultValue={categories[0]?.name} className="w-full">
            <TabsList className="w-full overflow-x-auto flex bg-secondary/50 p-1 justify-start">
              {categories.map(cat => (
                <TabsTrigger key={cat.id} value={cat.name} className="shrink-0">{cat.name}</TabsTrigger>
              ))}
            </TabsList>

            {categories.map(cat => (
              <TabsContent key={cat.id} value={cat.name} className="space-y-3 pt-4">
                {cat.items.filter(i => i.status !== "out_of_stock").map(item => {
                  const cartItem = cart.find(ci => ci.id === item.id);
                  return (
                    <Card key={item.id} className="border-border/40 shadow-sm overflow-hidden group active:scale-[0.99] transition-all hover:shadow-md">
                      <CardContent className="p-0 flex h-[120px] sm:h-28">
                        <div className="w-28 sm:w-32 bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-5xl">{item.emoji || "🍽️"}</span>
                          )}
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

      {/* Footer / Cart Summary (mobile only) */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-10 z-30">
          <div className="max-w-3xl mx-auto">
            <Button
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 flex justify-between px-6 rounded-2xl"
              onClick={goToOrder}
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
    </CustomerShell>
  );
}
