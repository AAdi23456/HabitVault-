"use client";

import { HabitForm } from "@/components/habit-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Lightbulb } from "lucide-react";

export default function NewHabitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 animate-fadeIn">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-primary/10 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-blue-500/5 to-transparent opacity-30"></div>
      </div>
    
      <div className="container mx-auto py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                Create New Habit
              </h1>
              <p className="text-muted-foreground mt-1">Start building a better routine</p>
            </div>
            <Button 
              variant="outline" 
              className="gap-2 hover:bg-primary/10 transition-colors" 
              asChild
            >
              <Link href="/habits">
                <ArrowLeft className="h-4 w-4" />
                Back to Habits
              </Link>
            </Button>
          </header>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mx-auto max-w-2xl">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-lg p-4 mb-6 flex items-start gap-3 text-sm">
              <div className="shrink-0 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 p-1 rounded-full mt-0.5">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-400">Habit Building Tip</p>
                <p className="text-blue-600/90 dark:text-blue-300/90 mt-1">
                  Start small and be specific with your habits. It's easier to build consistency with
                  concrete actions like "Walk for 10 minutes after lunch" rather than vague goals.
                </p>
              </div>
            </div>
            <HabitForm />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 