"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BodyWeightChart from "@/components/dashboard/BodyWeightChart";
import WorkoutHistoryCard from "@/components/dashboard/WorkoutHistoryCard";
import { Loader2 } from "lucide-react";

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

interface WeightLog {
  id: string;
  weight: number;
  date: string;
  notes?: string | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [weightLoading, setWeightLoading] = useState(true);

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

  const fetchWeightLogs = async () => {
    setWeightLoading(true);
    try {
      const res = await fetch("/api/bodyweight");
      const data = await res.json();
      setWeightLogs(data);
    } catch (error) {
      console.error("Failed to fetch weight logs:", error);
    } finally {
      setWeightLoading(false);
    }
  };

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

  // Hook 3: Fetch workouts and weight logs
  useEffect(() => {
    if (status === "authenticated" && session) {
      fetchWorkouts();
      fetchWeightLogs();
    }
  }, [status, session]);

  // Early return AFTER all hooks
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleDeleteWorkout = (deletedId: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== deletedId));
  };

  const totalWorkouts = workouts.length;
  const totalVolume = workouts.reduce((sum: number, w: WorkoutHistoryItem) => sum + w.total_volume, 0);
  const totalPRs = workouts.reduce((sum: number, w: WorkoutHistoryItem) => sum + w.pr_count, 0);
  const totalMinutes = workouts.reduce(
    (sum: number, w: WorkoutHistoryItem) => sum + (w.duration_seconds ? w.duration_seconds / 60 : 0),
    0
  );

  return (
    <div className="space-y-12 pb-12 max-w-[800px] mx-auto">
      {/* Page Header - Typographic, no boxes */}
      <header className="pt-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Overview
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Welcome back, {session?.user?.username || session?.user?.name || "Athlete"}.
        </p>
      </header>

      {/* Stats - Linear style grid, dense, minimal borders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden">
        <div className="bg-background p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Workouts</span>
          <span className="text-2xl tabular-nums font-semibold text-foreground tracking-tight">{totalWorkouts}</span>
        </div>
        <div className="bg-background p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Volume</span>
          <span className="text-2xl tabular-nums font-semibold text-foreground tracking-tight">
            {(totalVolume / 1000).toFixed(1)}k
          </span>
        </div>
        <div className="bg-background p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Time</span>
          <span className="text-2xl tabular-nums font-semibold text-foreground tracking-tight">
            {totalMinutes.toFixed(0)}m
          </span>
        </div>
        <div className="bg-background p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-2">PRs</span>
          <span className="text-2xl tabular-nums font-semibold text-primary tracking-tight">{totalPRs}</span>
        </div>
      </div>

      {/* Body Weight Chart */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-4 border-b border-border pb-2">Body Weight</h2>
        <div className="mt-4">
          <BodyWeightChart 
            logs={weightLogs}
            loading={weightLoading}
            showInput={true}
            chartHeight={200}
            showTitle={false}
            onWeightAdded={fetchWeightLogs}
          />
        </div>
      </section>

      {/* Recent Workouts */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-4 border-b border-border pb-2">Recent Workouts</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : workouts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No workouts yet. Start your first workout.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {workouts.slice(0, 5).map((workout: WorkoutHistoryItem) => (
              <WorkoutHistoryCard key={workout.id} workout={workout} onDelete={handleDeleteWorkout} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
