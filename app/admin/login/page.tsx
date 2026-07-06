'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Login failed')
        setLoading(false)
        return
      }

      toast.success('Login successful!')
      router.push('/admin/dashboard')
      router.refresh()
    } catch {
      toast.error('An error occurred during login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1C1C1C] border border-[#2A2A25] rounded-lg p-6 sm:p-8 relative">
        <Link
          href="/"
          className="absolute left-4 top-4 inline-flex items-center gap-2 text-sm text-[#C9A84C] hover:text-[#E8C96A] transition-colors"
        >
          <span aria-hidden="true">←</span>
          <span>Kembali</span>
        </Link>

        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center pt-5 sm:pt-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F0] mb-2">Prestige Barbershop</h1>
          <h2 className="text-base sm:text-lg text-[#C9A84C]">Admin Panel</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

      </div>
    </div>
  )
}
