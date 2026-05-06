import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/navigation/ClientLayout";
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
          <ClientLayout>{children}</ClientLayout>

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
