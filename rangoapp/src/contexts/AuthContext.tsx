import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login as apiLogin, logout as apiLogout, getMe } from "../lib/api";

interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        const data = await getMe();
        setUser(data);
      }
    } catch {
      setUser(null);
      try {
        await AsyncStorage.removeItem("authToken");
      } catch {
        // AsyncStorage may not be ready yet
      }
    } finally {
      setLoading(false);
    }
  }

  async function login(username: string, password: string) {
    const data = await apiLogin(username, password);
    setUser(data.user || data);
  }

  async function logout() {
    try {
      await apiLogout();
    } catch {
      // Ignora erros ao deslogar
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
