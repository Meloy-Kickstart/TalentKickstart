'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GraduationCap, Building2, Eye, EyeOff, Loader2, Sparkles, CheckCircle } from 'lucide-react'

function SignupForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const preselectedRole = searchParams.get('role') as 'student' | 'startup' | null

	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [role, setRole] = useState<'student' | 'startup'>(preselectedRole || 'student')

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)
		setSuccess(null)
		setLoading(true)

		const formData = new FormData(e.currentTarget)
		formData.set('role', role)
		formData.set('fullName', formData.get('name') as string)

		const result = await signUp(formData)

		if (result.error) {
			setError(result.error)
			setLoading(false)
		} else if (result.redirect) {
			router.push(result.redirect)
			router.refresh()
		} else if (result.success) {
			setSuccess(result.success)
			setLoading(false)
		}
	}

	return (
		<div className="w-full max-w-lg relative z-10">
			<div className="glass-panel p-10 md:p-12 relative overflow-hidden">

				{/* Subtle gradient overlay inside card */}
				<div className="absolute inset-0 bg-gradient-to-br from-[#500000]/[0.02] via-transparent to-[#d4a574]/[0.02] pointer-events-none"></div>

				<div className="relative z-10">
					{/* Header */}
					<div className="text-center mb-10">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-[#500000] to-[#a50034] shadow-lg shadow-[#500000]/20 mb-6">
							<Sparkles className="h-7 w-7 text-white" />
						</div>
						<h1 className="text-3xl font-bold text-[#1a0a0d] tracking-tight mb-2">
							Join the <span className="text-gradient">Movement</span>
						</h1>
						<p className="text-[#500000]/50 text-sm font-light">
							Create your account and start building the impossible.
						</p>
					</div>

					{/* Success Message */}
					{success && (
						<div className="mb-6 p-5 rounded-2xl bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/50 text-emerald-700 text-sm text-center font-medium flex items-center justify-center gap-2">
							<CheckCircle className="h-5 w-5" />
							{success}
						</div>
					)}

					{/* Error Message */}
					{error && (
						<div className="mb-6 p-4 rounded-2xl bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 text-sm text-center font-medium">
							{error}
						</div>
					)}

					{/* Role Toggle */}
					<div className="mb-8">
						<Label className="text-[#500000]/70 text-xs font-semibold uppercase tracking-widest mb-3 block">
							I am a...
						</Label>
						<div className="grid grid-cols-2 gap-3">
							<button
								type="button"
								onClick={() => setRole('student')}
								className={`group relative flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-500 cursor-pointer ${role === 'student'
										? 'bg-gradient-to-br from-[#500000] to-[#732222] text-white border-[#500000]/30 shadow-lg shadow-[#500000]/15'
										: 'glass text-[#500000]/70 hover:bg-white/60 border-white/60'
									}`}
							>
								<GraduationCap className={`h-5 w-5 transition-colors ${role === 'student' ? 'text-white' : 'text-[#500000]/50'}`} />
								<span className="font-semibold text-sm">Student</span>
							</button>
							<button
								type="button"
								onClick={() => setRole('startup')}
								className={`group relative flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-500 cursor-pointer ${role === 'startup'
										? 'bg-gradient-to-br from-[#500000] to-[#732222] text-white border-[#500000]/30 shadow-lg shadow-[#500000]/15'
										: 'glass text-[#500000]/70 hover:bg-white/60 border-white/60'
									}`}
							>
								<Building2 className={`h-5 w-5 transition-colors ${role === 'startup' ? 'text-white' : 'text-[#500000]/50'}`} />
								<span className="font-semibold text-sm">Startup</span>
							</button>
						</div>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="space-y-2">
							<Label htmlFor="signup-name" className="text-[#500000]/70 text-xs font-semibold uppercase tracking-widest">
								Full Name
							</Label>
							<Input
								id="signup-name"
								name="name"
								type="text"
								required
								placeholder="Jane Doe"
								className="h-12 rounded-xl text-sm px-4"
								autoComplete="name"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="signup-email" className="text-[#500000]/70 text-xs font-semibold uppercase tracking-widest">
								Email
							</Label>
							<Input
								id="signup-email"
								name="email"
								type="email"
								required
								placeholder="you@tamu.edu"
								className="h-12 rounded-xl text-sm px-4"
								autoComplete="email"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="signup-password" className="text-[#500000]/70 text-xs font-semibold uppercase tracking-widest">
								Password
							</Label>
							<div className="relative">
								<Input
									id="signup-password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									required
									placeholder="••••••••"
									className="h-12 rounded-xl text-sm px-4 pr-12"
									autoComplete="new-password"
									minLength={6}
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
							<p className="text-xs text-[#500000]/30 mt-1">Minimum 6 characters</p>
						</div>

						<Button
							type="submit"
							disabled={loading}
							className="w-full h-13 text-base font-medium btn-maroon-glass rounded-xl mt-2"
						>
							{loading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Creating account...
								</>
							) : (
								<>
									Create Account
									<Sparkles className="h-4 w-4 ml-2" />
								</>
							)}
						</Button>
					</form>

					{/* Footer Link */}
					<div className="mt-8 text-center">
						<p className="text-sm text-[#500000]/40">
							Already have an account?{' '}
							<Link
								href="/login"
								className="text-[#500000] font-semibold hover:text-[#732222] transition-colors underline underline-offset-4"
							>
								Log in
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default function SignupPage() {
	return (
		<div className="relative min-h-screen overflow-hidden font-sans flex items-center justify-center px-4 py-24">

			{/* Ambient Background Blobs */}
			<div className="fixed inset-0 w-full h-full pointer-events-none -z-10">
				<div className="absolute inset-0 bg-tech-grid opacity-30"></div>
				<div className="absolute top-[-10%] right-[10%] w-[700px] h-[700px] blob-soft rounded-full animate-blob opacity-60"></div>
				<div className="absolute top-[40%] left-[-5%] w-[450px] h-[450px] blob-maroon rounded-full animate-blob animation-delay-2000 opacity-50"></div>
				<div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] blob-gold rounded-full animate-blob animation-delay-4000 opacity-40"></div>
				<div className="absolute top-[10%] left-[30%] w-[350px] h-[350px] blob-soft rounded-full animate-blob animation-delay-6000 opacity-30"></div>
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
						<Link href="/login">
							<Button variant="ghost" size="sm" className="text-[#500000]/60 hover:text-[#500000] hover:bg-white/40">
								Log in
							</Button>
						</Link>
					</div>
				</div>
			</nav>

			{/* Signup Form wrapped in Suspense for useSearchParams */}
			<Suspense fallback={
				<div className="w-full max-w-lg relative z-10">
					<div className="glass-panel p-10 md:p-12 flex items-center justify-center min-h-[400px]">
						<Loader2 className="h-8 w-8 animate-spin text-[#500000]/40" />
					</div>
				</div>
			}>
				<SignupForm />
			</Suspense>
		</div>
	)
}
