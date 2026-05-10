"use client"

import Link from "next/link"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { PasswordInput } from "@/presentation/components/ui/password-input"
import { Label } from "@/presentation/components/ui/label"
import { Apple, Chrome } from "lucide-react"

import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import * as React from "react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-[440px] space-y-8">
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="space-y-2 text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Login with your Apple or Google account
            </p>
          </div>

          <div className="grid gap-3 mb-8">
            <Button variant="outline" className="h-11 bg-background/50 border-border/50 hover:bg-accent/50 transition-all font-medium">
              <Apple className="mr-2 h-4 w-4" />
              Login with Apple
            </Button>
            <Button variant="outline" className="h-11 bg-background/50 border-border/50 hover:bg-accent/50 transition-all font-medium">
              <Chrome className="mr-2 h-4 w-4" />
              Login with Google
            </Button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <form 
            className="space-y-6" 
            onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);
              const formData = new FormData(e.currentTarget);
              const email = formData.get("email");
              const password = formData.get("password");

              try {
                const res = await fetch("/api/auth/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password }),
                });

                const data = await res.json();
                if (res.ok) {
                  localStorage.setItem("syncly_user", JSON.stringify(data.user));
                  toast.success("Login successful", {
                    description: "You have been logged in.",
                  })
                  window.location.href = "/";
                } else {
                  toast.error("Login failed", {
                    description: data.error || "Invalid credentials",
                  })
                }
              } catch (error) {
                console.error("Login error:", error);
                toast.error("Something went wrong", {
                  description: "Please try again later.",
                })
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="noufalrahim6784@gmail.com" required className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Forgot your password?
                </Link>
              </div>
              <PasswordInput id="password" name="password" placeholder="••••••••" required className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors" />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11 text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/auth/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground leading-relaxed px-4">
          By clicking continue, you agree to our{" "}
          <Link href="#" className="underline underline-offset-4 hover:text-primary transition-colors">Terms of Service</Link>{" "}
          and{" "}
          <Link href="#" className="underline underline-offset-4 hover:text-primary transition-colors">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  )
}
