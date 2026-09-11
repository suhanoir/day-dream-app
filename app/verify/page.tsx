"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Mail,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DayDreamLogo } from "@/components/ui/DayDreamLogo";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryStatus = searchParams.get("status");
  const queryToken = searchParams.get("token");
  const queryEmail = searchParams.get("email") || "";

  const [status, setStatus] = useState<string>(queryStatus || (queryToken ? "verifying" : "invalid"));
  const [emailInput, setEmailInput] = useState(queryEmail);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  // If token is in URL directly without status, call verify API
  useEffect(() => {
    if (queryToken && !queryStatus) {
      fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: queryToken }),
      })
        .then(async (res) => {
          if (res.ok) {
            setStatus("success");
          } else if (res.status === 410) {
            setStatus("expired");
          } else {
            setStatus("invalid");
          }
        })
        .catch(() => setStatus("error"));
    }
  }, [queryToken, queryStatus]);

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsResending(true);
    setResendMessage(null);
    setResendError(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() || undefined }),
      });

      const data = await res.json();
      if (res.ok) {
        setResendMessage(
          data.message || "A fresh verification link has been sent to your email!"
        );
      } else {
        setResendError(data.error || "Failed to resend verification link.");
      }
    } catch {
      setResendError("A network error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      {/* Brand logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <DayDreamLogo size={40} className="w-10 h-10 shadow-xs group-hover:scale-105 transition-transform" />
        <span className="text-xl font-bold tracking-tight text-stone-900">
          DayDream
        </span>
      </Link>

      <div className="w-full max-w-md bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-stone-900/5 text-center">
        {/* Loading / Verifying State */}
        {status === "verifying" && (
          <div className="py-8">
            <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mx-auto mb-4 animate-spin">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Verifying Email...</h2>
            <p className="text-sm text-stone-500 mt-2">
              Validating your verification link, please wait a moment.
            </p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Email Verified!
            </h2>
            <p className="text-sm text-stone-600 mt-2.5 leading-relaxed">
              Your email address has been successfully confirmed. You are all set to track your lifelong dreams and reflections.
            </p>
            <div className="mt-8">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Expired State */}
        {status === "expired" && (
          <div className="py-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Link Expired
            </h2>
            <p className="text-sm text-stone-600 mt-2.5 leading-relaxed">
              For security, email verification links expire after 24 hours. Request a fresh link below to complete your verification.
            </p>

            {resendMessage && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                {resendMessage}
              </div>
            )}

            {resendError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {resendError}
              </div>
            )}

            <form onSubmit={handleResend} className="mt-6 space-y-3 text-left">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white text-stone-900 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center"
                isLoading={isResending}
              >
                <Mail className="w-4 h-4 mr-2" />
                Resend Verification Link
              </Button>
            </form>
          </div>
        )}

        {/* Invalid or Error State */}
        {(status === "invalid" || status === "error") && (
          <div className="py-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Invalid Link
            </h2>
            <p className="text-sm text-stone-600 mt-2.5 leading-relaxed">
              This verification link is invalid or has already been used. If your account is already verified, you can sign in directly.
            </p>

            {resendMessage && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                {resendMessage}
              </div>
            )}

            {resendError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {resendError}
              </div>
            )}

            <form onSubmit={handleResend} className="mt-6 space-y-3 text-left">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Request New Verification Link
                </label>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white text-stone-900 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center"
                isLoading={isResending}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send New Link
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-center gap-4 text-xs">
              <Link
                href="/login"
                className="font-medium text-stone-600 hover:text-stone-900 underline"
              >
                Back to Sign In
              </Link>
              <Link
                href="/dashboard"
                className="font-medium text-stone-600 hover:text-stone-900 underline"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}

