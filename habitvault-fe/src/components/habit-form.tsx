"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useHabit, Habit } from "@/context/habit-context";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Calendar, AlertCircle, CheckCircle, Sun, Moon, Edit3, Save, ArrowLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define the form schema
const habitSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "custom"]),
  isActive: z.boolean().default(true),
  startDate: z.date().default(new Date()),
});

type HabitFormValues = z.infer<typeof habitSchema>;

interface HabitFormProps {
  habitId?: string;
  onSuccess?: () => void;
}

// Days of the week
const DAYS_OF_WEEK = [
  { id: "monday", label: "Monday", short: "Mon" },
  { id: "tuesday", label: "Tuesday", short: "Tue" },
  { id: "wednesday", label: "Wednesday", short: "Wed" },
  { id: "thursday", label: "Thursday", short: "Thu" },
  { id: "friday", label: "Friday", short: "Fri" },
  { id: "saturday", label: "Saturday", short: "Sat" },
  { id: "sunday", label: "Sunday", short: "Sun" },
];

export function HabitForm({ habitId, onSuccess }: HabitFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { createHabit, updateHabit, getHabit, isLoading } = useHabit();
  const [targetDays, setTargetDays] = useState<string[]>(
    DAYS_OF_WEEK.map(day => day.id)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameLength, setNameLength] = useState(0);
  const [date, setDate] = useState<Date>(new Date());

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      frequency: "daily",
      isActive: true,
    },
  });

  const frequency = watch("frequency");
  const name = watch("name");
  const isActive = watch("isActive");
  const startDate = watch("startDate");

  // Update name length for character counter
  useEffect(() => {
    setNameLength(name?.length || 0);
  }, [name]);

  // Load habit data if editing
  useEffect(() => {
    if (habitId) {
      const loadHabit = async () => {
        const habit = await getHabit(habitId);
        if (habit) {
          setValue("name", habit.name);
          setValue("description", habit.description || "");
          setValue("frequency", habit.frequency as any);
          setValue("isActive", habit.isActive);
          
          // Set start date if available
          if (habit.startDate) {
            const date = new Date(habit.startDate);
            setValue("startDate", date);
            setDate(date);
          }
          
          // Set target days
          const days = typeof habit.targetDays === 'string'
            ? JSON.parse(habit.targetDays)
            : habit.targetDays;
            
          setTargetDays(days);
        }
      };
      
      loadHabit();
    }
  }, [habitId, getHabit, setValue]);

  // Handle frequency change
  useEffect(() => {
    if (frequency === "daily") {
      setTargetDays(DAYS_OF_WEEK.map(day => day.id));
    } else if (frequency === "weekly") {
      // Default to weekdays
      setTargetDays(["monday", "tuesday", "wednesday", "thursday", "friday"]);
    }
  }, [frequency]);

  const onSubmit = async (data: HabitFormValues) => {
    setIsSubmitting(true);
    
    try {
      const habitData = {
        ...data,
        targetDays,
        startDate: data.startDate.toISOString(),
      };
      
      if (habitId) {
        // Update existing habit
        await updateHabit(habitId, habitData);
        toast({
          title: "Success",
          description: "Habit updated successfully",
        });
      } else {
        // Create new habit
        await createHabit(habitData);
        toast({
          title: "Success",
          description: "Habit created successfully",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/habits");
      }
    } catch (error) {
      console.error("Error saving habit:", error);
      toast({
        title: "Error",
        description: "Failed to save habit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTargetDayToggle = (day: string) => {
    setTargetDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="w-full border-t-4 border-t-primary shadow-md hover:shadow-lg transition-all">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              {habitId ? <Edit3 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-xl">{habitId ? "Edit Habit" : "Create Habit"}</CardTitle>
              <CardDescription>
                {habitId ? "Update your habit details" : "Set up a new habit to track"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit as any)}>
          <CardContent className="space-y-6">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="name" className="text-base font-medium">Habit Name</Label>
                <span className={cn(
                  "text-xs",
                  nameLength > 0 && nameLength <= 100 ? "text-muted-foreground" : "text-destructive"
                )}>
                  {nameLength}/100
                </span>
              </div>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="e.g., Morning Meditation"
                  className={cn(
                    "pl-10 transition-all pr-4 focus-visible:ring-2 focus-visible:ring-offset-2",
                    errors.name ? "border-destructive ring-destructive" : "focus-visible:ring-primary"
                  )}
                  {...register("name", {
                    onChange: (e) => setNameLength(e.target.value.length)
                  })}
                />
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 9C15.5 7.61929 14.3807 6.5 13 6.5C11.6193 6.5 10.5 7.61929 10.5 9C10.5 10.3807 11.6193 11.5 13 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M13 11.5V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              {errors.name && (
                <div className="flex items-center gap-1.5 text-destructive text-sm mt-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <p>{errors.name.message}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2.5">
              <Label htmlFor="description" className="text-base font-medium">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your habit, goals, and why it matters to you..."
                className="min-h-24 resize-none"
                {...register("description")}
              />
            </div>
            
            <div className="space-y-2.5">
              <Label htmlFor="startDate" className="text-base font-medium">Start Date</Label>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDate"
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        if (date) {
                          setDate(date);
                          setValue("startDate", date);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="text-sm text-muted-foreground">
                  The date when you'll begin tracking this habit
                </div>
              </div>
            </div>
            
            <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
              <div>
                <Label htmlFor="frequency" className="text-base font-medium">Frequency</Label>
                <p className="text-sm text-muted-foreground mb-2">How often do you want to practice this habit?</p>
                <Select
                  defaultValue={frequency}
                  onValueChange={(value: string) => setValue("frequency", value as any)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Daily (Every day)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="weekly">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-amber-500" />
                        <span>Weekdays (Mon-Fri)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="custom">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>Custom schedule</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {frequency === "custom" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 pt-2"
                >
                  <Label className="text-base font-medium">Days of the Week</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleTargetDayToggle(day.id)}
                        className={cn(
                          "flex items-center justify-center py-1.5 px-3 rounded-full text-sm font-medium transition-all",
                          targetDays.includes(day.id)
                            ? "bg-primary text-white" 
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        )}
                      >
                        <span className="md:hidden">{day.short}</span>
                        <span className="hidden md:inline">{day.label}</span>
                      </button>
                    ))}
                  </div>
                  {targetDays.length === 0 && (
                    <div className="flex items-center gap-1.5 text-destructive text-sm mt-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <p>Please select at least one day</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked: boolean) => setValue("isActive", checked)}
                className={cn(
                  "h-5 w-5 rounded-full transition-all",
                  isActive ? "bg-green-500 text-white" : "bg-muted"
                )}
              />
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-base font-medium cursor-pointer">
                  {isActive ? "Active" : "Inactive"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isActive ? "This habit is currently being tracked" : "This habit will be paused"}
                </p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t bg-muted/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="sm:flex-1 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || targetDays.length === 0}
              className={cn(
                "sm:flex-[2] gap-2 bg-gradient-to-r shadow-md hover:shadow-lg",
                habitId
                  ? "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  : "from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700"
              )}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{habitId ? "Update" : "Create"} Habit</span>
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
} 