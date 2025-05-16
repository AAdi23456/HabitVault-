"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPreferences } from "@/components/user-preferences";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 animate-fadeIn">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-primary/10 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-blue-500/5 to-transparent opacity-30"></div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                Settings
              </h1>
              <p className="text-muted-foreground mt-1">Customize your HabitVault experience</p>
            </div>
            <Button
              variant="outline"
              className="gap-2 hover:bg-primary/10 transition-colors"
              onClick={() => router.push('/dashboard')}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </header>
        </motion.div>

        {/* Content */}
        <div className="grid gap-6 md:grid-cols-8">
          <div className="md:col-span-5 md:col-start-2">
            <UserPreferences />
          </div>
        </div>
      </div>
    </div>
  );
} 