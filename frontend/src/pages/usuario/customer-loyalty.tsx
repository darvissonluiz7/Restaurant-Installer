import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Gift, Star, Trophy, Sparkles, Crown } from "lucide-react";
import CustomerShell from "@/components/usuario/CustomerShell";

const rewards = [
  { id: 1, name: "Sobremesa Grátis", points: 50, icon: "🍰", unlocked: true },
  { id: 2, name: "Bebida Grátis", points: 100, icon: "🥤", unlocked: true },
  { id: 3, name: "10% de Desconto", points: 200, icon: "💰", unlocked: false },
  { id: 4, name: "Prato Principal Grátis", points: 500, icon: "🍽️", unlocked: false },
];

export default function CustomerLoyalty() {
  const currentPoints = 120;
  const nextReward = rewards.find(r => !r.unlocked);
  const progressToNext = nextReward ? (currentPoints / nextReward.points) * 100 : 100;

  return (
    <CustomerShell activeId="loyalty" title="Fidelidade" titleIcon={<Gift className="w-5 h-5 lg:hidden" />}>
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Points card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden relative">
          <div className="absolute top-3 right-3 opacity-10">
            <Crown className="w-24 h-24" />
          </div>
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Seus Pontos</span>
            </div>
            <div className="text-4xl font-bold mb-4">{currentPoints} <span className="text-lg font-normal text-white/70">pts</span></div>
            
            {nextReward && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-white/80">
                  <span>Próxima recompensa: {nextReward.name}</span>
                  <span>{currentPoints}/{nextReward.points}</span>
                </div>
                <Progress value={progressToNext} className="h-2 bg-white/20" />
                <p className="text-xs text-white/60">Faltam {nextReward.points - currentPoints} pontos</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How it works */}
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Como Funciona
            </h3>
            <div className="space-y-3">
              {[
                { step: "1", text: "Faça pedidos pelo cardápio digital", sub: "A cada R$10 você ganha 1 ponto" },
                { step: "2", text: "Acumule pontos automaticamente", sub: "Seus pontos ficam salvos na sua conta" },
                { step: "3", text: "Troque por recompensas", sub: "Escolha entre diversas opções" },
              ].map(({ step, text, sub }) => (
                <div key={step} className="flex gap-3">
                  <Badge variant="secondary" className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {step}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{text}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rewards catalog */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
            <Star className="w-4 h-4" />
            Recompensas Disponíveis
          </h3>
          {rewards.map(reward => (
            <Card key={reward.id} className={`border-border/30 shadow-sm transition-all ${reward.unlocked ? "hover:shadow-md" : "opacity-60"}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0">
                  {reward.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{reward.name}</p>
                  <p className="text-xs text-muted-foreground">{reward.points} pontos</p>
                </div>
                {reward.unlocked ? (
                  <Button size="sm" variant="outline" className="border-primary text-primary text-xs shrink-0">
                    Resgatar
                  </Button>
                ) : (
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    🔒 {reward.points - currentPoints} pts restantes
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </CustomerShell>
  );
}
