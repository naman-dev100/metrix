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
    <div className="flex items-center gap-2 py-2">
      {/* Set Number */}
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#16161f] text-xs font-bold text-[#5a5a6a] flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
        {set.setNumber}
      </div>

      {/* Weight */}
      <div className="flex-1 min-w-0">
        <label className="block text-[10px] font-medium text-[#8a8a9a] uppercase tracking-wider mb-0.5">
          Weight
        </label>
        <div className="relative">
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
            className={cn(
              "bg-[#16161f] border-[#1e1e2a] text-white text-sm h-9 pr-8 focus:ring-[#7c3aed]",
              "border-none focus:border-none focus:ring-2 focus:ring-offset-0",
              "placeholder:text-[#5a5a6a]"
            )}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a8a9a] text-xs pointer-events-none">
            kg
          </span>
        </div>
      </div>

      {/* Reps */}
      <div className="w-16 min-w-[60px]">
        <label className="block text-[10px] font-medium text-[#8a8a9a] uppercase tracking-wider mb-0.5">
          Reps
        </label>
        <Input
          type="number"
          inputMode="numeric"
          value={set.reps}
          onChange={(e) =>
            updateSet(exerciseId, set.id, {
              reps: parseInt(e.target.value) || 0,
            })
          }
          placeholder="0"
          aria-label="Number of repetitions"
          className={cn(
            "bg-[#16161f] border-[#1e1e2a] text-white text-sm h-9 text-center focus:ring-[#7c3aed]",
            "border-none focus:border-none focus:ring-2 focus:ring-offset-0",
            "placeholder:text-[#5a5a6a]"
          )}
        />
      </div>

      {/* Volume */}
      <div className="w-20 text-right flex-shrink-0">
        <p className="text-[10px] text-[#8a8a9a] uppercase tracking-wider mb-0.5">Vol</p>
        <span className={cn(
          "text-xs",
          "font-mono",
          "letter-spacing-0.02",
          set.weight && set.reps ? "text-white" : "text-[#5a5a6a]"
        )}>
          {volume}
        </span>
      </div>

      {/* Delete */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => deleteSet(exerciseId, set.id)}
        aria-label={`Delete set ${set.setNumber}`}
        className={cn(
          "w-8 h-8 p-0 text-[#5a5a6a] hover:text-[#ef4444] hover:bg-[#ef4444]/10 mt-0.5",
          "rounded-lg transition-all"
        )}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
