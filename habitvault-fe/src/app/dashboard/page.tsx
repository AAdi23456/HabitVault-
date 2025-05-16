"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogoutConfirmation } from "@/components/logout-confirmation";
import { useHabit, Habit } from "@/context/habit-context";
import { Quote, getDailyQuote } from "@/lib/quotes-service";
import { getUserPreferences } from "@/lib/local-storage";

export default function DashboardPage() {
  const router = useRouter();
  const { habits, isLoading, fetchHabits, logHabit } = useHabit();
  const [dailyQuote, setDailyQuote] = useState<Quote | null>(null);
  const [todaysHabits, setTodaysHabits] = useState<Habit[]>([]);
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [userPrefs, setUserPrefs] = useState({showQuotes: true});

  // Fetch data on component mount only
  useEffect(() => {
    // Get user preferences from localStorage
    const prefs = getUserPreferences();
    setUserPrefs({showQuotes: prefs.showMotivationalQuotes});

    // Fetch habits
    fetchHabits();

    // Fetch daily quote if enabled
    if (prefs.showMotivationalQuotes) {
      setIsLoadingQuote(true);
      getDailyQuote()
        .then((quote) => {
          if (quote) {
            setDailyQuote(quote);
          }
        })
        .finally(() => {
          setIsLoadingQuote(false);
        });
    }
  }, []); // Empty dependency array means this only runs once on mount

  // Determine today's habits and which ones are completed
  useEffect(() => {
    if (!habits || habits.length === 0) return;

    // Get today's day of the week (0-6, 0 is Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = daysOfWeek[dayOfWeek];
    
    // Filter habits that should be done today based on targetDays
    const habitsForToday = habits.filter(habit => {
      // If targetDays is a string (from JSON), parse it
      let targetDays;
      try {
        targetDays = typeof habit.targetDays === 'string' 
          ? JSON.parse(habit.targetDays) 
          : habit.targetDays;
      } catch (error) {
        console.error('Error parsing targetDays:', error);
        return false;
      }
      
      return habit.isActive && targetDays && Array.isArray(targetDays) && targetDays.includes(todayName);
    });
    
    setTodaysHabits(habitsForToday);

    // TODO: Fetch completed habits for today from the API
    // For now, we'll simulate this
    setCompletedToday([]);
  }, [habits]);

  const handleMarkHabit = async (habitId: string, completed: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const status = completed ? 'completed' : 'missed';
    
    try {
      await logHabit(habitId, today, status);
      
      // Update local state
      if (completed) {
        setCompletedToday(prev => [...prev, habitId]);
      } else {
        setCompletedToday(prev => prev.filter(id => id !== habitId));
      }
    } catch (error) {
      console.error('Error marking habit:', error);
    }
  };

  // Calculate summary statistics
  const activeHabits = habits.filter(h => h.isActive).length;
  const completedTodayCount = completedToday.length;
  const highestStreak = habits.reduce((max, habit) => 
    Math.max(max, habit.currentStreak || 0), 0);

  return (
    <div className="container mx-auto py-10 px-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push('/habits')}
          >
            Manage Habits
          </Button>
          <LogoutConfirmation />
        </div>
      </header>
      
      {/* Daily quote section */}
      {userPrefs.showQuotes && dailyQuote && (
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <blockquote className="italic text-lg text-center">
              "{dailyQuote.text}"
            </blockquote>
            <p className="text-right mt-2 text-sm font-medium">— {dailyQuote.author}</p>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Habit Summary</CardTitle>
            <CardDescription>Your habit progress at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Active Habits</span>
                <span className="font-bold">{activeHabits}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed Today</span>
                <span className="font-bold">{completedTodayCount} / {todaysHabits.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Highest Streak</span>
                <span className="font-bold">{highestStreak} days</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/analytics')}
            >
              View Analytics
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Habits</CardTitle>
            <CardDescription>Habits to complete today</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-muted-foreground">Loading habits...</p>
              </div>
            ) : todaysHabits.length === 0 ? (
              <div className="h-40 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">No habits scheduled for today</p>
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={() => router.push('/habits/new')}
                  >
                    Add Your First Habit
                  </Button>
                </div>
              </div>
            ) : (
              <ul className="space-y-2">
                {todaysHabits.map((habit) => (
                  <li 
                    key={habit.id} 
                    className="p-3 rounded border flex justify-between items-center hover:bg-muted/50 transition-colors"
                    onClick={() => handleMarkHabit(habit.id, !completedToday.includes(habit.id))}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{habit.name}</span>
                      {habit.currentStreak > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {habit.currentStreak} day streak
                        </span>
                      )}
                    </div>
                    <div 
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center cursor-pointer",
                        completedToday.includes(habit.id) 
                          ? "bg-green-500 text-white" 
                          : "border-2 border-muted-foreground"
                      )}
                    >
                      {completedToday.includes(habit.id) && (
                        <span>✓</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => router.push('/habits/new')}
            >
              Add New Habit
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Streak Progress</CardTitle>
            <CardDescription>Your most consistent habits</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-muted-foreground">Loading habits...</p>
              </div>
            ) : habits.length === 0 ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-muted-foreground">No habits yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {habits
                  .sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0))
                  .slice(0, 3)
                  .map((habit) => (
                    <div key={habit.id} className="flex items-center justify-between p-2 border-b">
                      <span>{habit.name}</span>
                      <div className="flex items-center">
                        <span className="font-bold mr-1">{habit.currentStreak || 0}</span>
                        <span className="text-xs text-muted-foreground">days</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/habits')}
            >
              View All Habits
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 