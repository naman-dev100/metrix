"use client";

import { useState, useEffect } from "react";
import { Activity, Plus, Play, Dumbbell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import useWorkoutStore from "@/lib/workout-store";
import WorkoutExerciseCard from "@/components/workout/WorkoutExerciseCard";
import RoutineCard from "@/components/workout/RoutineCard";
import RoutineDialog from "@/components/workout/RoutineDialog";
import AddExerciseDialog from "@/components/workout/AddExerciseDialog";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
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

interface Routine {
  id: string;
  name: string;
  notes?: string | null;
  created_at: string;
  routineExercises: {
    id: string;
    sets_count?: number;
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
  const startSession = useWorkoutStore((s) => s.startSession);
  const stopSession = useWorkoutStore((s) => s.stopSession);
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const removeExercise = useWorkoutStore((s) => s.removeExercise);
  const routineName = useWorkoutStore((s) => s.routineName);
  const routineId = useWorkoutStore((s) => s.routineId);

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoutineDialog, setShowRoutineDialog] = useState(false);
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null);

  const checkIfRoutineModified = () => {
    if (!routineId) return false;
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return false;

    // Compare lengths
    if (activeExercises.length !== routine.routineExercises.length) return true;

    // Compare each exercise and its sets count
    for (let i = 0; i < activeExercises.length; i++) {
      const activeEx = activeExercises[i];
      const routineEx = routine.routineExercises[i];

      // Check ID
      if (activeEx.exerciseId !== routineEx.exercise.id) return true;

      // Check sets count
      const activeSetsCount = activeEx.sets.length;
      const routineSetsCount = routineEx.sets_count || 3;
      if (activeSetsCount !== routineSetsCount) return true;
    }

    return false;
  };

  const [showAddExercise, setShowAddExercise] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUpdateRoutinePrompt, setShowUpdateRoutinePrompt] = useState(false);
  const [updatingRoutine, setUpdatingRoutine] = useState(false);

  // Completed workouts and history log states
  const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Async loading states for buttons
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

  async function fetchWorkouts() {
    setWorkoutsLoading(true);
    try {
      const res = await fetch("/api/workouts");
      const data = await res.json();
      setWorkouts(data);
      setFilteredWorkouts(data);
    } catch (error) {
      console.error("Failed to fetch workouts:", error);
    } finally {
      setWorkoutsLoading(false);
    }
  }

  const handleDeleteWorkout = (deletedId: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== deletedId));
    setFilteredWorkouts(prev => prev.filter(w => w.id !== deletedId));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoutines();
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        startSession(data.sessionId, routineName, routineId);

        const routine = routines.find((r) => r.id === routineId);
        if (routine) {
          for (const re of routine.routineExercises) {
            const setsCount = (re as any).sets_count || 3;
            addExercise(re.exercise.id, re.exercise.name, setsCount);
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

  const handleFinishWorkout = async (forceNoRoutineUpdate = false) => {
    // Check if the routine was modified and show prompt before saving
    if (routineId && checkIfRoutineModified() && !forceNoRoutineUpdate) {
      setShowUpdateRoutinePrompt(true);
      return;
    }

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
        setShowUpdateRoutinePrompt(false);
        fetchWorkouts();
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

  const handleUpdateRoutineAndSave = async () => {
    if (!routineId) return;
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    setUpdatingRoutine(true);
    try {
      const res = await fetch(`/api/routines/${routineId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: routine.name,
          notes: routine.notes || "",
          exercises: activeExercises.map((e) => ({
            exerciseId: e.exerciseId,
            setsCount: e.sets.length,
          })),
        }),
      });

      if (res.ok) {
        toast.success("Original routine updated!");
        await fetchRoutines();
        // Force finish the session without another prompt loop
        await handleFinishWorkout(true);
      } else {
        toast.error("Failed to update routine in DB, but saving workout...");
        await handleFinishWorkout(true);
      }
    } catch (error) {
      console.error("Failed to update routine:", error);
      toast.error("Failed to update routine in DB, but saving workout...");
      await handleFinishWorkout(true);
    } finally {
      setUpdatingRoutine(false);
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

  // Dynamic stats calculation
  const totalVolume = workouts.reduce((sum, w) => sum + w.total_volume, 0);
  const totalSets = workouts.reduce((sum, w) => sum + w.total_sets, 0);
  const totalPRs = workouts.reduce((sum, w) => sum + w.pr_count, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-2xl font-bold text-white tracking-tight animate-fade-in">Workout</h1>
          <p className="text-base md:text-sm text-[#8a8a9a] mt-1.5 animate-fade-in">Start a workout, choose a routine, or view your history</p>
        </div>
      </div>

      {/* Stats Grid - Visible only when NOT in an active workout session */}
      {!isActive && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-in">
          <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.4)] hover-lift transition-all">
            <p className="text-xs text-[#8a8a9a] uppercase tracking-wider font-semibold">Total Workouts</p>
            <p className="text-2xl font-bold text-white mt-1">{workouts.length}</p>
          </div>
          <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.4)] hover-lift transition-all">
            <p className="text-xs text-[#8a8a9a] uppercase tracking-wider font-semibold">Total Volume</p>
            <p className="text-2xl font-bold text-white mt-1">
              {(totalVolume / 1000).toFixed(1)}k <span className="text-[10px] text-[#5a5a6a]">kg</span>
            </p>
          </div>
          <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.4)] hover-lift transition-all">
            <p className="text-xs text-[#8a8a9a] uppercase tracking-wider font-semibold">Total Sets</p>
            <p className="text-2xl font-bold text-white mt-1">{totalSets}</p>
          </div>
          <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.4)] hover-lift transition-all">
            <p className="text-xs text-[#8a8a9a] uppercase tracking-wider font-semibold">Total PRs</p>
            <p className="text-2xl font-bold text-[#7c3aed] mt-1">{totalPRs}</p>
          </div>
        </div>
      )}

      {/* Active Workout View */}
      {isActive && (
        <div className="space-y-4">
          {/* Active Workout Header */}
          <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.4),_0_1px_2px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/5 to-[#7c3aed]/0" />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 md:w-10 md:h-10 rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(124,58,237,0.15)]">
                    <Activity className="w-5 h-5 text-[#7c3aed]" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg md:text-base font-bold text-white truncate" title={routineName || "Quick Workout"}>
                      {routineName || "Quick Workout"}
                    </h2>
                    <p className="text-base md:text-sm text-[#7c3aed] font-mono leading-none mt-1">{formatDuration(elapsedSeconds)}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleFinishWorkout()}
                  loading={finishWorkoutLoading}
                  aria-label={finishWorkoutLoading ? "Finishing workout..." : "Finish current workout"}
                  className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-5 h-11 md:h-9 text-base md:text-sm font-extrabold rounded-xl shadow-[0_4px_12px_rgba(239,68,68,0.2)] transition-all cursor-pointer flex-shrink-0"
                >
                  Finish Workout
                </Button>
              </div>
            </div>
          </div>
          {/* Exercise List */}
          {activeExercises.map((exercise) => (
            <WorkoutExerciseCard key={exercise.exerciseId} exercise={exercise} />
          ))}

          {/* Add Exercise Button */}
          <Button
            variant="outline"
            aria-label="Add exercises to current workout"
            className="w-full border-dashed border-[#1e1e2a] text-[#8a8a9a] hover:text-white hover:border-[#333348] hover:bg-[#16161f] transition-all h-12 md:h-10 text-base md:text-sm font-semibold rounded-xl cursor-pointer flex items-center justify-center"
            onClick={() => setShowAddExercise(true)}
          >
            <Plus className="w-5 h-5 md:w-4 md:h-4 mr-2" />
            Add Exercise
          </Button>
        </div>
      )}

      {/* Not Active - Show Routines, Quick Start, and Workout History */}
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
                loading={quickStartLoading}
                aria-label={quickStartLoading ? "Starting workout..." : "Start a new quick workout session"}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 h-12 md:h-10 text-base md:text-sm font-bold rounded-xl shadow-[0_4px_12px_rgba(124,58,237,0.2)] transition-all cursor-pointer flex items-center justify-center"
              >
                <Play className="w-5 h-5 md:w-4 md:h-4 mr-2" />
                Start Workout
              </Button>
            </div>
          </div>

          {/* Create Routine Heading */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">My Routines</h2>
            <Button
              onClick={() => {
                setRoutineToEdit(null);
                setShowRoutineDialog(true);
              }}
              aria-label="Create a new workout routine"
              variant="outline"
              className="border-[#1e1e2a] text-[#a3a3aa] hover:text-white hover:bg-[#16161f] transition-all h-11 md:h-9 text-sm md:text-xs px-4 rounded-xl cursor-pointer flex items-center justify-center"
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
            <div className="space-y-3 animate-slide-in">
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

          {/* Separator line */}
          <div className="border-t border-[#1e1e2a]/50 my-6" />

          {/* Workout History & Log Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-tight">Workout History</h2>
              <span className="text-[10px] text-[#5a5a6a] uppercase font-bold tracking-wider">
                {workouts.length} completed session{workouts.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Search past sessions */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6a]" />
              <Input
                type="text"
                placeholder="Search workouts or exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#111118] border-[#1e1e2a] text-white pl-10 focus:ring-[#7c3aed] placeholder:text-[#5a5a6a]"
                aria-label="Search workouts or exercises"
              />
            </div>

            {/* Workout Log Cards */}
            {workoutsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#111118] border border-[#1e1e2a] rounded-xl h-32 animate-pulse shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                  />
                ))}
              </div>
            ) : filteredWorkouts.length === 0 ? (
              <div className="bg-[#111118] border border-[#1e1e2a] rounded-xl p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                <Dumbbell className="w-8 h-8 text-[#5a5a6a] mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm text-[#a3a3aa]">
                  {search ? "No workouts match your search" : "No workouts logged yet. Start training!"}
                </p>
              </div>
            ) : (
              <div className="space-y-3 animate-slide-in">
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
      )}

      {/* Add Exercise Dialog */}
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

      {/* Routine Dialog (Create/Edit) */}
      <RoutineDialog
        open={showRoutineDialog}
        onOpenChange={setShowRoutineDialog}
        initialData={routineToEdit}
        onSubmit={async (name, notes, selectedExercises) => {
          if (selectedExercises.length === 0) return;
          
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
              exercises: selectedExercises.map((se) => ({ 
                exerciseId: se.exerciseId, 
                sets_count: se.setsCount 
              })) 
            }),
          });

          if (res.ok) {
            toast.success(routineToEdit ? "Routine updated" : "Routine created");
            await fetchRoutines();
          } else {
            const data = await res.json().catch(() => ({}));
            const msg = data?.error || (routineToEdit ? "Failed to update routine" : "Failed to create routine");
            toast.error(msg);
            throw new Error(msg);
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

      {/* Update Routine Prompt Dialog */}
      {showUpdateRoutinePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <div className="bg-[#111118] border border-[#1e1e2a] rounded-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.6),_0_8px_24px_-4px_rgba(0,0,0,0.4)] w-full max-w-md p-6 animate-scale-in space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-[#7c3aed]" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Update Original Routine?</h3>
            </div>
            
            <p className="text-sm text-[#a3a3aa] leading-relaxed">
              You modified this routine's exercises or sets during your workout. Would you like to update the original routine so future workouts use these changes?
            </p>
            
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={handleUpdateRoutineAndSave}
                loading={updatingRoutine || finishWorkoutLoading}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold h-11 rounded-xl shadow-[0_2px_8px_rgba(124,58,237,0.4)] transition-all"
              >
                Update and Save
              </Button>
              <Button
                onClick={() => handleFinishWorkout(true)}
                loading={finishWorkoutLoading}
                variant="outline"
                className="border-[#2e2e3a] text-white hover:bg-[#16161f] h-11 rounded-xl transition-all font-semibold"
              >
                Save Only (No Update)
              </Button>
              <Button
                onClick={() => setShowUpdateRoutinePrompt(false)}
                disabled={updatingRoutine || finishWorkoutLoading}
                variant="ghost"
                className="text-[#a3a3aa] hover:bg-[#16161f] h-10 rounded-xl transition-all"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
