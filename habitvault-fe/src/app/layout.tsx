import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { HabitProvider } from "@/context/habit-context";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "%s | HabitVault",
    default: "HabitVault - Track Your Habits",
  },
  description: "Track your habits and build better routines with HabitVault",
  keywords: ["habit tracker", "habit building", "productivity", "routine"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <AuthProvider>
            <HabitProvider>
              {children}
              <Toaster />
            </HabitProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
