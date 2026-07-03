"use client";

import { AuthContext } from "@/contexts/auth-context";
import { removeAccessToken } from "@/lib/cookies";
import { setUnauthorizedHandler } from "@/lib/fetch";
import { authService } from "@/services";
import { UserDto } from "@definitions/dto";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactNode, useCallback, useEffect, useState } from "react";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const redirectToLogin = useCallback(() => {
    setUser(null);
    if (!pathname.startsWith("/login")) {
      navigate("/login", { replace: true });
    }
  }, [navigate, pathname]);

  const checkAuth = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const userData = await authService.getMe();
      setUser(userData);
      if (pathname === "/login") {
        navigate("/deals", { replace: true });
      }
    } catch (err) {
      setUser(null);
      if (!pathname.startsWith("/login")) {
        navigate("/login", { replace: true });
      }
      setError(err instanceof Error ? err.message : "Auth check failed");
    } finally {
      setLoading(false);
    }
  }, [navigate, pathname]);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await authService.login(email, password);
      await checkAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    }
  };

  const logout = async () => {
    removeAccessToken();
    setUser(null);
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    setUnauthorizedHandler(redirectToLogin);
    return () => setUnauthorizedHandler(null);
  }, [redirectToLogin]);

  useEffect(() => {
    checkAuth().catch(() => {
      setLoading(false);
      setUser(null);
    });
    // Проверка сессии только при старте приложения
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
