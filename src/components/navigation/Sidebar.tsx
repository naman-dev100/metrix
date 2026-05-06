"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Dumbbell,
  Activity,
  BookOpen,
  Flame,
  ChevronFirst,
  ChevronLast,
  User,
  LogOut,
  Settings,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const navItems = [
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
    name: "History",
    href: "/history",
    icon: Flame,
    ariaLabel: "Navigate to Workout History",
  },
  {
    name: "Metrics",
    href: "/metrics",
    icon: LineChart,
    ariaLabel: "Navigate to Metrics",
  },
];

export default function Sidebar({ collapsed }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(collapsed || false);

  const user = session?.user;
  const isLoading = status === "loading";

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-gray-950 border-r border-gray-800 transition-all duration-300 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1e1e2a]">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#7c3aed] flex-shrink-0 animate-scale-in">
          <Dumbbell className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        {!isCollapsed && (
          <span className="text-xl font-bold text-white tracking-tight">
            Metrix
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={isActive ? `Current page: ${item.name}` : item.ariaLabel}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-[#7c3aed]/15 text-[#7c3aed]"
                  : "text-[#a3a3aa] hover:bg-[#16161f] hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive && "text-[#7c3aed]"
                )}
                aria-hidden="true"
              />
              {!isCollapsed && (
                <span className="font-medium">{item.name}</span>
              )}
              {!isCollapsed && isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      {!isCollapsed && user && (
        <div className="p-3 border-t border-[#1e1e2a]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 h-auto text-[#a3a3aa] hover:bg-[#16161f] hover:text-white"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-[#7c3aed] text-white text-sm">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white truncate">
                    {user.username || user.name || "User"}
                  </p>
                  <p className="text-xs text-[#8a8a9a] truncate">
                    {user.username ? `@${user.username}` : user.email}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="end"
              className="bg-[#0a0a0a] border-[#1a1a24] text-white"
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#1a1a24]" />
              <DropdownMenuItem className="hover:bg-[#16161f] cursor-pointer" onClick={() => window.location.href = '/profile'}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#16161f] cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1a1a24]" />
              <DropdownMenuItem
                className="hover:bg-[#16161f] cursor-pointer text-red-400"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Collapsed User Avatar */}
      {isCollapsed && user && (
        <div className="p-3 border-t border-[#1e1e2a] flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full hover:bg-[#16161f]"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-[#7c3aed] text-white text-sm">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="end"
              className="bg-[#0a0a0a] border-[#1a1a24] text-white"
            >
              <DropdownMenuLabel>{user.username || user.name || "User"}</DropdownMenuLabel>
              {user.username && (
                <p className="text-xs text-[#8a8a9a] px-2 pb-1">@{user.username}</p>
              )}
              <DropdownMenuSeparator className="bg-[#1a1a24]" />
              <DropdownMenuItem
                className="hover:bg-[#16161f] cursor-pointer text-red-400"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Collapse Button */}
      <div className="p-3 border-t border-[#1e1e2a]">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[#8a8a9a] hover:bg-[#16161f] hover:text-white transition-all"
        >
          {isCollapsed ? (
            <ChevronLast className="w-5 h-5" />
          ) : (
            <>
              <ChevronFirst className="w-5 h-5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
