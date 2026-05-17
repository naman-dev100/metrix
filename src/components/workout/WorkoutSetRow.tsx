"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import useWorkoutStore from "@/lib/workout-store";

interface WorkoutSetRowProps {
  exerciseId: string;
  set: {
    id: string;
    setNumber: number;
    weight: number | null;
    reps: number;
  };
}

export default function WorkoutSetRow({ exerciseId, set }: WorkoutSetRowProps) {
  const { updateSet, deleteSet } = useWorkoutStore();

  const volume = set.weight && set.reps
    ? (set.weight * set.reps).toFixed(0)
    : "-";

  return (
    <div className="flex items-center gap-3 py-1 group">
      {/* Set Number */}
      <div className="w-6 h-6 flex items-center justify-center rounded bg-muted/50 text-[11px] font-semibold text-muted-foreground flex-shrink-0">
        {set.setNumber}
      </div>

      {/* Weight */}
      <div className="flex-1 min-w-0 flex items-center bg-muted/30 rounded border border-transparent focus-within:border-ring focus-within:bg-background transition-colors">
        <Input
          type="number"
          inputMode="numeric"
          step="0.5"
          pattern="[0-9]*([.][0-9]*)?"
          value={set.weight ?? ""}
          onChange={(e) =>
            updateSet(exerciseId, set.id, {
              weight: e.target.value ? parseFloat(e.target.value) : null,
            })
          }
          placeholder="0"
          aria-label="Weight in kilograms"
          className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground text-sm h-8 px-2 w-full tabular-nums text-right placeholder:text-muted-foreground/50"
        />
        <span className="text-muted-foreground text-xs pr-2 select-none pointer-events-none">
          kg
        </span>
      </div>

      {/* Reps */}
      <div className="w-16 min-w-[64px] flex items-center bg-muted/30 rounded border border-transparent focus-within:border-ring focus-within:bg-background transition-colors">
        <Input
          type="number"
          inputMode="numeric"
          value={set.reps || ""}
          onChange={(e) =>
            updateSet(exerciseId, set.id, {
              reps: parseInt(e.target.value) || 0,
            })
          }
          placeholder="0"
          aria-label="Number of repetitions"
          className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground text-sm h-8 px-2 w-full text-center tabular-nums placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Volume */}
      <div className="w-14 text-right flex-shrink-0 flex items-center justify-end">
        <span className={cn(
          "text-xs tabular-nums",
          set.weight && set.reps ? "text-muted-foreground" : "text-muted-foreground/30"
        )}>
          {volume}
        </span>
      </div>

      {/* Delete (Hover reveal on desktop, subtle on mobile) */}
      <button
        onClick={() => deleteSet(exerciseId, set.id)}
        aria-label={`Delete set ${set.setNumber}`}
        className="w-8 h-8 flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded transition-all active-press"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
