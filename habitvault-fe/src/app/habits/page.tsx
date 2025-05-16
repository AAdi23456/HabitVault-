"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useHabit, Habit } from "@/context/habit-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, CheckCircle, XCircle, Calendar, Flame, ArrowLeft, LayoutGrid, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { API_ENDPOINTS } from "@/lib/api-config";
import { formatDays } from "@/lib/format-helpers";
import { motion, AnimatePresence } from "framer-motion";

export default function HabitsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const habitContext = useHabit(); // Keep context reference for deleteHabit
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Properly fetch habits with authentication
  useEffect(() => {
    let isMounted = true;
    
    const fetchHabitsData = async () => {
      if (!isAuthenticated) {
        console.log("User is not authenticated, redirecting to login");
        router.push('/login');
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching habits from API...");
        const response = await fetch(API_ENDPOINTS.HABITS.BASE, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include" // Important for sending cookies
        });
        
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API Response:", data);
        
        if (data.success && Array.isArray(data.habits) && isMounted) {
          setHabits(data.habits);
        } else {
          throw new Error("Invalid data format from API");
        }
      } catch (err) {
        console.error("Failed to fetch habits:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load habits");
          toast({
            title: "Error",
            description: "Could not load habits. Please try again.",
            variant: "destructive"
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHabitsData();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, router, toast]);

  // Handle habit deletion
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const success = await habitContext.deleteHabit(id);
      
      if (success) {
        // Update local state after successful deletion
        setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
        toast({
          title: "Success",
          description: "Habit deleted successfully"
        });
      }
    } catch (err) {
      console.error("Failed to delete habit:", err);
      toast({
        title: "Error",
        description: "Could not delete habit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "tween",
        duration: 0.4
      }
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 animate-fadeIn">
        {/* Decorative background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-primary/10 to-transparent opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-blue-500/5 to-transparent opacity-30"></div>
        </div>
        
        <div className="container mx-auto py-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                  Your Habits
                </h1>
                <p className="text-muted-foreground mt-1">Manage and track your habits</p>
              </div>
              <Button disabled className="gap-2">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Habit
              </Button>
            </header>
          </motion.div>
          
          <div className="text-center py-20">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-primary/20 border-b-primary animate-spin animation-delay-500"></div>
            </div>
            <p className="text-muted-foreground mt-4">Loading your habits...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 animate-fadeIn">
        {/* Decorative background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-primary/10 to-transparent opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-blue-500/5 to-transparent opacity-30"></div>
        </div>
        
        <div className="container mx-auto py-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                  Your Habits
                </h1>
                <p className="text-muted-foreground mt-1">Manage and track your habits</p>
              </div>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </header>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="mx-auto max-w-md border-red-200 dark:border-red-800/30 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <CardTitle>Error Loading Habits</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{error}</p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
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
      
      <div className="container mx-auto py-10 px-4">
        {/* Enhanced header section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                Your Habits
              </h1>
              <p className="text-muted-foreground mt-1">Manage and track your progress</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="gap-2 hover:bg-primary/10 transition-colors" 
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                asChild 
                className="gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
              >
                <Link href="/habits/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Habit
                </Link>
              </Button>
            </div>
          </header>
        </motion.div>
        
        {habits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center py-20"
          >
            <div className="bg-muted/40 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutGrid className="h-12 w-12 text-muted-foreground/60" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No habits yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">Start building better routines by creating your first habit.</p>
            <Button 
              asChild
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
            >
              <Link href="/habits/new">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Your First Habit
              </Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {habits.map((habit) => (
              <motion.div key={habit.id} variants={item}>
                <Card 
                  className={cn(
                    "h-full overflow-hidden border-t-4 group hover:shadow-lg transition-all duration-300",
                    habit.isActive ? "border-t-green-500" : "border-t-gray-400",
                    !habit.isActive && "opacity-75"
                  )}
                >
                  <CardHeader className="pb-2 relative">
                    {/* Status indicator */}
                    <div className="absolute top-4 right-4">
                      {habit.isActive ? (
                        <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-medium py-1 px-2 rounded-full">
                          <CheckCircle className="h-3 w-3" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 text-xs font-medium py-1 px-2 rounded-full">
                          <XCircle className="h-3 w-3" />
                          <span>Inactive</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Title with link */}
                    <Link 
                      href={`/habits/${habit.id}`} 
                      className="inline-flex items-center gap-1.5 group-hover:text-primary transition-colors"
                    >
                      <CardTitle className="truncate">{habit.name}</CardTitle>
                    </Link>
                      
                    {/* Description with fade-out effect if too long */}
                    {habit.description && (
                      <div className="relative mt-1 max-h-10 overflow-hidden">
                        <p className="text-sm text-muted-foreground">{habit.description}</p>
                        {habit.description.length > 80 && (
                          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent"></div>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Habit info with icons */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Frequency</p>
                          <p className="text-sm font-medium">{formatDays(habit.targetDays)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                          <Flame className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Current Streak</p>
                          <div className="flex items-baseline gap-1">
                            <p className="text-sm font-bold">{habit.currentStreak || 0}</p>
                            <p className="text-xs text-muted-foreground">days</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Streak progress bar */}
                    {(habit.currentStreak > 0 || habit.longestStreak > 0) && (
                      <div className="pt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Current</span>
                          <span className="font-medium">Best: {habit.longestStreak || 0} days</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 relative group-hover:opacity-90 transition-opacity"
                            style={{ width: `${Math.min(((habit.currentStreak || 0) / Math.max(habit.longestStreak || 1, 1)) * 100, 100)}%` }}
                          >
                            <div className="absolute inset-0 opacity-30 animate-pulse-slow">
                              <div className="h-full w-20 bg-white/30 blur-md transform -skew-x-12 animate-shimmer"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2 border-t bg-muted/20">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                      asChild
                    >
                      <Link href={`/habits/${habit.id}`}>
                        <BarChart3 className="mr-1 h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                        onClick={() => router.push(`/habits/${habit.id}/edit`)}
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(habit.id)}
                        disabled={deletingId === habit.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        {deletingId === habit.id ? (
                          <>
                            <span className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Reusable info row
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-medium">{value}</span>
  </div>
);
