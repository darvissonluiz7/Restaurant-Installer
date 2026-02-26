/**
 * Detecta o ambiente e define a base URL da API.
 *
 * - Desenvolvimento (localhost): usa o proxy do Vite → ""
 * - Produção (Railway, etc.): usa a mesma origem → ""
 * - Se precisar apontar para outro servidor, defina VITE_API_URL no .env
 *
 * Uso:  import { API_BASE } from "@/lib/env";
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

/** URL base da API (sem barra final) */
export const API_BASE: string =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ?? "";

/** Ambiente atual */
export const ENV = isDev ? "development" : "production";

/** Atalho: monta a URL completa de um endpoint da API */
export function apiUrl(path: string): string {
  // garante que o path comece com /
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalised}`;
}
