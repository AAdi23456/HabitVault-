"use client";

import { useState, useEffect } from "react";
import { getUserPreferences, saveUserPreferences } from "@/lib/local-storage";
import { useTheme } from "@/context/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Sun, Moon, Clock, Quote } from "lucide-react";
import { motion } from "framer-motion";

export function UserPreferences() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    darkMode: false,
    analyticsTimeRange: "week" as "week" | "month" | "year",
    showMotivationalQuotes: true,
  });

  // Load preferences on mount
  useEffect(() => {
    const storedPrefs = getUserPreferences();
    setPreferences({
      darkMode: theme === "dark",
      analyticsTimeRange: storedPrefs.analyticsTimeRange,
      showMotivationalQuotes: storedPrefs.showMotivationalQuotes,
    });
  }, [theme]);

  const handleDarkModeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
    setPreferences(prev => ({ ...prev, darkMode: checked }));
  };

  const handleTimeRangeChange = (value: "week" | "month" | "year") => {
    setPreferences(prev => ({ ...prev, analyticsTimeRange: value }));
    saveUserPreferences({
      ...preferences,
      analyticsTimeRange: value,
    });
    toast({
      title: "Time range preference saved",
      description: `Analytics will now default to ${value} view`,
    });
  };

  const handleQuotesChange = (checked: boolean) => {
    setPreferences(prev => ({ ...prev, showMotivationalQuotes: checked }));
    saveUserPreferences({
      ...preferences,
      showMotivationalQuotes: checked,
    });
    toast({
      title: checked ? "Quotes enabled" : "Quotes disabled",
      description: checked 
        ? "Motivational quotes will be shown on your dashboard" 
        : "Motivational quotes will be hidden from your dashboard",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            User Preferences
          </CardTitle>
          <CardDescription>
            Customize your HabitVault experience. All preferences are saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-muted rounded-full">
                {preferences.darkMode ? (
                  <Moon className="h-4 w-4 text-indigo-500" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base">
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={preferences.darkMode}
              onCheckedChange={handleDarkModeChange}
            />
          </div>

          {/* Analytics Time Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-muted rounded-full">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <Label className="text-base">Default Analytics Time Range</Label>
            </div>
            <RadioGroup
              value={preferences.analyticsTimeRange}
              onValueChange={handleTimeRangeChange as (value: string) => void}
              className="flex flex-col space-y-1 ml-9"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="week" id="week" />
                <Label htmlFor="week">Week</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="month" id="month" />
                <Label htmlFor="month">Month</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="year" id="year" />
                <Label htmlFor="year">Year</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Motivational Quotes Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-muted rounded-full">
                <Quote className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="show-quotes" className="text-base">
                  Daily Motivational Quotes
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show inspirational quotes on your dashboard
                </p>
              </div>
            </div>
            <Switch
              id="show-quotes"
              checked={preferences.showMotivationalQuotes}
              onCheckedChange={handleQuotesChange}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 