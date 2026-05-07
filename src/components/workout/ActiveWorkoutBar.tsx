"use client";

import { useEffect, useRef, useState } from "react";
import { X, Play, Pause, Dumbbell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useWorkoutStore from "@/lib/workout-store";
import { formatDuration } from "@/lib/utils";

export default function ActiveWorkoutBar() {
  const router = useRouter();
  const isActive = useWorkoutStore((s) => s.isActive);
  const sessionId = useWorkoutStore((s) => s.sessionId);
  const elapsedSeconds = useWorkoutStore((s) => s.elapsedSeconds);
  const stopSession = useWorkoutStore((s) => s.stopSession);
  const tick = useWorkoutStore((s) => s.tick);

  const [restTimer, setRestTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Refs to avoid stale closures in interval
  const tickRef = useRef(tick);
  const restTimerRef = useRef(restTimer);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    tickRef.current = tick;
    restTimerRef.current = restTimer;
    isPausedRef.current = isPaused;
  });

  useEffect(() => {
    if (!isActive || isPausedRef.current || !sessionId) return;

    const interval = setInterval(() => {
      tickRef.current();
      setRestTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, sessionId, tick]);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30">
      <div className="bg-[#111118] border border-[#1e1e2a] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.6),_0_4px_12px_rgba(0,0,0,0.4)] px-4 py-2 flex items-center gap-3 animate-scale-in">
        {/* Clickable area - navigates to workout page */}
        <Link
          href="/workout"
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-4 h-4 text-[#7c3aed]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" aria-hidden="true" />
            <span className="text-white font-mono text-sm">
              {formatDuration(elapsedSeconds)}
            </span>
          </div>
        </Link>

        {/* Rest Timer */}
        {restTimer > 0 && (
          <span className="text-[#7c3aed] text-xs font-mono border-l border-[#1e1e2a] pl-3">
            {restTimer}s
          </span>
        )}

        {/* Controls */}
        <div className="flex items-center gap-1 border-l border-[#1e1e2a] pl-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? "Resume workout" : "Pause workout"}
            className="w-7 h-7 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center text-[#7c3aed] hover:bg-[#7c3aed]/30 transition-all"
          >
            {isPaused ? (
              <Play className="w-3 h-3" />
            ) : (
              <Pause className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={() => {
              stopSession();
              toast.info("Workout discarded");
            }}
            aria-label="Discard workout"
            className="w-7 h-7 rounded-full bg-[#ef4444]/20 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] hover:bg-[#ef4444]/30 transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
