'use client'

import { useEffect, useState } from 'react'
import LanguageCard from '@/components/observatory/LanguageCard'

interface Language {
  id: string
  name: string
  region: string
  vitalityScore: number
  speakers?: number
  nativeName?: string
  audioCount?: number
  storiesArchived?: number
  createdAt?: string
}

export default function ObservatoryPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchLanguages() {
      try {
        const res = await fetch('/api/language/list', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch languages')
        const data = await res.json()
        
        // Filter out languages that have no actual contributions
        const activeLanguages = (data.languages || []).filter(
          (lang: Language) => ((lang.audioCount || 0) + (lang.storiesArchived || 0)) > 0
        )
        
        setLanguages(activeLanguages)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchLanguages()
  }, [])

  const filteredLanguages = languages.filter((lang) => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lang.region.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-sand pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="font-ui text-xs font-bold tracking-[0.3em] uppercase text-gold/80 mb-4 block">
              Global Observatory
            </span>
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-navy leading-tight mb-6">
              Atlas of Memories.
            </h1>
            <p className="font-body text-lg text-stone/80 leading-relaxed">
              Explore the living archive of human culture. Every card represents a language, and inside, the voices, stories, and context preserved by its community.
            </p>
          </div>

          <div className="w-full md:w-72 shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search languages or regions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-border/20 rounded-xl font-ui text-sm text-navy placeholder:text-stone/40 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
              />
              <svg className="absolute left-4 top-3.5 text-stone/40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <p className="font-ui text-[10px] uppercase tracking-widest text-stone/40 mt-3 text-right">
              {languages.length} Languages Active
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 glass rounded-2xl bg-white/10" />
            ))}
          </div>
        ) : error ? (
          <div className="glass-heavy rounded-2xl p-12 text-center max-w-lg mx-auto border-red-500/20">
            <p className="font-ui text-sm text-red-500 mb-4">Error loading observatory</p>
            <p className="font-body text-stone">{error}</p>
          </div>
        ) : languages.length === 0 ? (
          <div className="glass rounded-2xl p-24 text-center border border-dashed border-stone/20">
            <h3 className="font-display text-2xl font-bold text-navy mb-4">No language memories have been recorded yet.</h3>
            <p className="font-body text-stone/60">Be the first contributor to preserve a language.</p>
          </div>
        ) : filteredLanguages.length === 0 ? (
          <div className="glass rounded-2xl p-24 text-center border border-dashed border-stone/20">
            <h3 className="font-display text-2xl font-bold text-navy mb-2">No languages found</h3>
            <p className="font-body text-stone/60">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredLanguages.map(lang => (
              <LanguageCard key={lang.id} language={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
