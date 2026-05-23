"use client";

import { useState, useEffect } from "react";
import { X, Dumbbell, GripVertical, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddExerciseDialog from "./AddExerciseDialog";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  category: string;
}

interface Routine {
  id: string;
  name: string;
  notes?: string | null;
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

interface SelectedExercise {
  exerciseId: string;
  setsCount: number;
}

interface RoutineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, notes: string, exercises: SelectedExercise[]) => Promise<void>;
  initialData?: Routine | null;
}

export default function RoutineDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: RoutineDialogProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [nameError, setNameError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAddSelector, setShowAddSelector] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const isEditing = !!initialData;

  async function fetchExercises() {
    try {
      const res = await fetch("/api/exercises");
      const data = await res.json();
      setExercises(data);
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    }
  }

  // Fetch exercises when dialog opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchExercises();
      if (initialData) {
        setName(initialData.name);
        setNotes(initialData.notes || "");
        setSelectedExercises(initialData.routineExercises.map(re => ({
          exerciseId: re.exercise.id,
          setsCount: re.sets_count || 3
        })));
      } else {
        setName("");
        setNotes("");
        setSelectedExercises([]);
      }
      setNameError("");
    }
  }, [open, initialData]);

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises((prev) => prev.filter((p) => p.exerciseId !== exerciseId));
  };

  const handleAddExercise = (exerciseId: string) => {
    setSelectedExercises((prev) => {
      if (prev.find((p) => p.exerciseId === exerciseId)) return prev;
      return [...prev, { exerciseId, setsCount: 3 }];
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError("Please enter a routine name");
      return;
    }
    if (selectedExercises.length === 0) {
      setNameError("Select at least one exercise");
      return;
    }
    setNameError("");

    setSubmitting(true);
    try {
      await onSubmit(name, notes, selectedExercises);
      onOpenChange(false);
    } catch (error) {
      console.error(`Failed to submit routine:`, error);
      setNameError(`Failed to save routine. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="bg-[#111118] border border-[#1e1e2a] rounded-t-2xl sm:rounded-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.6),_0_8px_24px_-4px_rgba(0,0,0,0.4)] w-full sm:max-w-xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col animate-slide-up sm:animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e1e2a] bg-[#111118]">
          <h2 id="dialog-title" className="text-lg font-bold text-white tracking-tight">
            {isEditing ? "Edit Routine" : "Create Routine"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            aria-label="Close dialog"
            className="w-8 h-8 p-0 text-[#5a5a6a] hover:text-white hover:bg-[#16161f] rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Name and Notes */}
          <div className="space-y-3">
            <div>
              <Input
                type="text"
                placeholder="Routine name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError("");
                }}
                className={`bg-[#16161f] border-${nameError ? "[#ef4444]" : "[#1e1e2a]"} text-white placeholder-[#5a5a6a] focus:ring-[#7c3aed] h-10 border focus:border-none`}
                aria-label="Routine name"
                autoComplete="off"
              />
              {nameError && (
                <p className="text-[#ef4444] text-xs mt-1 ml-1" role="alert">{nameError}</p>
              )}
            </div>
            <Input
              type="text"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-[#16161f] border-[#1e1e2a] text-white placeholder-[#5a5a6a] focus:ring-[#7c3aed] h-10 border focus:border-none"
              aria-label="Notes for routine"
            />
          </div>

          <div className="border-t border-[#1e1e2a]/50 my-2" />

          {/* Exercises list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#8a8a9a] uppercase tracking-wider font-semibold">Exercises</p>
              {selectedExercises.length > 1 && (
                <span className="text-[10px] text-[#5a5a6a] uppercase">Drag exercises to reorder</span>
              )}
            </div>

            {selectedExercises.length === 0 ? (
              <div className="border border-dashed border-[#1e1e2a] rounded-xl p-8 text-center bg-[#111118]/20">
                <Dumbbell className="w-8 h-8 text-[#5a5a6a] mx-auto mb-2" />
                <p className="text-sm text-[#8a8a9a]">No exercises added yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedExercises.map((ex, index) => {
                  const dbEx = exercises.find((e) => e.id === ex.exerciseId);
                  return (
                    <div
                      key={ex.exerciseId}
                      draggable
                      onDragStart={(e) => {
                        setDraggedIndex(index);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedIndex === null || draggedIndex === index) return;
                        setSelectedExercises((prev) => {
                          const list = [...prev];
                          const [draggedItem] = list.splice(draggedIndex, 1);
                          list.splice(index, 0, draggedItem);
                          return list;
                        });
                        setDraggedIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedIndex(null);
                      }}
                      className={`flex items-center justify-between p-3 bg-[#111118] border border-[#1e1e2a] rounded-xl hover:border-[#7c3aed]/40 transition-all ${
                        draggedIndex === index ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        {/* Drag Handle */}
                        <div className="cursor-grab active:cursor-grabbing text-[#5a5a6a] hover:text-[#a3a3aa] p-1 mr-2 transition-colors">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-sm font-bold text-white truncate">
                            {dbEx ? dbEx.name : "Loading exercise..."}
                          </p>
                          <p className="text-xs text-[#5a5a6a] mt-0.5 uppercase tracking-wider font-semibold">
                            {dbEx ? `${dbEx.muscle_group} • ${dbEx.category}` : "---"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Sets Config */}
                        <div className="flex items-center gap-2 bg-[#16161f] border border-[#2e2e3a] rounded-lg px-2 h-8">
                          <label htmlFor={`sets-${ex.exerciseId}`} className="text-[10px] text-[#8a8a9a] uppercase font-bold tracking-wider">Sets:</label>
                          <input
                            id={`sets-${ex.exerciseId}`}
                            type="number"
                            min="1"
                            max="20"
                            value={ex.setsCount}
                            onChange={(e) => {
                              const val = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
                              setSelectedExercises((prev) =>
                                prev.map((p) =>
                                  p.exerciseId === ex.exerciseId ? { ...p, setsCount: val } : p
                                )
                              );
                            }}
                            className="w-8 bg-transparent border-none text-white text-xs text-center font-mono font-bold focus:outline-none focus:ring-0 p-0"
                          />
                        </div>

                        {/* Remove */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExercise(ex.exerciseId)}
                          aria-label="Remove exercise from routine"
                          className="w-8 h-8 p-0 text-[#5a5a6a] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Exercise Trigger Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddSelector(true)}
              className="w-full border-dashed border-[#1e1e2a] text-[#8a8a9a] hover:text-white hover:border-[#333348] hover:bg-[#16161f] transition-all py-5 mt-1 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e1e2a] flex items-center justify-between bg-[#111118] flex-shrink-0">
          <p className="text-xs text-[#5a5a6a] uppercase tracking-wider font-semibold">
            {selectedExercises.length} exercise{selectedExercises.length !== 1 ? "s" : ""} selected
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              className="text-[#a3a3aa] hover:bg-[#16161f]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || selectedExercises.length === 0}
              loading={submitting}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 font-bold"
            >
              {initialData ? "Update Routine" : "Create Routine"}
            </Button>
          </div>
        </div>
      </div>

      {/* Nested Add Exercise Dialog */}
      <AddExerciseDialog
        open={showAddSelector}
        onOpenChange={setShowAddSelector}
        selectedIds={selectedExercises.map((e) => e.exerciseId)}
        onAdd={handleAddExercise}
        onRemove={removeExercise}
      />
    </div>
  );
}
