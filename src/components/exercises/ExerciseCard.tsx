"use client";

import {
  Dumbbell,
  Tag,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    category: string;
    muscle_group: string;
    image_url?: string | null;
  };
  onSelect?: (exerciseId: string) => void;
  selected?: boolean;
}

export default function ExerciseCard({
  exercise,
  onSelect,
  selected,
}: ExerciseCardProps) {
  const muscleColors: Record<string, string> = {
    Chest: "bg-[#ef4444]/10 text-[#f87171] border-[#ef4444]/20",
    Back: "bg-[#3b82f6]/10 text-[#60a5fa] border-[#3b82f6]/20",
    Legs: "bg-[#22c55e]/10 text-[#4ade80] border-[#22c55e]/20",
    Shoulders: "bg-[#eab308]/10 text-[#facc15] border-[#eab308]/20",
    Arms: "bg-[#a855f7]/10 text-[#c084fc] border-[#a855f7]/20",
    Core: "bg-[#fb923c]/10 text-[#fb923c] border-[#fb923c]/20",
    Cardio: "bg-[#06b6d4]/10 text-[#22d3ee] border-[#06b6d4]/20",
  };

  const categoryColors: Record<string, string> = {
    Barbell: "bg-[#1e1e2a]/50 text-[#a3a3aa]",
    Dumbbell: "bg-[#1e1e2a]/50 text-[#d4d4d8]",
    Machine: "bg-[#1e1e2a]/50 text-[#d4d4d8]",
    Cable: "bg-[#1e1e2a]/50 text-[#d4d4d8]",
    Bodyweight: "bg-[#16161f]/50 text-[#7c3aed]",
    Cardio: "bg-[#06b6d4]/10 text-[#22d3ee]",
  };

  return (
    <div
      className={cn(
        "bg-[#111118] border border-[#1e1e2a] rounded-xl overflow-hidden transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.5),_0_2px_6px_rgba(0,0,0,0.3)] group cursor-pointer hover-lift",
        selected && "border-[#7c3aed] bg-[#7c3aed]/20 shadow-[0_0_12px_rgba(124,58,237,0.4)]",
        !onSelect && "cursor-default"
      )}
      onClick={() => onSelect?.(exercise.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(exercise.id);
        }
      }}
      aria-label={`${exercise.name} exercise, ${exercise.muscle_group} muscle group, ${exercise.category} category`}
    >
      {/* Image */}
      <div className="relative h-32 bg-[#16161f] overflow-hidden">
        {exercise.image_url ? (
          <img
            src={exercise.image_url}
            alt={`${exercise.name} exercise demonstration`}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full" aria-hidden="true">
            <Dumbbell className="w-8 h-8 text-[#333348]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111118]/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white mb-2">
          {exercise.name}
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium border",
              muscleColors[exercise.muscle_group] || "bg-[#1e1e2a] text-[#a3a3aa]"
            )}
          >
            {exercise.muscle_group}
          </span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium",
              categoryColors[exercise.category] || "bg-[#1e1e2a] text-[#a3a3aa]"
            )}
          >
            {exercise.category}
          </span>
        </div>
      </div>
    </div>
  );
}
