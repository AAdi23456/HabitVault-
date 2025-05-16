"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useHabit, Habit } from "@/context/habit-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { API_ENDPOINTS } from "@/lib/api-config";

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Habits</h1>
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Habit
          </Button>
        </div>
        <div className="text-center py-20">
          <div className="mb-2 h-8 w-8 mx-auto animate-spin border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground">Loading habits...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Habits</h1>
          <Button asChild>
            <Link href="/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <div className="text-center py-20">
          <p className="text-xl font-bold text-destructive mb-2">Error</p>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Habits</h1>
        <Button asChild>
          <Link href="/habits/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Habit
          </Link>
        </Button>
      </div>
      
      {habits.length === 0 ? (
        <div className="text-center py-20">
          <p className="mb-4 text-muted-foreground">No habits found.</p>
          <Button asChild>
            <Link href="/habits/new">Create Your First Habit</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <Card key={habit.id} className={cn("transition-all hover:shadow-md", !habit.isActive && "opacity-60")}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{habit.name}</CardTitle>
                  {habit.isActive ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                {habit.description && (
                  <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
                )}
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <InfoRow label="Frequency" value={formatDays(habit.targetDays)} />
                <InfoRow label="Current Streak" value={`${habit.currentStreak || 0} days`} />
                <InfoRow label="Best Streak" value={`${habit.longestStreak || 0} days`} />
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button size="sm" variant="outline" onClick={() => router.push(`/habits/${habit.id}/edit`)}>
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(habit.id)}
                  disabled={deletingId === habit.id}
                  className="text-destructive hover:text-destructive"
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
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper to format targetDays
function formatDays(days: string | string[]) {
  try {
    const d = typeof days === "string" ? JSON.parse(days) : days;
    if (!Array.isArray(d)) return "Unknown";
    if (d.length === 7) return "Every day";
    if (d.length === 5 && ["monday", "tuesday", "wednesday", "thursday", "friday"].every(day => d.includes(day)))
      return "Weekdays";
    return d.map((day) => day.charAt(0).toUpperCase() + day.slice(1)).join(", ");
  } catch {
    return "Unknown";
  }
}

// Reusable info row
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-medium">{value}</span>
  </div>
);
