"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useHabit } from "@/context/habit-context";
import { getUserPreferences, saveTimeRange } from "@/lib/local-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
      
      <Tabs defaultValue={timeRange} onValueChange={handleTimeRangeChange}>
        <div className="mb-6 flex justify-center">
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
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
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
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
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Total Habits" 
          value={stats.totalHabits} 
          suffix="habits" 
        />
        
        <StatCard 
          title="Active Habits" 
          value={stats.activeHabits} 
          suffix="habits" 
          percentage={stats.totalHabits > 0 ? (stats.activeHabits / stats.totalHabits) * 100 : 0} 
        />
        
        <StatCard 
          title="Overall Completion Rate" 
          value={Math.round(stats.overallCompletionRate)} 
          suffix="%" 
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Best Performing Habit</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.bestHabit ? (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{stats.bestHabit.name}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completion Rate:</span>
                  <span className="font-medium">{Math.round(stats.bestHabit.completionRate)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Streak:</span>
                  <span className="font-medium">{stats.bestHabit.currentStreak} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Longest Streak:</span>
                  <span className="font-medium">{stats.bestHabit.longestStreak} days</span>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-primary" 
                    style={{ width: `${Math.min(Math.round(stats.bestHabit.completionRate), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No habits tracked yet</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Habit Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.habitStats && stats.habitStats.length > 0 ? (
            <div className="space-y-6">
              {stats.habitStats.map((habit: any) => (
                <div key={habit.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{habit.name}</h3>
                    <span className="text-sm">{Math.round(habit.completionRate)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-primary" 
                      style={{ width: `${Math.min(Math.round(habit.completionRate), 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No habit data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  percentage?: number;
}

function StatCard({ title, value, suffix, percentage }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{value}</span>
          {suffix && <span className="ml-1 text-muted-foreground">{suffix}</span>}
        </div>
        {typeof percentage === 'number' && (
          <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full rounded-full bg-primary" 
              style={{ width: `${Math.min(Math.round(percentage), 100)}%` }}
            ></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 