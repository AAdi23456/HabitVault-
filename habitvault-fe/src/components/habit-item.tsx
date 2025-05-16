"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Habit } from "@/context/habit-context";
import { CheckCircle, XCircle, Flame, Info, Trophy, Timer, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HabitItemProps {
  habit: Habit;
  isCompleted: boolean;
  onMarkCompleted: (habitId: string) => Promise<void>;
  onMarkMissed: (habitId: string) => Promise<void>;
}

export function HabitItem({ habit, isCompleted, onMarkCompleted, onMarkMissed }: HabitItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [completionState, setCompletionState] = useState<'idle' | 'completed' | 'missed'>(isCompleted ? 'completed' : 'idle');

  const handleMarkCompleted = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onMarkCompleted(habit.id);
      setCompletionState('completed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkMissed = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onMarkMissed(habit.id);
      setCompletionState('missed');
    } finally {
      setIsLoading(false);
    }
  };

  // When isCompleted prop changes, update the internal state
  if (isCompleted && completionState !== 'completed') {
    setCompletionState('completed');
  } else if (!isCompleted && completionState === 'completed') {
    setCompletionState('idle');
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "p-3 rounded-lg border flex justify-between items-center transition-all shadow-sm",
        completionState === 'completed'
          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800/30" 
          : completionState === 'missed'
          ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 dark:from-red-950/20 dark:to-rose-950/20 dark:border-red-800/30"
          : "hover:bg-muted/50 dark:hover:bg-muted/20"
      )}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col flex-grow overflow-hidden mr-3">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{habit.name}</span>
          {habit.currentStreak > 0 && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full"
            >
              <Flame className="h-3 w-3" />
              <span className="text-xs font-medium">{habit.currentStreak}</span>
            </motion.div>
          )}
          {habit.currentStreak >= 7 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-yellow-500">
                    <Trophy className="h-3.5 w-3.5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Streak of 7 days or more!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {habit.description && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
              {habit.description}
            </span>
            {habit.description.length > 30 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{habit.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={completionState === 'completed' ? "default" : "outline"}
                size="sm"
                className={cn(
                  "rounded-full w-8 h-8 p-0 transition-all",
                  completionState === 'completed'
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-sm hover:shadow-md" 
                    : "hover:border-green-500 hover:text-green-500"
                )}
                onClick={handleMarkCompleted}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
                ) : (
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: completionState === 'completed' ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </motion.div>
                )}
                <span className="sr-only">Mark as done</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Mark as completed</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={completionState === 'missed' ? "default" : "outline"}
                size="sm"
                className={cn(
                  "rounded-full w-8 h-8 p-0 transition-all",
                  completionState === 'missed'
                    ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-sm hover:shadow-md" 
                    : "hover:border-red-500 hover:text-red-500"
                )}
                onClick={handleMarkMissed}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
                ) : (
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: completionState === 'missed' ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <XCircle className="h-4 w-4" />
                  </motion.div>
                )}
                <span className="sr-only">Mark as missed</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Mark as missed</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
} 