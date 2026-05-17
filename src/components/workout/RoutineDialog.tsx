"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Plus, Search, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ExerciseCard from "@/components/exercises/ExerciseCard";

// Muscle groups with their sub-groups
const MUSCLE_GROUPS = {
  "Chest": ["Upper Chest", "Mid Chest", "Lower Chest"],
  "Back": ["Lats", "Upper Back", "Lower Back", "Traps"],
  "Legs": ["Quads", "Hamstrings", "Glutes", "Calves"],
  "Shoulders": ["Front Delts", "Side Delts", "Rear Delts"],
  "Arms": ["Biceps", "Triceps", "Forearms"],
  "Core": ["Upper Abs", "Lower Abs", "Obliques"],
  "Cardio": ["Conditioning"],
};

const CATEGORIES = [
  "Barbell",
  "Dumbbell",
  "Machine",
  "Cable",
  "Bodyweight",
  "Cardio",
  "Kettlebell",
  "Suspension",
  "Band",
  "Other",
];

interface Routine {
  id: string;
  name: string;
  notes?: string | null;
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

interface RoutineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, notes: string, exerciseIds: string[]) => Promise<void>;
  initialData?: Routine | null;
}

export default function RoutineDialog({ open, onOpenChange, onSubmit, initialData }: RoutineDialogProps) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameError, setNameError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [selectedSubGroups, setSelectedSubGroups] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const isEditing = !!initialData;

  // Fetch exercises when dialog opens
  useEffect(() => {
    if (open) {
      fetchExercises();
      if (initialData) {
        setName(initialData.name);
        setNotes(initialData.notes || "");
        setSelectedExercises(initialData.routineExercises.map(re => re.exercise.id));
      } else {
        setName("");
        setNotes("");
        setSelectedExercises([]);
      }
      setSearch("");
      setSelectedMuscleGroups([]);
      setSelectedSubGroups([]);
      setSelectedCategories([]);
      setNameError("");
    }
  }, [open, initialData]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exercises");
      const data = await res.json();
      setExercises(data);
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter exercises based on search, muscle groups, sub-groups, and categories
  const filteredExercises = useMemo(() => {
    let filtered = exercises;

    // Filter by muscle groups
    if (selectedMuscleGroups.length > 0) {
      filtered = filtered.filter((ex) => selectedMuscleGroups.includes(ex.muscle_group));
    }

    // Filter by sub-groups
    if (selectedSubGroups.length > 0) {
      filtered = filtered.filter((ex) => ex.sub_group && selectedSubGroups.includes(ex.sub_group));
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((ex) => selectedCategories.includes(ex.category));
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((ex) => ex.name.toLowerCase().includes(searchLower));
    }

    return filtered;
  }, [exercises, search, selectedMuscleGroups, selectedSubGroups, selectedCategories]);

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const toggleMuscleGroup = (group: string) => {
    const isRemoving = selectedMuscleGroups.includes(group);
    
    setSelectedMuscleGroups((prev) => {
      if (isRemoving) {
        return prev.filter((g) => g !== group);
      } else {
        return [...prev, group];
      }
    });

    // Clear sub-groups when deselecting
    if (isRemoving) {
      const subGroupsToRemove = MUSCLE_GROUPS[group as keyof typeof MUSCLE_GROUPS] || [];
      setSelectedSubGroups(prev => prev.filter(sg => !subGroupsToRemove.includes(sg)));
    }
  };

  const toggleSubGroup = (subGroup: string) => {
    setSelectedSubGroups((prev) => {
      if (prev.includes(subGroup)) {
        return prev.filter((sg) => sg !== subGroup);
      } else {
        return [...prev, subGroup];
      }
    });
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
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
      console.error(`Failed to ${isEditing ? 'update' : 'create'} routine:`, error);
      setNameError(`Failed to ${isEditing ? 'update' : 'create'} routine. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  // Get available sub-groups based on selected muscle groups
  const getAvailableSubGroups = () => {
    const subGroups: string[] = [];
    selectedMuscleGroups.forEach((mg) => {
      if (MUSCLE_GROUPS[mg as keyof typeof MUSCLE_GROUPS]) {
        subGroups.push(...MUSCLE_GROUPS[mg as keyof typeof MUSCLE_GROUPS]);
      }
    });
    return [...new Set(subGroups)];
  };

  const availableSubGroups = getAvailableSubGroups();
  const hasFilters = selectedMuscleGroups.length > 0 || selectedCategories.length > 0 || selectedSubGroups.length > 0;

  const clearFilters = () => {
    setSelectedMuscleGroups([]);
    setSelectedSubGroups([]);
    setSelectedCategories([]);
    setSearch("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="bg-[#111118] border border-[#1e1e2a] rounded-t-2xl sm:rounded-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.6),_0_8px_24px_-4px_rgba(0,0,0,0.4)] w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col animate-slide-up sm:animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e1e2a]">
          <h2 id="dialog-title" className="text-lg font-semibold text-white">
            {isEditing ? "Edit Routine" : "Create Routine"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            aria-label="Close dialog"
            className="w-8 h-8 p-0 text-[#5a5a6a] hover:text-white hover:bg-[#16161f]"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Name and Notes */}
          <div className="p-4 border-b border-[#1e1e2a] space-y-3">
            <div>
              <Input
                type="text"
                placeholder="Routine name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError("");
                }}
                className={`bg-[#16161f] border-${nameError ? "[#ef4444]" : "[#1e1e2a]"} text-white placeholder-[#5a5a6a] focus:ring-[#7c3aed] h-10`}
                aria-label="Routine name"
                autoComplete="off"
              />
              {nameError && (
                <p className="text-[#ef4444] text-sm mt-1 ml-1" role="alert">{nameError}</p>
              )}
            </div>
            <Input
              type="text"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-[#16161f] border-[#1e1e2a] text-white placeholder-[#5a5a6a] focus:ring-[#7c3aed] h-10"
              aria-label="Notes for routine"
            />
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-[#1e1e2a] space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6a] pointer-events-none" />
              <Input
                type="search"
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#16161f] border-[#1e1e2a] text-white placeholder-[#5a5a6a] focus:ring-[#7c3aed] pl-10 h-11 text-base"
                aria-label="Search exercises"
                autoComplete="off"
              />
            </div>

            {/* Muscle Groups - Toggleable */}
            <div className="space-y-2">
              <p className="text-xs text-[#5a5a6a] uppercase tracking-wider">Muscle Groups</p>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(MUSCLE_GROUPS).map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => toggleMuscleGroup(group)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      selectedMuscleGroups.includes(group)
                        ? "bg-[#7c3aed] text-white shadow-[0_2px_8px_rgba(124,58,237,0.4)]"
                        : "bg-[#16161f] border border-[#1e1e2a] text-[#a3a3aa] hover:text-white hover:border-[#2e2e3a]"
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>

              {/* Sub-Groups */}
              {availableSubGroups.length > 0 && (
                <div className="flex gap-2 flex-wrap pl-4">
                  {availableSubGroups.map((subGroup) => (
                    <button
                      key={subGroup}
                      type="button"
                      onClick={() => toggleSubGroup(subGroup)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                        selectedSubGroups.includes(subGroup)
                          ? "bg-[#6d28d9] text-white"
                          : "bg-[#1a1a24] border border-[#2e2e3a] text-[#8a8a9a] hover:text-white"
                      }`}
                    >
                      {subGroup}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Categories - Toggleable */}
            <div className="space-y-2">
              <p className="text-xs text-[#5a5a6a] uppercase tracking-wider">Categories</p>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      selectedCategories.includes(cat)
                        ? "bg-[#7c3aed] text-white shadow-[0_2px_8px_rgba(124,58,237,0.4)]"
                        : "bg-[#16161f] border border-[#1e1e2a] text-[#a3a3aa] hover:text-white hover:border-[#2e2e3a]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-[#5a5a6a] hover:text-red-400 transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Exercise Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#111118] border border-[#1e1e2a] rounded-xl h-36 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-center py-12">
                <Dumbbell className="w-8 h-8 text-[#5a5a6a] mx-auto mb-3" />
                <p className="text-[#8a8a9a]">No exercises found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onSelect={toggleExercise}
                    selected={selectedExercises.includes(exercise.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#1e1e2a] flex items-center justify-between bg-[#111118]">
            <p className="text-sm text-[#a3a3aa]">
              {selectedExercises.length} exercise{selectedExercises.length !== 1 ? "s" : ""} selected
            </p>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || selectedExercises.length === 0}
              loading={submitting}
              aria-label={submitting ? (isEditing ? "Updating routine..." : "Creating routine...") : (isEditing ? "Update routine" : "Create new routine")}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6"
            >
              {isEditing ? "Update Routine" : "Create Routine"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
