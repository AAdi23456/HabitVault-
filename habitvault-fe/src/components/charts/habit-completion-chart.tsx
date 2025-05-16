"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface HabitCompletionChartProps {
  data: {
    name: string;
    completionRate: number;
    id: string;
  }[];
  title?: string;
}

export function HabitCompletionChart({ data, title = "Habit Completion Rates" }: HabitCompletionChartProps) {
  // Sort data by completion rate
  const sortedData = [...data].sort((a, b) => b.completionRate - a.completionRate);
  
  // Generate custom colors (gradient based on completion rate)
  const getBarColor = (completionRate: number) => {
    // Higher completion rates get darker green
    if (completionRate >= 75) return '#15803d'; // green-700
    if (completionRate >= 50) return '#16a34a'; // green-600
    if (completionRate >= 25) return '#22c55e'; // green-500
    return '#4ade80'; // green-400
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-4 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-700 dark:text-gray-200">{label}</p>
          <p className="text-sm mt-2 flex items-center">
            <span className="inline-block w-3 h-3 bg-green-500 mr-2 rounded-full"></span>
            <span>Completion Rate: </span>
            <span className="font-bold text-green-600 dark:text-green-400 ml-1">
              {Math.round(payload[0].value)}%
            </span>
          </p>
          <div className="mt-2 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-600" 
              style={{ width: `${Math.min(Math.round(payload[0].value), 100)}%` }}
            ></div>
          </div>
        </div>
      );
    }
  
    return null;
  };

  return (
    <Card className="border-t-4 border-t-green-500 shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-950">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <div className="mr-2 h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              {title}
            </CardTitle>
            <CardDescription>
              Comparing completion rates across all your habits
            </CardDescription>
          </div>
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-sm bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full font-medium">
            {sortedData.length} habits
          </motion.div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
                margin={{
                  top: 20,
                  right: 15,
                  left: 15,
                  bottom: 30,
                }}
                barSize={40}
                className="[&_.recharts-cartesian-grid-horizontal_line]:stroke-muted [&_.recharts-cartesian-grid-vertical_line]:stroke-muted"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(224, 231, 255, 0.2)' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  formatter={() => "Completion Rate"}
                  wrapperStyle={{
                    paddingTop: "10px"
                  }}
                />
                <defs>
                  <filter id="shadow" height="130%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#64748b" floodOpacity="0.2" />
                  </filter>
                </defs>
                <Bar 
                  dataKey="completionRate" 
                  name="Completion Rate" 
                  radius={[6, 6, 0, 0]}
                  animationDuration={1800}
                  animationBegin={300}
                  filter="url(#shadow)"
                >
                  {sortedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getBarColor(entry.completionRate)} 
                      className="hover:opacity-90 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 