'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Please enter the administrator password.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.')
      }

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Unable to sign in. Please verify your credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-navy flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Archival Grid Background Accent */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(#C8A96B 0.75px, transparent 0.75px), radial-gradient(#C8A96B 0.75px, #FAF8F5 0.75px)',
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 15px 15px',
        }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3 p-2 rounded-2xl bg-white border border-gold/40 shadow-sm focus-ring">
            <span className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-gold">
              <ShieldCheck className="w-6 h-6 text-gold" />
            </span>
            <div className="text-left pr-3">
              <span className="block font-display font-bold text-xl text-navy">Oralis</span>
              <span className="block font-ui text-[9px] tracking-[0.25em] uppercase text-stone-500">
                Curatorial Access
              </span>
            </div>
          </Link>
        </div>

        <h1 className="text-center font-display text-3xl font-bold text-navy tracking-tight">
          Curator Portal
        </h1>
        <p className="mt-2 text-center text-xs font-ui text-stone-600 max-w-sm mx-auto">
          Authorized personnel only. Access review queues, factual metadata controls, and platform audit history.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-navy/5 border border-stone/20 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="admin-password" className="block text-xs font-ui font-semibold text-navy uppercase tracking-wider mb-2">
                Administrator Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password..."
                  className="block w-full pl-10 pr-10 py-3 bg-stone-50/50 border border-stone-200 rounded-xl text-sm font-body text-navy placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-navy focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-navy text-ivory hover:bg-navy/90 font-ui font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign into Administration</span>
                  <ArrowRight className="w-4 h-4 text-gold" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between text-xs font-ui text-stone-500">
            <Link href="/" className="hover:text-navy transition-colors">
              ? Return to Atlas
            </Link>
            <span className="text-[11px] text-stone-400">Oralis v0.1.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
