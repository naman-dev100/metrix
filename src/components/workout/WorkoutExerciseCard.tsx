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
  const { addSet, removeExercise } = useWorkoutStore();

  const totalVolume = exercise.sets.reduce((sum, s) => {
    return sum + (s.weight ? s.weight * s.reps : 0);
  }, 0);

  const prCount = exercise.sets.filter(s => s.isPR).length;

  return (
    <div className="py-2 border-b border-border/50 last:border-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">{exercise.exerciseName}</h3>
        <button
          onClick={() => removeExercise(exercise.exerciseId)}
          aria-label={`Delete exercise ${exercise.exerciseName}`}
          className="p-1.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded transition-colors active-press"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Header labels for rows */}
      <div className="flex items-center gap-3 px-1 mb-1">
        <div className="w-6 text-center text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Set</div>
        <div className="flex-1 text-right pr-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">kg</div>
        <div className="w-16 min-w-[64px] text-center text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Reps</div>
        <div className="w-14 text-right pr-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Vol</div>
        <div className="w-8"></div> {/* Spacer for delete button */}
      </div>

      {/* Sets */}
      <div className="space-y-0.5">
        {exercise.sets.map((set) => (
          <WorkoutSetRow
            key={set.id}
            exerciseId={exercise.exerciseId}
            set={set}
          />
        ))}
      </div>

      {/* Footer / Add Set */}
      <div className="flex items-center justify-between mt-2 pt-2">
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Vol</span>
            <span className="text-xs font-mono text-foreground">{totalVolume.toLocaleString()}</span>
          </div>
          {prCount > 0 && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">PRs</span>
              <span className="text-xs font-mono text-primary">{prCount}</span>
            </div>
          )}
        </div>
        
        <Button
          variant="secondary"
          size="xs"
          onClick={() => {
            addSet(exercise.exerciseId, null, 10);
          }}
          className="text-xs font-medium tracking-wide bg-muted/50 hover:bg-muted"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Set
        </Button>
      </div>
    </div>
  );
}
