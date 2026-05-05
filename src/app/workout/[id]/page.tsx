"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Dumbbell, 
  TrendingUp, 
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { parseDbDate, formatDuration } from "@/lib/utils";

interface SetInfo {
  weight: number | null;
  reps: number;
  set_number: number;
  is_pr: boolean;
}

interface ExerciseGroup {
  name: string;
  sets: SetInfo[];
}

interface WorkoutDetail {
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

export default function WorkoutDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchWorkout() {
      try {
        const res = await fetch(`/api/workouts/${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setWorkout(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchWorkout();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-pulse text-[#7c3aed] font-medium">Loading workout...</div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl text-white">Workout not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Group sets by exercise name
  const exerciseGroups: ExerciseGroup[] = [];
  workout.exercises.forEach((set) => {
    let group = exerciseGroups.find((g) => g.name === set.exerciseName);
    if (!group) {
      group = { name: set.exerciseName, sets: [] };
      exerciseGroups.push(group);
    }
    group.sets.push({
      weight: set.weight,
      reps: set.reps,
      set_number: set.set_number,
      is_pr: set.is_pr,
    });
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-12">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1a1a24] px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="text-[#a3a3aa] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-sm font-bold text-white truncate max-w-[150px]">
            Workout Details
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        {/* Summary Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a24] to-[#0a0a0a] border border-[#1a1a24] p-6 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Dumbbell className="w-32 h-32 text-white" />
          </div>
          
          <div className="relative">
            <h2 className="text-2xl font-bold text-white mb-4">{workout.name}</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-[#a3a3aa]">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">
                  {mounted ? (format(parseDbDate(workout.start_time)!, "MMM dd, yyyy") || "-") : ""}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#a3a3aa]">
                <Clock className="w-4 h-4" />
                <span className="text-xs">
                  {workout.duration_seconds ? formatDuration(workout.duration_seconds) : "-"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#a3a3aa]">
                <Dumbbell className="w-4 h-4" />
                <span className="text-xs">
                  {workout.total_volume.toFixed(0)} kg total
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#7c3aed]">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold">
                  {workout.pr_count} PRs achieved
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#5a5a6a] uppercase tracking-widest px-1">
            Exercises ({workout.total_sets} sets)
          </h3>
          
          {exerciseGroups.map((group, idx) => (
            <Card key={idx} className="bg-[#111118] border-[#1a1a24] overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b border-[#1a1a24] bg-[#16161f]">
                  <h4 className="text-base font-bold text-white">{group.name}</h4>
                </div>
                <div className="divide-y divide-[#1a1a24]">
                  {group.sets.map((set, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between p-4 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-[#5a5a6a] font-mono w-6">
                          {set.set_number}
                        </span>
                        <span className="text-white font-medium">
                          {set.weight ? `${set.weight} kg` : "-"} × {set.reps}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {set.is_pr && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#7c3aed]/15 text-[#7c3aed] text-[10px] font-bold border border-[#7c3aed]/30 uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            PR
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
