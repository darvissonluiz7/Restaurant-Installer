import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Check,
  ExternalLink,
  Loader2,
  Construction,
  ChevronRight,
  ShieldCheck,
  Unplug,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

/* ─── Types ─── */
type AcquirerStatus = "available" | "coming_soon";
type ConnectionStatus = "connected" | "disconnected";

interface Acquirer {
  id: string;
  name: string;
  description: string;
  logo: React.ReactNode;
  status: AcquirerStatus;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
  fees?: string;
}

/* ─── Logo components ─── */
function MercadoPagoLogo() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00b1ea]/10">
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <circle cx="20" cy="20" r="18" fill="#00b1ea" />
        <text
          x="20"
          y="26"
          textAnchor="middle"
          fill="white"
          fontWeight="bold"
          fontSize="18"
          fontFamily="sans-serif"
        >
          MP
        </text>
      </svg>
    </div>
  );
}

function PagBankLogo() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFC72C]/10">
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <circle cx="20" cy="20" r="18" fill="#FFC72C" />
        <text
          x="20"
          y="26"
          textAnchor="middle"
          fill="#1a1a1a"
          fontWeight="bold"
          fontSize="16"
          fontFamily="sans-serif"
        >
          PB
        </text>
      </svg>
    </div>
  );
}

function InfinitePayLogo() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1DB954]/10">
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <circle cx="20" cy="20" r="18" fill="#1DB954" />
        <text
          x="20"
          y="26"
          textAnchor="middle"
          fill="white"
          fontWeight="bold"
          fontSize="14"
          fontFamily="sans-serif"
        >
          IP
        </text>
      </svg>
    </div>
  );
}

function PagarmeLogo() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#65A300]/10">
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <circle cx="20" cy="20" r="18" fill="#65A300" />
        <text
          x="20"
          y="26"
          textAnchor="middle"
          fill="white"
          fontWeight="bold"
          fontSize="14"
          fontFamily="sans-serif"
        >
          PM
        </text>
      </svg>
    </div>
  );
}

/* ─── Acquirer Data ─── */
const acquirers: Acquirer[] = [
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description:
      "Receba pagamentos via Pix, cartão de crédito e débito com uma das maiores plataformas de pagamento do Brasil.",
    logo: <MercadoPagoLogo />,
    status: "available",
    color: "text-[#00b1ea]",
    bgColor: "bg-[#00b1ea]/5",
    borderColor: "border-[#00b1ea]/20 hover:border-[#00b1ea]/50",
    features: [
      "Pix instantâneo",
      "Cartão de crédito e débito",
      "Taxas competitivas",
      "Aprovação rápida",
      "Antecipação de recebíveis",
      "Checkout transparente",
    ],
    fees: "A partir de 1,99% no crédito",
  },
  {
    id: "pagbank",
    name: "PagBank",
    description:
      "Solução completa de pagamentos do PagSeguro com conta digital integrada.",
    logo: <PagBankLogo />,
    status: "coming_soon",
    color: "text-[#FFC72C]",
    bgColor: "bg-[#FFC72C]/5",
    borderColor: "border-[#FFC72C]/20",
    features: [
      "Pix e QR Code",
      "Cartões de crédito e débito",
      "Boleto",
      "Conta digital PagBank",
    ],
  },
  {
    id: "infinitepay",
    name: "InfinitePay",
    description:
      "Pagamentos com as menores taxas do mercado e recebimento na hora.",
    logo: <InfinitePayLogo />,
    status: "coming_soon",
    color: "text-[#1DB954]",
    bgColor: "bg-[#1DB954]/5",
    borderColor: "border-[#1DB954]/20",
    features: [
      "Recebimento instantâneo",
      "Menores taxas do mercado",
      "Pix grátis",
      "Gestão financeira",
    ],
  },
  {
    id: "pagarme",
    name: "Pagar.me",
    description:
      "Infraestrutura de pagamentos robusta com split de pagamento para marketplaces.",
    logo: <PagarmeLogo />,
    status: "coming_soon",
    color: "text-[#65A300]",
    bgColor: "bg-[#65A300]/5",
    borderColor: "border-[#65A300]/20",
    features: [
      "Split de pagamento",
      "Multi-meio de pagamento",
      "Recorrência",
      "Antifraude integrado",
    ],
  },
];

/* ═══════════════════════════════════════════════════ */
/*               ACQUIRERS PAGE                       */
/* ═══════════════════════════════════════════════════ */

export default function Acquirers() {
  const [selectedAcquirer, setSelectedAcquirer] = useState<Acquirer | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, ConnectionStatus>>({});
  const [accessToken, setAccessToken] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [pixEnabled, setPixEnabled] = useState(true);
  const [creditEnabled, setCreditEnabled] = useState(true);
  const [debitEnabled, setDebitEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleConnect = (acquirer: Acquirer) => {
    if (acquirer.status === "coming_soon") return;
    setSelectedAcquirer(acquirer);
    setConfigOpen(true);
    // Reset form
    setAccessToken("");
    setPublicKey("");
    setPixEnabled(true);
    setCreditEnabled(true);
    setDebitEnabled(true);
  };

  const handleSave = async () => {
    if (!selectedAcquirer) return;
    if (!accessToken.trim()) {
      toast({
        title: "Token obrigatório",
        description: "Insira o Access Token do Mercado Pago.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    // Simulate API call
    await new Promise((res) => setTimeout(res, 1500));
    setConnectionStatus((prev) => ({
      ...prev,
      [selectedAcquirer.id]: "connected",
    }));
    setIsSaving(false);
    setConfigOpen(false);
    toast({
      title: "Conectado com sucesso!",
      description: `${selectedAcquirer.name} foi configurado e está pronto para receber pagamentos.`,
    });
  };

  const handleDisconnect = (acquirerId: string) => {
    setConnectionStatus((prev) => ({
      ...prev,
      [acquirerId]: "disconnected",
    }));
    toast({
      title: "Desconectado",
      description: "O adquirente foi desconectado com sucesso.",
    });
  };

  const isConnected = (id: string) => connectionStatus[id] === "connected";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <Wallet className="h-8 w-8 text-primary" />
            Adquirentes
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure os meios de pagamento do seu restaurante.
          </p>
        </div>
        <Badge variant="outline" className="text-xs gap-1.5 px-3 py-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
          Conexões seguras via SSL
        </Badge>
      </div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4"
      >
        <CreditCard className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">
            Conecte um adquirente para receber pagamentos
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Seus clientes poderão pagar diretamente pelo cardápio digital via Pix, cartão de crédito ou débito.
          </p>
        </div>
      </motion.div>

      {/* Acquirer grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {acquirers.map((acquirer, index) => {
          const connected = isConnected(acquirer.id);
          const comingSoon = acquirer.status === "coming_soon";

          return (
            <motion.div
              key={acquirer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
            >
              <Card
                className={`relative overflow-hidden border transition-all duration-300 ${
                  connected
                    ? "border-green-500/30 bg-green-500/[0.02] shadow-sm shadow-green-500/10"
                    : comingSoon
                    ? "border-border/40 opacity-75"
                    : acquirer.borderColor
                } ${!comingSoon ? "cursor-pointer hover:shadow-md" : ""}`}
                onClick={() => !connected && handleConnect(acquirer)}
              >
                {/* Coming soon overlay */}
                {comingSoon && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Construction className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">
                        Em breve
                      </span>
                      <span className="text-xs text-muted-foreground/70 max-w-[200px]">
                        Estamos trabalhando na integração
                      </span>
                    </div>
                  </div>
                )}

                {/* Connected indicator */}
                {connected && (
                  <div className="absolute top-3 right-3 z-20">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                      </span>
                      Conectado
                    </motion.div>
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className="shrink-0">{acquirer.logo}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold font-display">
                          {acquirer.name}
                        </h3>
                        {acquirer.status === "available" && !connected && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-2 py-0 bg-primary/10 text-primary border-primary/20"
                          >
                            Disponível
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {acquirer.description}
                      </p>

                      {/* Features preview */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {acquirer.features.slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            <Check className="h-3 w-3 text-primary/60" />
                            {f}
                          </span>
                        ))}
                        {acquirer.features.length > 3 && (
                          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] text-muted-foreground">
                            +{acquirer.features.length - 3} mais
                          </span>
                        )}
                      </div>

                      {/* Fees */}
                      {acquirer.fees && !comingSoon && (
                        <p className="mt-2 text-xs text-muted-foreground/80">
                          {acquirer.fees}
                        </p>
                      )}

                      {/* Action button */}
                      {!comingSoon && (
                        <div className="mt-4 flex items-center gap-2">
                          {connected ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConnect(acquirer);
                                }}
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                Configurar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDisconnect(acquirer.id);
                                }}
                              >
                                <Unplug className="h-3.5 w-3.5 mr-1.5" />
                                Desconectar
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" className="text-xs rounded-lg">
                              Conectar
                              <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Config Dialog (Mercado Pago) ─── */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {selectedAcquirer?.logo}
              <div>
                <DialogTitle className="font-display">
                  Configurar {selectedAcquirer?.name}
                </DialogTitle>
                <DialogDescription>
                  Insira suas credenciais para ativar os pagamentos.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Warning */}
            <div className="flex items-start gap-2.5 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800/50 dark:bg-orange-950/20">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
              <p className="text-xs text-orange-800 dark:text-orange-300 leading-relaxed">
                Suas credenciais são armazenadas de forma segura e criptografada.
                Nunca compartilhe seu Access Token publicamente.
              </p>
            </div>

            {/* Access Token */}
            <div className="space-y-2">
              <Label htmlFor="access_token" className="text-sm font-medium">
                Access Token <span className="text-destructive">*</span>
              </Label>
              <Input
                id="access_token"
                type="password"
                placeholder="APP_USR-0000000000000000-000000-00000000000000000000000000000000-000000000"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Encontre em:{" "}
                <a
                  href="https://www.mercadopago.com.br/developers/panel/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  Painel de Desenvolvedores
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            {/* Public Key */}
            <div className="space-y-2">
              <Label htmlFor="public_key" className="text-sm font-medium">
                Public Key
              </Label>
              <Input
                id="public_key"
                type="text"
                placeholder="APP_USR-00000000-0000-0000-0000-000000000000"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            {/* Payment methods toggle */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Métodos de Pagamento</Label>
              <div className="space-y-3 rounded-lg border border-border/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-green-600" fill="currentColor">
                        <path d="M9.5 4C6.46 4 4 6.46 4 9.5S6.46 15 9.5 15h1V9.5c0-2.21 1.79-4 4-4H16C14.94 4 13.8 4 12.74 4.2 11.85 4.04 10.84 4 9.5 4zm5 5v5.5c0 .55.45 1 1 1h.5c2.76 0 5-2.24 5-5s-2.24-5-5-5H15c.63.83 1 1.87 1 3v.5c0 .55-.45 1-1 1h-.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Pix</p>
                      <p className="text-[11px] text-muted-foreground">
                        Recebimento instantâneo
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={pixEnabled}
                    onCheckedChange={setPixEnabled}
                  />
                </div>

                <div className="h-px bg-border/50" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Cartão de Crédito</p>
                      <p className="text-[11px] text-muted-foreground">
                        Visa, Master, Elo, Amex
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={creditEnabled}
                    onCheckedChange={setCreditEnabled}
                  />
                </div>

                <div className="h-px bg-border/50" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Cartão de Débito</p>
                      <p className="text-[11px] text-muted-foreground">
                        Visa, Master, Elo
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={debitEnabled}
                    onCheckedChange={setDebitEnabled}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfigOpen(false)}
              >
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Salvar e Conectar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
