import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/navigation/Sidebar";
import BottomNav from "@/components/navigation/BottomNav";
import ActiveWorkoutBar from "@/components/workout/ActiveWorkoutBar";
import { Toaster } from "@/components/ui/sonner";
import SessionWrapper from "@/components/auth/SessionWrapper";

export const metadata: Metadata = {
  title: "Metrix - Workout Tracker",
  description: "Track your workouts, monitor progress, and crush your fitness goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased dark:bg-background dark:text-white dark:font-['Outfit']">
        <SessionWrapper>
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 md:ml-64 pb-20 md:pb-4">
            <div className="max-w-6xl mx-auto px-4 py-6 md:px-8">
              {children}
            </div>
          </main>

          {/* Mobile Bottom Nav */}
          <BottomNav />

          {/* Active Workout Floating Bar */}
          <ActiveWorkoutBar />

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1F2937",
                border: "1px solid #374151",
                color: "#fff",
              },
            }}
          />
        </SessionWrapper>
      </body>
    </html>
  );
}
