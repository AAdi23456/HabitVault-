"use client";

import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <section className="h-screen flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">HabitVault</h1>
        <Suspense fallback={<div className="w-full h-64 flex items-center justify-center">Loading...</div>}>
          <AuthForm type="login" />
        </Suspense>
      </div>
    </section>
  );
} 