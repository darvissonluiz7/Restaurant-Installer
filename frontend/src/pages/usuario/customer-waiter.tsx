import { useState } from "react";
import { useParams } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle2,
  Loader2,
  HandMetal,
  Clock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import CustomerShell from "@/components/usuario/CustomerShell";

export default function CustomerWaiter() {
  const { tableId } = useParams();
  const tableNumber = parseInt(tableId || "0", 10);
  const [called, setCalled] = useState(false);

  const callWaiterMutation = useMutation({
    mutationFn: () => api.customerCallWaiter(tableNumber),
    onSuccess: () => {
      setCalled(true);
      toast({ title: "Garçom Chamado! 🔔", description: "Um atendente virá até a sua mesa em breve." });
    },
    onError: (err: any) => {
      // 409 = already pending
      if (err?.message?.includes("409")) {
        setCalled(true);
        toast({ title: "Aviso", description: "Já existe uma chamada pendente para sua mesa." });
      } else {
        toast({ title: "Erro", description: "Não foi possível chamar o garçom.", variant: "destructive" });
      }
    },
  });

  return (
    <CustomerShell activeId="waiter" title="Chamar Garçom" titleIcon={<Bell className="w-5 h-5 lg:hidden" />}>
      <main className="max-w-lg mx-auto px-4 py-10">
        <div className="text-center space-y-8">
          {/* Illustration */}
          <div className="relative mx-auto w-32 h-32">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
              called
                ? "bg-green-100 border-4 border-green-300"
                : "bg-amber-50 border-4 border-amber-200"
            }`}>
              {called ? (
                <CheckCircle2 className="w-14 h-14 text-green-500" />
              ) : (
                <HandMetal className="w-14 h-14 text-amber-500" />
              )}
            </div>
            {called && (
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <Bell className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Text */}
          {called ? (
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-green-700">Garçom a caminho!</h1>
              <p className="text-muted-foreground">
                Um atendente foi notificado e virá até a sua mesa em instantes.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Aguarde alguns minutos</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Precisa de ajuda?</h1>
              <p className="text-muted-foreground">
                Toque no botão abaixo para chamar um garçom até a sua mesa.
              </p>
            </div>
          )}

          {/* Button */}
          <Card className="border-border/40 shadow-lg">
            <CardContent className="p-6">
              <Button
                size="lg"
                className={`w-full h-16 text-lg font-bold rounded-2xl shadow-lg transition-all ${
                  called
                    ? "bg-green-600 hover:bg-green-700 shadow-green-200"
                    : "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
                }`}
                onClick={() => {
                  setCalled(false);
                  callWaiterMutation.mutate();
                }}
                disabled={callWaiterMutation.isPending}
              >
                {callWaiterMutation.isPending ? (
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                ) : (
                  <Bell className="w-6 h-6 mr-3" />
                )}
                {callWaiterMutation.isPending
                  ? "Chamando..."
                  : called
                  ? "Chamar Novamente"
                  : "Chamar Garçom"}
              </Button>
              {called && (
                <p className="text-xs text-muted-foreground mt-3">
                  Se o garçom não vier em 5 minutos, toque novamente.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="text-left space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Como funciona</h3>
            <div className="space-y-2">
              {[
                { step: "1", text: "Toque em \"Chamar Garçom\"" },
                { step: "2", text: "O garçom recebe a notificação" },
                { step: "3", text: "Aguarde — ele virá até sua mesa" },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-3">
                  <Badge variant="secondary" className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {step}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </CustomerShell>
  );
}
