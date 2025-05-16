/**
 * Format an array of days into a readable string
 */
export function formatDays(days: string | string[]) {
  try {
    const d = typeof days === "string" ? JSON.parse(days) : days;
    if (!Array.isArray(d)) return "Unknown";
    if (d.length === 7) return "Every day";
    if (d.length === 5 && ["monday", "tuesday", "wednesday", "thursday", "friday"].every(day => d.includes(day)))
      return "Weekdays";
    return d.map((day) => day.charAt(0).toUpperCase() + day.slice(1)).join(", ");
  } catch {
    return "Unknown";
  }
} 