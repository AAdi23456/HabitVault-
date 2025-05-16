"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useHabit } from "@/context/habit-context";
import { getUserPreferences, saveTimeRange } from "@/lib/local-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HabitCompletionChart } from "@/components/charts/habit-completion-chart";
import { CompletionRateChart } from "@/components/charts/completion-rate-chart";
import { StreakChart } from "@/components/charts/streak-chart";
import { BarChart3, LineChart, PieChart, TrendingUp, Award, ChevronLeft, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const router = useRouter();
  const { habits, isLoading, fetchHabitStats, stats } = useHabit();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  
  useEffect(() => {
    // Load time range preference from localStorage
    const prefs = getUserPreferences();
    setTimeRange(prefs.analyticsTimeRange);
    
    // Fetch habit stats
    fetchHabitStats();
  }, [fetchHabitStats]);
  
  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    const newRange = value as "week" | "month" | "year";
    setTimeRange(newRange);
    saveTimeRange(newRange);
  };
  
  return (
    <div className="container mx-auto py-10 px-4 animate-fadeIn">
      {/* Enhanced Header with Better Gradient Background */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 mb-8 text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
          <div>
            <h1 className="text-4xl font-bold mb-3 flex items-center">
              <BarChart3 className="mr-3 h-10 w-10" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100">Analytics Dashboard</span>
              <Sparkles className="ml-2 h-6 w-6 text-yellow-300 animate-pulse" />
            </h1>
            <p className="text-white/90 max-w-2xl text-lg">
              Track your habit performance, completion rates, and streaks to understand your progress over time.
            </p>
          </div>
          <Button variant="secondary" size="sm" asChild className="shadow-md hover:shadow-lg transition-all mt-4 md:mt-0 hover:-translate-y-1 transform duration-200">
            <Link href="/dashboard" className="flex items-center">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs 
          defaultValue={timeRange} 
          onValueChange={handleTimeRangeChange}
          className="mb-6"
        >
          <div className="mb-6 flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3 p-1 bg-muted/80 backdrop-blur-sm">
              <TabsTrigger value="week" className="flex items-center justify-center transition-all data-[state=active]:bg-white data-[state=active]:shadow-md">
                <Calendar className="mr-2 h-4 w-4" />
                Week
              </TabsTrigger>
              <TabsTrigger value="month" className="flex items-center justify-center transition-all data-[state=active]:bg-white data-[state=active]:shadow-md">
                <Calendar className="mr-2 h-4 w-4" />
                Month
              </TabsTrigger>
              <TabsTrigger value="year" className="flex items-center justify-center transition-all data-[state=active]:bg-white data-[state=active]:shadow-md">
                <Calendar className="mr-2 h-4 w-4" />
                Year
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="week" className="mt-0">
            <AnalyticsContent isLoading={isLoading} stats={stats} timeRange="week" />
          </TabsContent>
          
          <TabsContent value="month" className="mt-0">
            <AnalyticsContent isLoading={isLoading} stats={stats} timeRange="month" />
          </TabsContent>
          
          <TabsContent value="year" className="mt-0">
            <AnalyticsContent isLoading={isLoading} stats={stats} timeRange="year" />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

interface AnalyticsContentProps {
  isLoading: boolean;
  stats: any;
  timeRange: "week" | "month" | "year";
}

function AnalyticsContent({ isLoading, stats, timeRange }: AnalyticsContentProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }
  
  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">No stats available</p>
      </div>
    );
  }

  // Prepare streak data for chart
  const streakData = stats.habitStats.map((habit: any) => ({
    id: habit.id,
    name: habit.name,
    currentStreak: habit.currentStreak || 0,
    longestStreak: habit.longestStreak || 0,
  }));
  
  return (
    <div className="space-y-8">
      {/* Summary Cards - Enhanced with animations and better styling */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatCard 
            title="Total Habits" 
            value={stats.totalHabits} 
            suffix="habits"
            icon={<BarChart3 className="h-5 w-5 text-indigo-500" />}
            description="Total number of habits created"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatCard 
            title="Active Habits" 
            value={stats.activeHabits} 
            suffix="habits" 
            percentage={stats.totalHabits > 0 ? (stats.activeHabits / stats.totalHabits) * 100 : 0}
            icon={<TrendingUp className="h-5 w-5 text-green-500" />}
            description="Currently active habits"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatCard 
            title="Overall Completion Rate" 
            value={Math.round(stats.overallCompletionRate)} 
            suffix="%"
            icon={<PieChart className="h-5 w-5 text-purple-500" />} 
            description="How often you complete habits"
          />
        </motion.div>
      </div>

      {/* Charts Section - Improved Grid Layout with animations */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Completion Rate Pie Chart */}
        <motion.div 
          className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ y: -5 }}
        >
          <CompletionRateChart 
            completionRate={stats.overallCompletionRate} 
            title={`${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Completion Rate`}
          />
        </motion.div>
        
        {/* Best Performing Habit - Enhanced styling */}
        <motion.div 
          className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ y: -5 }}
        >
          <Card className="h-full border-t-4 border-t-purple-500 bg-white dark:bg-slate-950 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-yellow-500" />
                Best Performing Habit
              </CardTitle>
              <CardDescription>
                Your most consistent habit based on completion rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.bestHabit ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                    {stats.bestHabit.name}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Completion Rate:</span>
                      <span className="font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
                        {Math.round(stats.bestHabit.completionRate)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Current Streak:</span>
                      <span className="font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-md flex items-center">
                        <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
                        {stats.bestHabit.currentStreak} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Longest Streak:</span>
                      <span className="font-medium bg-purple-50 text-purple-600 px-2 py-1 rounded-md">
                        {stats.bestHabit.longestStreak} days
                      </span>
                    </div>
                    <div className="mt-4 h-3 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-green-400 via-green-500 to-teal-500 shadow-inner relative"
                        style={{ width: `${Math.min(Math.round(stats.bestHabit.completionRate), 100)}%` }}
                      >
                        <div className="absolute inset-0 opacity-30 animate-pulse-slow">
                          <div className="h-full w-20 bg-white/30 blur-md transform -skew-x-12 animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No habits tracked yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Completion Rate Bar Chart - Enhanced with hover effects */}
      {stats.habitStats && stats.habitStats.length > 0 && (
        <motion.div 
          className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          whileHover={{ y: -5 }}
        >
          <HabitCompletionChart 
            data={stats.habitStats} 
            title="Habit Performance Comparison"
          />
        </motion.div>
      )}

      {/* Streak Area Chart - Enhanced with hover effects */}
      {stats.habitStats && stats.habitStats.some((h: any) => (h.currentStreak > 0 || h.longestStreak > 0)) && (
        <motion.div 
          className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          whileHover={{ y: -5 }}
        >
          <StreakChart 
            data={streakData} 
            title="Top Habit Streaks"
          />
        </motion.div>
      )}

      {/* Bottom info card - enhanced with better styling */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card className="bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 border-0 shadow-sm hover:shadow-md transition-all">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-muted-foreground">
              Data shown is based on your habit activity over the selected {timeRange} period.
              Continue tracking your habits to see more comprehensive analytics.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  percentage?: number;
  icon?: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, suffix, percentage, icon, description }: StatCardProps) {
  return (
    <Card className="border-t-4 border-t-indigo-500 transform transition-all duration-300 hover:scale-[1.03] hover:shadow-xl bg-white dark:bg-slate-950 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="text-muted-foreground">{title}</span>
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-full">
            {icon}
          </div>
        </CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700">
            {value}
          </span>
          {suffix && <span className="ml-1 text-muted-foreground">{suffix}</span>}
        </div>
        {typeof percentage === 'number' && (
          <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-indigo-500 to-purple-500 relative"
              style={{ width: `${Math.min(Math.round(percentage), 100)}%` }}
            >
              <div className="absolute inset-0 opacity-30">
                <div className="h-full w-10 bg-white blur-md transform -skew-x-12 animate-shimmer"></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add these at the end of the file, for animations
declare module "react" {
  interface CSSProperties {
    '--value'?: string | number;
  }
}

// Add this to your global CSS file
// You'll need to create this animation in your globals.css or tailwind config 