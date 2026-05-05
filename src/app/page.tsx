"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BodyWeightChart from "@/components/dashboard/BodyWeightChart";
import WorkoutHistoryCard from "@/components/dashboard/WorkoutHistoryCard";
import { Activity, Dumbbell, Timer, TrendingUp, Loader2 } from "lucide-react";

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Hook 1: Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Hook 2: Redirect to setup username if needed
  useEffect(() => {
    if (session?.user && !session.user.username) {
      router.push("/auth/setup-username");
    }
  }, [session, router]);

  // Hook 3: Fetch workouts (always called, guarded inside)
  useEffect(() => {
    if (status === "authenticated" && session) {
      fetchWorkouts();
    }
  }, [status, session]);

  // Early return AFTER all hooks
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

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workouts");
      const data = await res.json();
      setWorkouts(data);
    } catch (error) {
      console.error("Failed to fetch workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalWorkouts = workouts.length;
  const totalVolume = workouts.reduce((sum: number, w: any) => sum + w.total_volume, 0);
  const totalPRs = workouts.reduce((sum: number, w: any) => sum + w.pr_count, 0);
  const totalMinutes = workouts.reduce(
    (sum: number, w: any) => sum + (w.duration_seconds ? w.duration_seconds / 60 : 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header with Gradient */}
      <div className="gradient-purple-subtle rounded-2xl p-6 border border-[#1a1a24]">
        <h1 className="text-3xl font-bold text-white tracking-tight animate-fade-in">
          Welcome back, {session?.user?.username || session?.user?.name || "Athlete"}!
        </h1>
        <p className="text-[#b0b0b8] mt-2 animate-fade-in">Your training overview</p>
      </div>

      {/* Stats Cards with Gradients */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a24] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-all hover:shadow-[0_8px_24px_rgba(124,58,237,0.15)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.25)] hover-lift card-enter">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] flex items-center justify-center shadow-[0_4px_12px_rgba(124,58,237,0.3)]">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[#b0b0b8] uppercase tracking-widest font-semibold">Workouts</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white tracking-tight">{totalWorkouts}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a24] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-all hover:shadow-[0_8px_24px_rgba(124,58,237,0.15)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.25)] hover-lift card-delay-1 card-enter">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] flex items-center justify-center shadow-[0_4px_12px_rgba(124,58,237,0.3)]">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[#b0b0b8] uppercase tracking-widest font-semibold">Volume</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white tracking-tight">
            {(totalVolume / 1000).toFixed(1)}k
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a24] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-all hover:shadow-[0_8px_24px_rgba(124,58,237,0.15)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.25)] hover-lift card-delay-2 card-enter">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] flex items-center justify-center shadow-[0_4px_12px_rgba(124,58,237,0.3)]">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[#b0b0b8] uppercase tracking-widest font-semibold">Time</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white tracking-tight">
            {totalMinutes.toFixed(0)}m
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a24] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-all hover:shadow-[0_8px_24px_rgba(124,58,237,0.15)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.25)] hover-lift card-delay-3 card-enter">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] flex items-center justify-center shadow-[0_4px_12px_rgba(124,58,237,0.3)]">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[#b0b0b8] uppercase tracking-widest font-semibold">PRs</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#7c3aed] tracking-tight">{totalPRs}</p>
        </div>
      </div>

      {/* Body Weight Chart */}
      <BodyWeightChart />

      {/* Recent Workouts */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Workouts</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#111118] border border-[#1e1e2a] rounded-xl h-32 animate-pulse shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
              />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
            <Activity className="w-8 h-8 text-[#5a5a6a] mx-auto mb-3" aria-hidden="true" />
            <p className="text-[#a3a3aa]">No workouts yet. Start your first workout.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.slice(0, 5).map((workout: any) => (
              <WorkoutHistoryCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
