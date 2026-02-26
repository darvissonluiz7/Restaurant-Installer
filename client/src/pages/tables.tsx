import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";

// Mock tables data
const tables = Array.from({ length: 12 }, (_, i) => {
  const id = i + 1;
  // Randomize statuses for mockup
  let status = "Livre";
  let occupiedBy = null;
  let time = null;
  let amount = null;
  
  if (id === 2 || id === 4 || id === 8) {
    status = "Ocupada";
    occupiedBy = Math.floor(Math.random() * 4) + 1;
    time = `${Math.floor(Math.random() * 45) + 5} min`;
    amount = `R$ ${Math.floor(Math.random() * 200) + 50},00`;
  } else if (id === 5) {
    status = "Aguardando Limpeza";
  } else if (id === 10) {
    status = "Reservada";
    time = "19:30";
  }

  return { id, status, capacity: id % 3 === 0 ? 6 : 4, occupiedBy, time, amount };
});

export default function Tables() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Mapa de Mesas</h1>
          <p className="text-muted-foreground mt-1">Gerencie a ocupação e atendimento do salão.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500"></div> Livre</div>
          <div className="flex items-center gap-1.5 ml-3"><div className="w-3 h-3 rounded-full bg-primary"></div> Ocupada</div>
          <div className="flex items-center gap-1.5 ml-3"><div className="w-3 h-3 rounded-full bg-orange-400"></div> Limpeza</div>
          <div className="flex items-center gap-1.5 ml-3"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Reservada</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {tables.map((table) => (
          <Card 
            key={table.id} 
            className={`border-2 transition-all cursor-pointer hover:shadow-md relative overflow-hidden ${
              table.status === 'Livre' ? 'border-green-500/20 hover:border-green-500/50' :
              table.status === 'Ocupada' ? 'border-primary shadow-sm shadow-primary/10' :
              table.status === 'Aguardando Limpeza' ? 'border-orange-400/50 bg-orange-50 dark:bg-orange-950/10' :
              'border-blue-500/50 bg-blue-50 dark:bg-blue-950/10'
            }`}
          >
            {table.status === 'Ocupada' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            )}
            
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full border-2 border-border/50 flex items-center justify-center bg-secondary/50">
                  <span className="font-display font-bold text-lg">{table.id}</span>
                </div>
                <Badge variant={table.status === 'Ocupada' ? 'default' : 'outline'} className={`
                  ${table.status === 'Livre' ? 'text-green-600 border-green-200 bg-green-50' : ''}
                  ${table.status === 'Aguardando Limpeza' ? 'text-orange-600 border-orange-200' : ''}
                  ${table.status === 'Reservada' ? 'text-blue-600 border-blue-200' : ''}
                `}>
                  {table.status}
                </Badge>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{table.occupiedBy ? `${table.occupiedBy}/${table.capacity}` : `Lugares: ${table.capacity}`}</span>
                  </div>
                  {table.time && (
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4" />
                      {table.time}
                    </div>
                  )}
                </div>

                {table.status === 'Ocupada' && (
                  <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Parcial</span>
                    <span className="font-bold text-foreground">{table.amount}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}