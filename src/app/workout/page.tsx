"use client";

import { useState, useEffect } from "react";
import { Activity, Plus, Play, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useWorkoutStore from "@/lib/workout-store";
import WorkoutExerciseCard from "@/components/workout/WorkoutExerciseCard";
import RoutineCard from "@/components/workout/RoutineCard";
import RoutineDialog from "@/components/workout/RoutineDialog";
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

interface DBExercise {
  id: string;
  name: string;
  muscle_group: string;
  category: string;
}

interface PRRecord {
  name: string;
  weight: number;
  reps: number;
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
  const [showRoutineDialog, setShowRoutineDialog] = useState(false);
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [quickStartLoading, setQuickStartLoading] = useState(false);
  const [finishWorkoutLoading, setFinishWorkoutLoading] = useState(false);

  async function fetchRoutines() {
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
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoutines();
  }, []);

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

    if (!sessionId) {
      toast.error("No active workout session. Please restart your workout.");
      stopSession();
      return;
    }

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
          name: routineName || "Quick Workout",
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
          data.prExercises.forEach((pr: PRRecord) => {
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
    <div className="space-y-8 pb-12 max-w-[800px] mx-auto">
      
      {/* Active Workout View */}
      {isActive ? (
        <div className="space-y-6">
          {/* Active Workout Header - Minimalist */}
          <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary animate-pulse" />
                  {routineName || "Quick Workout"}
                </h2>
                <p className="text-sm font-mono text-muted-foreground mt-0.5">{formatDuration(elapsedSeconds)}</p>
              </div>
              <Button
                onClick={handleFinishWorkout}
                loading={finishWorkoutLoading}
                aria-label={finishWorkoutLoading ? "Finishing workout..." : "Finish current workout"}
                variant="default"
                className="bg-foreground text-background hover:bg-foreground/90 font-semibold"
              >
                Finish
              </Button>
            </div>
            
            {/* Rest Timer Banner */}
            {restTimer > 0 && (
              <div className="mt-3 bg-muted/50 rounded-lg p-2.5 flex items-center justify-center border border-border" role="status" aria-live="polite">
                <span className="text-foreground font-mono font-semibold text-sm">{restTimer}s</span>
                <span className="text-muted-foreground text-[10px] ml-2 uppercase tracking-widest font-semibold">Rest</span>
              </div>
            )}
          </div>

          {/* Exercise List */}
          <div className="space-y-4">
            {activeExercises.map((exercise) => (
              <WorkoutExerciseCard key={exercise.exerciseId} exercise={exercise} />
            ))}

            {activeExercises.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">
                Your workout is empty. Add an exercise to begin.
              </div>
            )}
          </div>

          {/* Add Exercise Button */}
          <Button
            variant="outline"
            size="lg"
            aria-label="Add exercises to current workout"
            className="w-full text-muted-foreground hover:text-foreground font-medium border-dashed border-border"
            onClick={() => setShowAddExercise(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </Button>
        </div>
      ) : (
        /* Not Active - Show Routines */
        <div className="space-y-10">
          <header className="pt-4">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Workout
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Start a new session or choose a routine.
            </p>
          </header>

          {/* Quick Start */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground tracking-tight">Quick Start</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Start an empty workout session</p>
            </div>
            <Button
              onClick={handleQuickStart}
              loading={quickStartLoading}
              aria-label={quickStartLoading ? "Starting workout..." : "Start a new quick workout session"}
              variant="default"
              className="font-medium"
            >
              <Play className="w-4 h-4 mr-1.5" />
              Start Empty
            </Button>
          </div>

          {/* Routines Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground tracking-tight">My Routines</h2>
              <Button
                onClick={() => {
                  setRoutineToEdit(null);
                  setShowRoutineDialog(true);
                }}
                aria-label="Create a new workout routine"
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary hover:bg-primary/10 -mr-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Routine
              </Button>
            </div>

            {/* Routines List */}
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted/30 rounded-lg h-16 animate-pulse"
                  />
                ))}
              </div>
            ) : routines.length === 0 ? (
              <div className="py-12 border border-dashed border-border rounded-xl text-center">
                <Dumbbell className="w-6 h-6 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No routines yet.</p>
                <Button
                  onClick={() => {
                    setRoutineToEdit(null);
                    setShowRoutineDialog(true);
                  }}
                  variant="link"
                  className="text-primary mt-1 h-auto p-0"
                >
                  Create your first routine
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {routines.map((routine) => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    onStart={handleStartRoutine}
                    onStartLoading={quickStartLoading}
                    onEdit={(r) => {
                      setRoutineToEdit(r);
                      setShowRoutineDialog(true);
                    }}
                    onDelete={(id) => {
                      setRoutineToDelete(id);
                      setShowDeleteConfirm(true);
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Dialogs */}
      <AddExerciseDialog
        open={showAddExercise}
        onOpenChange={setShowAddExercise}
        selectedIds={activeExercises.map((e) => e.exerciseId)}
        onAdd={async (exerciseId) => {
          try {
            const res = await fetch("/api/exercises");
            const exercises: DBExercise[] = await res.json();
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

      <RoutineDialog
        open={showRoutineDialog}
        onOpenChange={setShowRoutineDialog}
        initialData={routineToEdit}
        onSubmit={async (name, notes, exerciseIds) => {
          if (exerciseIds.length === 0) return;
          
          const url = routineToEdit 
            ? `/api/routines/${routineToEdit.id}` 
            : "/api/routines";
          
          const method = routineToEdit ? "PUT" : "POST";

          const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              name, 
              notes, 
              exercises: exerciseIds.map((id) => ({ exerciseId: id })) 
            }),
          });

          if (res.ok) {
            toast.success(routineToEdit ? "Routine updated" : "Routine created");
            await fetchRoutines();
          } else {
            toast.error(routineToEdit ? "Failed to update routine" : "Failed to create routine");
          }
        }}
      />

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
