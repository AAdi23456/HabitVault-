"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { CheckCircle, Zap, BarChart2, Clock, Award, TrendingUp } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-gray-900 dark:to-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: 0.3 + custom * 0.1,
        duration: 0.5 
      }
    })
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div 
          className="max-w-5xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero section */}
          <div className="text-center mb-16">
            <motion.div variants={itemVariants} className="inline-block mb-4">
              <div className="bg-primary/10 dark:bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-medium inline-flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Build lasting habits with ease
              </div>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600"
            >
              Welcome to HabitVault
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl mb-12 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Track your habits, maintain streaks, and build better routines with
              our beautiful and intuitive habit tracking app.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
            >
              {!isAuthenticated ? (
                <>
                  <Button 
                    asChild 
                    size="lg" 
                    className="px-8 py-6 text-lg bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg hover:shadow-xl transition-all group"
                  >
                    <Link href="/register" className="flex items-center gap-2">
                      Sign Up
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="size-5 transform group-hover:translate-x-1 transition-transform"
                      >
                        <path d="M5 12h14"/>
                        <path d="m12 5 7 7-7 7"/>
                      </svg>
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="px-8 py-6 text-lg border-2 hover:bg-muted/50"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                </>
              ) : (
                <Button 
                  asChild 
                  size="lg" 
                  className="px-8 py-6 text-lg bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg hover:shadow-xl transition-all"
                >
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              )}
            </motion.div>
          </div>

          {/* Features section */}
          <motion.div 
            className="mt-32"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.h2 
              variants={itemVariants} 
              className="text-3xl font-bold mb-16 text-center"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600">
                Everything you need
              </span> to build better habits
            </motion.h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                custom={0}
                variants={featureVariants}
                className="bg-white dark:bg-gray-800/50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group hover:border-primary/20 dark:hover:border-primary/20"
              >
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors">Daily Tracking</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Easily track your habits daily with a beautiful interface and build lasting consistency in your routines.
                </p>
              </motion.div>
              
              <motion.div 
                custom={1}
                variants={featureVariants}
                className="bg-white dark:bg-gray-800/50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group hover:border-primary/20 dark:hover:border-primary/20"
              >
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 group-hover:text-amber-500 transition-colors">Streak Counting</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Visualize your progress with beautiful streak counters that motivate you to maintain your habits.
                </p>
              </motion.div>
              
              <motion.div 
                custom={2}
                variants={featureVariants}
                className="bg-white dark:bg-gray-800/50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group hover:border-primary/20 dark:hover:border-primary/20"
              >
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  <BarChart2 className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 group-hover:text-blue-500 transition-colors">Powerful Analytics</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Gain insights into your habits with detailed analytics and visualizations of your productivity patterns.
                </p>
              </motion.div>
            </div>
            
            {/* Additional features */}
            <div className="grid md:grid-cols-3 gap-8 mt-8">
              <motion.div 
                custom={3}
                variants={featureVariants}
                className="bg-white dark:bg-gray-800/50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group hover:border-primary/20 dark:hover:border-primary/20"
              >
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 group-hover:text-green-500 transition-colors">Flexible Scheduling</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Set custom schedules for your habits - daily, weekdays only, or on specific days that work for you.
                </p>
              </motion.div>
              
              <motion.div 
                custom={4}
                variants={featureVariants}
                className="bg-white dark:bg-gray-800/50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group hover:border-primary/20 dark:hover:border-primary/20"
              >
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 group-hover:text-rose-500 transition-colors">Progress Tracking</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Monitor your growth over time with beautiful visualizations that show your habit development.
                </p>
              </motion.div>
              
              <motion.div 
                custom={5}
                variants={featureVariants}
                className="bg-white dark:bg-gray-800/50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group hover:border-primary/20 dark:hover:border-primary/20"
              >
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 group-hover:text-violet-500 transition-colors">Achievements</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Earn achievements as you build consistency, helping you stay motivated on your journey.
                </p>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Call to action */}
          <motion.div 
            variants={itemVariants}
            className="mt-32 mb-16 text-center"
          >
            <div className="bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-gray-800 dark:to-gray-800/50 p-12 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden opacity-10">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-violet-400 rounded-full blur-3xl"></div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to build better habits?</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Start your journey to better habits today and see the difference consistency can make.
              </p>
              
              {!isAuthenticated && (
                <Button 
                  asChild 
                  size="lg" 
                  className="px-10 py-6 text-lg bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg hover:shadow-xl transition-all"
                >
                  <Link href="/register">Sign Up Now</Link>
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-900 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} HabitVault. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
} 