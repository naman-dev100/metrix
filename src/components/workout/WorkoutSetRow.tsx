"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import useWorkoutStore from "@/lib/workout-store";

interface WorkoutSetRowProps {
  exerciseId: string;
  set: {
    id: string;
    setNumber: number;
    weight: number | null;
    reps: number | null;
    isCompleted: boolean;
  };
  prevSet?: {
    weight: number | null;
    reps: number;
  };
  allTimeMax?: {
    weight: number | null;
    reps: number;
  } | null;
  isEditing?: boolean;
}

export default function WorkoutSetRow({ exerciseId, set, prevSet, allTimeMax, isEditing }: WorkoutSetRowProps) {
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
    <div className={cn(
      "flex items-center gap-1.5 md:gap-2.5 py-1.5 px-3 md:px-4 rounded-xl transition-all duration-300 border border-transparent",
      set.isCompleted 
        ? "opacity-60 bg-[#22c55e]/5" 
        : "hover:border-[#1e1e2a]/50"
    )}>
      {/* Set Number */}
      <div className="w-8 h-10 md:h-9 flex items-center justify-center flex-shrink-0">
        <div className={cn(
          "w-8 h-8 flex items-center justify-center rounded-full text-xs font-extrabold shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-colors duration-300",
          set.isCompleted 
            ? "bg-[#22c55e]/20 text-[#22c55e]" 
            : "bg-[#16161f] text-[#a3a3aa]"
        )}>
          {set.setNumber}
        </div>
      </div>

      {/* Weight - Prevent collapse on mobile */}
      <div className="flex-1 min-w-[64px]">
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
            className="bg-[#16161f] border-none !text-white text-base md:text-sm h-10 md:h-9 pr-6 text-center focus:ring-[#7c3aed] focus:ring-2 focus:ring-offset-0 transition-all placeholder:text-[#6a6a7a] placeholder:font-mono rounded-lg w-full"
          />
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none font-semibold text-[#8a8a9a]">
            kg
          </span>
        </div>
        {prevSet && (
          <p className="text-[10px] md:text-[9px] text-[#8a8a9a] mt-1 text-center font-mono leading-none">
            Prev: {prevSet.weight !== null && prevSet.weight > 0 ? `${prevSet.weight}kg` : "BW"}
          </p>
        )}
      </div>

      {/* Reps */}
      <div className="flex-1 min-w-[64px]">
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
          className="bg-[#16161f] border-none !text-white text-base md:text-sm h-10 md:h-9 text-center focus:ring-[#7c3aed] focus:ring-2 focus:ring-offset-0 transition-all placeholder:text-[#6a6a7a] placeholder:font-mono rounded-lg w-full"
        />
        {prevSet && (
          <p className="text-[10px] md:text-[9px] text-[#8a8a9a] mt-1 text-center font-mono leading-none">
            Prev: {prevSet.reps}
          </p>
        )}
      </div>

      {/* Volume */}
      <div className="w-14 text-right flex-shrink-0 flex flex-col select-none pr-1">
        <div className="h-10 md:h-9 flex items-center justify-end">
          <span className={cn(
            "text-sm md:text-xs font-mono font-bold transition-colors duration-300",
            set.weight && set.reps ? "!text-white" : "text-[#8a8a9a]"
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

      {/* Checkbox / Delete button */}
      <div className="w-8 h-10 md:h-9 flex items-center justify-center flex-shrink-0">
        {isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteSet(exerciseId, set.id)}
            aria-label={`Delete set ${set.setNumber}`}
            className="w-8 h-8 p-0 text-[#5a5a6a] hover:text-[#ef4444] hover:bg-[#ef4444]/15 rounded-lg flex-shrink-0 transition-colors cursor-pointer flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
          </Button>
        ) : (
          <button
            onClick={() => updateSet(exerciseId, set.id, { isCompleted: !set.isCompleted })}
            aria-label={set.isCompleted ? "Mark set incomplete" : "Mark set complete"}
            className={cn(
              "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer",
              set.isCompleted 
                ? "bg-[#22c55e] border-[#22c55e] text-white" 
                : "border-[#5a5a6a] hover:border-[#7c3aed] text-transparent hover:text-[#7c3aed]/30"
            )}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        )}
      </div>
    </div>
  );
}
