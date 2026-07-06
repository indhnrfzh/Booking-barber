'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'

interface AdminNavbarProps {
  admin: {
    id: string
    username: string
    role: string
  }
}

export function AdminNavbar({ admin }: AdminNavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/services', label: 'Services', icon: '✂️' },
    { href: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
    { href: '/admin/schedule', label: 'Schedule', icon: '⏰' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ]

  const isActive = (href: string) => pathname === href

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' })
      if (response.ok) {
        toast.success('Logged out successfully')
        router.push('/admin/login')
        router.refresh()
      }
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1C1C1C] border-b border-[#2A2A25] shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8">
        <div className="h-16 sm:h-20 pt-[env(safe-area-inset-top)] flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold min-w-0">
            <span className="text-2xl shrink-0">💈</span>
            <span className="text-base sm:text-lg text-[#F5F5F0] truncate">Prestige Admin</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-[#C9A84C] text-[#0A0A0A]'
                    : 'text-[#F5F5F0] hover:bg-[#2A2A25]'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </div>

          {/* User Dropdown & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Desktop User Dropdown */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#2A2A25] hover:bg-[#3A3A35] text-[#F5F5F0]"
              >
                <span>👤 {admin.username}</span>
                <span className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#2A2A25] border border-[#3A3A35] rounded-md shadow-lg">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-[#F5F5F0] hover:bg-[#3A3A35] rounded-md flex items-center gap-2"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[#F5F5F0] text-2xl bg-[#2A2A25] hover:bg-[#3A3A35] transition-colors"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 rounded-b-2xl bg-[#1C1C1C] border-t border-[#2A2A25]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 min-h-11 flex items-center rounded-md transition-colors text-sm sm:text-base ${
                  isActive(item.href)
                    ? 'bg-[#C9A84C] text-[#0A0A0A]'
                    : 'text-[#F5F5F0] hover:bg-[#2A2A25]'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
            <div className="border-t border-[#2A2A25] pt-2 mx-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full min-h-11 flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-md text-sm sm:text-base transition-colors"
              >
                🚪 Logout ({admin.username})
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
