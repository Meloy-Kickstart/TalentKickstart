'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signIn } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await signIn(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.redirect) {
      router.push(result.redirect)
      router.refresh()
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden font-sans flex items-center justify-center px-4">

      {/* Ambient Background Blobs */}
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute inset-0 bg-tech-grid opacity-30"></div>
        <div className="absolute top-[-15%] left-[5%] w-[600px] h-[600px] blob-soft rounded-full animate-blob opacity-60"></div>
        <div className="absolute top-[30%] right-[-5%] w-[500px] h-[500px] blob-maroon rounded-full animate-blob animation-delay-2000 opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[40%] w-[550px] h-[550px] blob-gold rounded-full animate-blob animation-delay-4000 opacity-40"></div>
      </div>

      {/* Floating Nav */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="glass px-8 py-4 flex items-center justify-between w-full max-w-5xl">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="KickStart Talent"
              width={40}
              height={40}
              className="group-hover:scale-105 transition-all duration-500"
            />
            <span className="font-semibold text-lg text-[#500000]/90 group-hover:text-[#500000] transition-colors duration-300">
              KickStart Talent
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/signup">
              <Button size="sm" className="btn-maroon-glass px-6">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel p-10 md:p-12 relative overflow-hidden">
          
          {/* Subtle gradient overlay inside card */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#500000]/[0.02] via-transparent to-[#d4a574]/[0.02] pointer-events-none"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-[#500000] to-[#a50034] shadow-lg shadow-[#500000]/20 mb-6">
                <ArrowRight className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-[#1a0a0d] tracking-tight mb-2">
                Welcome <span className="text-gradient">Back</span>
              </h1>
              <p className="text-[#500000]/50 text-sm font-light">
                Sign in to continue building the impossible.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 text-sm text-center font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-[#500000]/70 text-xs font-semibold uppercase tracking-widest">
                  Email
                </Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@tamu.edu"
                  className="h-12 rounded-xl text-sm px-4"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-[#500000]/70 text-xs font-semibold uppercase tracking-widest">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="h-12 rounded-xl text-sm px-4 pr-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#500000]/40 hover:text-[#500000]/70 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-13 text-base font-medium btn-maroon-glass rounded-xl mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-[#500000]/40">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="text-[#500000] font-semibold hover:text-[#732222] transition-colors underline underline-offset-4"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
