"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Dumbbell, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import useWorkoutStore, { useWorkoutStoreSafe } from "@/lib/workout-store";
import { formatDuration } from "@/lib/utils";

export default function ActiveWorkoutBar() {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = useWorkoutStoreSafe((s) => s.isActive, false);
  const sessionId = useWorkoutStoreSafe((s) => s.sessionId, null);
  const elapsedSeconds = useWorkoutStoreSafe((s) => s.elapsedSeconds, 0);
  const routineName = useWorkoutStoreSafe((s) => s.routineName, null);
  const stopSession = useWorkoutStore((s) => s.stopSession);
  const tick = useWorkoutStore((s) => s.tick);

  const [isPaused, setIsPaused] = useState(false);

  // Refs to avoid stale closures in interval
  const tickRef = useRef(tick);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    tickRef.current = tick;
    isPausedRef.current = isPaused;
  });

  useEffect(() => {
    if (!isActive || isPausedRef.current || !sessionId) return;

    const interval = setInterval(() => {
      tickRef.current();
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, sessionId, tick]);

  // Notification management for mobile / active workout
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }

    // Request notification permission if workout is active and permission is default
    if (isActive && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const showOrUpdateNotification = async () => {
      if (Notification.permission !== "granted") return;

      try {
        const reg = await navigator.serviceWorker.ready;
        const minutes = Math.floor(elapsedSeconds / 60);
        const timeStr = minutes > 0 ? ` (${minutes}m)` : "";

        await reg.showNotification("Active Workout", {
          body: `${routineName || "Quick Workout"} in progress${timeStr}`,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-192x192.png",
          tag: "active-workout-session",
          silent: true,  // Do not play sound/vibrate on update
          requireInteraction: true,
          ...({ ongoing: true } as any), // Android persistent notification (non-standard option)
        } as any);
      } catch (err) {
        console.error("Failed to show notification:", err);
      }
    };

    const closeNotification = async () => {
      if (Notification.permission !== "granted") return;
      try {
        const reg = await navigator.serviceWorker.ready;
        const notifications = await reg.getNotifications({ tag: "active-workout-session" });
        notifications.forEach((notification) => notification.close());
      } catch (err) {
        console.error("Failed to close notification:", err);
      }
    };

    if (isActive && sessionId) {
      // Show/update notification when active
      // To avoid constant spamming, only show at start and update every 60 seconds (when seconds = 0)
      if (elapsedSeconds === 0 || elapsedSeconds % 60 === 0) {
        showOrUpdateNotification();
      }
    } else {
      // Close notification when workout is not active
      closeNotification();
    }
  }, [isActive, sessionId, elapsedSeconds, routineName]);

  if (!isActive || pathname === "/workout") return null;

  return (
    <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-30 md:bottom-6">
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

        {/* Controls */}
        <div className="flex items-center gap-1 border-l border-[#1e1e2a] pl-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? "Resume workout" : "Pause workout"}
            className="w-7 h-7 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center text-[#7c3aed] hover:bg-[#7c3aed]/30 transition-all cursor-pointer"
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
            className="w-7 h-7 rounded-full bg-[#ef4444]/20 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] hover:bg-[#ef4444]/30 transition-all cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
