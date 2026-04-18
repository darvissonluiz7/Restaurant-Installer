import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const { login, loginLoading } = useAuth();
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ username, password });
    } catch {
      setError("Usuário ou senha inválidos.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-secondary/30 p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-primary font-display font-bold text-3xl">
            <UtensilsCrossed className="w-8 h-8" />
            Zenny Food
          </div>
        </div>

        <Card className="border-border/50 shadow-xl shadow-primary/5">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-display text-center">Acesso Administrativo</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais para gerenciar o restaurante
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2.5 text-center">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
                    className="pl-10"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={loginLoading}>
                {loginLoading ? "Entrando..." : "Entrar no Sistema"}
                {!loginLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          &copy; 2026 Zenny Food Systems. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}