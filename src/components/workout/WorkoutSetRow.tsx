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
    reps: number | null;
  };
  prevSet?: {
    weight: number | null;
    reps: number;
  };
  allTimeMax?: {
    weight: number | null;
    reps: number;
  } | null;
}

export default function WorkoutSetRow({ exerciseId, set, prevSet, allTimeMax }: WorkoutSetRowProps) {
  const { updateSet, deleteSet } = useWorkoutStore();

  const volume = set.weight && set.reps
    ? (set.weight * set.reps).toFixed(0)
    : "-";

  // PR Calculation logic
  const hasInput = set.weight !== null || set.reps !== null;
  const currentWeight = set.weight !== null ? set.weight : (prevSet?.weight ?? 0);
  const currentReps = set.reps !== null ? set.reps : (prevSet?.reps ?? 10);

  const isPR = hasInput && (
    !allTimeMax ||
    allTimeMax.weight === null ||
    currentWeight > allTimeMax.weight ||
    (currentWeight === allTimeMax.weight && currentWeight > 0 && currentReps > allTimeMax.reps)
  );

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
            placeholder={prevSet && prevSet.weight !== null ? prevSet.weight.toString() : "0"}
            aria-label="Weight in kilograms"
            className={cn(
              "bg-[#16161f] border-[#1e1e2a] text-white text-sm h-9 pr-8 focus:ring-[#7c3aed]",
              "border-none focus:border-none focus:ring-2 focus:ring-offset-0",
              "placeholder:text-[#5a5a6a] placeholder:font-mono"
            )}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a8a9a] text-xs pointer-events-none">
            kg
          </span>
        </div>
        {prevSet && (
          <p className="text-[10px] text-[#5a5a6a] mt-1 pl-1">
            Prev: {prevSet.weight !== null && prevSet.weight > 0 ? `${prevSet.weight} kg` : "Bodyweight"}
          </p>
        )}
      </div>

      {/* Reps */}
      <div className="w-16 min-w-[60px]">
        <label className="block text-[10px] font-medium text-[#8a8a9a] uppercase tracking-wider mb-0.5">
          Reps
        </label>
        <Input
          type="number"
          inputMode="numeric"
          value={set.reps ?? ""}
          onChange={(e) =>
            updateSet(exerciseId, set.id, {
              reps: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          placeholder={prevSet ? prevSet.reps.toString() : "10"}
          aria-label="Number of repetitions"
          className={cn(
            "bg-[#16161f] border-[#1e1e2a] text-white text-sm h-9 text-center focus:ring-[#7c3aed]",
            "border-none focus:border-none focus:ring-2 focus:ring-offset-0",
            "placeholder:text-[#5a5a6a] placeholder:font-mono"
          )}
        />
        {prevSet && (
          <p className="text-[10px] text-[#5a5a6a] mt-1 text-center">
            Prev: {prevSet.reps}
          </p>
        )}
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
        {isPR && (
          <p className="text-[9px] font-bold text-[#7c3aed] mt-1 uppercase tracking-wider flex items-center justify-end gap-0.5 animate-pulse">
            🔥 PR
          </p>
        )}
      </div>

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



