import {
  LayoutDashboard,
  Activity,
  BookOpen,
  LineChart,
} from "lucide-react";

export const navItems = [
  {
    name: "Home",
    href: "/",
    icon: LayoutDashboard,
    ariaLabel: "Navigate to Dashboard Home",
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
] as const;

