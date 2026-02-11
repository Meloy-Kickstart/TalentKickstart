import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  CheckCircle,
  Building2,
  Users,
  GraduationCap,
  Rocket,
  Zap,
  Cpu,
  Code2
} from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, redirect to appropriate dashboard
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, onboarding_completed')
      .eq('id', user.id)
      .single()

    if (profile) {
      if (!(profile as any).onboarding_completed) {
        redirect('/onboarding')
      }
      if ((profile as any).role === 'student') {
        redirect('/student/dashboard')
      }
      if ((profile as any).role === 'startup') {
        redirect('/startup/dashboard')
      }
      if ((profile as any).role === 'admin') {
        redirect('/admin')
      }
    }
  }

  // Fetch some stats
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('is_available', true)

  const { count: startupCount } = await supabase
    .from('startups')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', true)

  const { count: roleCount } = await supabase
    .from('roles')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">

      {/* Ambient Background - Organic Floating Blobs */}
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-10">
        {/* Subtle grid for depth */}
        <div className="absolute inset-0 bg-tech-grid opacity-30"></div>

        {/* Soft organic blobs - slow floating motion */}
        <div className="absolute top-[-10%] left-[10%] w-[700px] h-[700px] blob-soft rounded-full animate-blob opacity-60"></div>
        <div className="absolute top-[20%] right-[5%] w-[500px] h-[500px] blob-maroon rounded-full animate-blob animation-delay-2000 opacity-50"></div>
        <div className="absolute bottom-[-5%] left-[30%] w-[600px] h-[600px] blob-gold rounded-full animate-blob animation-delay-4000 opacity-40"></div>
        <div className="absolute top-[50%] left-[-5%] w-[400px] h-[400px] blob-soft rounded-full animate-blob animation-delay-6000 opacity-50"></div>
      </div>

      {/* Floating Navbar - Liquid Glass */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="glass px-8 py-4 flex items-center justify-between w-full max-w-5xl animate-float" style={{ animationDuration: '18s' }}>
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="KickStart Talent"
              width={44}
              height={44}
              className="group-hover:scale-105 transition-all duration-500"
            />
            <span className="font-semibold text-lg text-[#500000]/90 group-hover:text-[#500000] transition-colors duration-300">KickStart Talent</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/roles">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-[#500000]/60 hover:text-[#500000] hover:bg-white/40">
                Browse Roles
              </Button>
            </Link>
            <div className="h-5 w-px bg-[#500000]/10 hidden sm:block"></div>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-[#500000]/60 hover:text-[#500000] hover:bg-white/40">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="btn-maroon-glass px-6">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-40">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">



            <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-10 leading-[1.05] text-[#1a0a0d]">
              Build the <br />
              <span className="text-liquid animate-liquid-text font-black tracking-tighter">
                IMPOSSIBLE
              </span>
            </h1>

            <p className="text-xl text-[#500000]/50 mb-14 max-w-2xl mx-auto leading-relaxed font-light">
              Join the elite network of Texas A&M builders, founders, and visionaries.
              Launch your career in the high-velocity world of startups.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/signup?role=student">
                <div className="group relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#500000]/20 to-[#a50034]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  <Button size="lg" className="relative h-16 px-12 bg-gradient-to-r from-[#500000] to-[#732222] hover:from-[#3d0000] hover:to-[#500000] text-white rounded-2xl flex items-center gap-3 text-lg font-medium shadow-xl shadow-[#500000]/15 border border-white/10 transition-all duration-500 hover:scale-[1.02]">
                    Find a Role <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </Link>
              <Link href="/signup?role=startup">
                <Button size="lg" variant="ghost" className="h-16 px-12 glass hover:bg-white/60 text-[#500000]/80 hover:text-[#500000] text-lg rounded-2xl transition-all duration-500">
                  Hire Talent <Building2 className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Stats - Floating Glass Cards */}
            <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { label: 'Students', value: studentCount || '100+', desc: 'Ready to build', delay: '0s' },
                { label: 'Startups', value: startupCount || '50+', desc: 'Hiring now', delay: '0.2s' },
                { label: 'Roles', value: roleCount || '100+', desc: 'Active opportunities', delay: '0.4s' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="glass p-8 text-center glass-hover group animate-float"
                  style={{ animationDelay: stat.delay, animationDuration: '7s' }}
                >
                  <div className="text-5xl font-bold text-[#500000] mb-2 group-hover:scale-105 transition-transform duration-500">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#500000]/50 font-medium uppercase tracking-widest mb-1">{stat.label}</div>
                  <div className="text-xs text-[#a50034]/50 font-mono">{stat.desc}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Feature Section - Students */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#500000]/10 to-transparent"></div>

        <div className="container px-4">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass">
                <GraduationCap className="h-4 w-4 text-[#500000]/70" />
                <span className="text-sm text-[#500000]/70 font-medium">For Students</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-[#1a0a0d] tracking-tight leading-[1.1]">
                Accelerate <br />
                <span className="text-gradient">Your Impact.</span>
              </h2>
              <p className="text-lg text-[#500000]/50 leading-relaxed font-light">
                Skip the career fair lines. Startups don't care about your GPA—they care about what you can ship. Build a profile that proves your worth.
              </p>

              <div className="space-y-4">
                {[
                  'Direct Founder Access',
                  'High-Growth Roles',
                  'Equity Opportunities',
                  'Real Responsibility'
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 glass p-5 glass-hover group cursor-default"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="h-11 w-11 rounded-2xl bg-[#500000]/5 flex items-center justify-center group-hover:bg-[#500000] transition-all duration-500">
                      <CheckCircle className="h-5 w-5 text-[#500000] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-[#1a0a0d]/80 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="glass-panel p-10 animate-float" style={{ animationDuration: '8s' }}>
                <div className="flex items-center gap-5 mb-10">
                  <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-[#500000] to-[#a50034] shadow-lg shadow-[#500000]/15"></div>
                  <div>
                    <div className="h-4 w-44 bg-[#500000]/10 rounded-lg mb-3"></div>
                    <div className="h-3 w-28 bg-[#500000]/5 rounded-lg"></div>
                  </div>
                </div>
                <div className="space-y-4 mb-10">
                  <div className="h-4 w-full bg-[#500000]/5 rounded-lg"></div>
                  <div className="h-4 w-5/6 bg-[#500000]/5 rounded-lg"></div>
                  <div className="h-4 w-4/6 bg-[#500000]/5 rounded-lg"></div>
                </div>
                <div className="inline-flex h-12 px-6 bg-[#500000]/10 rounded-xl border border-[#500000]/15 items-center justify-center text-[#500000] text-sm font-bold tracking-wide">
                  HIRED
                </div>

                {/* Floating accent */}
                <div className="absolute -top-8 -right-8 glass p-5 rounded-2xl animate-float" style={{ animationDelay: '1s', animationDuration: '6s' }}>
                  <Rocket className="h-7 w-7 text-[#500000]/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section - Startups */}
      <section className="py-40 relative">
        <div className="absolute right-[-10%] bottom-[20%] w-[600px] h-[600px] blob-gold rounded-full animate-blob opacity-40 -z-10"></div>

        <div className="container px-4">
          <div className="grid md:grid-cols-2 gap-24 items-center">

            <div className="relative order-2 md:order-1">
              <div className="glass-panel p-12 animate-float" style={{ animationDuration: '9s', animationDelay: '0.5s' }}>
                <div className="grid grid-cols-2 gap-5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass p-6 text-center hover:bg-white/60 transition-all duration-500 group">
                      <div className="h-12 w-12 mx-auto bg-[#500000]/5 rounded-2xl mb-5 flex items-center justify-center group-hover:bg-[#500000] transition-colors duration-500">
                        <Users className="h-6 w-6 text-[#500000]/50 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div className="h-2 w-20 mx-auto bg-[#500000]/10 rounded-lg group-hover:bg-[#500000]/15 transition-colors"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-12 order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass">
                <Building2 className="h-4 w-4 text-[#a50034]/70" />
                <span className="text-sm text-[#a50034]/70 font-medium">For Startups</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-[#1a0a0d] tracking-tight leading-[1.1]">
                Hire <span className="text-gradient-gold">Relentless</span> Talent.
              </h2>
              <p className="text-lg text-[#500000]/50 leading-relaxed font-light">
                Access a curated pool of ambitious Aggies who live to build.
                Filter by technical stack, project portfolio, and drive.
              </p>

              <div className="grid grid-cols-2 gap-5">
                {[
                  { icon: Zap, label: 'Speed to Hire', color: 'text-[#d4a574]' },
                  { icon: Code2, label: 'Vetted Skills', color: 'text-[#500000]' },
                ].map((feat, i) => (
                  <div key={i} className="glass p-8 text-center hover:bg-white/60 transition-all duration-500">
                    <feat.icon className={`h-9 w-9 mx-auto mb-5 ${feat.color} opacity-70`} />
                    <div className="font-medium text-[#1a0a0d]/80">{feat.label}</div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link href="/signup?role=startup">
                  <Button className="btn-maroon-glass rounded-2xl px-12 py-8 text-lg font-medium">
                    Start Hiring
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-48 relative text-center">
        <div className="container px-4">
          <div className="glass-panel max-w-5xl mx-auto p-20 md:p-28 relative overflow-hidden">

            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#500000]/3 via-transparent to-[#d4a574]/3 opacity-50"></div>

            <h2 className="text-5xl md:text-7xl font-bold mb-10 relative z-10 text-[#1a0a0d] tracking-tight">
              Ready to <span className="text-gradient">Launch?</span>
            </h2>
            <p className="text-xl text-[#500000]/50 mb-14 max-w-xl mx-auto relative z-10 font-light">
              Join the fastest growing network of builders at Texas A&M.
            </p>

            <div className="relative z-10">
              <Link href="/signup">
                <div className="group inline-block relative">
                  <div className="absolute -inset-3 bg-gradient-to-r from-[#500000]/15 to-[#a50034]/15 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  <Button size="lg" className="relative h-18 px-14 text-lg bg-gradient-to-r from-[#500000] to-[#732222] text-white hover:from-[#3d0000] hover:to-[#500000] rounded-2xl shadow-xl shadow-[#500000]/20 border border-white/10 transition-all duration-500 hover:scale-[1.02]">
                    Get Started
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Liquid Glass */}
      <footer className="border-t border-[#500000]/5 py-14 glass">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="KickStart Talent"
                width={44}
                height={44}
              />
              <span className="font-semibold text-xl text-[#500000]/80">KickStart Talent</span>
            </div>

            <div className="flex gap-12 text-sm font-medium text-[#500000]/40">
              <Link href="/roles" className="hover:text-[#500000] transition-colors duration-300 uppercase tracking-widest text-xs">Roles</Link>
              <Link href="/startups" className="hover:text-[#500000] transition-colors duration-300 uppercase tracking-widest text-xs">Startups</Link>
              <Link href="/students" className="hover:text-[#500000] transition-colors duration-300 uppercase tracking-widest text-xs">Students</Link>
              <Link href="https://meloykickstart.tech/" className="hover:text-[#500000] transition-colors duration-300 uppercase tracking-widest text-xs">Contact</Link>
            </div>

            <p className="text-xs text-[#500000]/30 font-mono">
              © {new Date().getFullYear()} Meloy Kickstart.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
