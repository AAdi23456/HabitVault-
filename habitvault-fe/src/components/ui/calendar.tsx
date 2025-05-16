"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Define weekends as Sunday (0) and Saturday (6)
  const weekendDays = [0, 6]
  
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-card border-0 rounded-md", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-6",
        month: "space-y-6",
        caption: "flex justify-between items-center pb-4",
        caption_label: "text-base font-semibold text-primary",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-80 hover:opacity-100"
        ),
        nav_button_previous: "ml-1",
        nav_button_next: "mr-1",
        table: "w-full border-collapse space-y-1",
        head_row: "grid grid-cols-7 mb-1",
        head_cell: "text-center text-xs font-medium text-muted-foreground py-2",
        row: "grid grid-cols-7 mt-1",
        cell: "text-center relative p-0 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground border border-primary/50",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      weekStartsOn={1} // Start week on Monday
      modifiers={{
        weekend: (date) => weekendDays.includes(date.getDay()),
      }}
      modifiersClassNames={{
        weekend: "text-blue-500",
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar } 