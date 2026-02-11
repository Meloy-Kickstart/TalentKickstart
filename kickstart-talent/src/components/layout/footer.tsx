import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-[#500000]/10 glass">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <Image
                src="/logo.png"
                alt="KickStart Talent"
                width={40}
                height={40}
                className="group-hover:scale-105 transition-transform"
              />
              <span className="font-bold text-[#500000] group-hover:text-[#732222] transition-colors">KickStart Talent</span>
            </Link>
            <p className="text-sm text-[#500000]/60">
              Connecting Texas A&M students with early-stage startups for meaningful work opportunities.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-[#1a0a0d] mb-4">For Students</h3>
            <ul className="space-y-2 text-sm text-[#500000]/60">
              <li>
                <Link href="/roles" className="hover:text-[#500000] transition-colors">
                  Browse Roles
                </Link>
              </li>
              <li>
                <Link href="/startups" className="hover:text-[#500000] transition-colors">
                  Explore Startups
                </Link>
              </li>
              <li>
                <Link href="/signup?role=student" className="hover:text-[#500000] transition-colors">
                  Create Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-[#1a0a0d] mb-4">For Startups</h3>
            <ul className="space-y-2 text-sm text-[#500000]/60">
              <li>
                <Link href="/talent" className="hover:text-[#500000] transition-colors">
                  Browse Talent
                </Link>
              </li>
              <li>
                <Link href="/signup?role=startup" className="hover:text-[#500000] transition-colors">
                  Post a Role
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-[#1a0a0d] mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-[#500000]/60">
              <li>
                <Link href="/about" className="hover:text-[#500000] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#500000] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#500000]/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#500000]/50">
            © {new Date().getFullYear()} Meloy Kickstart. All rights reserved.
          </p>
          <p className="text-sm text-[#500000]/50">
            Made at Texas A&M University
          </p>
        </div>
      </div>
    </footer>
  )
}
