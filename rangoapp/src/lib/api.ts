import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Em dev no emulador Android, use 10.0.2.2 ao invés de localhost
// Em dev no iOS simulator, localhost funciona
// Em produção, troque pela URL real
const DEV_URL = Platform.select({
  android: "http://10.0.2.2:8000",
  ios: "http://localhost:8000",
  default: "http://localhost:8000",
});

export const API_BASE = DEV_URL;

const AUTH_TOKEN_KEY = "authToken";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Adicionar Content-Type se não for FormData
  if (!(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Adicionar token de autorização
  if (!skipAuth) {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      headers["Authorization"] = `Token ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API Error ${res.status}: ${errorBody}`);
  }

  if (res.status === 204) return {} as T;

  return res.json();
}

// Auth
export async function login(username: string, password: string) {
  const data = await apiFetch("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    skipAuth: true,
  });
  // Salvar token retornado pelo backend
  if (data.token) {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
  }
  return data;
}

export async function logout() {
  try {
    await apiFetch("/api/auth/logout/", { method: "POST" });
  } catch {
    // Ignora erro — pode já estar deslogado
  }
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function getMe() {
  return apiFetch("/api/auth/me/");
}

// Dashboard
export async function getDashboard() {
  return apiFetch("/api/dashboard/");
}

// Orders
export async function getOrders(params?: {
  status?: string;
  today_only?: boolean;
}) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.today_only) searchParams.set("today_only", "true");
  const qs = searchParams.toString();
  return apiFetch(`/api/orders/${qs ? `?${qs}` : ""}`);
}

export async function updateOrderStatus(id: string, status: string) {
  return apiFetch(`/api/orders/${id}/update_status/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Menu
export async function getCategories() {
  return apiFetch("/api/categories/");
}

export async function createCategory(data: { name: string; display_order?: number }) {
  return apiFetch("/api/categories/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: string, data: { name?: string; display_order?: number }) {
  return apiFetch(`/api/categories/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string) {
  return apiFetch(`/api/categories/${id}/`, { method: "DELETE" });
}

export async function getMenuItems(params?: { category?: string; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);
  const qs = searchParams.toString();
  return apiFetch(`/api/menu-items/${qs ? `?${qs}` : ""}`);
}

export async function createMenuItem(data: FormData) {
  return apiFetch("/api/menu-items/", {
    method: "POST",
    body: data,
  });
}

export async function updateMenuItem(id: string, data: FormData | Record<string, any>) {
  const isFormData = data instanceof FormData;
  return apiFetch(`/api/menu-items/${id}/`, {
    method: "PATCH",
    body: isFormData ? data : JSON.stringify(data),
  });
}

export async function deleteMenuItem(id: string) {
  return apiFetch(`/api/menu-items/${id}/`, { method: "DELETE" });
}

// Tables
export async function getTables() {
  return apiFetch("/api/tables/");
}

export async function createTable(data: { number: number; capacity?: number }) {
  return apiFetch("/api/tables/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTable(id: string, data: Record<string, any>) {
  return apiFetch(`/api/tables/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function updateTableStatus(id: string, status: string) {
  return apiFetch(`/api/tables/${id}/update_status/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteTable(id: string) {
  return apiFetch(`/api/tables/${id}/`, { method: "DELETE" });
}

// Waiter Calls
export async function getWaiterCalls(pending_only?: boolean) {
  const qs = pending_only ? "?pending_only=true" : "";
  return apiFetch(`/api/waiter-calls/${qs}`);
}

export async function acknowledgeWaiterCall(id: string) {
  return apiFetch(`/api/waiter-calls/${id}/acknowledge/`, {
    method: "PATCH",
  });
}
