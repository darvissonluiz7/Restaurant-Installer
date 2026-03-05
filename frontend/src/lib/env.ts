/**
 * Detecta automaticamente se o sistema está rodando em LOCAL ou PRODUÇÃO
 * e define a base URL da API.
 *
 * Regra:
 *  - localhost / 127.0.0.1  → LOCAL  (usa proxy do Vite em dev ou Django direto)
 *  - qualquer outro host     → PRODUÇÃO (mesma origem)
 *  - Variável VITE_API_URL   → sobrescreve tudo (para apontar para outro servidor)
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

/**
 * URL base da API (sem barra final).
 *
 * - Em LOCAL:       "" (usa o proxy do Vite → http://127.0.0.1:8000)
 * - Em PRODUÇÃO:    "" (front e back servidos na mesma origem)
 * - VITE_API_URL:   sobrescreve os dois acima se definido no .env
 */
export const API_BASE: string =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ?? "";

/** Atalho: monta a URL completa de um endpoint da API */
export function apiUrl(path: string): string {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalised}`;
}
