import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, QrCode, ArrowRight } from "lucide-react";

export default function SelectTable() {
  const [, navigate] = useLocation();
  const [tableNumber, setTableNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(tableNumber);
    if (num && num > 0) {
      navigate(`/m/${num}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-center">
        <div className="flex items-center gap-2 text-primary font-bold text-2xl">
          <UtensilsCrossed className="w-7 h-7" />
          <span className="font-display">RestoPro</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Welcome text */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold tracking-tight">
              Bem-vindo!
            </h1>
            <p className="text-muted-foreground">
              Digite o número da sua mesa para acessar o cardápio digital.
            </p>
          </div>

          {/* Table number form */}
          <Card className="border-border/50 shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="table-number"
                    className="text-sm font-medium text-foreground"
                  >
                    Número da Mesa
                  </label>
                  <Input
                    id="table-number"
                    type="number"
                    min="1"
                    inputMode="numeric"
                    placeholder="Ex: 5"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="h-14 text-center text-2xl font-bold tracking-wider"
                    autoFocus
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={!tableNumber || parseInt(tableNumber) < 1}
                >
                  Acessar Cardápio
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* QR code hint */}
          <div className="flex items-center gap-3 justify-center text-muted-foreground text-sm">
            <QrCode className="w-5 h-5 shrink-0" />
            <p>
              Você também pode escanear o <strong className="text-foreground">QR Code</strong> na sua mesa para entrar direto.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        Powered by RestoPro
      </footer>
    </div>
  );
}
