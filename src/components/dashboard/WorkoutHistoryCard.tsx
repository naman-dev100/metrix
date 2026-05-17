"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { parseDbDate, formatDuration } from "@/lib/utils";
import Link from "next/link";
import { Timer, Dumbbell, TrendingUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

interface WorkoutHistoryItem {
  id: string;
  name: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  total_sets: number;
  total_volume: number;
  pr_count: number;
  exercises: {
    exerciseName: string;
    weight: number | null;
    reps: number;
    set_number: number;
    is_pr: boolean;
  }[];
}

interface WorkoutHistoryCardProps {
  workout: WorkoutHistoryItem;
  onDelete?: (id: string) => void;
}

export default function WorkoutHistoryCard({ workout, onDelete }: WorkoutHistoryCardProps) {
  const [mounted, setMounted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/workouts/${workout.id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        toast.success("Workout deleted");
        onDelete?.(workout.id);
      } else {
        toast.error("Failed to delete workout");
      }
    } catch (error) {
      toast.error("Failed to delete workout");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isDeleting) {
      setShowDeleteConfirm(false);
    }
  };

  const durationText = workout.duration_seconds ? formatDuration(workout.duration_seconds) : "N/A";

  return (
    <div className="group relative">
      <Link 
        href={`/workout/${workout.id}`} 
        className="block rounded-lg -mx-3 px-3 py-3 transition-colors hover:bg-muted/50 border border-transparent hover:border-border"
      >
        <div className="flex justify-between items-start gap-4">
          {/* Header Info */}
          <div>
            <h3 className="text-sm font-medium text-foreground">{workout.name}</h3>
            <span className="text-xs text-muted-foreground mt-0.5 block">
              {mounted && workout.start_time ? format(parseDbDate(workout.start_time)!, "MMM d, h:mm a") : ""}
            </span>
          </div>

          {/* Quick Stats (Linear style density) */}
          <div className="flex items-center gap-4 text-xs tabular-nums text-muted-foreground">
            <div className="flex items-center gap-1.5" title="Duration">
              <Timer className="w-3.5 h-3.5" />
              <span>{durationText}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Volume">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>{workout.total_volume.toFixed(0)}kg</span>
            </div>
            {workout.pr_count > 0 && (
              <div className="flex items-center gap-1.5 text-primary" title="Personal Records">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{workout.pr_count} PR{workout.pr_count > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* Exercises Preview (1 line, truncated) */}
        <div className="mt-2 text-xs text-muted-foreground truncate w-[85%]">
          {workout.exercises.length > 0 ? (
            workout.exercises.map(ex => ex.exerciseName).join(" • ")
          ) : (
            "No exercises logged"
          )}
        </div>
      </Link>
      
      {/* Delete Button - hover reveal */}
      <button
        onClick={handleDeleteClick}
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive active-press"
        title="Delete workout"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      
      <ConfirmDeleteDialog
        isOpen={showDeleteConfirm}
        title="Delete Workout"
        description="Are you sure you want to delete this workout? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
