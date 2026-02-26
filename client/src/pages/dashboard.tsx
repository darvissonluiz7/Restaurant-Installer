import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, ShoppingBag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Vendas de Hoje",
    value: "R$ 4.231,50",
    trend: "+12.5%",
    isUp: true,
    icon: DollarSign,
  },
  {
    title: "Pedidos Feitos",
    value: "142",
    trend: "+5.2%",
    isUp: true,
    icon: ShoppingBag,
  },
  {
    title: "Mesas Ocupadas",
    value: "18 / 24",
    trend: "-2",
    isUp: false,
    icon: Users,
  },
  {
    title: "Tempo Médio",
    value: "24 min",
    trend: "-3 min",
    isUp: true,
    icon: Clock,
  },
];

const recentOrders = [
  { id: "1024", table: "Mesa 04", items: "2x Hamburguer, 1x Fritas", total: "R$ 98,00", status: "Preparando", time: "10 min" },
  { id: "1025", table: "Mesa 12", items: "1x Pizza G, 2x Refri", total: "R$ 115,00", status: "Pronto", time: "2 min" },
  { id: "1026", table: "Delivery", items: "Sushi Combo", total: "R$ 140,00", status: "Novo", time: "Agora" },
  { id: "1027", table: "Balcão", items: "1x Café Expresso", total: "R$ 8,00", status: "Entregue", time: "15 min" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Bem-vindo de volta, aqui está o resumo de hoje.</p>
        </div>
        <Button data-testid="btn-new-order" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
          + Novo Pedido
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold">{stat.value}</div>
              <div className={`flex items-center text-xs mt-1 ${stat.isUp ? 'text-green-600' : 'text-red-500'}`}>
                {stat.isUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {stat.trend} <span className="text-muted-foreground ml-1">vs ontem</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pedidos Recentes</CardTitle>
                <CardDescription>Acompanhe o fluxo da cozinha em tempo real.</CardDescription>
              </div>
              <Button variant="outline" size="sm">Ver todos</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 rounded-lg">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg font-medium">Pedido</th>
                    <th className="px-4 py-3 font-medium">Local</th>
                    <th className="px-4 py-3 font-medium">Itens</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 rounded-r-lg font-medium">Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">#{order.id}</td>
                      <td className="px-4 py-3 text-muted-foreground">{order.table}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground" title={order.items}>{order.items}</td>
                      <td className="px-4 py-3 font-medium">{order.total}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Novo' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                          order.status === 'Preparando' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' :
                          order.status === 'Pronto' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {order.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Pratos Populares</CardTitle>
            <CardDescription>Mais vendidos hoje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Hamburguer Artesanal", sales: 45, price: "R$ 35,00" },
              { name: "Pizza Marguerita", sales: 32, price: "R$ 48,00" },
              { name: "Suco Natural", sales: 28, price: "R$ 12,00" },
              { name: "Porção de Fritas", sales: 24, price: "R$ 25,00" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.sales} pedidos</p>
                  </div>
                </div>
                <div className="text-sm font-medium">{item.price}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}