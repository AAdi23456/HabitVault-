"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useHabit, Habit } from "@/context/habit-context";
import { HabitHistory } from "@/components/habit-history";
import { HabitItem } from "@/components/habit-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDays } from "@/lib/format-helpers";
import { ChevronLeft, Edit, BarChart } from "lucide-react";

export default function HabitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const habitId = params.id as string;
  const { getHabit, logHabit } = useHabit();
  
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHabitDetails() {
      setIsLoading(true);
      setError(null);
      
      try {
        const fetchedHabit = await getHabit(habitId);
        
        if (fetchedHabit) {
          setHabit(fetchedHabit);
          
          // Check if completed today
          const today = new Date().toISOString().split('T')[0];
          const todayLog = fetchedHabit.logs?.find(
            (log: any) => log.date === today && log.status === 'completed'
          );
          setIsCompleted(!!todayLog);
        } else {
          setError("Habit not found");
        }
      } catch (err) {
        console.error("Error fetching habit:", err);
        setError("Failed to load habit details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchHabitDetails();
  }, [habitId, getHabit]);

  const handleMarkCompleted = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await logHabit(id, today, 'completed');
      setIsCompleted(true);
    } catch (error) {
      console.error('Error marking habit as completed:', error);
    }
  };

  const handleMarkMissed = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await logHabit(id, today, 'missed');
      setIsCompleted(false);
    } catch (error) {
      console.error('Error marking habit as missed:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href="/habits">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Habit Details</h1>
        </div>
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !habit) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href="/habits">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Habit Details</h1>
        </div>
        <div className="text-center py-20">
          <p className="text-xl font-bold text-destructive mb-2">Error</p>
          <p className="mb-4 text-muted-foreground">{error || "Habit not found"}</p>
          <Button asChild>
            <Link href="/habits">Go Back to Habits</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Check if habit should be done today
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = daysOfWeek[dayOfWeek];
  
  // Parse targetDays if it's a string
  let targetDays;
  try {
    targetDays = typeof habit.targetDays === 'string' 
      ? JSON.parse(habit.targetDays) 
      : habit.targetDays;
  } catch (error) {
    console.error('Error parsing targetDays:', error);
    targetDays = [];
  }
  
  const isDueToday = habit.isActive && targetDays.includes(todayName);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href="/habits">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{habit.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/habits/${habitId}/edit`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/analytics">
              <BarChart className="h-4 w-4 mr-1" />
              Analytics
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Habit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {habit.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p>{habit.description}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Frequency</h3>
              <p>{formatDays(habit.targetDays)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
              <p>{new Date(habit.startDate).toLocaleDateString()}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
                <p className="text-2xl font-bold">{habit.currentStreak || 0} days</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Longest Streak</h3>
                <p className="text-2xl font-bold">{habit.longestStreak || 0} days</p>
              </div>
            </div>
            
            {isDueToday && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Today's Status</h3>
                <HabitItem
                  habit={habit}
                  isCompleted={isCompleted}
                  onMarkCompleted={handleMarkCompleted}
                  onMarkMissed={handleMarkMissed}
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <HabitHistory habitId={habitId} maxDays={10} />
        </div>
      </div>
    </div>
  );
} 