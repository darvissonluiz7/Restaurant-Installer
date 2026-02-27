import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  UtensilsCrossed,
  Bell,
  Receipt,
  ShoppingCart,
  Home,
  Info,
  Phone,
  MapPin,
  Star,
  Gift,
  Menu as MenuIcon,
} from "lucide-react";
import { formatBRL } from "@/lib/api";
import { getCart } from "@/pages/usuario/customer-order";

// ── Route map ───────────────────────────────────────────────────────────
const routeMap: Record<string, string> = {
  menu: "",
  cart: "/pedido",
  waiter: "/garcom",
  bill: "/conta",
  reviews: "/avaliacoes",
  loyalty: "/fidelidade",
  about: "/sobre",
  contact: "/contato",
};

// ── Sidebar Navigation Items ────────────────────────────────────────────
const navItems = [
  { icon: Home, label: "Cardápio", id: "menu" },
  { icon: ShoppingCart, label: "Meu Pedido", id: "cart" },
  { icon: Bell, label: "Chamar Garçom", id: "waiter" },
  { icon: Receipt, label: "Pedir Conta", id: "bill" },
];

const infoItems = [
  { icon: Star, label: "Avaliações", id: "reviews" },
  { icon: Gift, label: "Fidelidade", id: "loyalty" },
  { icon: Info, label: "Sobre Nós", id: "about" },
  { icon: Phone, label: "Contato", id: "contact" },
];

// ── Sidebar Content ─────────────────────────────────────────────────────
function SidebarContent({
  tableId,
  cartCount,
  total,
  activeId,
  onNavigate,
}: {
  tableId: string;
  cartCount: number;
  total: number;
  activeId: string;
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
            {navItems.map((item) => {
              const isActive = item.id === activeId;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive
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
              );
            })}
          </nav>

          <Separator className="my-4" />

          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-2">
            Restaurante
          </p>
          <nav className="space-y-0.5">
            {infoItems.map((item) => {
              const isActive = item.id === activeId;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    }`}
                >
                  <item.icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
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
              onClick={() => onNavigate("cart")}
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
          onClick={() => onNavigate("waiter")}
        >
          <Bell className="w-3.5 h-3.5 mr-1.5" />
          Chamar Garçom
        </Button>
      </div>
    </div>
  );
}

// ── Shell Props ─────────────────────────────────────────────────────────
interface CustomerShellProps {
  activeId: string;
  title: string;
  titleIcon?: React.ReactNode;
  children: React.ReactNode;
  /** Extra content in the header right side */
  headerRight?: React.ReactNode;
  /** Whether to show a fixed bottom bar (the page handles it) */
  noPadBottom?: boolean;
}

export default function CustomerShell({ activeId, title, titleIcon, children, headerRight, noPadBottom }: CustomerShellProps) {
  const { tableId } = useParams();
  const [, navigate] = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const cart = getCart(tableId || "0");
  const cartCount = cart.reduce((a, b) => a + b.qty, 0);
  const total = cart.reduce((acc, i) => acc + i.price * i.qty, 0);

  const handleNavigate = (id: string) => {
    setIsMobileSidebarOpen(false);
    const suffix = routeMap[id] ?? "";
    navigate(`/m/${tableId}${suffix}`);
  };

  const sidebarProps = {
    tableId: tableId || "0",
    cartCount,
    total,
    activeId,
    onNavigate: handleNavigate,
  };

  return (
    <div className="min-h-screen bg-secondary/10">
      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[260px] flex-col bg-card border-r border-border/50 shadow-sm">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Mobile Sidebar ───────────────────────────────────────────── */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0 border-r border-border/50">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <SidebarContent {...sidebarProps} />
        </SheetContent>
      </Sheet>

      {/* ── Main area ────────────────────────────────────────────────── */}
      <div className={`lg:pl-[260px] min-h-screen ${noPadBottom ? "" : "pb-6"}`}>
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-20 px-4 py-3 shadow-sm">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden -ml-2 h-9 w-9"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <MenuIcon className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2 text-primary font-bold text-lg lg:text-xl">
                {titleIcon}
                <span>{title}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs bg-primary/5 text-primary border-primary/20 lg:hidden">
                Mesa {tableId}
              </Badge>
              {headerRight}
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
