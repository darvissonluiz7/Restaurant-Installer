/**
 * Detecta automaticamente se o sistema está rodando em LOCAL ou PRODUÇÃO
 * e define a base URL da API.
 *
 * Regra:
 *  - localhost / 127.0.0.1  → LOCAL  (proxy do Vite → Django em :8000)
 *  - qualquer outro host     → PRODUÇÃO → https://api.mercatusads.com.br
 *  - Variável VITE_API_URL   → sobrescreve tudo
 *
 * Uso:
 *   import { API_BASE, IS_LOCAL, ENV } from "@/lib/env";
 */

const hostname = typeof window !== "undefined" ? window.location.hostname : "";

/** true quando rodando localmente */
export const IS_LOCAL: boolean =
  hostname === "localhost" || hostname === "127.0.0.1";

/** "local" | "production" */
export const ENV: "local" | "production" = IS_LOCAL ? "local" : "production";

const PRODUCTION_API = "https://restaurant-installer.fly.dev";

/**
 * URL base da API (sem barra final).
 *
 * - Em LOCAL:       "" (usa o proxy do Vite → http://127.0.0.1:8000)
 * - Em PRODUÇÃO:    "https://api.mercatusads.com.br"
 * - VITE_API_URL:   sobrescreve os dois acima se definido no .env
 */
export const API_BASE: string =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ??
  (IS_LOCAL ? "" : PRODUCTION_API);

/** Atalho: monta a URL completa de um endpoint da API */
export function apiUrl(path: string): string {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalised}`;
}
