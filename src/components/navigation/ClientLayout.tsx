"use client";

import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import ActiveWorkoutBar from "@/components/workout/ActiveWorkoutBar";
import useWorkoutStore from "@/lib/workout-store";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isActive = useWorkoutStore((s) => s.isActive);

  return (
    <>
      {/* Desktop Sidebar - only show when authenticated */}
      {isAuthenticated && (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 ${isAuthenticated ? 'md:ml-64' : ''} pb-20 md:pb-4`}>
        <div className="max-w-6xl mx-auto px-4 py-6 md:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav - only show when authenticated */}
      {isAuthenticated && <BottomNav />}

      {/* Active Workout Floating Bar */}
      <ActiveWorkoutBar />
    </>
  );
}
