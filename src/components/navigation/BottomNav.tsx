"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  Activity,
  BookOpen,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: LayoutDashboard,
    ariaLabel: "Navigate to Dashboard",
  },
  {
    name: "Workout",
    href: "/workout",
    icon: Activity,
    ariaLabel: "Navigate to Workout page",
  },
  {
    name: "Exercises",
    href: "/exercises",
    icon: BookOpen,
    ariaLabel: "Navigate to Exercise Library",
  },
  {
    name: "History",
    href: "/history",
    icon: Flame,
    ariaLabel: "Navigate to Workout History",
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-sm border-t border-[#1e1e2a] md:hidden">
      <div className="flex items-center justify-around py-2 px-1 animate-slide-in">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={isActive ? `Current page: ${item.name}` : item.ariaLabel}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 min-w-[60px]",
                isActive
                  ? "text-[#7c3aed]"
                  : "text-[#a3a3aa] hover:text-white"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-all",
                  isActive && "bg-[#7c3aed]/15"
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
