"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Activity, 
  Dumbbell, 
  Timer, 
  TrendingUp, 
  Loader2, 
  Search, 
  History 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import WorkoutHistoryCard from "@/components/dashboard/WorkoutHistoryCard";

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

export default function WorkoutHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workouts");
      const data = await res.json();
      setWorkouts(data);
      setFilteredWorkouts(data);
    } catch (error) {
      console.error("Failed to fetch workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch all completed workouts
  useEffect(() => {
    if (status === "authenticated" && session) {
      fetchWorkouts();
    }
  }, [status, session]);

  // Handle live search filter
  useEffect(() => {
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      setFilteredWorkouts(
        workouts.filter((w) =>
          w.name.toLowerCase().includes(searchLower) ||
          w.exercises.some((e) =>
            e.exerciseName.toLowerCase().includes(searchLower)
          )
        )
      );
    } else {
      setFilteredWorkouts(workouts);
    }
  }, [search, workouts]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleDeleteWorkout = (deletedId: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== deletedId));
    setFilteredWorkouts(prev => prev.filter(w => w.id !== deletedId));
  };

  // Dynamic statistics calculations
  const totalWorkouts = workouts.length;
  const totalVolume = workouts.reduce((sum, w) => sum + w.total_volume, 0);
  const totalPRs = workouts.reduce((sum, w) => sum + w.pr_count, 0);
  const totalMinutes = workouts.reduce(
    (sum, w) => sum + (w.duration_seconds ? w.duration_seconds / 60 : 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header with Gradient */}
      <div className="gradient-purple-subtle rounded-2xl p-4 md:p-6 border border-[#1a1a24] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/5 to-[#7c3aed]/0 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3 animate-fade-in">
            <History className="w-8 h-8 text-[#7c3aed]" />
            Workout History
          </h1>
          <p className="text-[#b0b0b8] mt-2 animate-fade-in">
            Review your complete training archive, stats, and personal records.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a24] rounded-2xl p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-all hover:shadow-[0_8px_24px_rgba(124,58,237,0.15)] hover-lift card-enter">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(124,58,237,0.3)]">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-[#b0b0b8] uppercase tracking-widest font-semibold">Total Sessions</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white tracking-tight">{totalWorkouts}</p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a24] rounded-2xl p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-all hover:shadow-[0_8px_24px_rgba(124,58,237,0.15)] hover-lift card-delay-1 card-enter">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(124,58,237,0.3)]">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-[#b0b0b8] uppercase tracking-widest font-semibold">Total Volume</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white tracking-tight">
            {(totalVolume / 1000).toFixed(1)}k <span className="text-xs text-[#8a8a9a]">kg</span>
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a24] rounded-2xl p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-all hover:shadow-[0_8px_24px_rgba(124,58,237,0.15)] hover-lift card-delay-2 card-enter">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(124,58,237,0.3)]">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-[#b0b0b8] uppercase tracking-widest font-semibold">Active Time</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white tracking-tight">
            {totalMinutes >= 60 
              ? `${(totalMinutes / 60).toFixed(1)}h` 
              : `${totalMinutes.toFixed(0)}m`}
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a24] rounded-2xl p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-all hover:shadow-[0_8px_24px_rgba(124,58,237,0.15)] hover-lift card-delay-3 card-enter">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(124,58,237,0.3)]">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-[#b0b0b8] uppercase tracking-widest font-semibold">PRs Hit</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#7c3aed] tracking-tight">{totalPRs}</p>
        </div>
      </div>

      {/* Main History Feed */}
      <div className="space-y-4">
        {/* Search workouts and exercises */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6a]" />
          <Input
            type="text"
            placeholder="Search workouts by name or exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#111118] border-[#1e1e2a] text-white pl-10 focus:ring-[#7c3aed] placeholder:text-[#5a5a6a] h-12 text-sm rounded-xl"
            aria-label="Search workouts"
          />
        </div>

        {/* Workout list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#111118] border border-[#1e1e2a] rounded-2xl h-36 animate-pulse shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
              />
            ))}
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <div className="bg-[#111118] border border-[#1e1e2a] rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
            <History className="w-12 h-12 text-[#5a5a6a] mx-auto mb-3" aria-hidden="true" />
            <p className="text-white font-semibold">No workouts found</p>
            <p className="text-xs text-[#a3a3aa] mt-1">
              {search 
                ? "Try relaxing your search keywords." 
                : "Your training archive is empty. Start a workout session to log data!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-slide-in">
            {filteredWorkouts.map((workout) => (
              <WorkoutHistoryCard
                key={workout.id}
                workout={workout}
                onDelete={handleDeleteWorkout}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
