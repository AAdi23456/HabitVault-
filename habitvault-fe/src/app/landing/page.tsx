"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to HabitVault</h1>
          <p className="text-xl mb-12 text-muted-foreground">
            Track your habits, maintain streaks, and build better routines with
            our minimalist habit tracking app.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            {!isAuthenticated ? (
              <>
                <Button asChild size="lg" className="px-8">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8">
                  <Link href="/register">Register</Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="px-8">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </div>

          <div className="mt-24">
            <h2 className="text-2xl font-bold mb-6">Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="font-bold text-xl mb-2">Daily Tracking</h3>
                <p className="text-muted-foreground">
                  Track your habits daily and build consistency
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="font-bold text-xl mb-2">Streak Counting</h3>
                <p className="text-muted-foreground">
                  Maintain and visualize your habit streaks
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="font-bold text-xl mb-2">Analytics</h3>
                <p className="text-muted-foreground">
                  Get insights into your productivity patterns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 