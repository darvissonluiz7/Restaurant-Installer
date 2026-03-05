import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "wouter";
import {
  ChefHat,
  Smartphone,
  BarChart3,
  Clock,
  Star,
  ArrowRight,
  Check,
  Zap,
  ShieldCheck,
  Users,
  QrCode,
  Bell,
  Receipt,
  TrendingUp,
  Menu,
  X,
  CheckCircle2,
  MessageSquare,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ─── Fade-in animation wrapper ─── */
function FadeIn({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}) {
  const dirMap = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };
  return (
    <motion.div
      initial={{ opacity: 0, ...dirMap[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Floating badge ─── */
function FloatingBadge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className={`inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─── Feature card ─── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <FadeIn delay={delay}>
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-shadow hover:shadow-xl hover:border-primary/30"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold font-display">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </motion.div>
    </FadeIn>
  );
}

/* ─── Stat counter ─── */
function StatCard({
  value,
  label,
  delay = 0,
}: {
  value: string;
  label: string;
  delay?: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="text-center">
        <div className="text-4xl md:text-5xl font-bold font-display bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
          {value}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </div>
    </FadeIn>
  );
}

/* ─── Pricing card ─── */
function PricingCard({
  name,
  price,
  description,
  features,
  highlighted = false,
  delay = 0,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  delay?: number;
}) {
  return (
    <FadeIn delay={delay}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`relative overflow-hidden rounded-2xl border p-8 ${
          highlighted
            ? "border-primary bg-gradient-to-b from-primary/5 to-card shadow-xl shadow-primary/10"
            : "border-border/50 bg-card shadow-sm"
        }`}
      >
        {highlighted && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-orange-400" />
        )}
        <div className="mb-1 text-sm font-medium text-primary">{name}</div>
        <div className="mb-1">
          <span className="text-4xl font-bold font-display">{price}</span>
          {price !== "Sob consulta" && (
            <span className="text-muted-foreground">/mês</span>
          )}
        </div>
        <p className="mb-6 text-sm text-muted-foreground">{description}</p>
        <ul className="mb-8 space-y-3">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button
            className={`w-full rounded-xl ${
              highlighted ? "" : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-white"
            }`}
            size="lg"
          >
            Começar agora
          </Button>
        </a>
      </motion.div>
    </FadeIn>
  );
}

/* ─── Testimonial ─── */
function TestimonialCard({
  quote,
  name,
  role,
  delay = 0,
}: {
  quote: string;
  name: string;
  role: string;
  delay?: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="mb-4 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-primary text-primary"
            />
          ))}
        </div>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground italic">
          "{quote}"
        </p>
        <div>
          <div className="font-semibold text-sm">{name}</div>
          <div className="text-xs text-muted-foreground">{role}</div>
        </div>
      </div>
    </FadeIn>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*                      LANDING PAGE                              */
/* ═══════════════════════════════════════════════════════════════ */

const WHATSAPP_URL = "https://wa.me/5511999999999?text=Ol%C3%A1!%20Tenho%20interesse%20no%20sistema%20Rango%20para%20meu%20restaurante.";

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [formSent, setFormSent] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── HEADER / NAV ─── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <ChefHat className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold font-display text-primary">
              Rango
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#funcionalidades" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </a>
            <a href="#precos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
            <a href="#depoimentos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Depoimentos
            </a>
            <a href="#contato" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contato
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="rounded-full px-5">
                Teste Grátis
              </Button>
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="flex flex-col gap-4 px-6 py-6">
                <a href="#funcionalidades" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
                <a href="#precos" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Preços</a>
                <a href="#faq" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
                <a href="#depoimentos" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Depoimentos</a>
                <a href="#contato" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contato</a>
                <div className="flex gap-3 pt-2">
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full">Entrar</Button>
                  </a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full">Teste Grátis</Button>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative pt-28 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-orange-300/10 blur-[120px]" />
          <motion.div
            style={{ y: heroY }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(24_95%_53%/0.08),transparent_60%)]"
          />
        </div>
        {/* Grid pattern */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(0_0%_0%/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(0_0%_0%/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <motion.div style={{ opacity: heroOpacity }} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <FadeIn>
              <FloatingBadge className="mb-6">
                <Zap className="h-4 w-4" />
                Novo: Pedidos pelo celular, sem app
              </FloatingBadge>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display leading-[1.1] tracking-tight">
                O melhor sistema{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
                    para restaurantes
                  </span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                    className="absolute -bottom-1 left-0 right-0 h-1 origin-left rounded-full bg-gradient-to-r from-primary to-amber-500"
                  />
                </span>{" "}
                <span className="bg-gradient-to-r from-orange-500 to-primary bg-clip-text text-transparent">
                  Rango
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
                Cardápio digital por QR Code, pedidos em tempo real, gestão de mesas e pagamentos integrados.
                Tudo que seu restaurante precisa — sem enrolação.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                    Começar Gratuitamente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a href="#funcionalidades">
                  <Button variant="outline" size="lg" className="rounded-full px-8 text-base">
                    Ver Funcionalidades
                  </Button>
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" /> Sem cartão de crédito
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" /> 14 dias grátis
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" /> Suporte 24/7
                </span>
              </div>
            </FadeIn>
          </div>

          {/* Hero mockup */}
          <FadeIn delay={0.5}>
            <div className="relative mx-auto mt-16 max-w-5xl">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 via-orange-400/20 to-amber-400/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
                {/* Fake browser chrome */}
                <div className="flex items-center gap-2 border-b border-border/30 bg-muted/30 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="ml-4 flex-1 rounded-lg bg-background/80 px-4 py-1.5 text-xs text-muted-foreground">
                    rango.com.br/admin
                  </div>
                </div>
                {/* Dashboard mockup content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                  {/* Stats row */}
                  <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-5 border border-primary/10">
                    <div className="text-sm text-muted-foreground mb-1">Pedidos Hoje</div>
                    <div className="text-3xl font-bold font-display text-primary">147</div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" /> +23% vs ontem
                    </div>
                  </div>
                  <div className="rounded-xl bg-card p-5 border border-border/50">
                    <div className="text-sm text-muted-foreground mb-1">Faturamento</div>
                    <div className="text-3xl font-bold font-display">R$ 8.420</div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" /> +18% vs ontem
                    </div>
                  </div>
                  <div className="rounded-xl bg-card p-5 border border-border/50">
                    <div className="text-sm text-muted-foreground mb-1">Mesas Ocupadas</div>
                    <div className="text-3xl font-bold font-display">12/20</div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-3/5 rounded-full bg-primary" />
                    </div>
                  </div>
                  {/* Chart placeholder */}
                  <div className="md:col-span-2 rounded-xl bg-card p-5 border border-border/50">
                    <div className="text-sm font-medium mb-4">Vendas da Semana</div>
                    <div className="flex items-end h-32 gap-2">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                          className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-orange-400"
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
                    </div>
                  </div>
                  {/* Recent orders */}
                  <div className="rounded-xl bg-card p-5 border border-border/50">
                    <div className="text-sm font-medium mb-3">Pedidos Recentes</div>
                    <div className="space-y-3">
                      {[
                        { mesa: "Mesa 5", item: "X-Burger", status: "Pronto" },
                        { mesa: "Mesa 12", item: "Pizza Margherita", status: "Preparando" },
                        { mesa: "Mesa 3", item: "Açaí 500ml", status: "Novo" },
                      ].map((order, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <div>
                            <div className="font-medium">{order.mesa}</div>
                            <div className="text-muted-foreground">{order.item}</div>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              order.status === "Pronto"
                                ? "bg-green-100 text-green-700"
                                : order.status === "Preparando"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </motion.div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="border-y border-border/30 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="2.500+" label="Restaurantes Ativos" delay={0} />
            <StatCard value="1M+" label="Pedidos por Mês" delay={0.1} />
            <StatCard value="99,9%" label="Uptime Garantido" delay={0.2} />
            <StatCard value="4.9/5" label="Avaliação dos Clientes" delay={0.3} />
          </div>
        </div>
      </section>

      {/* ─── PAYMENT METHODS BAR ─── */}
      <section className="border-b border-border/30 bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Pagamentos aceitos
              </span>
              <div className="flex items-center gap-4 flex-wrap justify-center">
                {[
                  { label: "Pix", color: "bg-[#32BCAD]/10 text-[#32BCAD] border-[#32BCAD]/20" },
                  { label: "Mastercard", color: "bg-[#EB001B]/10 text-[#EB001B] border-[#EB001B]/20" },
                  { label: "Visa", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
                  { label: "Elo", color: "bg-yellow-400/10 text-yellow-600 border-yellow-400/20" },
                  { label: "Amex", color: "bg-blue-700/10 text-blue-700 border-blue-700/20" },
                  { label: "Débito", color: "bg-muted text-muted-foreground border-border/50" },
                ].map((method) => (
                  <span
                    key={method.label}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${method.color}`}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    {method.label}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="funcionalidades" className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <FadeIn>
              <FloatingBadge className="mb-4">
                <Star className="h-4 w-4" />
                Funcionalidades
              </FloatingBadge>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display">
                Tudo que você precisa em{" "}
                <span className="text-primary">um só lugar</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="mt-4 text-lg text-muted-foreground">
                O Rango foi feito pra quem trabalha duro. Ferramentas simples,
                resultado na hora — sem precisar de TI, sem treinamento longo.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={QrCode}
              title="Cardápio Digital QR Code"
              description="Seus clientes escaneiam o QR Code da mesa e acessam o cardápio completo direto no celular. Sem app, sem complicação."
              delay={0}
            />
            <FeatureCard
              icon={Bell}
              title="Pedidos em Tempo Real"
              description="Receba pedidos instantaneamente na cozinha e no painel admin. Acompanhe cada etapa de preparo em tempo real."
              delay={0.05}
            />
            <FeatureCard
              icon={Receipt}
              title="Gestão Financeira"
              description="Controle vendas, faturamento e custos. Relatórios detalhados para tomar decisões inteligentes."
              delay={0.1}
            />
            <FeatureCard
              icon={Smartphone}
              title="100% Responsivo"
              description="Funciona em qualquer dispositivo. Gerencie seu negócio do celular, tablet ou computador."
              delay={0.15}
            />
            <FeatureCard
              icon={Users}
              title="Gestão de Mesas"
              description="Visualize todas as mesas em tempo real. Saiba quais estão livres, ocupadas ou aguardando conta."
              delay={0.2}
            />
            <FeatureCard
              icon={BarChart3}
              title="Dashboard Inteligente"
              description="Métricas e insights sobre seu negócio. Saiba o que mais vende, horários de pico e tendências."
              delay={0.25}
            />
            <FeatureCard
              icon={Clock}
              title="Chamar Garçom"
              description="O cliente pode chamar o garçom direto pelo celular. Sem espera desnecessária, mais agilidade no atendimento."
              delay={0.3}
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Seguro & Confiável"
              description="Dados criptografados e backup automático. Seu negócio sempre protegido com a melhor tecnologia."
              delay={0.35}
            />
            <FeatureCard
              icon={Zap}
              title="Setup em 5 Minutos"
              description="Cadastre seus itens, imprima o QR Code e pronto! Sem instalação complexa, sem treinamentos longos."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 md:py-32 bg-muted/20 border-y border-border/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display">
                Começar é{" "}
                <span className="text-primary">fácil demais</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-4 text-lg text-muted-foreground">
                Em menos de 5 minutos seu restaurante já está no Rango. Sério.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                step: "01",
                icon: ChefHat,
                color: "from-primary/20 to-primary/5 border-primary/20",
                iconColor: "text-primary",
                title: "Cadastre seu Restaurante",
                description:
                  "Crie sua conta, adicione os itens do cardápio com fotos e preços. Personalize como quiser.",
              },
              {
                step: "02",
                icon: QrCode,
                color: "from-orange-500/20 to-orange-500/5 border-orange-500/20",
                iconColor: "text-orange-500",
                title: "Gere os QR Codes",
                description:
                  "Imprima QR Codes únicos para cada mesa. Cole na mesa e seus clientes já podem pedir.",
              },
              {
                step: "03",
                icon: BarChart3,
                color: "from-green-500/20 to-green-500/5 border-green-500/20",
                iconColor: "text-green-600",
                title: "Gerencie Tudo",
                description:
                  "Acompanhe pedidos, faturamento e mesas em tempo real pelo dashboard. Foque no que importa.",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`relative rounded-2xl border bg-gradient-to-br p-8 ${item.color}`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 dark:bg-black/20 shadow-sm ${item.iconColor}`}>
                      <item.icon className="h-7 w-7" />
                    </div>
                    <span className="text-5xl font-black font-display text-foreground/10 select-none leading-none">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold font-display mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {item.description}
                  </p>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-10 -right-5 z-10">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border shadow-sm">
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  )}
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="precos" className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <FadeIn>
              <FloatingBadge className="mb-4">
                <Zap className="h-4 w-4" />
                Preços
              </FloatingBadge>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display">
                Planos que cabem no seu{" "}
                <span className="text-primary">bolso</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="mt-4 text-lg text-muted-foreground">
                Comece grátis e escale conforme seu negócio cresce.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price="R$ 0"
              description="Perfeito para testar"
              features={[
                "Até 10 mesas",
                "Cardápio digital",
                "QR Codes ilimitados",
                "Pedidos em tempo real",
                "Suporte por email",
              ]}
              delay={0}
            />
            <PricingCard
              name="Profissional"
              price="R$ 97"
              description="Para restaurantes em crescimento"
              features={[
                "Mesas ilimitadas",
                "Dashboard completo",
                "Relatórios avançados",
                "Chamar garçom",
                "Programa de fidelidade",
                "Suporte prioritário",
              ]}
              highlighted
              delay={0.1}
            />
            <PricingCard
              name="Enterprise"
              price="Sob consulta"
              description="Para redes e franquias"
              features={[
                "Tudo do Profissional",
                "Múltiplas unidades",
                "API personalizada",
                "Integrações sob medida",
                "Gerente de conta dedicado",
                "SLA garantido",
              ]}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section
        id="depoimentos"
        className="py-20 md:py-32 bg-muted/20 border-y border-border/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display">
                O que nossos clientes{" "}
                <span className="text-primary">dizem</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-4 text-lg text-muted-foreground">
                Milhares de restaurantes já transformaram sua operação.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="Depois que implementamos o RestoPro, nossos pedidos ficaram organizados e o faturamento aumentou 35%. A facilidade do QR Code é impressionante!"
              name="Carlos Silva"
              role="Dono do Sabor & Arte Restaurante"
              delay={0}
            />
            <TestimonialCard
              quote="O melhor investimento que fiz pro meu negócio. Os clientes adoram poder pedir pelo celular e eu consigo gerenciar tudo pelo painel. Recomendo demais!"
              name="Ana Rodrigues"
              role="Proprietária da Lanchonete da Ana"
              delay={0.1}
            />
            <TestimonialCard
              quote="A equipe de suporte é excepcional. Implementamos em 3 unidades e a gestão centralizada mudou completamente nossa operação."
              name="Roberto Mendes"
              role="Diretor da Rede Burger Express"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 md:py-32 border-t border-border/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <FadeIn>
              <FloatingBadge className="mb-4">
                <MessageSquare className="h-4 w-4" />
                Dúvidas frequentes
              </FloatingBadge>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display">
                Perguntas{" "}
                <span className="text-primary">frequentes</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="mt-4 text-lg text-muted-foreground">
                Tudo que você precisa saber antes de começar.
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.2}>
            <Accordion type="single" collapsible className="space-y-3">
              {[
                {
                  q: "Preciso instalar algum aplicativo para usar o RestoPro?",
                  a: "Não! O RestoPro funciona totalmente no navegador, tanto para o painel administrativo quanto para o cardápio digital dos clientes. Basta acessar a URL — sem instalação, sem app na App Store.",
                },
                {
                  q: "Como os clientes fazem pedidos?",
                  a: "O cliente escaneia o QR Code da mesa com a câmera do celular, abre o cardápio digital direto no navegador e faz o pedido em segundos. O pedido chega instantaneamente no seu painel administrativo.",
                },
                {
                  q: "Funciona offline ou precisa de internet?",
                  a: "O sistema precisa de conexão com a internet para funcionar em tempo real. Recomendamos manter uma rede Wi-Fi estável no estabelecimento para garantir a melhor experiência.",
                },
                {
                  q: "Posso usar no celular para gerenciar meu restaurante?",
                  a: "Sim! O painel admin é totalmente responsivo e funciona muito bem no celular e tablet. Você pode acompanhar pedidos, ver o dashboard e gerenciar o cardápio de qualquer dispositivo.",
                },
                {
                  q: "Como funciona o pagamento pelo cardápio digital?",
                  a: "Conecte um adquirente de pagamentos (como o Mercado Pago) no painel de Adquirentes. Depois disso, seus clientes poderão pagar via Pix, cartão de crédito ou débito diretamente pelo cardápio, sem precisar chamar o garçom.",
                },
                {
                  q: "Posso migrar meu cardápio atual para o RestoPro?",
                  a: "Sim! Você pode cadastrar os itens manualmente pelo painel. Nossa equipe também oferece suporte para ajudar na migração caso tenha um cardápio grande. Entre em contato pelo chat.",
                },
                {
                  q: "Posso cancelar quando quiser?",
                  a: "Sim, sem fidelidade e sem multa. Você cancela a qualquer momento pelo painel. Seus dados ficam disponíveis por 30 dias após o cancelamento.",
                },
              ].map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl border border-border/50 bg-card px-6 shadow-sm data-[state=open]:border-primary/30 data-[state=open]:shadow-md transition-all"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline py-5 gap-4">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeIn>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-orange-400/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[150px]" />
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Plano gratuito disponível agora
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display leading-tight">
              Pronto para revolucionar{" "}
              <span className="text-primary">seu restaurante</span>?
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Junte-se a mais de 2.500 restaurantes que já usam o RestoPro.
              Comece hoje mesmo — é grátis!
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="rounded-full px-10 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                >
                  Começar Grátis Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="#contato">
                <Button variant="outline" size="lg" className="rounded-full px-8 text-base">
                  Falar com vendas
                </Button>
              </a>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> Setup em 5 minutos
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> Cancele quando quiser
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> Suporte em português
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contato" className="py-20 md:py-32 border-t border-border/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <h2 className="text-3xl md:text-4xl font-bold font-display">
                  Fale com a gente
                </h2>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                  Tem dúvidas? Quer uma demonstração personalizada? Nossa equipe
                  está pronta para ajudar você a transformar seu negócio.
                </p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">WhatsApp</div>
                      <div className="text-sm text-muted-foreground">
                        (11) 99999-9999
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Horário</div>
                      <div className="text-sm text-muted-foreground">
                        Seg-Sex, 8h às 18h
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.15} direction="left">
              <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm min-h-[420px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {formSent ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col items-center justify-center text-center gap-4 py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
                      >
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                      </motion.div>
                      <h3 className="text-xl font-bold font-display">Mensagem enviada!</h3>
                      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                        Obrigado pelo contato. Nossa equipe responderá em até 1 dia útil.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-2 rounded-xl"
                        onClick={() => setFormSent(false)}
                      >
                        Enviar outra mensagem
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                      onSubmit={(e) => { e.preventDefault(); setFormSent(true); }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">
                            Nome
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Seu nome"
                            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">
                            Restaurante
                          </label>
                          <input
                            type="text"
                            placeholder="Nome do restaurante"
                            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="seu@email.com"
                          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">
                          Mensagem
                        </label>
                        <textarea
                          rows={4}
                          required
                          placeholder="Como podemos ajudar?"
                          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                        />
                      </div>
                      <Button className="w-full rounded-xl" size="lg">
                        Enviar Mensagem
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border/30 bg-muted/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
                  <ChefHat className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold font-display">
                  Resto<span className="text-primary">Pro</span>
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O sistema mais completo para gestão de restaurantes e
                lanchonetes do Brasil.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#funcionalidades" className="hover:text-foreground transition-colors">Funcionalidades</a></li>
                <li><a href="#precos" className="hover:text-foreground transition-colors">Preços</a></li>
                <li><a href="#depoimentos" className="hover:text-foreground transition-colors">Depoimentos</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre nós</a></li>
                <li><a href="#contato" className="hover:text-foreground transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Carreiras</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Termos de uso</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} RestoPro. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-8.384 4.482A13.944 13.944 0 011.671 3.15a4.916 4.916 0 001.523 6.573 4.897 4.897 0 01-2.229-.616v.062a4.918 4.918 0 003.946 4.827 4.996 4.996 0 01-2.224.084 4.918 4.918 0 004.6 3.42 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.212c9.054 0 14.002-7.496 14.002-13.986 0-.21 0-.423-.015-.634A9.936 9.936 0 0024 4.557z"/></svg>
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
