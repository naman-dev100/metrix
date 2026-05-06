"use client";

import { useState, useEffect } from "react";
import { Flame, Calendar, Timer, Dumbbell, TrendingUp, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import WorkoutHistoryCard from "@/components/dashboard/WorkoutHistoryCard";
import { formatDuration } from "@/lib/utils";

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

export default function HistoryPage() {
  const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutHistoryItem[]>([]);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  useEffect(() => {
    if (search) {
      setFilteredWorkouts(
        workouts.filter((w) =>
          w.name.toLowerCase().includes(search.toLowerCase()) ||
          w.exercises.some((e) =>
            e.exerciseName.toLowerCase().includes(search.toLowerCase())
          )
        )
      );
    } else {
      setFilteredWorkouts(workouts);
    }
  }, [search, workouts]);

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

  const handleDeleteWorkout = (deletedId: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== deletedId));
    setFilteredWorkouts(prev => prev.filter(w => w.id !== deletedId));
  };

  const totalVolume = workouts.reduce((sum, w) => sum + w.total_volume, 0);
  const totalSets = workouts.reduce((sum, w) => sum + w.total_sets, 0);
  const totalPRs = workouts.reduce((sum, w) => sum + w.pr_count, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Workout History</h1>
        <p className="text-gray-500 mt-1">Your complete training log</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
          <p className="text-xs text-[#8a8a9a] uppercase tracking-wider">Total Workouts</p>
          <p className="text-2xl font-bold text-white mt-1">{workouts.length}</p>
        </div>
        <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
          <p className="text-xs text-[#8a8a9a] uppercase tracking-wider">Total Volume</p>
          <p className="text-2xl font-bold text-white mt-1">
            {(totalVolume / 1000).toFixed(1)}k
          </p>
        </div>
        <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
          <p className="text-xs text-[#8a8a9a] uppercase tracking-wider">Total Sets</p>
          <p className="text-2xl font-bold text-white mt-1">{totalSets}</p>
        </div>
        <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
          <p className="text-xs text-[#8a8a9a] uppercase tracking-wider">Total PRs</p>
          <p className="text-2xl font-bold text-[#7c3aed] mt-1">{totalPRs}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6a]" />
        <Input
          type="text"
          placeholder="Search workouts or exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#111118] border-[#1e1e2a] text-white pl-10 focus:ring-[#7c3aed]"
          aria-label="Search workouts or exercises"
        />
      </div>

      {/* Workout List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-900/30 border border-gray-800 rounded-xl h-32 animate-pulse"
            />
          ))}
        </div>
      ) : filteredWorkouts.length === 0 ? (
        <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
          <Flame className="w-8 h-8 text-[#5a5a6a] mx-auto mb-3" aria-hidden="true" />
          <p className="text-[#a3a3aa]">
            {search ? "No workouts match your search" : "No workouts yet. Start training!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWorkouts.map((workout) => (
            <WorkoutHistoryCard key={workout.id} workout={workout} onDelete={handleDeleteWorkout} />
          ))}
        </div>
      )}
    </div>
  );
}
