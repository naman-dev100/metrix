"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Loader2, User, Mail, LogOut } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(session?.user?.username || "");
  const [isLoading, setIsLoading] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
      </div>
    );
  }

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  const user = session.user;

  const handleUpdateUsername = async () => {
    if (!username.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/user/set-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update username");
        setIsLoading(false);
        return;
      }

      toast.success("Username updated!");
      await update();
      setIsEditing(false);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-[#a3a3aa] mt-1">Manage your account settings</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Card */}
        <Card className="bg-[#0a0a0a] border-[#1a1a24]">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-[#7c3aed] text-white text-2xl">
                  {(user.username || user.name)?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-white text-2xl">
                  {user.username || user.name || "User"}
                </CardTitle>
                <CardDescription className="text-[#a3a3aa] mt-1">
                  {user.email}
                </CardDescription>
                {user.username && (
                  <Badge variant="secondary" className="mt-2 bg-[#1a1a24] text-[#7c3aed]">
                    @{user.username}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Account Details */}
        <Card className="bg-[#0a0a0a] border-[#1a1a24]">
          <CardHeader>
            <CardTitle className="text-white">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Username - Main Display Name */}
            <div className="flex items-center gap-3 p-3 bg-[#050505] rounded-lg">
              <User className="w-5 h-5 text-[#7c3aed]" />
              <div className="flex-1">
                <p className="text-xs text-[#8a8a9a] uppercase tracking-wider">Username (Display Name)</p>
                {isEditing ? (
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="flex-1 bg-[#0a0a0a] border border-[#1a1a24] rounded px-3 py-1 text-white text-sm"
                      placeholder="username"
                    />
                    <Button
                      size="sm"
                      onClick={handleUpdateUsername}
                      disabled={isLoading}
                      className="bg-[#7c3aed] hover:bg-[#6d28d9]"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-white">{user.username || "Not set"}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setUsername(user.username || "");
                        setIsEditing(true);
                      }}
                      className="text-[#7c3aed] hover:text-[#6d28d9]"
                    >
                      Edit
                    </Button>
                  </div>
                )}
                <p className="text-xs text-[#5a5a6a] mt-1">
                  This is your public display name. Must be unique across Metrix.
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 p-3 bg-[#050505] rounded-lg">
              <Mail className="w-5 h-5 text-[#7c3aed]" />
              <div className="flex-1">
                <p className="text-xs text-[#8a8a9a] uppercase tracking-wider">Email</p>
                <p className="text-white">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-[#0a0a0a] border-[#1a1a24] border-t-4 border-t-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => {
                signOut({ callbackUrl: "/login" });
              }}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
