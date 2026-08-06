"use client"

import Link from "next/link"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { PasswordInput } from "@/presentation/components/ui/password-input"
import { Label } from "@/presentation/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import * as React from "react"
import { useSearchParams } from "next/navigation"
import { SynclyLogo } from "@/presentation/components/syncly-logo"

export default function SignupPageClient() {
  const [isLoading, setIsLoading] = React.useState(false)
  const searchParams = useSearchParams()
  const defaultEmail = searchParams.get("email") || ""
  const next = searchParams.get("next") || "/"

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-[440px] space-y-8">
        <div className="flex justify-center">
          <SynclyLogo size={44} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="space-y-2 text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>

          <form
            className="space-y-6"
            onSubmit={async (e) => {
              e.preventDefault()
              setIsLoading(true)
              const formData = new FormData(e.currentTarget)
              const name = formData.get("full-name")
              const email = formData.get("email")
              const password = formData.get("password")
              const confirmPassword = formData.get("confirm-password")

              if (password !== confirmPassword) {
                toast.error("Passwords do not match", {
                  description: "Please make sure your passwords match.",
                })
                setIsLoading(false)
                return
              }

              try {
                const res = await fetch("/api/auth/signup", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, email, password }),
                })

                const data = await res.json()
                if (res.ok) {
                  toast.success("Account created", {
                    description: "Your account has been created successfully.",
                  })
                  window.location.href = `/auth/login?email=${encodeURIComponent(String(email || ""))}&next=${encodeURIComponent(next)}`
                } else {
                  toast.error("Signup failed", {
                    description: data.error || "Please try again later.",
                  })
                }
              } catch (error) {
                console.error("Signup error:", error)
                toast.error("Something went wrong", {
                  description: "Please try again later.",
                })
              } finally {
                setIsLoading(false)
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" name="full-name" placeholder="Vickie Kilback" required className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={defaultEmail} placeholder="Gilbert25@hotmail.com" required className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput id="password" name="password" placeholder="••••••••" required className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <PasswordInput id="confirm-password" name="confirm-password" placeholder="••••••••" required className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors" />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Must be at least 6 characters long.
            </p>

            <Button type="submit" disabled={isLoading} className="w-full h-11 text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
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
