import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api, type Table } from "@/lib/api";
import { UtensilsCrossed, Users, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<Table["status"], { label: string; color: string; available: boolean }> = {
  free:     { label: "Livre",     color: "bg-green-500/10 border-green-500/40 text-green-700 hover:bg-green-500/20",  available: true },
  occupied: { label: "Ocupada",   color: "bg-red-500/10 border-red-400/40 text-red-600 cursor-not-allowed opacity-60", available: false },
  reserved: { label: "Reservada", color: "bg-blue-500/10 border-blue-400/40 text-blue-600 cursor-not-allowed opacity-60", available: false },
  cleaning: { label: "Limpeza",   color: "bg-orange-500/10 border-orange-400/40 text-orange-600 cursor-not-allowed opacity-60", available: false },
};

export default function SelectTable() {
  const [, navigate] = useLocation();

  const { data: tables, isLoading, isError } = useQuery({
    queryKey: ["public-tables"],
    queryFn: api.getPublicTables,
    refetchInterval: 15_000,
  });

  const handleSelect = (table: Table) => {
    if (statusConfig[table.status].available) {
      navigate(`/m/${table.number}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-center">
        <div className="flex items-center gap-2 text-primary font-bold text-2xl">
          <UtensilsCrossed className="w-7 h-7" />
          <span className="font-display">Zenny Food</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-4 pb-12 pt-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Welcome text */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold tracking-tight">
              Escolha sua mesa
            </h1>
            <p className="text-muted-foreground">
              Selecione uma mesa disponível para acessar o cardápio.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Livre</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Ocupada</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Reservada</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Limpeza</span>
          </div>

          {/* Tables grid */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <p className="text-center text-muted-foreground py-16">
              Não foi possível carregar as mesas. Tente novamente.
            </p>
          ) : !tables?.length ? (
            <p className="text-center text-muted-foreground py-16">
              Nenhuma mesa cadastrada ainda.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {tables.map((table) => {
                const cfg = statusConfig[table.status];
                return (
                  <button
                    key={table.id}
                    onClick={() => handleSelect(table)}
                    disabled={!cfg.available}
                    className={`
                      relative flex flex-col items-center justify-center gap-1.5
                      rounded-xl border-2 p-4 transition-all duration-150
                      ${cfg.color}
                      ${cfg.available ? "cursor-pointer active:scale-95" : ""}
                    `}
                  >
                    <span className="text-2xl font-bold">{table.number}</span>
                    <div className="flex items-center gap-1 text-xs opacity-70">
                      <Users className="w-3 h-3" />
                      <span>{table.capacity}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 mt-0.5 border-current"
                    >
                      {cfg.label}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        Powered by Zenny Food
      </footer>
    </div>
  );
}
