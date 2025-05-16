"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { API_ENDPOINTS } from "@/lib/api-config";
import { HabitLog } from "@/context/habit-context";
import { CheckCircle, XCircle, SkipForward, Calendar } from "lucide-react";

interface HabitHistoryProps {
  habitId: string;
  maxDays?: number;
}

export function HabitHistory({ habitId, maxDays = 7 }: HabitHistoryProps) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHabitLogs() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Calculate date range (last n days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - maxDays);
        
        const response = await fetch(
          `${API_ENDPOINTS.HABITS.logs(habitId)}?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch logs: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setLogs(data.logs);
        } else {
          throw new Error(data.message || 'Failed to fetch habit logs');
        }
      } catch (error) {
        console.error('Error fetching habit logs:', error);
        setError('Failed to load habit history');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchHabitLogs();
  }, [habitId, maxDays]);

  // Create a daily map of the last maxDays
  const dailyStatusMap = new Map<string, string>();
  
  // Initialize all days with no data
  for (let i = 0; i < maxDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    dailyStatusMap.set(dateString, 'no-data');
  }
  
  // Update with actual log data
  logs.forEach(log => {
    if (dailyStatusMap.has(log.date)) {
      dailyStatusMap.set(log.date, log.status);
    }
  });
  
  // Convert to array for rendering
  const dailyStatus = Array.from(dailyStatusMap.entries())
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()) // Sort newest first
    .map(([date, status]) => ({ date, status }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            {error}
          </div>
        ) : (
          <div className="space-y-2">
            {dailyStatus.map(({ date, status }) => (
              <div key={date} className="flex items-center justify-between py-1 border-b border-muted last:border-0">
                <span className="text-sm">{formatDate(date)}</span>
                <div>
                  {status === 'completed' && (
                    <div className="flex items-center text-green-500">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Completed</span>
                    </div>
                  )}
                  {status === 'missed' && (
                    <div className="flex items-center text-red-500">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Missed</span>
                    </div>
                  )}
                  {status === 'skipped' && (
                    <div className="flex items-center text-yellow-500">
                      <SkipForward className="h-4 w-4 mr-1" />
                      <span className="text-sm">Skipped</span>
                    </div>
                  )}
                  {status === 'no-data' && (
                    <div className="flex items-center text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm">No Data</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 