import { useState } from "react";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, Bell, Receipt, ShoppingCart, Plus, Minus, CreditCard } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const menuItems = [
  { id: 1, name: "Bife Ancho com Fritas", category: "Pratos", price: 65, img: "🥩" },
  { id: 2, name: "Salmão Grelhado", category: "Pratos", price: 78, img: "🐟" },
  { id: 3, name: "Risoto de Cogumelos", category: "Pratos", price: 55, img: "🍄" },
  { id: 4, name: "Suco Laranja", category: "Bebidas", price: 12, img: "🍊" },
  { id: 5, name: "Cerveja IPA", category: "Bebidas", price: 22, img: "🍺" },
  { id: 6, name: "Pudim de Leite", category: "Sobremesas", price: 18, img: "🍮" },
];

export default function CustomerMenu() {
  const { tableId } = useParams();
  const [cart, setCart] = useState<{id: number, qty: number}[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);

  const addToCart = (id: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) return prev.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { id, qty: 1 }];
    });
    toast({ title: "Adicionado!", description: "Item adicionado ao seu pedido." });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(0, item.qty - 1) } : item).filter(item => item.qty > 0));
  };

  const total = cart.reduce((acc, item) => {
    const menuItem = menuItems.find(mi => mi.id === item.id);
    return acc + (menuItem?.price || 0) * item.qty;
  }, 0);

  const handleCallWaiter = () => {
    setIsCallingWaiter(true);
    setTimeout(() => {
      setIsCallingWaiter(false);
      toast({ title: "Garçom Chamado!", description: "Um atendente virá até a sua mesa em breve." });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-secondary/10 pb-32">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-20 px-4 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-display font-bold text-xl">
            <UtensilsCrossed className="w-6 h-6" />
            RestoPro
          </div>
          <Badge variant="outline" className="font-mono bg-primary/5 text-primary border-primary/20">
            Mesa {tableId}
          </Badge>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 h-12 bg-card border-border/50 shadow-sm"
            onClick={handleCallWaiter}
            disabled={isCallingWaiter}
          >
            <Bell className={`w-4 h-4 mr-2 ${isCallingWaiter ? "animate-bounce text-primary" : ""}`} />
            {isCallingWaiter ? "Chamando..." : "Chamar Garçom"}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 h-12 bg-card border-border/50 shadow-sm"
            onClick={() => setIsPaymentOpen(true)}
          >
            <Receipt className="w-4 h-4 mr-2" />
            Pedir Conta
          </Button>
        </div>

        <Tabs defaultValue="Pratos" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-secondary/50 p-1">
            <TabsTrigger value="Pratos">Pratos</TabsTrigger>
            <TabsTrigger value="Bebidas">Bebidas</TabsTrigger>
            <TabsTrigger value="Sobremesas">Doces</TabsTrigger>
          </TabsList>

          {["Pratos", "Bebidas", "Sobremesas"].map(cat => (
            <TabsContent key={cat} value={cat} className="space-y-4 pt-4">
              {menuItems.filter(i => i.category === cat).map(item => {
                const cartItem = cart.find(ci => ci.id === item.id);
                return (
                  <Card key={item.id} className="border-border/40 shadow-sm overflow-hidden group active:scale-[0.98] transition-transform">
                    <CardContent className="p-0 flex h-28">
                      <div className="w-28 bg-secondary flex items-center justify-center text-4xl shrink-0">
                        {item.img}
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base">{item.name}</h3>
                          <p className="text-primary font-bold mt-1 text-sm">R$ {item.price},00</p>
                        </div>
                        <div className="flex justify-end items-center gap-3">
                          {cartItem && (
                            <div className="flex items-center gap-3 animate-in slide-in-from-right-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7 rounded-full" 
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="font-bold text-sm">{cartItem.qty}</span>
                            </div>
                          )}
                          <Button 
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-primary text-white" 
                            onClick={() => addToCart(item.id)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Footer / Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-10 z-30">
          <div className="max-w-2xl mx-auto">
            <Button 
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 flex justify-between px-6 rounded-2xl"
              onClick={() => setIsPaymentOpen(true)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">
                  {cart.reduce((a, b) => a + b.qty, 0)}
                </div>
                <span className="font-bold">Ver Pedido</span>
              </div>
              <span className="font-display font-bold">R$ {total},00</span>
            </Button>
          </div>
        </div>
      )}

      {/* Payment/Checkout Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-md rounded-t-3xl sm:rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Sua Conta</DialogTitle>
            <DialogDescription>Confira seus itens e escolha como pagar.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto pr-2">
            {cart.map(item => {
              const mi = menuItems.find(m => m.id === item.id);
              return (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground font-mono">{item.qty}x</span>
                    <span className="font-medium">{mi?.name}</span>
                  </div>
                  <span className="font-semibold">R$ {(mi?.price || 0) * item.qty},00</span>
                </div>
              )
            })}
            <div className="pt-4 border-t border-border flex justify-between items-center">
              <span className="font-bold text-lg">Total</span>
              <span className="font-display font-bold text-2xl text-primary">R$ {total},00</span>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2">
            <Button className="w-full h-12 bg-primary text-white" onClick={() => {
              setIsPaymentOpen(false);
              setCart([]);
              toast({ title: "Pagamento Concluído!", description: "Obrigado pela preferência!" });
            }}>
              <CreditCard className="w-4 h-4 mr-2" /> Pagar via Site (Pix/Cartão)
            </Button>
            <Button variant="outline" className="w-full h-12" onClick={() => {
              setIsPaymentOpen(false);
              toast({ title: "Conta Solicitada", description: "O garçom trará a maquininha." });
            }}>
              Solicitar Maquininha na Mesa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}