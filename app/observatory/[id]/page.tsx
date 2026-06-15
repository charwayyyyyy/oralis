'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ContributionItem from '@/components/observatory/ContributionItem'

export default function LanguageDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLanguageData() {
      try {
        const res = await fetch(`/api/language/full?id=${id}`)
        if (!res.ok) {
          if (res.status === 404) throw new Error('Language not found in the archive.')
          throw new Error('Failed to fetch language data.')
        }
        const json = await res.json()
        setData(json)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchLanguageData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-sand pt-32 pb-24 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-sand pt-32 pb-24 flex items-center justify-center px-6">
        <div className="max-w-md w-full glass-heavy rounded-2xl p-12 text-center">
          <h2 className="font-display text-2xl font-bold text-navy mb-4">Archive Error</h2>
          <p className="font-body text-stone mb-8">{error}</p>
          <Link href="/observatory" className="font-ui text-sm px-6 py-3 glass rounded-lg text-navy hover:bg-white/50 transition-colors">
            ← Return to Observatory
          </Link>
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
          <Link href="/observatory" className="inline-flex items-center gap-2 font-ui text-xs uppercase tracking-widest text-gold/80 hover:text-gold transition-colors mb-8">
            ← Back to Observatory
          </Link>
          
          <h1 className="font-display text-5xl lg:text-7xl font-bold mb-4">
            {metadata.name}
          </h1>
          {metadata.nativeName && (
            <p className="font-body text-2xl text-gold/80 italic mb-8">
              {metadata.nativeName}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-6 font-ui text-sm">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              <span className="text-gold/50">Region</span>
              <span>{metadata.region}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              <span className="text-gold/50">Vitality</span>
              <span>{metadata.vitalityScore}/100</span>
            </div>
            {metadata.speakers !== undefined && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                <span className="text-gold/50">Speakers</span>
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
          <div className="text-right shrink-0">
            <span className="font-display text-4xl font-bold text-gold">{contributions.length}</span>
            <span className="block font-ui text-[10px] uppercase tracking-widest text-stone/50 mt-1">Contributions</span>
          </div>
        </div>

        {contributions.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center border border-dashed border-stone/20">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-gold text-2xl">✧</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-navy mb-3">No memories yet</h3>
            <p className="font-body text-stone/70 max-w-md mx-auto mb-8">
              This language has been registered in the archive, but no audio recordings or phrases have been contributed yet.
            </p>
            <Link href="/contribute" className="font-ui text-sm px-6 py-3 glass-gold text-gold hover:bg-gold/20 rounded-lg transition-colors inline-block">
              Be the first to contribute
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {contributions.map((contrib: any) => (
              <ContributionItem key={contrib.id} contribution={contrib} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
