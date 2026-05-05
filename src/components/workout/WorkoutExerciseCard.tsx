"use client";

import { Plus, Trash2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkoutSetRow from "@/components/workout/WorkoutSetRow";
import useWorkoutStore from "@/lib/workout-store";

interface WorkoutExerciseCardProps {
  exercise: {
    exerciseId: string;
    exerciseName: string;
    sets: {
      id: string;
      setNumber: number;
      weight: number | null;
      reps: number;
      isPR?: boolean;
    }[];
  };
}

export default function WorkoutExerciseCard({ exercise }: WorkoutExerciseCardProps) {
  const { addSet } = useWorkoutStore();

  const totalVolume = exercise.sets.reduce((sum, s) => {
    return sum + (s.weight ? s.weight * s.reps : 0);
  }, 0);

  const prCount = exercise.sets.filter(s => s.isPR).length;

  return (
    <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="p-3 border-b border-[#1e1e2a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#7c3aed]" />
          <h3 className="text-sm font-semibold text-white">{exercise.exerciseName}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            console.log("Delete exercise:", exercise.exerciseId);
          }}
          aria-label={`Delete exercise ${exercise.exerciseName}`}
          className="w-8 h-8 p-0 text-[#5a5a6a] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Sets */}
      <div className="p-3 space-y-2">
        {exercise.sets.map((set, index) => (
          <WorkoutSetRow
            key={set.id}
            exerciseId={exercise.exerciseId}
            set={set}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#1e1e2a] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-[#8a8a9a] uppercase tracking-wider">Total Volume</p>
            <p className="text-sm font-mono text-white letter-spacing-0.02">
              {totalVolume.toLocaleString()} kg
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#8a8a9a] uppercase tracking-wider">PRs</p>
            <p className="text-sm font-mono text-[#7c3aed] letter-spacing-0.02">
              {prCount}
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            const newSetNumber = exercise.sets.length + 1;
            addSet(exercise.exerciseId, null, 10);
          }}
          aria-label={`Add set for ${exercise.exerciseName}`}
          className="w-8 h-8 p-0 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
