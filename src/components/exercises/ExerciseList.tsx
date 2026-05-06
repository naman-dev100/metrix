"use client";

import { useState, useEffect, useCallback } from "react";
import ExerciseCard from "./ExerciseCard";
import { Search, X, Dumbbell } from "lucide-react";

// Muscle groups with their sub-groups
const MUSCLE_GROUPS = {
  "Chest": [],
  "Back": [],
  "Legs": [],
  "Shoulders": [],
  "Arms": ["Biceps", "Triceps", "Forearms"],
  "Core": [],
  "Cardio": [],
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

interface ExerciseListProps {
  onSelect?: (exerciseId: string | string[]) => void;
  selectedExercises?: string[];
  multiSelect?: boolean;
}

export default function ExerciseList({
  onSelect,
  selectedExercises = [],
  multiSelect = false,
}: ExerciseListProps) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [selectedSubGroups, setSelectedSubGroups] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Get available sub-groups based on selected muscle groups
  const getAvailableSubGroups = () => {
    const subGroups: string[] = [];
    selectedMuscleGroups.forEach((mg) => {
      if (MUSCLE_GROUPS[mg as keyof typeof MUSCLE_GROUPS]) {
        subGroups.push(...MUSCLE_GROUPS[mg as keyof typeof MUSCLE_GROUPS]);
      }
    });
    return [...new Set(subGroups)]; // Remove duplicates
  };

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (selectedMuscleGroups.length > 0) {
        params.set("muscle_groups", selectedMuscleGroups.join(","));
      }
      if (selectedSubGroups.length > 0) {
        params.set("sub_groups", selectedSubGroups.join(","));
      }
      if (selectedCategories.length > 0) {
        params.set("categories", selectedCategories.join(","));
      }
      if (search) {
        params.set("search", search);
      }

      const res = await fetch(`/api/exercises?${params}`);
      const data = await res.json();
      setExercises(data);
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMuscleGroups, selectedSubGroups, selectedCategories, search]);

  useEffect(() => {
    const debounce = setTimeout(fetchExercises, 300);
    return () => clearTimeout(debounce);
  }, [fetchExercises]);

  const handleSelect = (value: string | string[]) => {
    if (multiSelect) {
      const ids = Array.isArray(value) ? value : [];
      onSelect?.(ids);
    } else if (typeof value === 'string') {
      onSelect?.(value);
    }
  };

  const toggleMuscleGroup = (group: string) => {
    setSelectedMuscleGroups((prev) => {
      if (prev.includes(group)) {
        return prev.filter((g) => g !== group);
      } else {
        return [...prev, group];
      }
    });
    // Clear sub-groups when deselecting Arms
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

  const hasFilters = search || selectedMuscleGroups.length > 0 || selectedCategories.length > 0;
  const availableSubGroups = getAvailableSubGroups();

  // Filter exercises by sub-group on the client side (since sub-group is part of name or we need to add it to DB)
  const filteredExercises = exercises;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6a]" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111118] border border-[#1e1e2a] rounded-xl pl-10 pr-12 py-2.5 text-sm text-white placeholder-[#5a5a6a] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-none transition-all shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
          />
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5a6a] hover:text-[#8a8a9a]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Muscle Groups - Toggleable */}
        <div className="space-y-2">
          <p className="text-xs text-[#5a5a6a] uppercase tracking-wider">Muscle Groups</p>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(MUSCLE_GROUPS).map((group) => (
              <button
                key={group}
                onClick={() => toggleMuscleGroup(group)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedMuscleGroups.includes(group)
                    ? "bg-[#7c3aed] text-white shadow-[0_2px_8px_rgba(124,58,237,0.4)]"
                    : "bg-[#111118] border border-[#1e1e2a] text-[#a3a3aa] hover:text-white hover:border-[#2e2e3a]"
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Sub-Groups (only show if Arms is selected) */}
          {availableSubGroups.length > 0 && (
            <div className="flex gap-2 flex-wrap pl-4">
              {availableSubGroups.map((subGroup) => (
                <button
                  key={subGroup}
                  onClick={() => toggleSubGroup(subGroup)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
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
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategories.includes(cat)
                    ? "bg-[#7c3aed] text-white shadow-[0_2px_8px_rgba(124,58,237,0.4)]"
                    : "bg-[#111118] border border-[#1e1e2a] text-[#a3a3aa] hover:text-white hover:border-[#2e2e3a]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-[#5a5a6a] hover:text-red-400 transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-[#8a8a9a]">
        {loading ? "Loading..." : `${filteredExercises.length} exercises found`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#111118] border border-[#1e1e2a] rounded-xl h-48 animate-pulse shadow-[0_1px_3px_rgba(0,0,0,0.4)] skeleton"
            />
          ))}
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell className="w-8 h-8 text-[#5a5a6a] mx-auto mb-3" aria-hidden="true" />
          <p className="text-[#a3a3aa]">No exercises found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onSelect={handleSelect}
              selected={selectedExercises?.includes(exercise.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
