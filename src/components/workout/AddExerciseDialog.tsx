"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Search, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  sub_group: string | null;
  category: string;
  image_url?: string;
}

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onAdd: (exerciseId: string) => void;
  onRemove: (exerciseId: string) => void;
}

// Global cache to persist across component mounts
let exercisesCache: Exercise[] | null = null;

export default function AddExerciseDialog({
  open,
  onOpenChange,
  selectedIds,
  onAdd,
  onRemove,
}: AddExerciseDialogProps) {
  const [exercises, setExercises] = useState<Exercise[]>(exercisesCache || []);
  const [loading, setLoading] = useState(!exercisesCache);
  const [search, setSearch] = useState("");
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [selectedSubGroups, setSelectedSubGroups] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exercises");
      const data = await res.json();
      exercisesCache = data;
      setExercises(data);
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (!exercisesCache) {
        fetchExercises();
      } else {
        setExercises(exercisesCache);
        setLoading(false);
      }
      setSearch("");
      setSelectedMuscleGroups([]);
      setSelectedSubGroups([]);
      setSelectedCategories([]);
    }
  }, [open]);

  const filteredExercises = useMemo(() => {
    let filtered = exercises;

    if (selectedMuscleGroups.length > 0) {
      filtered = filtered.filter((ex) => selectedMuscleGroups.includes(ex.muscle_group));
    }

    if (selectedSubGroups.length > 0) {
      filtered = filtered.filter((ex) => ex.sub_group && selectedSubGroups.includes(ex.sub_group));
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((ex) => selectedCategories.includes(ex.category));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((ex) => ex.name.toLowerCase().includes(searchLower));
    }

    return filtered;
  }, [exercises, search, selectedMuscleGroups, selectedSubGroups, selectedCategories]);

  const toggleMuscleGroup = (group: string) => {
    setSelectedMuscleGroups((prev) => {
      if (prev.includes(group)) {
        return prev.filter((g) => g !== group);
      } else {
        return [...prev, group];
      }
    });
    if (group === "Arms" && selectedMuscleGroups.includes("Arms")) {
      setSelectedSubGroups([]);
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

  const clearFilters = () => {
    setSearch("");
    setSelectedMuscleGroups([]);
    setSelectedSubGroups([]);
    setSelectedCategories([]);
  };

  const hasFilters = selectedMuscleGroups.length > 0 || selectedCategories.length > 0 || selectedSubGroups.length > 0;

  const availableSubGroups = useMemo(() => {
    const subGroups: string[] = [];
    selectedMuscleGroups.forEach((mg) => {
      if (MUSCLE_GROUPS[mg as keyof typeof MUSCLE_GROUPS]) {
        subGroups.push(...MUSCLE_GROUPS[mg as keyof typeof MUSCLE_GROUPS]);
      }
    });
    return [...new Set(subGroups)];
  }, [selectedMuscleGroups]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="bg-[#111118] border border-[#1e1e2a] rounded-t-2xl sm:rounded-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.6)] w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col animate-slide-up sm:animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e1e2a]">
          <h2 id="dialog-title" className="text-lg font-semibold text-white">Add Exercise</h2>
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
          {/* Search */}
          <div className="p-4 border-b border-[#1e1e2a] space-y-3">
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

            {/* Muscle Groups */}
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

            {/* Categories */}
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

          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-[#111118] border border-[#1e1e2a] rounded-xl h-20 animate-pulse" />
                ))}
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-center py-12">
                <Dumbbell className="w-8 h-8 text-[#5a5a6a] mx-auto mb-3" />
                <p className="text-[#8a8a9a]">No exercises found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredExercises.map((exercise) => {
                  const isSelected = selectedIds.includes(exercise.id);
                  return (
                    <button
                      key={exercise.id}
                      type="button"
                      onClick={() => isSelected ? onRemove(exercise.id) : onAdd(exercise.id)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#7c3aed]/15 border-[#7c3aed] text-white"
                          : "bg-[#111118] border-[#1e1e2a] text-[#a3a3aa] hover:text-white hover:border-[#2e2e3a]"
                      }`}
                    >
                      <p className="text-sm font-medium">{exercise.name}</p>
                      <p className="text-xs mt-1 text-[#5a5a6a]">{exercise.muscle_group}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
