"use client";

import { useEffect, useState } from "react";
import { X, Play, Pause } from "lucide-react";
import useWorkoutStore from "@/lib/workout-store";
import { formatDuration } from "@/lib/utils";

export default function ActiveWorkoutBar() {
  const isActive = useWorkoutStore((s) => s.isActive);
  const sessionId = useWorkoutStore((s) => s.sessionId);
  const elapsedSeconds = useWorkoutStore((s) => s.elapsedSeconds);
  const stopSession = useWorkoutStore((s) => s.stopSession);
  const tick = useWorkoutStore((s) => s.tick);

  const [restTimer, setRestTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isActive || isPaused || !sessionId) return;

    const interval = setInterval(() => {
      tick();
      setRestTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, sessionId, tick]);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30">
      <div className="bg-[#111118] border border-[#1e1e2a] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.6),_0_4px_12px_rgba(0,0,0,0.4)] px-4 py-2 flex items-center gap-4 animate-scale-in">
        {/* Rest Timer */}
        {restTimer > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[#7c3aed] font-bold text-sm font-mono">
              {restTimer}s
            </span >
            <span className="text-[#7c3aed]/60 text-xs uppercase tracking-wider">rest</span >
          </div>
        )}

        {/* Timer */}
        <div className="flex items-center gap-2">
          <span className="text-white font-mono text-sm">
            {formatDuration(elapsedSeconds)}
          </span >
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? "Resume workout" : "Pause workout"}
            className="w-8 h-8 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center text-[#7c3aed] hover:bg-[#7c3aed]/30 transition-all"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" aria-hidden="true" /> : <Pause className="w-3.5 h-3.5" aria-hidden="true" />}
          </button>
          <button
            onClick={stopSession}
            aria-label="Stop workout session"
            className="w-8 h-8 rounded-full bg-[#ef4444]/20 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] hover:bg-[#ef4444]/30 transition-all"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
