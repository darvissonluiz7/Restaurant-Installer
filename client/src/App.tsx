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

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Dashboard}/>
        <Route path="/orders" component={Orders}/>
        <Route path="/menu" component={Menu}/>
        <Route path="/tables" component={Tables}/>
        <Route component={NotFound} />
      </Switch>
    </Shell>
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
