"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";

export default function SetupUsernamePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not logged in
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // Redirect if already has username
  if (session?.user?.username) {
    router.push("/dashboard");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/user/set-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to set username");
        setIsLoading(false);
        return;
      }

      toast.success("Username set successfully!");
      await update(); // Refresh session
      router.push("/dashboard");
    } catch (error) {
      console.error("Set username error:", error);
      setError("Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-[#0a0a0a] border-[#1a1a24] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
            <User className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Choose a Username
          </CardTitle>
          <CardDescription className="text-[#a3a3aa]">
            This will be displayed on your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs uppercase tracking-widest font-semibold text-[#b0b0b8]">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6a]" />
                <Input
                  id="username"
                  type="text"
                  placeholder="your_username"
                  className="pl-10 bg-[#050505] border-[#1a1a24] text-white focus:ring-[#7c3aed]"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
              <p className="text-xs text-[#5a5a6a]">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] hover:from-[#7c3aed] hover:to-[#5b21b6] text-white h-11 font-semibold shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
