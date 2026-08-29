'use client'

import { useState, useRef, useEffect } from 'react'
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
  const [loyaltyOpen, setLoyaltyOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const loyaltyRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  // Primary navigation items
  const mainNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/services', label: 'Services' },
    { href: '/admin/members', label: 'Members' },
  ]

  // Grouped Loyalty items
  const loyaltyItems = [
    {
      href: '/admin/rewards',
      label: 'Rewards Catalog',
      desc: 'Kelola poin & hadiah penukaran',
      icon: '🎁',
    },
    {
      href: '/admin/vouchers',
      label: 'Voucher Checker',
      desc: 'Validasi & gunakan kupon pelanggan',
      icon: '🎟️',
    },
    {
      href: '/admin/reminders',
      label: 'WA Reminders',
      desc: 'Pengingat potong rambut otomatis',
      icon: '🔔',
    },
  ]

  // Secondary items
  const secondaryNavItems = [
    { href: '/admin/schedule', label: 'Schedule' },
    { href: '/admin/gallery', label: 'Gallery' },
    { href: '/admin/settings', label: 'Settings' },
  ]

  const isLoyaltyActive = loyaltyItems.some((item) => pathname === item.href)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (loyaltyRef.current && !loyaltyRef.current.contains(event.target as Node)) {
        setLoyaltyOpen(false)
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-[#242420] shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <span className="text-xl">💈</span>
            <span className="font-cormorant text-xl font-bold tracking-wider text-[#C9A84C] group-hover:text-[#E8C96A] transition-colors">
              PRESTIGE
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/25 font-semibold">
              ADMIN
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1.5">
            {/* Main items */}
            {mainNavItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-[#C9A84C] text-[#0A0A0A] font-semibold shadow-xs'
                      : 'text-[#A0A09A] hover:text-[#F5F5F0] hover:bg-[#1E1E1C]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}

            {/* Loyalty Dropdown */}
            <div className="relative" ref={loyaltyRef}>
              <button
                onClick={() => setLoyaltyOpen(!loyaltyOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isLoyaltyActive
                    ? 'bg-[#C9A84C] text-[#0A0A0A] font-semibold shadow-xs'
                    : 'text-[#A0A09A] hover:text-[#F5F5F0] hover:bg-[#1E1E1C]'
                }`}
              >
                <span>Loyalty</span>
                <span className={`text-[10px] transition-transform duration-200 ${loyaltyOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {loyaltyOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-[#181816] border border-[#2E2E2A] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C9A84C] px-3 py-1.5 border-b border-[#2E2E2A]/50 mb-1">
                    Loyalty & Marketing
                  </div>
                  {loyaltyItems.map((item) => {
                    const active = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setLoyaltyOpen(false)}
                        className={`flex items-start gap-2.5 p-2 rounded-lg text-left transition-all ${
                          active
                            ? 'bg-[#C9A84C]/15 text-[#C9A84C]'
                            : 'text-[#F5F5F0] hover:bg-[#242420]'
                        }`}
                      >
                        <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                        <div>
                          <p className="text-xs font-semibold">{item.label}</p>
                          <p className="text-[11px] text-[#808078] leading-tight">{item.desc}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Secondary items */}
            {secondaryNavItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-[#C9A84C] text-[#0A0A0A] font-semibold shadow-xs'
                      : 'text-[#A0A09A] hover:text-[#F5F5F0] hover:bg-[#1E1E1C]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* View Public Website */}
            <Link
              href="/id"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#808078] hover:text-[#C9A84C] px-2.5 py-1.5 rounded-lg border border-transparent hover:border-[#2A2A25] transition-colors"
              title="Buka website publik"
            >
              <span>🌐</span>
              <span className="hidden md:inline">Website</span>
            </Link>

            {/* User Dropdown */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-[#1C1C1A] hover:bg-[#282824] border border-[#2E2E2A] transition-colors text-[#F5F5F0]"
              >
                <div className="w-6 h-6 rounded-full bg-[#C9A84C] text-[#0A0A0A] font-bold text-xs flex items-center justify-center uppercase">
                  {admin.username.charAt(0) || 'A'}
                </div>
                <span className="text-xs font-medium hidden sm:inline">{admin.username}</span>
                <span className={`text-[9px] text-[#808078] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#181816] border border-[#2E2E2A] rounded-xl shadow-2xl p-1.5 z-50">
                  <div className="px-3 py-2 border-b border-[#2E2E2A] mb-1">
                    <p className="text-xs font-semibold text-[#F5F5F0]">{admin.username}</p>
                    <p className="text-[10px] text-[#C9A84C] uppercase tracking-wider">Super Admin</p>
                  </div>
                  <Link
                    href="/id"
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-[#A0A09A] hover:text-[#F5F5F0] hover:bg-[#242420] rounded-lg transition-colors"
                  >
                    <span>🌐</span> Buka Website Publik
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex w-9 h-9 items-center justify-center rounded-lg text-[#F5F5F0] bg-[#1E1E1C] hover:bg-[#2A2A26] border border-[#2E2E2A] transition-colors"
              aria-label="Toggle navigation"
            >
              <span className="text-lg">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-5 pt-2 border-t border-[#242420] space-y-4 max-h-[calc(100dvh-4rem)] overflow-y-auto">
            {/* Core Section */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#808078] px-3 mb-1">
                Operasional
              </p>
              <div className="space-y-0.5">
                {mainNavItems.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? 'bg-[#C9A84C] text-[#0A0A0A] font-semibold'
                          : 'text-[#F5F5F0] hover:bg-[#1E1E1C]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Loyalty Section */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#C9A84C] px-3 mb-1">
                Loyalitas & Promo
              </p>
              <div className="space-y-0.5">
                {loyaltyItems.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? 'bg-[#C9A84C] text-[#0A0A0A] font-semibold'
                          : 'text-[#F5F5F0] hover:bg-[#1E1E1C]'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Settings Section */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#808078] px-3 mb-1">
                Pengaturan & Media
              </p>
              <div className="space-y-0.5">
                {secondaryNavItems.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? 'bg-[#C9A84C] text-[#0A0A0A] font-semibold'
                          : 'text-[#F5F5F0] hover:bg-[#1E1E1C]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Logout */}
            <div className="pt-2 border-t border-[#242420] px-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-red-400 bg-red-950/20 hover:bg-red-950/40 rounded-lg text-sm font-medium transition-colors"
              >
                <span>🚪</span> Logout ({admin.username})
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

