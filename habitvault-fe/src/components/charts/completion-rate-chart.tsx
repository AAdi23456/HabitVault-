"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChartIcon, Award } from "lucide-react";
import { motion } from "framer-motion";

interface CompletionRateChartProps {
  completionRate: number;
  title?: string;
}

export function CompletionRateChart({ 
  completionRate, 
  title = "Overall Completion Rate" 
}: CompletionRateChartProps) {
  // Ensure completionRate is between 0 and 100
  const safeCompletionRate = Math.min(100, Math.max(0, completionRate));
  
  // Calculate missed rate
  const missedRate = 100 - safeCompletionRate;
  
  // Data for pie chart
  const data = [
    { name: 'Completed', value: safeCompletionRate },
    { name: 'Missed', value: missedRate },
  ];

  // Colors for the pie slices - enhanced with brighter colors
  const COLORS = ['#10b981', '#f43f5e']; // emerald-500 and rose-500
  
  // Get status text and color based on completion rate
  const getStatusInfo = (rate: number) => {
    if (rate >= 80) return { text: 'Excellent', color: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' };
    if (rate >= 60) return { text: 'Good', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' };
    if (rate >= 40) return { text: 'Average', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400' };
    if (rate >= 20) return { text: 'Needs Improvement', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400' };
    return { text: 'Poor', color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400' };
  };
  
  const statusInfo = getStatusInfo(safeCompletionRate);
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const name = data.name;
      const value = data.value;
      const color = name === 'Completed' ? 'bg-emerald-500' : 'bg-rose-500';
      const textColor = name === 'Completed' ? 'text-emerald-600' : 'text-rose-600';
      
      return (
        <div className="bg-white dark:bg-slate-900 p-4 border rounded-lg shadow-lg">
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 ${color} mr-2 rounded-full`}></span>
            <span className="font-medium dark:text-white">{name}</span>
          </div>
          <p className={`font-bold text-lg mt-1 ${textColor} dark:text-opacity-90`}>{value.toFixed(1)}%</p>
        </div>
      );
    }
    
    return null;
  };

  // Animation variants for the percentage counter
  const variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  return (
    <Card className="border-t-4 border-t-purple-500 shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-950">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <div className="mr-2 h-8 w-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                <PieChartIcon className="h-5 w-5" />
              </div>
              {title}
            </CardTitle>
            <CardDescription>
              How often you complete your scheduled habits
            </CardDescription>
          </div>
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`text-sm px-3 py-1.5 rounded-full font-medium ${statusInfo.color}`}
          >
            {statusInfo.text}
          </motion.div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-60 w-full flex flex-col items-center">
          <motion.div 
            className="relative"
            initial="hidden"
            animate="visible"
            variants={variants}
          >
            <div className="text-4xl font-bold text-center mb-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              {Math.round(safeCompletionRate)}%
            </div>
            <div className="text-sm text-muted-foreground text-center mb-2">
              {safeCompletionRate >= 60 ? (
                <div className="flex items-center justify-center">
                  <Award className="h-4 w-4 text-yellow-500 mr-1" />
                  <span>Great Progress!</span>
                </div>
              ) : (
                <span>Completion Rate</span>
              )}
            </div>
          </motion.div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <filter id="glow" height="130%" width="130%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  animationDuration={1800}
                  animationBegin={300}
                  filter="url(#glow)"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="hover:opacity-90 transition-opacity drop-shadow-md"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{
                    paddingTop: "15px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 