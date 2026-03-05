import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "@/lib/api";

export interface AuthUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me/"],
    queryFn: api.me,
    retry: false,
    staleTime: 60_000,
  });

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      api.login(username, password),
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me/"], data);
      setLocation("/admin");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me/"], null);
      queryClient.clear();
      setLocation("/admin/login");
    },
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    loginLoading: loginMutation.isPending,
    logout: logoutMutation.mutate,
    logoutLoading: logoutMutation.isPending,
  };
}
