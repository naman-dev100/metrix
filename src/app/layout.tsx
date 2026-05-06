import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientLayout from "@/components/navigation/ClientLayout";
import { Toaster } from "@/components/ui/sonner";
import SessionWrapper from "@/components/auth/SessionWrapper";

export const metadata: Metadata = {
  title: "Metrix - Workout Tracker",
  description: "Track your workouts, monitor progress, and crush your fitness goals.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Metrix",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
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
