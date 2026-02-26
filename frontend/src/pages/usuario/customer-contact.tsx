import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  Instagram,
  Facebook,
  MapPin,
  MessageCircle,
  Globe,
} from "lucide-react";
import CustomerShell from "@/components/usuario/CustomerShell";

const contactItems = [
  {
    icon: Phone,
    label: "Telefone",
    value: "(11) 9999-9999",
    action: "tel:+5511999999999",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "(11) 9999-9999",
    action: "https://wa.me/5511999999999",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: "contato@restopro.com",
    action: "mailto:contato@restopro.com",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: "@restopro",
    action: "https://instagram.com/restopro",
    color: "text-pink-600 bg-pink-50",
  },
  {
    icon: Facebook,
    label: "Facebook",
    value: "/restopro",
    action: "https://facebook.com/restopro",
    color: "text-blue-700 bg-blue-50",
  },
  {
    icon: Globe,
    label: "Website",
    value: "www.restopro.com",
    action: "https://restopro.com",
    color: "text-primary bg-primary/10",
  },
];

export default function CustomerContact() {
  return (
    <CustomerShell activeId="contact" title="Contato" titleIcon={<Phone className="w-5 h-5 lg:hidden" />}>
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 py-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Phone className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Fale Conosco</h1>
          <p className="text-sm text-muted-foreground">
            Entre em contato por qualquer um dos canais abaixo
          </p>
        </div>

        {/* Contact cards */}
        <div className="space-y-3">
          {contactItems.map(({ icon: Icon, label, value, action, color }) => (
            <a key={label} href={action} target="_blank" rel="noopener noreferrer" className="block">
              <Card className="border-border/30 shadow-sm hover:shadow-md transition-all active:scale-[0.99]">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground truncate">{value}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-primary shrink-0">
                    Abrir
                  </Button>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {/* Location */}
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Endereço
            </h3>
            <Separator />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Rua Exemplo, 123 — Centro<br />
              São Paulo — SP, 01234-567
            </p>
            <a
              href="https://maps.google.com/?q=Rua+Exemplo+123"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="w-full text-xs mt-2">
                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                Abrir no Google Maps
              </Button>
            </a>
          </CardContent>
        </Card>
      </main>
    </CustomerShell>
  );
}
