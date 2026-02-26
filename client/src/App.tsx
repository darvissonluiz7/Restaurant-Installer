import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Shell from "@/components/layout/Shell";
import Dashboard from "@/pages/dashboard";
import Orders from "@/pages/orders";
import Menu from "@/pages/menu";
import Tables from "@/pages/tables";
import Login from "@/pages/login";
import CustomerMenu from "@/pages/customer-menu";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login}/>
      <Route path="/m/:tableId" component={CustomerMenu}/>
      
      <Route path="/">
        <Shell><Dashboard /></Shell>
      </Route>
      <Route path="/orders">
        <Shell><Orders /></Shell>
      </Route>
      <Route path="/menu">
        <Shell><Menu /></Shell>
      </Route>
      <Route path="/tables">
        <Shell><Tables /></Shell>
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
