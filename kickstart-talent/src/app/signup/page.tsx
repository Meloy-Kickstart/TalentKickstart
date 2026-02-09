"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signUp } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, GraduationCap, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

function SignUpForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') as 'student' | 'startup' | null
  const [selectedRole, setSelectedRole] = useState<'student' | 'startup'>(defaultRole || 'student')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(null)

    formData.set('role', selectedRole)
    const result = await signUp(formData)

    if (result?.redirect) {
      router.push(result.redirect)
      return
    }
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      setSuccess(result.success)
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md glass">
      <CardHeader className="text-center">
        <Link href="/" className="flex items-center justify-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-white font-bold border border-purple-500/30">
            MK
          </div>
        </Link>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Join Meloy Kickstart to connect with opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-950/30 border border-red-900/50 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-green-950/30 border border-green-900/50 p-3 text-sm text-green-400">
              {success}
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-2">
            <Label>I am a...</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                  selectedRole === 'student'
                    ? "border-pink-500/50 bg-pink-500/10"
                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                )}
              >
                <GraduationCap className={cn(
                  "h-6 w-6",
                  selectedRole === 'student' ? "text-pink-400" : "text-gray-400"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  selectedRole === 'student' ? "text-pink-300" : "text-gray-400"
                )}>
                  Student
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('startup')}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                  selectedRole === 'startup'
                    ? "border-purple-500/50 bg-purple-500/10"
                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                )}
              >
                <Building2 className={cn(
                  "h-6 w-6",
                  selectedRole === 'startup' ? "text-purple-400" : "text-gray-400"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  selectedRole === 'startup' ? "text-purple-300" : "text-gray-400"
                )}>
                  Startup
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              required
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@tamu.edu"
              required
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              minLength={8}
              required
              className="bg-white/5 border-white/10"
            />
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !!success} variant="liquid">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>

        <div className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-pink-400 hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      {/* Background Ambience */}
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl mix-blend-screen"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl mix-blend-screen"></div>
      </div>

      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  )
}
