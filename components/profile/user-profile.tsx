'use client'

import { useState, useEffect } from 'react'

interface Contribution {
  PK:              string
  SK:              string
  id:              string
  title?:          string
  languageName:    string
  type?:           string
  context?:        string
  contributorName?: string
  createdAt:       string
}

// Tokens saved in localStorage when contributions were created
interface StoredToken {
  token:    string
  PK:       string
  sk:       string
  title:    string
  language: string
  date:     string
}

export default function UserProfile() {
  const [token, setToken]               = useState('')
  const [searching, setSearching]       = useState(false)
  const [found, setFound]               = useState<Contribution | null>(null)
  const [foundPK, setFoundPK]           = useState('')
  const [foundSK, setFoundSK]           = useState('')
  const [searchError, setSearchError]   = useState<string | null>(null)
  const [deleting, setDeleting]         = useState(false)
  const [deleted, setDeleted]           = useState(false)
  const [deleteError, setDeleteError]   = useState<string | null>(null)
  const [localTokens, setLocalTokens]   = useState<Record<string, StoredToken>>({})

  // Load locally stored tokens on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('oralis_tokens') ?? '{}')
      setLocalTokens(stored)
    } catch {
      // ignore
    }
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) return
    setSearching(true)
    setSearchError(null)
    setFound(null)
    setDeleted(false)

    try {
      const res = await fetch(`/api/contribution/find-by-token?token=${encodeURIComponent(token.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Lookup failed')
      setFound(data.contribution)
      setFoundPK(data.contribution.PK)
      setFoundSK(data.contribution.SK)
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : 'Lookup failed')
    } finally {
      setSearching(false)
    }
  }

  const handleDelete = async () => {
    if (!found || !foundPK || !foundSK) return
    if (!confirm('Are you sure you want to permanently delete this contribution? This cannot be undone.')) return

    setDeleting(true)
    setDeleteError(null)
    try {
      const params = new URLSearchParams({
        PK:    foundPK,
        SK:    foundSK,
        token: token.trim(),
      })
      const res = await fetch(`/api/contribution/delete?${params.toString()}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Delete failed')

      // Remove from localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('oralis_tokens') ?? '{}')
        if (found.id && stored[found.id]) {
          delete stored[found.id]
          localStorage.setItem('oralis_tokens', JSON.stringify(stored))
          setLocalTokens(stored)
        }
      } catch { /* ignore */ }

      setDeleted(true)
      setFound(null)
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const hasLocalTokens = Object.keys(localTokens).length > 0

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16 lg:py-24">
      <div className="max-w-2xl mx-auto">

        {/* ── Intro ──────────────────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px bg-gold/40" />
            <h2 className="font-ui text-xs text-stone tracking-[0.2em] uppercase">Manage My Contribution</h2>
          </div>
          <p className="font-body text-stone/70 leading-relaxed">
            Enter the delete token you received when you submitted your contribution.
            You can look up and permanently delete your submission at any time — no account required.
          </p>
        </div>

        {/* ── Locally stored tokens (from this device) ──────────────────── */}
        {hasLocalTokens && (
          <div className="glass-heavy rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-px bg-gold/40" />
              <h3 className="font-ui text-xs text-stone tracking-[0.18em] uppercase">Saved on This Device</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(localTokens).map(([id, t]) => (
                <button
                  key={id}
                  onClick={() => setToken(t.token)}
                  className="w-full text-left glass rounded-xl p-4 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-sm font-bold text-navy group-hover:text-gold transition-colors">{t.title}</p>
                      <p className="font-ui text-xs text-stone/50 mt-0.5">{t.language} · {new Date(t.date).toLocaleDateString()}</p>
                    </div>
                    <span className="font-ui text-xs text-gold shrink-0">Use token →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Token search form ─────────────────────────────────────────── */}
        <div className="glass-heavy rounded-2xl p-8 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="delete-token" className="block font-ui text-xs font-medium tracking-wide text-stone mb-2 uppercase">
                Delete Token *
              </label>
              <input
                id="delete-token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-4 py-3 glass rounded-xl font-mono text-sm focus-ring text-navy placeholder:text-stone/30 min-h-[44px]"
                aria-required="true"
                autoComplete="off"
                spellCheck={false}
              />
              <p className="font-body text-xs text-stone/40 mt-2">
                Your token was displayed immediately after your contribution was sealed.
                If you saved it to this device, select it above.
              </p>
            </div>

            {searchError && (
              <div className="glass rounded-xl px-4 py-3 border border-red-400/30">
                <p className="font-ui text-sm text-red-500">⚠ {searchError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={searching || !token.trim()}
              className="w-full font-ui text-sm py-3 glass-navy-heavy text-ivory rounded-xl hover:bg-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] focus-ring"
            >
              {searching ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                  </svg>
                  Looking up…
                </>
              ) : 'Find My Contribution'}
            </button>
          </form>
        </div>

        {/* ── Found contribution ────────────────────────────────────────── */}
        {found && (
          <div className="glass-heavy rounded-2xl p-8 border border-gold/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-5 h-px bg-gold/40" />
              <h3 className="font-ui text-xs text-stone tracking-[0.18em] uppercase">Found Contribution</h3>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: 'Title',       value: found.title || '(Untitled)' },
                { label: 'Language',    value: found.languageName },
                { label: 'Type',        value: found.type || '—' },
                { label: 'Contributor', value: found.contributorName || '—' },
                { label: 'Submitted',   value: new Date(found.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-4 border-b border-border/10 pb-3">
                  <span className="font-ui text-xs text-stone/40 w-28 shrink-0 pt-0.5 tracking-wide">{label}</span>
                  <span className="font-body text-sm text-navy">{value}</span>
                </div>
              ))}
              {found.context && (
                <div className="flex items-start gap-4 border-b border-border/10 pb-3">
                  <span className="font-ui text-xs text-stone/40 w-28 shrink-0 pt-0.5 tracking-wide">Context</span>
                  <span className="font-body text-sm text-stone/70 leading-relaxed line-clamp-4">{found.context}</span>
                </div>
              )}
            </div>

            {deleteError && (
              <div className="glass rounded-xl px-4 py-3 border border-red-400/30 mb-4">
                <p className="font-ui text-sm text-red-500">⚠ {deleteError}</p>
              </div>
            )}

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full font-ui text-sm py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] focus-ring"
            >
              {deleting ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                  </svg>
                  Deleting…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14H6L5 6"></path>
                    <path d="M10 11v6M14 11v6"></path>
                  </svg>
                  Permanently Delete This Contribution
                </>
              )}
            </button>

            <p className="font-body text-xs text-stone/40 mt-3 text-center">
              This action is irreversible. The contribution will be removed from the atlas permanently.
            </p>
          </div>
        )}

        {/* ── Success ───────────────────────────────────────────────────── */}
        {deleted && (
          <div className="glass-heavy rounded-2xl p-8 text-center border border-green-500/20">
            <div className="w-16 h-16 rounded-full glass-gold flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12l5 5L20 7" stroke="#C8A96B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-navy mb-2">Contribution deleted.</h3>
            <p className="font-body text-sm text-stone/60 mb-6">
              Your contribution has been permanently removed from the Oralis Atlas.
            </p>
            <a
              href="/contribute"
              className="font-ui text-sm px-6 py-3 glass-navy-heavy text-ivory rounded-xl hover:bg-navy transition-colors inline-block"
            >
              Preserve Another Memory
            </a>
          </div>
        )}

      </div>
    </div>
  )
}
