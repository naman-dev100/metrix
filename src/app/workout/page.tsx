"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, Plus, Play, Calendar, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import useWorkoutStore from "@/lib/workout-store";
import WorkoutExerciseCard from "@/components/workout/WorkoutExerciseCard";
import RoutineCard from "@/components/workout/RoutineCard";
import CreateRoutineDialog from "@/components/workout/CreateRoutineDialog";
import AddExerciseDialog from "@/components/workout/AddExerciseDialog";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
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
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Async loading states for buttons
  const [quickStartLoading, setQuickStartLoading] = useState(false);
  const [finishWorkoutLoading, setFinishWorkoutLoading] = useState(false);

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
    if (quickStartLoading) return;
    setQuickStartLoading(true);
    try {
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
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to start workout");
      }
    } catch (error) {
      console.error("Quick start error:", error);
      toast.error("Network error. Check your connection.");
    } finally {
      setQuickStartLoading(false);
    }
  };

  const handleStartRoutine = async (routineId: string, routineName: string) => {
    if (quickStartLoading) return;
    setQuickStartLoading(true);
    try {
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
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to start workout");
      }
    } catch (error) {
      console.error("Routine start error:", error);
      toast.error("Network error. Check your connection.");
    } finally {
      setQuickStartLoading(false);
    }
  };

  const handleFinishWorkout = async () => {
    if (finishWorkoutLoading) return;

    // Validate session exists
    if (!sessionId) {
      toast.error("No active workout session. Please restart your workout.");
      stopSession();
      return;
    }

    // Validate exercises have sets
    const hasValidSets = activeExercises.some((ex) => ex.sets.length > 0);
    if (!hasValidSets) {
      toast.error("Add at least one set before finishing.");
      return;
    }

    setFinishWorkoutLoading(true);
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

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
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
        console.error("Finish workout failed:", data);
        const msg = data?.error || res.statusText || "Failed to finish workout";
        toast.error(msg);
      }
    } catch (error) {
      console.error("Finish workout error:", error);
      toast.error("Network error. Check your connection and try again.");
    } finally {
      setFinishWorkoutLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!routineToDelete) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/routines/${routineToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRoutines((prev) => prev.filter((r) => r.id !== routineToDelete));
        toast.success("Routine deleted");
      } else {
        toast.error("Failed to delete routine");
      }
    } catch (error) {
      toast.error("Failed to delete routine");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setRoutineToDelete(null);
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
                  disabled={finishWorkoutLoading}
                  aria-label={finishWorkoutLoading ? "Finishing workout..." : "Finish current workout"}
                  className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {finishWorkoutLoading ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Finishing...
                    </>
                  ) : (
                    "Finish Workout"
                  )}
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
            aria-label="Add exercises to current workout"
            className="w-full border-dashed border-[#1e1e2a] text-[#8a8a9a] hover:text-white hover:border-[#333348] hover:bg-[#16161f] transition-all"
            onClick={() => setShowAddExercise(true)}
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
                disabled={quickStartLoading}
                aria-label={quickStartLoading ? "Starting workout..." : "Start a new quick workout session"}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {quickStartLoading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Workout
                  </>
                )}
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
                  onStartLoading={quickStartLoading}
                  onDelete={(id) => {
                    setRoutineToDelete(id);
                    setShowDeleteConfirm(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Exercise Dialog */}
      <AddExerciseDialog
        open={showAddExercise}
        onOpenChange={setShowAddExercise}
        selectedIds={activeExercises.map((e) => e.exerciseId)}
        onAdd={async (exerciseId) => {
          try {
            const res = await fetch("/api/exercises");
            const exercises: any[] = await res.json();
            const exercise = exercises.find((e) => e.id === exerciseId);
            if (exercise) {
              addExercise(exerciseId, exercise.name);
              toast.success(`Added ${exercise.name}`);
            } else {
              toast.error("Exercise not found in database");
            }
          } catch {
            toast.error("Failed to add exercise");
          }
        }}
        onRemove={(exerciseId) => {
          removeExercise(exerciseId);
          toast.info("Exercise removed");
        }}
      />

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

      {/* Delete Routine Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={showDeleteConfirm}
        title="Delete Routine"
        description="Are you sure you want to delete this routine? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setShowDeleteConfirm(false);
            setRoutineToDelete(null);
          }
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
}
