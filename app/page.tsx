"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Sparkles, CheckCircle2, ArrowRight, Heart, Globe, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DayDreamLogo } from "@/components/ui/DayDreamLogo";
import { APP_VERSION } from "@/lib/config/version";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <DayDreamLogo size={32} className="w-8 h-8 shadow-xs" />
          <span className="text-lg font-bold tracking-tight text-stone-900">
            DayDream
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Dashboard
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/60 border border-stone-200 text-stone-700 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-stone-700" />
          A calm space for life&apos;s greatest adventures
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-stone-950 leading-[1.15] mb-6">
          Make memories <br className="hidden sm:inline" />
          worth remembering.
        </h1>

        <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Not another corporate task manager. A thoughtful, personal journal for the dreams, milestones, and experiences you want to live.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-16">
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 font-semibold shadow-sm">
              Start Your Bucket List
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
              Sign In to Your List
            </Button>
          </Link>
        </div>

        {/* Visual Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
              <Globe className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-stone-900 mb-1">
              Category Organization
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Group your aspirations into Life, Travel, Career, Skills, or any custom theme.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-stone-900 mb-1">
              Clean, Calm Interaction
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Distraction-free tasks. Open any item to celebrate achievement and reflect.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center mb-3">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-stone-900 mb-1">
              Permanent Reflections
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Capture your memories in words so you can look back on how each moment felt.
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-stone-200/70 py-6 text-center text-xs text-stone-400">
        <p>DayDream {APP_VERSION} — Designed for meaningful life experiences.</p>
      </footer>
    </div>
  );
}

