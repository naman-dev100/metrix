"use client";

import { useState, useEffect } from "react";
import { Activity, Plus, Play, Calendar, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import useWorkoutStore from "@/lib/workout-store";
import WorkoutExerciseCard from "@/components/workout/WorkoutExerciseCard";
import RoutineCard from "@/components/workout/RoutineCard";
import CreateRoutineDialog from "@/components/workout/CreateRoutineDialog";
import { formatDuration } from "@/lib/utils";

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

export default function WorkoutPage() {
  const isActive = useWorkoutStore((s) => s.isActive);
  const sessionId = useWorkoutStore((s) => s.sessionId);
  const elapsedSeconds = useWorkoutStore((s) => s.elapsedSeconds);
  const activeExercises = useWorkoutStore((s) => s.activeExercises);
  const restTimer = useWorkoutStore((s) => s.restTimer);
  const startSession = useWorkoutStore((s) => s.startSession);
  const stopSession = useWorkoutStore((s) => s.stopSession);
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const removeExercise = useWorkoutStore((s) => s.removeExercise);
  const routineName = useWorkoutStore((s) => s.routineName);

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateRoutine, setShowCreateRoutine] = useState(false);

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/routines");
      const data = await res.json();
      setRoutines(data);
    } catch (error) {
      console.error("Failed to fetch routines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStart = async () => {
    const res = await fetch("/api/start-workout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Quick Workout" }),
    });

    if (res.ok) {
      const data = await res.json();
      startSession(data.sessionId);
      toast.success("Workout started");
    } else {
      toast.error("Failed to start workout");
    }
  };

  const handleStartRoutine = async (routineId: string, routineName: string) => {
    const res = await fetch("/api/start-workout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routineId, name: routineName }),
    });

    if (res.ok) {
      const data = await res.json();
      startSession(data.sessionId, routineName);

      const routine = routines.find((r) => r.id === routineId);
      if (routine) {
        for (const re of routine.routineExercises) {
          addExercise(re.exercise.id, re.exercise.name);
        }
      }

      toast.success(`Started: ${routineName}`);
    } else {
      toast.error("Failed to start workout");
    }
  };

  const handleFinishWorkout = async () => {
    try {
      const res = await fetch("/api/finish-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          routineId: null,
          name: "Quick Workout",
          exercises: activeExercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            sets: ex.sets.map((s) => ({
              id: s.id,
              setNumber: s.setNumber,
              weight: s.weight,
              reps: s.reps,
            })),
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();

        if (data.prExercises && data.prExercises.length > 0) {
          data.prExercises.forEach((pr: any) => {
            toast.success(
              `New PR! ${pr.name} - ${pr.weight}kg × ${pr.reps} reps`
            );
          });
        }

        toast.success(
          `Workout finished! Duration: ${formatDuration(data.duration)}`
        );
        stopSession();
      } else {
        toast.error("Failed to finish workout");
      }
    } catch (error) {
      toast.error("Failed to finish workout");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Workout</h1>
          <p className="text-[#8a8a9a] mt-1">Start a workout or choose a routine</p>
        </div>
      </div>

      {/* Active Workout View */}
      {isActive && (
        <div className="space-y-4">
          {/* Active Workout Header */}
          <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.4),_0_1px_2px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/5 to-[#7c3aed]/0" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.15)]">
                    <Activity className="w-5 h-5 text-[#7c3aed]" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{routineName || "Quick Workout"}</h2>
                    <p className="text-sm text-[#7c3aed] font-mono">{formatDuration(elapsedSeconds)}</p>
                  </div>
                </div>
                <Button
                  onClick={handleFinishWorkout}
                  aria-label="Finish current workout"
                  className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-4"
                >
                  Finish Workout
                </Button>
              </div>
            </div>
          </div>

          {/* Rest Timer */}
          {restTimer > 0 && (
            <div className="bg-[#7c3aed]/10 border border-[#7c3aed]/30 rounded-xl p-3 flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.4)]" role="status" aria-live="polite">
              <span className="text-[#7c3aed] font-bold text-lg font-mono">{restTimer}s</span>
              <span className="text-[#7c3aed]/60 text-sm ml-2 uppercase tracking-wider">rest</span>
            </div>
          )}

          {/* Exercise List */}
          {activeExercises.map((exercise) => (
            <WorkoutExerciseCard key={exercise.exerciseId} exercise={exercise} />
          ))}

          {/* Add Exercise Button */}
          <Button
            variant="outline"
            aria-label="Navigate to exercise library to add exercises"
            className="w-full border-dashed border-[#1e1e2a] text-[#8a8a9a] hover:text-white hover:border-[#333348] hover:bg-[#16161f] transition-all"
            onClick={() => {
              window.location.href = "/exercises";
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </Button>
        </div>
      )}

      {/* Not Active - Show Routines */}
      {!isActive && (
        <div className="space-y-6">
          {/* Quick Start */}
          <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4),_0_1px_2px_rgba(0,0,0,0.3)] hover-lift card-enter">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Quick Start</h2>
                <p className="text-sm text-[#a3a3aa] mt-1">Start an empty workout session</p>
              </div>
              <Button
                onClick={handleQuickStart}
                aria-label="Start a new quick workout session"
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Workout
              </Button>
            </div>
          </div>

          {/* Create Routine */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">My Routines</h2>
            <Button
              onClick={() => setShowCreateRoutine(true)}
              aria-label="Create a new workout routine"
              variant="outline"
              className="border-[#1e1e2a] text-[#a3a3aa] hover:text-white hover:bg-[#16161f] transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Routine
            </Button>
          </div>

          {/* Routines List */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#111118] border border-[#1e1e2a] rounded-xl h-24 animate-pulse shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                />
              ))}
            </div>
          ) : routines.length === 0 ? (
            <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
              <Dumbbell className="w-8 h-8 text-[#5a5a6a] mx-auto mb-3" />
              <p className="text-[#a3a3aa]">No routines yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {routines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onStart={handleStartRoutine}
                  onDelete={(id) => {
                    setRoutines((prev) => prev.filter((r) => r.id !== id));
                  }}
                  onUpdate={(updated) => {
                    setRoutines((prev) =>
                      prev.map((r) => (r.id === updated.id ? updated : r))
                    );
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Routine Dialog */}
      <CreateRoutineDialog
        open={showCreateRoutine}
        onOpenChange={setShowCreateRoutine}
        onCreate={async (name, notes, exerciseIds) => {
          if (exerciseIds.length === 0) return;
          const res = await fetch("/api/routines", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, notes, exercises: exerciseIds.map((id) => ({ exerciseId: id })) }),
          });
          if (res.ok) {
            toast.success("Routine created");
            await fetchRoutines();
          } else {
            toast.error("Failed to create routine");
          }
        }}
      />
    </div>
  );
}
