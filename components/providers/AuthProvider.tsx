"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Auth guard redirect logic
  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname === "/login" || pathname === "/register";
      const isProtectedPage =
        pathname.startsWith("/home") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/calendar") ||
        pathname.startsWith("/todo") ||
        pathname.startsWith("/expenses");

      if (!user && isProtectedPage) {
        router.replace("/login");
      } else if (user && isAuthPage) {
        router.replace("/home");
      }
    }
  }, [user, isLoading, pathname, router]);

  // Handle mobile browser BFcache (Back-Forward Cache) resume
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && user) {
        const INNER_SECTIONS = [
          "/dashboard",
          "/calendar",
          "/todo",
          "/to-do-list",
          "/expenses",
        ];
        const normalized = pathname.replace(/\/$/, "");
        if (INNER_SECTIONS.includes(normalized)) {
          router.replace("/home");
        }
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [user, pathname, router]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        setUser,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

