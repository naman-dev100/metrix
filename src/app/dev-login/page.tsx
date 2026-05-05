"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function DevLoginPage() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password.", {
          icon: <AlertCircle className="w-4 h-4" />,
        });
        setIsLoading(false);
      } else if (result?.ok) {
        toast.success("Login successful! Redirecting...");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("SignIn error:", error);
      toast.error("Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#050505]">
      <Card className="w-full max-w-md bg-[#0a0a0a] border-[#1a1a24]">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Developer Login</CardTitle>
          <CardDescription className="text-[#a3a3aa]">
            Credentials login for testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In (Dev)"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="/login" className="text-xs text-[#5a5a6a] hover:text-[#7c3aed]">
              ← Back to Google Sign-In
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
