import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Plus, MoreVertical, CheckCircle2 } from "lucide-react";

// Mock data
const initialOrders = [
  { id: "1028", table: "Mesa 02", items: ["1x Risoto de Salmão", "2x Taça Vinho Branco"], time: "2 min ago", status: "new", total: "R$ 120,00" },
  { id: "1029", table: "Mesa 05", items: ["3x Cerveja Artesanal", "1x Porção Bolinho de Bacalhau"], time: "5 min ago", status: "new", total: "R$ 85,00" },
  { id: "1024", table: "Mesa 04", items: ["2x Hamburguer Duplo", "1x Fritas G", "2x Suco Laranja"], time: "15 min ago", status: "preparing", total: "R$ 115,00" },
  { id: "1022", table: "Delivery", items: ["1x Pizza Calabresa", "1x Refrigerante 2L"], time: "25 min ago", status: "preparing", total: "R$ 75,00" },
  { id: "1020", table: "Mesa 12", items: ["1x Executivo Frango", "1x Água Mineral"], time: "30 min ago", status: "ready", total: "R$ 35,00" },
];

export default function Orders() {
  const [orders, setOrders] = useState(initialOrders);

  const moveOrder = (id: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const Column = ({ title, status, colorClass }: { title: string, status: string, colorClass: string }) => {
    const columnOrders = orders.filter(o => o.status === status);
    
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colorClass}`} />
            <h2 className="font-semibold text-foreground">{title}</h2>
          </div>
          <Badge variant="secondary" className="font-mono">{columnOrders.length}</Badge>
        </div>
        
        <div className="flex-1 min-h-[500px] bg-secondary/30 rounded-xl p-3 border border-border/50 flex flex-col gap-3">
          {columnOrders.map(order => (
            <Card key={order.id} className="border border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-display">#{order.id}</CardTitle>
                    <Badge variant="outline" className="text-xs">{order.table}</Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1.5">
                    <Clock className="w-3 h-3 mr-1" /> {order.time}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  {order.items.map((item, i) => (
                    <li key={i} className="line-clamp-1 flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-border mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="font-semibold text-sm">{order.total}</span>
                  
                  {status === 'new' && (
                    <Button size="sm" onClick={() => moveOrder(order.id, 'preparing')} className="h-8 text-xs bg-orange-500 hover:bg-orange-600 text-white">
                      Preparar
                    </Button>
                  )}
                  {status === 'preparing' && (
                    <Button size="sm" onClick={() => moveOrder(order.id, 'ready')} className="h-8 text-xs bg-green-500 hover:bg-green-600 text-white">
                      Pronto
                    </Button>
                  )}
                  {status === 'ready' && (
                    <Button size="sm" onClick={() => moveOrder(order.id, 'delivered')} variant="outline" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Entregue
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {columnOrders.length === 0 && (
            <div className="h-32 flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg m-2">
              Nenhum pedido
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Gestão de Pedidos</h1>
          <p className="text-muted-foreground mt-1">Acompanhe e mova os pedidos pelo fluxo.</p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Novo Pedido
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <Column title="Novos Pedidos" status="new" colorClass="bg-blue-500" />
        <Column title="Em Preparo" status="preparing" colorClass="bg-orange-500" />
        <Column title="Prontos" status="ready" colorClass="bg-green-500" />
      </div>
    </div>
  );
}