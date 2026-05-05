import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatWeight(weight: number): string {
  return `${weight.toFixed(1)} kg`;
}

/**
 * Parse a date string from the DB and return a Date object.
 * DB uses timestamptz (UTC). JSON serialisation always produces ISO with 'Z'.
 * date-fns format() converts to the browser's local timezone automatically.
 */
export function parseDbDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  return new Date(dateStr);
}

export function calculatePR(
  currentWeight: number,
  currentReps: number,
  historicalSets: { weight: number | null; reps: number }[]
): boolean {
  let isPR = false;
  let maxWeight = 0;
  let maxRepsForMaxWeight = 0;

  for (const set of historicalSets) {
    if (set.weight === null) continue;
    if (set.weight > maxWeight) {
      maxWeight = set.weight;
      maxRepsForMaxWeight = set.reps;
    } else if (set.weight === maxWeight && set.weight > 0) {
      if (set.reps > maxRepsForMaxWeight) {
        maxRepsForMaxWeight = set.reps;
      }
    }
  }

  if (currentWeight > maxWeight) {
    isPR = true;
  } else if (currentWeight === maxWeight && currentWeight > 0 && currentReps > maxRepsForMaxWeight) {
    isPR = true;
  }

  return isPR;
}
