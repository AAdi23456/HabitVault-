"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useHabit, Habit } from "@/context/habit-context";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

// Define the form schema
const habitSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "custom"]),
  isActive: z.boolean().default(true),
});

type HabitFormValues = z.infer<typeof habitSchema>;

interface HabitFormProps {
  habitId?: string;
  onSuccess?: () => void;
}

// Days of the week
const DAYS_OF_WEEK = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

export function HabitForm({ habitId, onSuccess }: HabitFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { createHabit, updateHabit, getHabit, isLoading } = useHabit();
  const [targetDays, setTargetDays] = useState<string[]>(
    DAYS_OF_WEEK.map(day => day.id)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        startDate: new Date().toISOString(),
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{habitId ? "Edit Habit" : "Create Habit"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit as any)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              placeholder="e.g., Morning Meditation"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your habit..."
              {...register("description")}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              defaultValue={frequency}
              onValueChange={(value: string) => setValue("frequency", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekdays</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {frequency === "custom" && (
            <div className="space-y-2">
              <Label>Days of the Week</Label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.id}
                      checked={targetDays.includes(day.id)}
                      onCheckedChange={() => handleTargetDayToggle(day.id)}
                    />
                    <Label htmlFor={day.id} className="cursor-pointer">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
              {targetDays.length === 0 && (
                <p className="text-sm text-destructive">
                  Please select at least one day
                </p>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={watch("isActive")}
              onCheckedChange={(checked: boolean) => setValue("isActive", checked)}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active
            </Label>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || targetDays.length === 0}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Saving...
              </span>
            ) : (
              `${habitId ? "Update" : "Create"} Habit`
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 