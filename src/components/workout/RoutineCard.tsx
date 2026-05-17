"use client";

import { Calendar, Dumbbell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn, parseDbDate } from "@/lib/utils";

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

  const muscleGroupIcons: Record<string, string> = {
    Chest: "bg-[#ef4444]/20 text-[#f87171]",
    Back: "bg-[#3b82f6]/20 text-[#60a5fa]",
    Legs: "bg-[#22c55e]/20 text-[#4ade80]",
    Shoulders: "bg-[#eab308]/20 text-[#facc15]",
    Arms: "bg-[#a855f7]/20 text-[#c084fc]",
    Core: "bg-[#fb923c]/20 text-[#fb923c]",
    Cardio: "bg-[#06b6d4]/20 text-[#22d3ee]",
  };

  return (
    <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.4),_0_1px_2px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.5),_0_2px_6px_rgba(0,0,0,0.3)] transition-all hover-lift group card-enter">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">{routine.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3 text-[#5a5a6a]" />
            <span className="text-xs text-[#8a8a9a]">
              {routine.created_at ? format(new Date(routine.created_at), "MMM dd, yyyy") : "N/A"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(routine.id)}
            aria-label={`Delete routine ${routine.name}`}
            className="w-8 h-8 p-0 text-[#5a5a6a] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <Dumbbell className="w-4 h-4 text-[#7c3aed]" />
          <span className="text-xs text-[#8a8a9a]">{totalExercises} exercises</span>
        </div>
        {uniqueMuscleGroups.length > 0 && (
          <div className="flex items-center gap-1">
            {uniqueMuscleGroups.slice(0, 3).map((mg, i) => (
              <span
                key={mg}
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                  muscleGroupIcons[mg] || "bg-[#1e1e2a] text-[#a3a3aa]"
                )}
              >
                {mg}
              </span>
            ))}
            {uniqueMuscleGroups.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#1e1e2a] text-[#8a8a9a]">
                +{uniqueMuscleGroups.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={() => onStart(routine.id, routine.name)}
          loading={onStartLoading}
          className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-3 py-2 text-sm"
        >
          Start
        </Button>
        <Button
          variant="outline"
          onClick={() => onEdit(routine)}
          aria-label={`Edit routine ${routine.name}`}
          className="px-3 py-2 text-sm border-[#1e1e2a] text-[#a3a3aa] hover:text-white hover:bg-[#16161f] transition-all"
        >
          Edit
        </Button>
      </div>
    </div>
  );
}
