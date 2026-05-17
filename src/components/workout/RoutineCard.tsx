"use client";

import { Calendar, Dumbbell, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Routine {
  id: string;
  name: string;
  notes?: string | null;
  created_at: string;
  routineExercises: {
    id: string;
    exercise: {
      id: string;
      name: string;
      muscle_group: string;
      category: string;
    };
    order: number;
  }[];
}

interface RoutineCardProps {
  routine: Routine;
  onStart: (routineId: string, name: string) => void;
  onEdit: (routine: Routine) => void;
  onDelete: (id: string) => void;
  onStartLoading?: boolean;
}

export default function RoutineCard({ routine, onStart, onEdit, onDelete, onStartLoading }: RoutineCardProps) {
  const totalExercises = routine.routineExercises.length;
  const uniqueMuscleGroups = [...new Set(routine.routineExercises.map(re => re.exercise.muscle_group))];

  return (
    <div className="group relative block rounded-lg -mx-3 px-3 py-3 transition-colors hover:bg-muted/50 border border-transparent hover:border-border">
      <div className="flex items-start justify-between gap-4">
        {/* Left Side: Title and Stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground truncate">{routine.name}</h3>
            
            {/* Actions for mobile (always visible) or desktop (subtle) */}
            <div className="flex gap-0.5">
              <button
                onClick={() => onEdit(routine)}
                className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground active-press"
                aria-label={`Edit routine ${routine.name}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(routine.id)}
                className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive active-press"
                aria-label={`Delete routine ${routine.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground tabular-nums">
             <div className="flex items-center gap-1">
               <Dumbbell className="w-3.5 h-3.5" />
               <span>{totalExercises} exercises</span>
             </div>
             {routine.created_at && (
               <div className="flex items-center gap-1">
                 <Calendar className="w-3.5 h-3.5" />
                 <span>{format(new Date(routine.created_at), "MMM d")}</span>
               </div>
             )}
          </div>

          <div className="flex items-center justify-between mt-3">
            {/* Muscle Groups */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {uniqueMuscleGroups.slice(0, 3).map((mg) => (
                <span key={mg} className="text-[10px] uppercase tracking-wider text-muted-foreground bg-border/50 px-1.5 py-0.5 rounded">
                  {mg}
                </span>
              ))}
              {uniqueMuscleGroups.length > 3 && (
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-border/50 px-1.5 py-0.5 rounded">
                  +{uniqueMuscleGroups.length - 3}
                </span>
              )}
            </div>

            <Button
              onClick={() => onStart(routine.id, routine.name)}
              loading={onStartLoading}
              size="sm"
              variant="default"
              className="h-8 shrink-0 ml-2"
            >
              Start
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
