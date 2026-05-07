"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { parseDbDate, formatDuration } from "@/lib/utils";
import Link from "next/link";
import {
  Timer,
  Dumbbell,
  TrendingUp,
  Calendar,
  Trash2,
} from "lucide-react";
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
      <Link href={`/workout/${workout.id}`} className="block">
        <div className="bg-[#0a0a0a] border border-[#1a1a24] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover:border-[#7c3aed]/50 transition-all">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-white">{workout.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3 text-[#5a5a6a]" />
            <span className="text-xs text-[#a3a3aa]">
              {mounted && workout.start_time ? format(parseDbDate(workout.start_time)!, "MMM dd, yyyy 'at' h:mm a") : ""}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c3aed]/20 to-[#5b21b6]/20 flex items-center justify-center border border-[#7c3aed]/20">
              <Timer className="w-4 h-4 text-[#7c3aed]" />
            </div>
            <div>
              <p className="text-[10px] text-[#b0b0b8] uppercase tracking-widest font-semibold">Duration</p>
              <p className="text-xs font-bold text-white tracking-tight">{durationText}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c3aed]/20 to-[#5b21b6]/20 flex items-center justify-center border border-[#7c3aed]/20">
              <Dumbbell className="w-4 h-4 text-[#7c3aed]" />
            </div>
            <div>
              <p className="text-[10px] text-[#b0b0b8] uppercase tracking-widest font-semibold">Volume</p>
              <p className="text-xs font-bold text-white tracking-tight">{workout.total_volume.toFixed(0)} kg</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c3aed]/20 to-[#5b21b6]/20 flex items-center justify-center border border-[#7c3aed]/20">
              <TrendingUp className="w-4 h-4 text-[#7c3aed]" />
            </div>
            <div>
              <p className="text-[10px] text-[#b0b0b8] uppercase tracking-widest font-semibold">PRs</p>
              <p className="text-xs font-bold text-[#7c3aed] tracking-tight">
                {workout.pr_count > 0 ? workout.pr_count : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Exercises Preview */}
        <div className="space-y-1.5">
          {workout.exercises.slice(0, 3).map((ex, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {ex.is_pr && (
                <span className="px-2 py-0.5 rounded-full bg-[#7c3aed]/15 text-[#7c3aed] text-[10px] font-semibold border border-[#7c3aed]/30">
                  PR
                </span>
              )}
              <span className="text-[#b0b0b8] font-medium">{ex.exerciseName}</span>
              <span className="text-[#b0b0b8] ml-auto font-mono">
                {ex.weight ? `${ex.weight}kg` : "-"} × {ex.reps}
              </span>
            </div>
          ))}
          {workout.exercises.length > 3 && (
            <p className="text-xs text-[#5a5a6a]">
              +{workout.exercises.length - 3} more exercises
            </p>
          )}
        </div>
      </div>
      </Link>
      
      {/* Delete Button - center right on hover */}
      <button
        onClick={handleDeleteClick}
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-[#1a1a24] hover:bg-red-500/20 border border-[#2a2a3a] hover:border-red-500/50 rounded-lg text-[#5a5a6a] hover:text-red-500"
        title="Delete workout"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      
      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={showDeleteConfirm}
        title="Delete Workout"
        description="Are you sure you want to delete this workout? All associated sets will be deleted. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
