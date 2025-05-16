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
import { API_ENDPOINTS } from "@/lib/api-config";
import { HabitItem } from "@/components/habit-item";
import { motion } from "framer-motion";
import { BarChart3, Calendar, Award, Plus, Settings, ChevronRight, Layers } from "lucide-react";

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

  // Function to fetch today's logs - only call this when habits are loaded
  const fetchTodaysLogs = useCallback(async () => {
    if (!habits || habits.length === 0) return;
    
    const today = new Date().toISOString().split('T')[0];
    const completedHabitIds: string[] = [];
    
    try {
      // For each habit, check if there's a log for today
      await Promise.all(habits.map(async (habit) => {
        const response = await fetch(`${API_ENDPOINTS.HABITS.logs(habit.id)}?date=${today}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.logs.length > 0) {
            // If there's a completed log for today, add to completed list
            const todayLog = data.logs.find((log: any) => log.date === today && log.status === 'completed');
            if (todayLog) {
              completedHabitIds.push(habit.id);
            }
          }
        }
      }));
      
      setCompletedToday(completedHabitIds);
    } catch (error) {
      console.error('Error fetching today\'s logs:', error);
    }
  }, [habits]);

  // Call fetchTodaysLogs when habits change
  useEffect(() => {
    if (habits && habits.length > 0) {
      fetchTodaysLogs();
    }
  }, [habits, fetchTodaysLogs]);

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
        if (!habit.targetDays) return false;
        
        if (typeof habit.targetDays === 'string') {
          // Handle potential empty string or invalid JSON
          const targetDaysStr = habit.targetDays as string;
          if (targetDaysStr.trim() === '') return false;
          targetDays = JSON.parse(targetDaysStr);
        } else if (Array.isArray(habit.targetDays)) {
          targetDays = habit.targetDays;
        } else {
          console.error('Invalid targetDays format:', habit.targetDays);
          return false;
        }
      } catch (error) {
        console.error('Error parsing targetDays for habit:', habit.name, error);
        return false;
      }
      
      return habit.isActive && Array.isArray(targetDays) && targetDays.includes(todayName);
    });
    
    setTodaysHabits(habitsForToday);
  }, [habits]);

  const handleMarkCompleted = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await logHabit(habitId, today, 'completed');
      
      // Update local state
      setCompletedToday(prev => [...prev.filter(id => id !== habitId), habitId]);
    } catch (error) {
      console.error('Error marking habit as completed:', error);
    }
  };

  const handleMarkMissed = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await logHabit(habitId, today, 'missed');
      
      // Update local state
      setCompletedToday(prev => prev.filter(id => id !== habitId));
    } catch (error) {
      console.error('Error marking habit as missed:', error);
    }
  };

  // Calculate summary statistics
  const activeHabits = habits.filter(h => h.isActive).length;
  const completedTodayCount = completedToday.length;
  const todayCompletionRate = todaysHabits.length > 0 
    ? Math.round((completedTodayCount / todaysHabits.length) * 100) 
    : 0;
  const highestStreak = habits.reduce((max, habit) => 
    Math.max(max, habit.currentStreak || 0), 0);

  // Format today's date
  const formatDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('en-US', options);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 animate-fadeIn">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-primary/10 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-blue-500/5 to-transparent opacity-30"></div>
      </div>

      <div className="container mx-auto py-8 px-4">
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
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">{formatDate()}</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="gap-2 hover:bg-primary/10 transition-colors"
                onClick={() => router.push('/habits')}
              >
                <Settings className="h-4 w-4" />
                Manage Habits
              </Button>
              <Button
                variant="outline"
                className="gap-2 hover:bg-blue-500/10 transition-colors"
                onClick={() => router.push('/settings')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-blue-500"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Settings
              </Button>
              <LogoutConfirmation />
            </div>
          </header>
        </motion.div>
        
        {/* Daily quote section - enhanced */}
        {userPrefs.showQuotes && dailyQuote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-primary/20 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 pb-4">
                <div className="relative">
                  <div className="absolute -top-4 -left-2 text-4xl text-primary/20 font-serif">"</div>
                  <blockquote className="italic text-lg text-center px-8">
                    {dailyQuote.text}
                  </blockquote>
                  <div className="absolute -bottom-4 -right-2 text-4xl text-primary/20 font-serif rotate-180">"</div>
                </div>
                <p className="text-right mt-4 text-sm font-medium text-muted-foreground">— {dailyQuote.author}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Summary stats at the top - New section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard 
            title="Active Habits" 
            value={activeHabits} 
            icon={<Layers className="h-5 w-5 text-primary" />}
            color="from-violet-600 to-primary"
          />
          
          <StatCard 
            title="Today's Completion" 
            value={`${completedTodayCount}/${todaysHabits.length}`}
            percentage={todayCompletionRate}
            icon={<Calendar className="h-5 w-5 text-green-500" />}
            color="from-green-600 to-emerald-500"
          />
          
          <StatCard 
            title="Highest Streak" 
            value={`${highestStreak} days`}
            icon={<Award className="h-5 w-5 text-yellow-500" />}
            color="from-yellow-600 to-amber-500"
          />

          <StatCard 
            title="Analytics" 
            actionLabel="View"
            icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
            color="from-blue-600 to-cyan-500"
            onClick={() => router.push('/analytics')}
          />
        </motion.div>
        
        {/* Main content area */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-12">
          {/* Today's Habits Card - Wider */}
          <motion.div variants={item} className="md:col-span-7">
            <Card className="h-full border-t-4 border-t-green-500 shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle>Today's Habits</CardTitle>
                      <CardDescription>Habits to complete today</CardDescription>
                    </div>
                  </div>
                  <div className="text-sm bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full font-medium hidden md:block">
                    {completedTodayCount}/{todaysHabits.length} Completed
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[350px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="text-muted-foreground">Loading habits...</p>
                    </div>
                  </div>
                ) : todaysHabits.length === 0 ? (
                  <div className="h-[350px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="bg-muted/40 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-10 w-10 text-muted-foreground/60" />
                      </div>
                      <p className="text-muted-foreground mb-2">No habits scheduled for today</p>
                      <Button 
                        variant="outline"
                        size="sm" 
                        onClick={() => router.push('/habits/new')}
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Your First Habit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                    {todaysHabits.map((habit, index) => (
                      <motion.div 
                        key={habit.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                      >
                        <HabitItem
                          habit={habit}
                          isCompleted={completedToday.includes(habit.id)}
                          onMarkCompleted={handleMarkCompleted}
                          onMarkMissed={handleMarkMissed}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full gap-1 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 shadow-sm"
                  onClick={() => router.push('/habits/new')}
                >
                  <Plus className="h-4 w-4" />
                  Add New Habit
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          
          {/* Streak Progress Card - Narrower */}
          <motion.div variants={item} className="md:col-span-5">
            <Card className="h-full border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Streak Progress</CardTitle>
                    <CardDescription>Your most consistent habits</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[350px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="text-muted-foreground">Loading habits...</p>
                    </div>
                  </div>
                ) : habits.length === 0 ? (
                  <div className="h-[350px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="bg-muted/40 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="h-10 w-10 text-muted-foreground/60" />
                      </div>
                      <p className="text-muted-foreground">No habits yet</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {habits
                      .sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0))
                      .slice(0, 5)
                      .map((habit, index) => {
                        // Calculate progress percentage for streak visualization
                        const progress = Math.min(((habit.currentStreak || 0) / (habit.longestStreak || 1)) * 100, 100);
                        return (
                          <motion.div 
                            key={habit.id} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className="group"
                          >
                            <div className="p-3 border-b last:border-0 hover:bg-muted/30 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{habit.name}</span>
                                    <div className="flex items-center gap-1">
                                      <span className="font-bold text-blue-600 dark:text-blue-400">{habit.currentStreak || 0}</span>
                                      <span className="text-xs text-muted-foreground">days</span>
                                    </div>
                                  </div>
                                  <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                                    <div 
                                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-600 relative group-hover:opacity-90 transition-opacity shadow-inner"
                                      style={{ width: `${progress}%` }}
                                    >
                                      <div className="absolute inset-0 opacity-30 animate-pulse-slow">
                                        <div className="h-full w-20 bg-white/30 blur-md transform -skew-x-12 animate-shimmer"></div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-muted-foreground">Current</span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      Best: {habit.longestStreak || 0}
                                      {habit.currentStreak === habit.longestStreak && habit.longestStreak > 0 && (
                                        <Award className="h-3 w-3 text-yellow-500" />
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full group"
                  onClick={() => router.push('/habits')}
                >
                  <span>View All Habits</span>
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value?: string | number;
  percentage?: number;
  icon?: React.ReactNode;
  color?: string;
  actionLabel?: string;
  onClick?: () => void;
}

function StatCard({ title, value, percentage, icon, color = "from-primary to-primary", actionLabel, onClick }: StatCardProps) {
  return (
    <Card 
      className={cn(
        "shadow-sm hover:shadow-md transition-all group overflow-hidden",
        onClick && "cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5 transform transition-all"
      )}
      onClick={onClick}
    >
      <div className="relative h-full">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary" style={{ backgroundImage: `linear-gradient(to right, var(--${color.split('-')[1].split(' ')[0]}), var(--${color.split(' ')[1]}))` }}></div>
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <div className="p-2 bg-muted/40 rounded-full">
              {icon}
            </div>
          </div>
          
          {value ? (
            <div className="mt-2">
              <div className="text-2xl font-bold">{value}</div>
              {typeof percentage === 'number' && (
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full rounded-full relative"
                    style={{
                      width: `${Math.min(Math.round(percentage), 100)}%`,
                      backgroundImage: `linear-gradient(to right, var(--${color.split('-')[1].split(' ')[0]}), var(--${color.split(' ')[1]}))`
                    }}
                  ></div>
                </div>
              )}
            </div>
          ) : actionLabel ? (
            <div className="mt-4 flex items-center">
              <span className="text-sm font-medium">{actionLabel}</span>
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          ) : null}
        </CardContent>
      </div>
    </Card>
  );
} 