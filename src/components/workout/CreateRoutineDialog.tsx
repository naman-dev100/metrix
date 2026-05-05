"use client";

import { useState, useEffect } from "react";
import { X, Plus, Search, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ExerciseCard from "@/components/exercises/ExerciseCard";

interface CreateRoutineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, notes: string, exerciseIds: string[]) => Promise<void>;
}

export default function CreateRoutineDialog({ open, onOpenChange, onCreate }: CreateRoutineDialogProps) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchExercises();
      setName("");
      setNotes("");
      setSearch("");
      setSelectedExercises([]);
    }
  }, [open]);

  useEffect(() => {
    if (search) {
      const filtered = filteredExercises.filter((ex) =>
        ex.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredExercises(filtered);
    } else {
      setFilteredExercises(filteredExercises);
    }
  }, [search, filteredExercises]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exercises");
      const data = await res.json();
      setFilteredExercises(data);
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return;

    await onCreate(name, notes, selectedExercises);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="bg-[#111118] border border-[#1e1e2a] rounded-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.6),_0_8px_24px_-4px_rgba(0,0,0,0.4)] w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e1e2a]">
          <h2 id="dialog-title" className="text-lg font-semibold text-white">Create Routine</h2>
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
            <Input
              placeholder="Routine name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#16161f] border-[#1e1e2a] text-white placeholder-[#5a5a6a] focus:ring-[#7c3aed] h-10"
              aria-label="Routine name"
            />
            <Input
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-[#16161f] border-[#1e1e2a] text-white placeholder-[#5a5a6a] focus:ring-[#7c3aed] h-10"
              aria-label="Notes for routine"
            />
          </div>

          {/* Search */}
          <div className="p-4 border-b border-[#1e1e2a]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6a]" />
              <Input
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#16161f] border-[#1e1e2a] text-white placeholder-[#5a5a6a] focus:ring-[#7c3aed] pl-10 h-10"
                aria-label="Search exercises"
              />
            </div>
          </div>

          {/* Exercise Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#111118] border border-[#1e1e2a] rounded-xl h-40 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-center py-12">
                <Dumbbell className="w-8 h-8 text-[#5a5a6a] mx-auto mb-3" />
                <p className="text-[#8a8a9a]">No exercises found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              {selectedExercises.length} exercises selected
            </p>
            <Button
              onClick={handleCreate}
              aria-label="Create new routine"
              disabled={!name.trim() || selectedExercises.length === 0}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Routine
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
