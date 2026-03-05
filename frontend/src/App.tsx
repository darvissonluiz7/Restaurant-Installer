import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Shell from "@/components/admin/Shell";
import Dashboard from "@/pages/admin/dashboard";
import Orders from "@/pages/admin/orders";
import Menu from "@/pages/admin/menu";
import Tables from "@/pages/admin/tables";
import Login from "@/pages/admin/login";
import Acquirers from "@/pages/admin/acquirers";
import CustomerMenu from "@/pages/usuario/customer-menu";
import CustomerOrder from "@/pages/usuario/customer-order";
import CustomerWaiter from "@/pages/usuario/customer-waiter";
import CustomerBill from "@/pages/usuario/customer-bill";
import CustomerReviews from "@/pages/usuario/customer-reviews";
import CustomerLoyalty from "@/pages/usuario/customer-loyalty";
import CustomerAbout from "@/pages/usuario/customer-about";
import CustomerContact from "@/pages/usuario/customer-contact";
import SelectTable from "@/pages/usuario/select-table";
import LandingPage from "@/pages/landing";

/** Wrapper that protects admin routes — redirects to /login if unauthenticated */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/admin/login" />;
  }

  return <>{children}</>;
}

/** If already logged in, redirect away from login page */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/admin" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Landing page */}
      <Route path="/" component={LandingPage} />

      {/* Customer routes */}
      <Route path="/mesa" component={SelectTable} />
      <Route path="/m/:tableId" component={CustomerMenu} />
      <Route path="/m/:tableId/pedido" component={CustomerOrder} />
      <Route path="/m/:tableId/garcom" component={CustomerWaiter} />
      <Route path="/m/:tableId/conta" component={CustomerBill} />
      <Route path="/m/:tableId/avaliacoes" component={CustomerReviews} />
      <Route path="/m/:tableId/fidelidade" component={CustomerLoyalty} />
      <Route path="/m/:tableId/sobre" component={CustomerAbout} />
      <Route path="/m/:tableId/contato" component={CustomerContact} />

      {/* Admin routes */}
      <Route path="/admin/login">
        <GuestRoute><Login /></GuestRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute><Shell><Dashboard /></Shell></ProtectedRoute>
      </Route>
      <Route path="/admin/orders">
        <ProtectedRoute><Shell><Orders /></Shell></ProtectedRoute>
      </Route>
      <Route path="/admin/menu">
        <ProtectedRoute><Shell><Menu /></Shell></ProtectedRoute>
      </Route>
      <Route path="/admin/tables">
        <ProtectedRoute><Shell><Tables /></Shell></ProtectedRoute>
      </Route>
      <Route path="/admin/acquirers">
        <ProtectedRoute><Shell><Acquirers /></Shell></ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
