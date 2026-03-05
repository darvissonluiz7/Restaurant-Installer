import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Grid2X2,
  Wallet,
  Settings,
  Bell,
  Search,
  Menu as MenuIcon,
  LogOut,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: ClipboardList, label: "Pedidos", href: "/admin/orders" },
  { icon: Grid2X2, label: "Mesas", href: "/admin/tables" },
  { icon: UtensilsCrossed, label: "Cardápio", href: "/admin/menu" },
  { icon: Wallet, label: "Adquirentes", href: "/admin/acquirers" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user
    ? (user.first_name?.[0] ?? "") + (user.last_name?.[0] ?? user.username[0])
    : "?";
  const displayName = user
    ? user.first_name
      ? `${user.first_name} ${user.last_name}`.trim()
      : user.username
    : "";
  const role = user?.is_staff ? "Administrador" : "Usuário";

  return (
    <div className="flex h-screen bg-secondary/20 overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-card border-r border-border/50 shadow-sm transition-transform duration-300 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/50">
          <div className="flex items-center gap-2 text-primary font-display font-bold text-xl">
            <UtensilsCrossed className="w-6 h-6" />
            RestoPro
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <div
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border/50 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Configurações</span>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-border/50 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
              <MenuIcon className="w-5 h-5" />
            </Button>
            
            <div className="hidden sm:flex relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar pedidos, pratos, clientes..." 
                className="pl-9 bg-secondary/50 border-transparent focus-visible:bg-card focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
            </Button>
            
            <div className="h-8 w-px bg-border/50 mx-1"></div>
            
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold leading-none text-foreground group-hover:text-primary transition-colors">{displayName}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
              <Avatar className="h-9 w-9 border-2 border-border group-hover:border-primary transition-colors">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials.toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}