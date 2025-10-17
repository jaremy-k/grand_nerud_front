"use client";

import { AuthContext } from "@/contexts/auth-context";
import { removeCookie, setCookie } from "@/lib/cookies";
import { authService } from "@/services";
import { UserDto } from "@definitions/dto";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useCallback, useEffect, useState } from "react";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const userData = await authService.getMe();
      setUser(userData);
      if (pathname === "/login") {
        router.push("/deals");
      }
    } catch (error) {
      if (!pathname.startsWith("/login")) {
        router.push("/login");
      }
      setUser(null);
      setError(error instanceof Error ? error.message : "Auth check failed");
    } finally {
      setLoading(false);
    }
  }, [router, pathname, setError, setLoading, setUser]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);

      const response = await fetch(
        "https://appgrand.worldautogroup.ru/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || "Login failed");
      }

      const { access_token } = await response.json();
      setCookie("tg_news_bot_access_token", access_token);

      await checkAuth();
      router.push("/deals");
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : "Login failed");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      removeCookie("tg_news_bot_access_token");
      setUser(null);
      router.push("/login");
    }
  };

  useEffect(() => {
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
