"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Award, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface StreakChartProps {
  data: {
    name: string;
    currentStreak: number;
    longestStreak: number;
    id: string;
  }[];
  title?: string;
}

export function StreakChart({ data, title = "Habit Streaks" }: StreakChartProps) {
  // Sort data by current streak
  const sortedData = [...data]
    .filter(item => item.currentStreak > 0 || item.longestStreak > 0)
    .sort((a, b) => b.currentStreak - a.currentStreak);
  
  // Take top 5 for better visualization
  const chartData = sortedData.slice(0, 5);

  // Find the habit with the longest current streak
  const bestStreakHabit = sortedData.length > 0 ? sortedData[0] : null;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-4 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-700 dark:text-gray-200">{label}</p>
          <div className="space-y-2 mt-2">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm flex items-center">
                <span 
                  className="inline-block w-3 h-3 mr-2 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span className="text-muted-foreground">{entry.name}: </span>
                <span className="font-bold ml-1 dark:text-white">
                  {entry.value} days
                </span>
              </p>
            ))}
          </div>
        </div>
      );
    }
  
    return null;
  };

  return (
    <Card className="border-t-4 border-t-blue-500 shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-950">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <div className="mr-2 h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <LineChart className="h-5 w-5" />
              </div>
              {title}
            </CardTitle>
            <CardDescription>
              Visualization of your current and longest streaks
            </CardDescription>
          </div>
          {bestStreakHabit && (
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-1 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full font-medium"
            >
              <Award className="h-4 w-4 text-yellow-500 mr-1" />
              <span>Best: {bestStreakHabit.currentStreak} days</span>
              <Sparkles className="h-3 w-3 ml-1 text-yellow-400 animate-pulse" />
            </motion.div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 15,
                  left: 15,
                  bottom: 30,
                }}
                className="[&_.recharts-cartesian-grid-horizontal_line]:stroke-muted [&_.recharts-cartesian-grid-vertical_line]:stroke-muted"
              >
                <defs>
                  <linearGradient id="currentStreakGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="longestStreakGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <filter id="dropShadow" height="130%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="0" dy="3" result="offsetblur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.2" />
                    </feComponentTransfer>
                    <feMerge> 
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" /> 
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-35} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tickFormatter={(value) => `${value} days`}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top"
                  height={36} 
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{
                    paddingTop: "10px"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="currentStreak" 
                  name="Current Streak" 
                  stroke="#0ea5e9" 
                  fill="url(#currentStreakGradient)" 
                  strokeWidth={3}
                  activeDot={{ r: 8, strokeWidth: 1, stroke: '#fff', fill: '#0ea5e9' }}
                  animationDuration={2000}
                  isAnimationActive={true}
                  filter="url(#dropShadow)"
                />
                <Area 
                  type="monotone" 
                  dataKey="longestStreak" 
                  name="Longest Streak" 
                  stroke="#8b5cf6" 
                  fill="url(#longestStreakGradient)" 
                  strokeWidth={3}
                  activeDot={{ r: 8, strokeWidth: 1, stroke: '#fff', fill: '#8b5cf6' }}
                  animationDuration={2000}
                  animationBegin={400}
                  isAnimationActive={true}
                  filter="url(#dropShadow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No streak data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 