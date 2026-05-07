import {
  LayoutDashboard,
  Dumbbell,
  Activity,
  BookOpen,
  History,
  LineChart,
} from "lucide-react";

export const navItems = [
  {
    name: "Dashboard",
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
    name: "Metrics",
    href: "/metrics",
    icon: LineChart,
    ariaLabel: "Navigate to Metrics",
  },
  {
    name: "History",
    href: "/history",
    icon: History,
    ariaLabel: "Navigate to Workout History",
  },
] as const;
