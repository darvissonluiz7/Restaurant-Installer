import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Info, Clock, MapPin, Utensils, Award, Leaf } from "lucide-react";
import CustomerShell from "@/components/usuario/CustomerShell";

export default function CustomerAbout() {
  return (
    <CustomerShell activeId="about" title="Sobre Nós" titleIcon={<Info className="w-5 h-5 lg:hidden" />}>
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <Card className="border-border/40 shadow-sm overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-lg flex items-center justify-center mb-3">
                <Utensils className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">RestoPro</h1>
              <p className="text-sm text-muted-foreground mt-1">Gastronomia com tecnologia</p>
            </div>
          </div>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Somos um restaurante que alia a tradição culinária à inovação tecnológica. 
              Nosso cardápio digital permite que você faça seu pedido com praticidade, 
              sem filas e com total controle do que está consumindo.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Utensils, label: "Culinária de Qualidade", desc: "Ingredientes frescos e selecionados" },
            { icon: Leaf, label: "Opções Saudáveis", desc: "Pratos fit e veganos disponíveis" },
            { icon: Award, label: "Premiado", desc: "Melhor restaurante da região 2025" },
            { icon: Clock, label: "Atendimento Rápido", desc: "Pedidos direto para a cozinha" },
          ].map(({ icon: Icon, label, desc }) => (
            <Card key={label} className="border-border/30">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-xs">{label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Hours */}
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Horário de Funcionamento
            </h3>
            <Separator />
            <div className="space-y-2 text-sm">
              {[
                { day: "Segunda a Quinta", hours: "11:00 - 23:00" },
                { day: "Sexta e Sábado", hours: "11:00 - 00:00" },
                { day: "Domingo", hours: "11:00 - 22:00" },
              ].map(({ day, hours }) => (
                <div key={day} className="flex justify-between">
                  <span className="text-muted-foreground">{day}</span>
                  <span className="font-medium">{hours}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Localização
            </h3>
            <Separator />
            <p className="text-sm text-muted-foreground">
              Rua Exemplo, 123 — Centro<br />
              São Paulo — SP, 01234-567
            </p>
            <Badge variant="secondary" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              Estacionamento gratuito
            </Badge>
          </CardContent>
        </Card>
      </main>
    </CustomerShell>
  );
}
