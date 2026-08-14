'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ContributionItem from '@/components/observatory/ContributionItem'
import type { Language } from '@/lib/data'
import type { PublicContributionDTO } from '@/lib/contracts/contribution'
import { RefreshCw, AlertCircle, Sparkles } from 'lucide-react'

interface LanguageArchiveData {
  success: boolean
  metadata: Language
  contributions: PublicContributionDTO[]
  durationMs?: number
}

export default function LanguageDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [data, setData] = useState<LanguageArchiveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLanguageData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/language/full?id=${encodeURIComponent(id)}`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Language not found in the cultural archive.')
        }
        throw new Error('Failed to load language archive data. Please try again.')
      }
      const json: LanguageArchiveData = await res.json()
      if (!json.success || !json.metadata) {
        throw new Error('Invalid archive response from server.')
      }
      setData(json)
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchLanguageData()
  }, [fetchLanguageData])

  if (loading) {
    return (
      <div className="min-h-screen bg-sand pt-32 pb-24 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />
        <p className="font-ui text-xs tracking-widest text-stone uppercase">Loading archival memories...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-sand pt-32 pb-24 flex items-center justify-center px-6">
        <div className="max-w-md w-full glass-heavy rounded-2xl p-10 text-center shadow-xl border border-stone/20">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl font-bold text-navy mb-2">Archive Notice</h2>
          <p className="font-body text-sm text-stone mb-6 leading-relaxed">{error}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={fetchLanguageData}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-ui text-xs font-semibold px-5 py-2.5 bg-navy text-ivory rounded-lg hover:bg-navy/90 transition-colors focus-ring"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Request</span>
            </button>
            <Link
              href="/observatory"
              className="w-full sm:w-auto inline-flex items-center justify-center font-ui text-xs font-medium px-5 py-2.5 glass rounded-lg text-navy hover:bg-white/50 transition-colors focus-ring"
            >
              ← Return to Observatory
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { metadata, contributions } = data

  return (
    <div className="min-h-screen bg-sand pt-32 pb-24">
      {/* Dynamic Header */}
      <div className="bg-navy text-ivory py-20 relative overflow-hidden mb-16 -mt-32 pt-40">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold via-transparent to-transparent" />
        
        <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10 text-center">
          <Link
            href="/observatory"
            className="inline-flex items-center gap-2 font-ui text-xs uppercase tracking-widest text-gold/80 hover:text-gold transition-colors mb-8 focus-ring rounded px-2 py-1"
          >
            ← Back to Observatory
          </Link>
          
          <h1 className="font-display text-5xl lg:text-7xl font-bold mb-4 tracking-tight">
            {metadata.name}
          </h1>
          {metadata.nativeName && (
            <p className="font-body text-2xl text-gold/80 italic mb-8">
              {metadata.nativeName}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 font-ui text-sm">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
              <span className="text-gold/60">Region</span>
              <span>{metadata.region}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
              <span className="text-gold/60">Vitality</span>
              <span>{metadata.vitalityScore ?? 0}/100</span>
            </div>
            {metadata.speakers !== undefined && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
                <span className="text-gold/60">Speakers</span>
                <span>{metadata.speakers.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-navy mb-2">Preserved Memories</h2>
            <p className="font-body text-stone">
              Audio recordings, phrases, and cultural context contributed by the community.
            </p>
          </div>
          <div className="text-right shrink-0 pl-4">
            <span className="font-display text-4xl font-bold text-gold">{contributions.length}</span>
            <span className="block font-ui text-[10px] uppercase tracking-widest text-stone/50 mt-1">Contributions</span>
          </div>
        </div>

        {contributions.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center border border-dashed border-stone/20">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-7 h-7 text-gold" />
            </div>
            <h3 className="font-display text-2xl font-bold text-navy mb-3">No memories yet</h3>
            <p className="font-body text-stone/70 max-w-md mx-auto mb-8 leading-relaxed">
              This language has been registered in the archive, but no audio recordings or phrases have been contributed yet.
            </p>
            <Link
              href="/contribute"
              className="font-ui text-sm px-6 py-3 bg-gold text-navy font-semibold hover:bg-gold-warm rounded-xl transition-all shadow-md inline-block focus-ring"
            >
              Be the first to contribute
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {contributions.map((contrib) => (
              <ContributionItem key={contrib.id} contribution={contrib as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
