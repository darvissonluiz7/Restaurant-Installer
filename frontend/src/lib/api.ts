/**
 * RestoPro — API service layer
 * Typed interfaces + fetch helpers for the Django backend.
 */

import { apiRequest, apiRequestFormData } from "./queryClient";
import { API_BASE } from "./env";

// ── Types ───────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface MenuItemShort {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  category_name: string;
  emoji: string;
  status: "available" | "low_stock" | "out_of_stock";
  image: string | null;
  is_active: boolean;
}

export interface MenuItem extends MenuItemShort {
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "free" | "occupied" | "reserved" | "cleaning";
  status_display: string;
  occupied_by: number | null;
  reservation_time: string | null;
  current_amount: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  menu_item: string;
  menu_item_name: string;
  menu_item_emoji: string;
  quantity: number;
  price: string;
  notes: string;
}

export interface Order {
  id: string;
  display_id: number;
  table: string | null;
  table_number: number | null;
  origin: "table" | "delivery" | "counter";
  origin_display: string;
  status: "new" | "preparing" | "ready" | "delivered" | "cancelled";
  status_display: string;
  total: string;
  notes: string;
  items: OrderItem[];
  time_elapsed: string;
  created_at: string;
  updated_at: string;
}

export interface WaiterCall {
  id: string;
  table: string;
  table_number: number;
  status: "pending" | "acknowledged";
  created_at: string;
  resolved_at: string | null;
}

export interface DashboardData {
  today_revenue: string;
  today_orders: number;
  tables_occupied: number;
  tables_total: number;
  avg_time_minutes: number;
  popular_items: {
    name: string;
    emoji: string;
    sales: number;
    revenue: string;
  }[];
  recent_orders: Order[];
}

export interface CustomerMenuData {
  table: Table;
  categories: {
    id: string;
    name: string;
    items: MenuItemShort[];
  }[];
}

export interface BillData {
  table_number: number;
  orders: Order[];
  total: string;
}

// Paginated response from DRF
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── API functions ───────────────────────────────────────────────────────

const BASE = `${API_BASE}/api`;

// Auth
export const api = {
  // ── Auth ───────────────────────────────────────────────────────────
  /** Fetch CSRF cookie (must call before first POST when unauthenticated) */
  getCsrf: async () => {
    await fetch(`${BASE}/auth/csrf/`, { credentials: "include" });
  },

  login: async (username: string, password: string) => {
    // Ensure CSRF cookie is set before attempting login
    await api.getCsrf();
    const res = await apiRequest("POST", `${BASE}/auth/login/`, { username, password });
    return res.json();
  },

  logout: async () => {
    await apiRequest("POST", `${BASE}/auth/logout/`);
  },

  me: async () => {
    const res = await fetch(`${BASE}/auth/me/`, { credentials: "include" });
    if (res.status === 401) return null;
    if (!res.ok) throw new Error("Erro ao buscar usuário");
    return res.json();
  },

  // ── Dashboard ──────────────────────────────────────────────────────
  getDashboard: async (): Promise<DashboardData> => {
    const res = await fetch(`${BASE}/dashboard/`, { credentials: "include" });
    if (!res.ok) throw new Error("Erro ao carregar dashboard");
    return res.json();
  },

  // ── Categories ─────────────────────────────────────────────────────
  getCategories: async (): Promise<PaginatedResponse<Category>> => {
    const res = await fetch(`${BASE}/categories/`, { credentials: "include" });
    if (!res.ok) throw new Error("Erro ao carregar categorias");
    return res.json();
  },

  createCategory: async (data: { name: string; display_order?: number }): Promise<Category> => {
    const res = await apiRequest("POST", `${BASE}/categories/`, data);
    return res.json();
  },

  updateCategory: async (id: string, data: { name: string; display_order?: number }): Promise<Category> => {
    const res = await apiRequest("PUT", `${BASE}/categories/${id}/`, data);
    return res.json();
  },

  deleteCategory: async (id: string) => {
    await apiRequest("DELETE", `${BASE}/categories/${id}/`);
  },

  // ── Menu Items ─────────────────────────────────────────────────────
  getMenuItems: async (params?: Record<string, string>): Promise<PaginatedResponse<MenuItemShort>> => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    const res = await fetch(`${BASE}/menu-items/${qs}`, { credentials: "include" });
    if (!res.ok) throw new Error("Erro ao carregar cardápio");
    return res.json();
  },

  createMenuItem: async (data: FormData): Promise<MenuItem> => {
    const res = await apiRequestFormData("POST", `${BASE}/menu-items/`, data);
    return res.json();
  },

  updateMenuItem: async (id: string, data: FormData): Promise<MenuItem> => {
    const res = await apiRequestFormData("PATCH", `${BASE}/menu-items/${id}/`, data);
    return res.json();
  },

  deleteMenuItem: async (id: string) => {
    await apiRequest("DELETE", `${BASE}/menu-items/${id}/`);
  },

  // ── Tables ─────────────────────────────────────────────────────────
  getTables: async (): Promise<PaginatedResponse<Table>> => {
    const res = await fetch(`${BASE}/tables/`, { credentials: "include" });
    if (!res.ok) throw new Error("Erro ao carregar mesas");
    return res.json();
  },

  createTable: async (data: { number: number; capacity: number }): Promise<Table> => {
    const res = await apiRequest("POST", `${BASE}/tables/`, data);
    return res.json();
  },

  deleteTable: async (id: string) => {
    await apiRequest("DELETE", `${BASE}/tables/${id}/`);
  },

  updateTableStatus: async (id: string, status: string) => {
    const res = await apiRequest("PATCH", `${BASE}/tables/${id}/update_status/`, { status });
    return res.json();
  },

  // ── Orders ─────────────────────────────────────────────────────────
  getOrders: async (params?: Record<string, string>): Promise<PaginatedResponse<Order>> => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    const res = await fetch(`${BASE}/orders/${qs}`, { credentials: "include" });
    if (!res.ok) throw new Error("Erro ao carregar pedidos");
    return res.json();
  },

  createOrder: async (data: { table?: string; origin: string; notes?: string; items: { menu_item: string; quantity: number; notes?: string }[] }) => {
    const res = await apiRequest("POST", `${BASE}/orders/`, data);
    return res.json();
  },

  updateOrderStatus: async (id: string, status: string) => {
    const res = await apiRequest("PATCH", `${BASE}/orders/${id}/update_status/`, { status });
    return res.json();
  },

  // ── Waiter Calls ──────────────────────────────────────────────────
  getWaiterCalls: async (params?: Record<string, string>): Promise<PaginatedResponse<WaiterCall>> => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    const res = await fetch(`${BASE}/waiter-calls/${qs}`, { credentials: "include" });
    if (!res.ok) throw new Error("Erro ao carregar chamadas");
    return res.json();
  },

  acknowledgeWaiterCall: async (id: string) => {
    const res = await apiRequest("PATCH", `${BASE}/waiter-calls/${id}/acknowledge/`);
    return res.json();
  },

  // ── Customer ───────────────────────────────────────────────────────
  getCustomerMenu: async (tableNumber: number): Promise<CustomerMenuData> => {
    const res = await fetch(`${BASE}/customer/${tableNumber}/menu/`);
    if (!res.ok) throw new Error("Erro ao carregar cardápio");
    return res.json();
  },

  customerOrder: async (tableNumber: number, items: { menu_item: string; quantity: number; notes?: string }[]) => {
    const res = await apiRequest("POST", `${BASE}/customer/${tableNumber}/order/`, { items });
    return res.json();
  },

  customerGetOrders: async (tableNumber: number): Promise<Order[]> => {
    const res = await fetch(`${BASE}/customer/${tableNumber}/orders/`);
    if (!res.ok) throw new Error("Erro ao carregar pedidos");
    return res.json();
  },

  customerCallWaiter: async (tableNumber: number) => {
    const res = await apiRequest("POST", `${BASE}/customer/${tableNumber}/call-waiter/`);
    return res.json();
  },

  customerRequestBill: async (tableNumber: number): Promise<BillData> => {
    const res = await apiRequest("POST", `${BASE}/customer/${tableNumber}/request-bill/`);
    return res.json();
  },
};

// ── Helper: format BRL ──────────────────────────────────────────────────
export function formatBRL(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ── Helper: status labels ───────────────────────────────────────────────
export const statusLabels: Record<string, string> = {
  available: "Disponível",
  low_stock: "Pouco Estoque",
  out_of_stock: "Esgotado",
  free: "Livre",
  occupied: "Ocupada",
  reserved: "Reservada",
  cleaning: "Aguardando Limpeza",
  new: "Novo",
  preparing: "Preparando",
  ready: "Pronto",
  delivered: "Entregue",
  cancelled: "Cancelado",
};
