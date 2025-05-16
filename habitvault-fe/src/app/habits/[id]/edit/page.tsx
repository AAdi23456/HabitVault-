"use client";

import { useParams, useRouter } from "next/navigation";
import { HabitForm } from "@/components/habit-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditHabitPage() {
  const params = useParams();
  const habitId = params.id as string;
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Habit</h1>
        <Button variant="outline" asChild>
          <Link href="/habits">Cancel</Link>
        </Button>
      </div>
      
      <div className="mx-auto max-w-2xl">
        <HabitForm habitId={habitId} />
      </div>
    </div>
  );
} 