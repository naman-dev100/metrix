"use client";

import { useState, useEffect, useCallback } from "react";
import ExerciseCard from "./ExerciseCard";
import { Search, X, Dumbbell } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MUSCLE_GROUPS = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Cardio",
];

const CATEGORIES = [
  "All",
  "Barbell",
  "Dumbbell",
  "Machine",
  "Cable",
  "Bodyweight",
  "Cardio",
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
  const [muscleGroup, setMuscleGroup] = useState("All");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (muscleGroup !== "All") params.set("muscle_group", muscleGroup);
        if (category !== "All") params.set("category", category);
        if (search) params.set("search", search);

        const res = await fetch(`/api/exercises?${params}`);
        const data = await res.json();
        setExercises(data);
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchExercises, 300);
    return () => clearTimeout(debounce);
  }, [muscleGroup, category, search]);

  const handleSelect = (value: string | string[]) => {
    if (multiSelect) {
      const ids = Array.isArray(value) ? value : [];
      onSelect?.(ids);
    } else if (typeof value === 'string') {
      onSelect?.(value);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setMuscleGroup("All");
    setCategory("All");
  };

  const hasFilters = search || muscleGroup !== "All" || category !== "All";

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
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

        <div className="flex gap-2 flex-wrap">
          <Select value={muscleGroup} onValueChange={(v) => setMuscleGroup(v || 'All')}>
            <SelectTrigger className="w-36 bg-[#111118] border border-[#1e1e2a] text-sm text-[#a3a3aa] hover:text-white focus:ring-[#7c3aed] focus:border-none shadow-[0_1px_3px_rgba(0,0,0,0.4)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-all">
              <SelectValue placeholder="Muscle" />
            </SelectTrigger>
            <SelectContent className="bg-[#111118] border border-[#1e1e2a] text-[#a3a3aa] focus:text-white">
              {MUSCLE_GROUPS.map((mg) => (
                <SelectItem key={mg} value={mg}>{mg}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={(v) => setCategory(v || 'All')}>
            <SelectTrigger className="w-36 bg-[#111118] border border-[#1e1e2a] text-sm text-[#a3a3aa] hover:text-white focus:ring-[#7c3aed] focus:border-none shadow-[0_1px_3px_rgba(0,0,0,0.4)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-all">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-[#111118] border border-[#1e1e2a] text-[#a3a3aa] focus:text-white">
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-[#8a8a9a]">
        {loading ? "Loading..." : `${exercises.length} exercises found`}
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
      ) : exercises.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell className="w-8 h-8 text-[#5a5a6a] mx-auto mb-3" aria-hidden="true" />
          <p className="text-[#a3a3aa]">No exercises found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {exercises.map((exercise) => (
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
