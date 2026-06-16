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
    <div className="flex items-start gap-1.5 md:gap-2.5 py-1.5 px-1 md:px-2.5 rounded-xl transition-all duration-300 border border-transparent hover:border-[#1e1e2a]/50">
      {/* Set Number */}
      <div className="w-8 md:w-8 h-10 md:h-9 flex items-center justify-center flex-shrink-0">
        <div className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-extrabold bg-[#16161f] text-[#5a5a6a] shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
          {set.setNumber}
        </div>
      </div>

      {/* Weight - Prevent collapse on mobile */}
      <div className="flex-1 min-w-[72px] md:min-w-[80px]">
        <div className="relative">
          <Input
            type="number"
            inputMode="decimal"
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
            className="bg-[#16161f] border-none text-white text-base md:text-sm h-10 md:h-9 pr-7 md:pr-8 text-center focus:ring-[#7c3aed] focus:ring-2 focus:ring-offset-0 transition-all placeholder:text-[#3a3a4a] placeholder:font-mono rounded-lg"
          />
          <span className="absolute right-2 md:right-2.5 top-1/2 -translate-y-1/2 text-[10px] md:text-[10px] pointer-events-none font-semibold text-[#5a5a6a]">
            kg
          </span>
        </div>
        {prevSet && (
          <p className="text-[10px] md:text-[9px] text-[#5a5a6a] mt-1 pl-1 font-mono leading-none">
            Prev: {prevSet.weight !== null && prevSet.weight > 0 ? `${prevSet.weight}kg` : "BW"}
          </p>
        )}
      </div>

      {/* Reps */}
      <div className="w-16 md:w-16 flex-shrink-0">
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
          className="bg-[#16161f] border-none text-white text-base md:text-sm h-10 md:h-9 text-center focus:ring-[#7c3aed] focus:ring-2 focus:ring-offset-0 transition-all placeholder:text-[#3a3a4a] placeholder:font-mono rounded-lg"
        />
        {prevSet && (
          <p className="text-[10px] md:text-[9px] text-[#5a5a6a] mt-1 text-center font-mono leading-none">
            Prev: {prevSet.reps}
          </p>
        )}
      </div>

      {/* Volume */}
      <div className="w-12 md:w-14 text-right flex-shrink-0 flex flex-col select-none pr-1">
        <div className="h-10 md:h-9 flex items-center justify-end">
          <span className={cn(
            "text-sm md:text-xs font-mono font-bold transition-colors duration-300",
            set.weight && set.reps ? "text-white" : "text-[#5a5a6a]"
          )}>
            {volume}
          </span>
        </div>
        {isPR && (
          <p className="text-[9px] md:text-[8px] font-extrabold text-[#7c3aed] uppercase tracking-wider flex items-center justify-end gap-0.5 animate-pulse mt-1 leading-none">
            🔥 PR
          </p>
        )}
      </div>

      {/* Delete button */}
      <div className="w-8 md:w-8 h-10 md:h-9 flex items-center justify-center flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteSet(exerciseId, set.id)}
          aria-label={`Delete set ${set.setNumber}`}
          className="w-8 h-8 p-0 text-[#3a3a4a] hover:text-[#ef4444] hover:bg-[#ef4444]/15 rounded-lg flex-shrink-0 transition-colors cursor-pointer flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
        </Button>
      </div>
    </div>
  );
}
