import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";

const menuCategories = ["Todos", "Pratos Principais", "Bebidas", "Sobremesas", "Entradas"];

const menuItems = [
  { id: 1, name: "Bife Ancho com Fritas", category: "Pratos Principais", price: "R$ 65,00", status: "Disponível", img: "🥩" },
  { id: 2, name: "Salmão Grelhado", category: "Pratos Principais", price: "R$ 78,00", status: "Disponível", img: "🐟" },
  { id: 3, name: "Risoto de Cogumelos", category: "Pratos Principais", price: "R$ 55,00", status: "Disponível", img: "🍄" },
  { id: 4, name: "Suco de Laranja Natural", category: "Bebidas", price: "R$ 12,00", status: "Disponível", img: "🍊" },
  { id: 5, name: "Cerveja Artesanal IPA", category: "Bebidas", price: "R$ 22,00", status: "Pouco Estoque", img: "🍺" },
  { id: 6, name: "Pudim de Leite", category: "Sobremesas", price: "R$ 18,00", status: "Esgotado", img: "🍮" },
  { id: 7, name: "Bruschetta de Tomate", category: "Entradas", price: "R$ 28,00", status: "Disponível", img: "🥖" },
];

export default function Menu() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Cardápio</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus pratos, preços e disponibilidade.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar no cardápio..." className="pl-9 w-[250px]" />
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Adicionar Item
          </Button>
        </div>
      </div>

      <Tabs defaultValue="Todos" className="w-full">
        <TabsList className="mb-6 overflow-x-auto flex-wrap h-auto p-1 bg-secondary/50">
          {menuCategories.map(cat => (
            <TabsTrigger key={cat} value={cat} className="data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="Todos" className="m-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {menuItems.map(item => (
              <Card key={item.id} className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors group">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] bg-secondary flex items-center justify-center text-6xl relative">
                    {item.img}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                        item.status === 'Disponível' ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                        item.status === 'Esgotado' ? 'bg-red-500/20 text-red-700 dark:text-red-400' :
                        'bg-orange-500/20 text-orange-700 dark:text-orange-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold leading-tight">{item.name}</h3>
                      <span className="font-bold text-primary whitespace-nowrap">{item.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">{item.category}</p>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                        <Edit2 className="w-3 h-3 mr-1" /> Editar
                      </Button>
                      <Button variant="outline" size="sm" className="w-8 h-8 p-0 text-destructive hover:bg-destructive hover:text-white shrink-0">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}