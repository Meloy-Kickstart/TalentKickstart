import { Navbar } from "./navbar"
import { Footer } from "./footer"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    id: string
    email: string
    fullName?: string | null
    avatarUrl?: string | null
    role: 'student' | 'startup' | 'admin'
  } | null
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar user={user} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
