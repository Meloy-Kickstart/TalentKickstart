"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { getInitials } from "@/lib/utils"
import { LogOut, User, Settings, Building2, LayoutDashboard } from "lucide-react"

interface NavbarProps {
  user?: {
    id: string
    email: string
    fullName?: string | null
    avatarUrl?: string | null
    role: 'student' | 'startup' | 'admin'
  } | null
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'student':
        return '/student/dashboard'
      case 'startup':
        return '/startup/dashboard'
      case 'admin':
        return '/admin'
      default:
        return '/'
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#500000]/10 glass">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="KickStart Talent"
              width={40}
              height={40}
              className="group-hover:scale-105 transition-transform"
            />
            <span className="font-bold text-lg text-[#500000] group-hover:text-[#732222] transition-colors">KickStart Talent</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-6">
              {user.role === 'student' && (
                <>
                  <Link
                    href="/student/dashboard"
                    className={`text-sm transition-colors ${pathname === '/student/dashboard' ? 'text-[#500000] font-medium' : 'text-[#500000]/80 hover:text-[#500000]'}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/roles"
                    className={`text-sm transition-colors ${pathname === '/roles' ? 'text-[#500000] font-medium' : 'text-[#500000]/80 hover:text-[#500000]'}`}
                  >
                    Browse Roles
                  </Link>
                  <Link
                    href="/startups"
                    className={`text-sm transition-colors ${pathname === '/startups' ? 'text-[#500000] font-medium' : 'text-[#500000]/80 hover:text-[#500000]'}`}
                  >
                    Startups
                  </Link>
                </>
              )}
              {user.role === 'startup' && (
                <>
                  <Link
                    href="/startup/dashboard"
                    className={`text-sm transition-colors ${pathname === '/startup/dashboard' ? 'text-[#500000] font-medium' : 'text-[#500000]/80 hover:text-[#500000]'}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/startup/roles"
                    className={`text-sm transition-colors ${pathname.startsWith('/startup/roles') ? 'text-[#500000] font-medium' : 'text-[#500000]/80 hover:text-[#500000]'}`}
                  >
                    My Roles
                  </Link>
                  <Link
                    href="/talent"
                    className={`text-sm transition-colors ${pathname === '/talent' ? 'text-[#500000] font-medium' : 'text-[#500000]/80 hover:text-[#500000]'}`}
                  >
                    Browse Talent
                  </Link>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <Link
                    href="/admin"
                    className={`text-sm transition-colors ${pathname === '/admin' ? 'text-[#500000] font-medium' : 'text-[#500000]/80 hover:text-[#500000]'}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/startups"
                    className={`text-sm transition-colors ${pathname === '/admin/startups' ? 'text-[#500000] font-medium' : 'text-[#500000]/80 hover:text-[#500000]'}`}
                  >
                    Startups
                  </Link>
                  <Link
                    href="/students"
                    className={`text-sm transition-colors ${pathname === '/students' ? 'text-[#500000] font-medium' : 'text-[#500000]/80 hover:text-[#500000]'}`}
                  >
                    Students
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-[#500000]/10 hover:border-[#500000]/20">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName || user.email} />
                    <AvatarFallback className="bg-gradient-to-br from-[#500000] to-[#732222] text-white font-medium">
                      {getInitials(user.fullName || user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass border-[#500000]/10" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.fullName && (
                      <p className="font-medium text-[#1a0a0d]">{user.fullName}</p>
                    )}
                    <p className="text-xs text-[#500000]/80">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-[#500000]/10" />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()} className="cursor-pointer text-[#500000]/80 hover:text-[#500000] hover:bg-[#500000]/5">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {user.role === 'student' && (
                  <DropdownMenuItem asChild>
                    <Link href="/student/profile" className="cursor-pointer text-[#500000]/80 hover:text-[#500000] hover:bg-[#500000]/5">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === 'startup' && (
                  <DropdownMenuItem asChild>
                    <Link href="/startup/profile" className="cursor-pointer text-[#500000]/80 hover:text-[#500000] hover:bg-[#500000]/5">
                      <Building2 className="mr-2 h-4 w-4" />
                      Company Profile
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer text-[#500000]/80 hover:text-[#500000] hover:bg-[#500000]/5">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#500000]/10" />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 hover:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
