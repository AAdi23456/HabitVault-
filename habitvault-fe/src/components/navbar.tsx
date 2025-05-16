"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          HabitVault
        </Link>
        
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link 
                href="/dashboard" 
                className={`text-sm ${isActive("/dashboard") ? "font-medium" : "text-muted-foreground"}`}
              >
                Dashboard
              </Link>
              <Link 
                href="/habits" 
                className={`text-sm ${isActive("/habits") ? "font-medium" : "text-muted-foreground"}`}
              >
                My Habits
              </Link>
              <button
                type="button"
                onClick={logout}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <div className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                  Login
                </div>
              </Link>
              <Link href="/register">
                <div className={cn(buttonVariants({ size: "sm" }))}>
                  Sign Up
                </div>
              </Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
} 