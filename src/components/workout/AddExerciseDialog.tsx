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

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((ex) => ex.name.toLowerCase().includes(searchLower));
    }

    return filtered;
  }, [exercises, search, selectedMuscleGroups, selectedSubGroups]);

  const toggleMuscleGroup = (group: string) => {
    setSelectedMuscleGroups((prev) => {
      if (prev.includes(group)) {
        // When unselecting, also clear any active subgroups associated with it
        const subgroupsToKeep = selectedSubGroups.filter(
          (sg) => !MUSCLE_GROUPS[group as keyof typeof MUSCLE_GROUPS]?.includes(sg)
        );
        setSelectedSubGroups(subgroupsToKeep);
        return prev.filter((g) => g !== group);
      } else {
        return [...prev, group];
      }
    });
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

  const clearFilters = () => {
    setSearch("");
    setSelectedMuscleGroups([]);
    setSelectedSubGroups([]);
  };

  const hasFilters = selectedMuscleGroups.length > 0 || selectedSubGroups.length > 0 || search.length > 0;

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
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0f] w-full h-full overflow-hidden animate-slide-up" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 md:px-6 border-b border-[#1e1e2a] bg-[#111118]/80 backdrop-blur-md flex-shrink-0">
        <h2 id="dialog-title" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-[#7c3aed]" />
          Choose Exercises
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
          aria-label="Close dialog"
          className="w-10 h-10 p-0 text-[#8a8a9a] hover:text-white hover:bg-[#16161f] rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Persistent Selected Exercises Horizontal Tray */}
      {selectedIds.length > 0 && (
        <div className="bg-[#16161f]/60 backdrop-blur border-b border-[#1e1e2a] px-4 py-3 space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
            <p className="text-xs text-[#8a8a9a] uppercase tracking-wider font-bold">
              Selected Exercises ({selectedIds.length})
            </p>
            <button
              onClick={() => {
                // Remove all
                selectedIds.forEach((id) => onRemove(id));
              }}
              className="text-xs text-[#ef4444] hover:text-red-400 font-semibold cursor-pointer transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="max-w-5xl mx-auto w-full flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            {selectedIds.map((id) => {
              const ex = exercises.find((e) => e.id === id);
              if (!ex) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-1.5 bg-[#7c3aed]/15 border border-[#7c3aed]/40 text-white pl-3 pr-1.5 py-1 rounded-full text-sm flex-shrink-0 animate-scale-in"
                >
                  <span className="font-semibold text-xs">{ex.name}</span>
                  <button
                    onClick={() => onRemove(id)}
                    className="w-4 h-4 rounded-full bg-[#7c3aed]/20 hover:bg-[#ef4444]/20 hover:text-red-400 flex items-center justify-center text-white transition-colors cursor-pointer"
                    aria-label={`Remove ${ex.name}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content wrapper */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="max-w-5xl mx-auto w-full p-4 md:p-6 space-y-6 flex-1 flex flex-col">
          {/* Search & Muscle Filters */}
          <div className="space-y-4 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a5a6a] pointer-events-none" />
              <Input
                type="search"
                placeholder="Search exercises by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#16161f] border-[#1e1e2a] text-white placeholder-[#5a5a6a] focus:ring-[#7c3aed] pl-12 h-12 text-base rounded-xl border focus:border-none w-full"
                aria-label="Search exercises"
                autoComplete="off"
              />
            </div>

            {/* Muscle Groups */}
            <div className="space-y-3">
              <p className="text-xs text-[#8a8a9a] uppercase tracking-wider font-bold">Filter Muscle Groups</p>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(MUSCLE_GROUPS).map((group) => {
                  const isSelected = selectedMuscleGroups.includes(group);
                  return (
                    <button
                      key={group}
                      type="button"
                      onClick={() => toggleMuscleGroup(group)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#7c3aed] text-white shadow-[0_4px_12px_rgba(124,58,237,0.35)]"
                          : "bg-[#16161f] border border-[#1e1e2a] text-[#a3a3aa] hover:text-white hover:border-[#2e2e3a]"
                      }`}
                    >
                      {group}
                    </button>
                  );
                })}
              </div>

              {/* Sleek Subgroups Target Areas UI */}
              {availableSubGroups.length > 0 && (
                <div className="bg-[#111118] border border-[#1e1e2a] rounded-2xl p-4 space-y-3 animate-scale-in">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-[#7c3aed] animate-pulse" />
                    <span className="text-xs text-white uppercase font-bold tracking-wider">Target Subgroups</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {availableSubGroups.map((subGroup) => {
                      const isSelected = selectedSubGroups.includes(subGroup);
                      return (
                        <button
                          key={subGroup}
                          type="button"
                          onClick={() => toggleSubGroup(subGroup)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#7c3aed]/20 border border-[#7c3aed] text-white"
                              : "bg-[#16161f] border border-[#1e1e2a] text-[#8a8a9a] hover:text-white"
                          }`}
                        >
                          {subGroup}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-[#5a5a6a] hover:text-red-400 font-semibold transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="border-t border-[#1e1e2a]/50 my-2 flex-shrink-0" />

          {/* Exercise List Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-[#111118]/80 border border-[#1e1e2a] rounded-2xl h-24 animate-pulse" />
                ))}
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center border border-dashed border-[#1e1e2a] rounded-2xl min-h-[250px] bg-[#111118]/10">
                <Dumbbell className="w-10 h-10 text-[#5a5a6a] mb-3 animate-pulse" />
                <p className="text-sm font-semibold text-[#8a8a9a]">No exercises found</p>
                <p className="text-xs text-[#5a5a6a] mt-1">Try relaxing your search terms or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredExercises.map((exercise) => {
                  const isSelected = selectedIds.includes(exercise.id);
                  return (
                    <button
                      key={exercise.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          onRemove(exercise.id);
                        } else {
                          onAdd(exercise.id);
                          setSearch(""); // Reset search query to show all exercises again
                        }
                      }}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-24 ${
                        isSelected
                          ? "bg-[#7c3aed]/15 border-[#7c3aed] text-white shadow-[0_0_15px_rgba(124,58,237,0.15)]"
                          : "bg-[#111118] border-[#1e1e2a] text-[#a3a3aa] hover:text-white hover:border-[#2e2e3a]"
                      }`}
                    >
                      <p className="text-sm font-bold truncate-2-lines leading-snug">{exercise.name}</p>
                      <p className="text-[10px] text-[#8a8a9a] uppercase tracking-wider font-bold mt-1">
                        {exercise.muscle_group}
                        {exercise.sub_group ? ` • ${exercise.sub_group}` : ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Confirm/Close Footer */}
      <div className="border-t border-[#1e1e2a] bg-[#111118]/90 backdrop-blur-md flex-shrink-0">
        <div className="max-w-5xl mx-auto w-full px-4 py-4 md:px-6 flex items-center justify-between pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <p className="text-sm text-[#8a8a9a] uppercase tracking-wider font-semibold">
            {selectedIds.length} exercise{selectedIds.length !== 1 ? "s" : ""} selected
          </p>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 h-11 rounded-xl text-base font-bold shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition-all cursor-pointer"
          >
            Confirm Selection
          </Button>
        </div>
      </div>
    </div>
  );
}
