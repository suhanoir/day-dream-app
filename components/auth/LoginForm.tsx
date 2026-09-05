"use client";

import React, { useState } from "react";
import Link from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { DayDreamLogo } from "@/components/ui/DayDreamLogo";

export function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to log in. Please check your credentials.");
        toastError(data.error || "Login failed.");
        return;
      }

      setUser(data.user);
      success(`Welcome back, ${data.user.name}!`);
      router.push("/dashboard");
    } catch {
      setFormError("An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("demo@bucketlist.com");
    setPassword("password123");
    setIsLoading(true);
    setFormError("");

    try {
      // Try logging in with demo account
      let res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "demo@bucketlist.com", password: "password123" }),
      });

      // If demo doesn't exist yet, register it
      if (!res.ok) {
        res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Adventurer",
            email: "demo@bucketlist.com",
            password: "password123",
          }),
        });
      }

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        success("Logged in with Demo Account!");
        router.push("/dashboard");
      } else {
        setFormError(data.error || "Demo login failed.");
      }
    } catch {
      setFormError("Demo login error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-stone-900/5">
      {/* Brand icon & title */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="mb-4">
          <DayDreamLogo size={48} className="w-12 h-12 shadow-sm" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
          Welcome back
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Continue pursuing the experiences that matter most to you.
        </p>
      </div>

      {formError && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-2 font-medium"
        >
          Sign In
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200" />
        </div>
        <span className="relative bg-white px-3 text-xs text-stone-400 font-medium uppercase tracking-wider">
          or
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleDemoLogin}
        disabled={isLoading}
        className="w-full text-xs text-stone-700 font-medium"
      >
        Try with 1-Click Demo Account
      </Button>

      <div className="mt-8 text-center text-xs text-stone-500">
        Don&apos;t have an account yet?{" "}
        <a
          href="/register"
          className="font-semibold text-stone-900 hover:underline cursor-pointer"
        >
          Create one now
        </a>
      </div>
    </div>
  );
}

