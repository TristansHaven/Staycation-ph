'use client'

import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

const NAV = [
  { href: '/dashboard',            icon: '📊', label: 'Overview' },
  { href: '/dashboard/bookings',   icon: '📋', label: 'Bookings' },
  { href: '/dashboard/calendar',   icon: '📅', label: 'Calendar' },
  { href: '/dashboard/inquiries',  icon: '💬', label: 'Inquiries' },
  { href: '/dashboard/expenses',   icon: '💰', label: 'Expenses' },
  { href: '/dashboard/ads',        icon: '📣', label: 'Marketing' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-forest text-cream min-h-screen fixed left-0 top-0">
        <div className="p-5 border-b border-white/10">
          <div className="text-lg font-display">Staycation PH</div>
          <div className="text-xs text-cream/60 mt-0.5">Owner Dashboard</div>
        </div>
        <nav className="flex-1 p-3">
          {NAV.map(n => (
            <a
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm transition-all ${
                pathname === n.href
                  ? 'bg-white/20 text-cream font-medium'
                  : 'text-cream/70 hover:bg-white/10 hover:text-cream'
              }`}
            >
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </a>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <a href="/" className="flex items-center gap-3 px-3 py-2 text-cream/60 hover:text-cream text-sm rounded-xl hover:bg-white/10 transition-all mb-1">
            <span>🌐</span><span>View website</span>
          </a>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="flex items-center gap-3 px-3 py-2 text-cream/60 hover:text-cream text-sm rounded-xl hover:bg-white/10 transition-all w-full text-left"
          >
            <span>🚪</span><span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-forest text-cream px-4 py-3 flex items-center justify-between">
        <div className="font-display">Staycation PH</div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-cream text-xl">☰</button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-forest text-cream pt-14">
          <nav className="p-4">
            {NAV.map(n => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-cream/80 hover:bg-white/10"
              >
                <span>{n.icon}</span><span>{n.label}</span>
              </a>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="flex items-center gap-3 px-4 py-3 text-cream/60 mt-4"
            >
              <span>🚪</span><span>Sign out</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-56 pt-14 md:pt-0 min-h-screen">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
