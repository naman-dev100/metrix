import {
  LayoutDashboard,
  Activity,
  History,
  BookOpen,
  LineChart,
  User,
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
    name: "History",
    href: "/history",
    icon: History,
    ariaLabel: "Navigate to Workout History",
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
    name: "Profile",
    href: "/profile",
    icon: User,
    ariaLabel: "Navigate to Profile",
  },
] as const;
