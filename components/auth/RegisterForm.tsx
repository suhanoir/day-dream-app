"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Compass, Sparkles } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Please enter your name.");
      return;
    }

    if (!email || !email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to create account. Please try again.");
        toastError(data.error || "Registration failed.");
        return;
      }

      setUser(data.user);
      success("Account created! Let's start building your bucket list.");
      router.push("/dashboard");
    } catch {
      setFormError("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-stone-900/5">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-stone-900 text-stone-50 flex items-center justify-center mb-4 shadow-sm">
          <Compass className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
          Create your account
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Begin capturing the life experiences you want to remember.
        </p>
      </div>

      {formError && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Your Name"
          type="text"
          placeholder="Alex Carter"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="alex@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password (min 6 characters)"
          type="password"
          autoComplete="new-password"
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
          <Sparkles className="w-4 h-4 mr-1.5" />
          Create Bucket List
        </Button>
      </form>

      <div className="mt-8 text-center text-xs text-stone-500">
        Already have an account?{" "}
        <a
          href="/login"
          className="font-semibold text-stone-900 hover:underline cursor-pointer"
        >
          Sign in here
        </a>
      </div>
    </div>
  );
}

