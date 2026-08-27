import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4 sm:p-6">
      <LoginForm />
    </div>
  );
}

