'use client'

import Link from 'next/link'

interface LanguageCardProps {
  language: {
    id: string
    name: string
    region: string
    vitalityScore: number
    speakers?: number
    nativeName?: string
    audioCount?: number
    storiesArchived?: number
  }
}

export default function LanguageCard({ language }: LanguageCardProps) {
  // Convert vitality score (0-100) to a status colour
  const getVitalityColor = (score: number) => {
    if (score > 80) return '#4ade80' // Safe - Green
    if (score > 50) return '#facc15' // Vulnerable - Yellow
    if (score > 20) return '#f97316' // Endangered - Orange
    return '#ef4444' // Critically endangered - Red
  }

  const vitColor = getVitalityColor(language.vitalityScore || 0)

  return (
    <Link 
      href={`/observatory/${language.id}`}
      className="block group h-full"
    >
      <div className="h-full glass rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/10 border border-border/20 group-hover:border-gold/30 bg-white/5 backdrop-blur-md relative overflow-hidden">
        {/* Decorative accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full translate-x-16 -translate-y-16 group-hover:bg-gold/10 transition-colors" />

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h3 className="font-display text-2xl font-bold text-navy group-hover:text-gold transition-colors">
              {language.name}
            </h3>
            {language.nativeName && (
              <p className="font-body text-sm text-stone/60 italic mt-1">
                {language.nativeName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-heavy bg-white/80">
            <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: vitColor }} title={`Vitality Score: ${language.vitalityScore || 0}/100`} />
            <span className="font-ui text-xs font-medium text-navy">
              {((language.audioCount || 0) + (language.storiesArchived || 0)).toLocaleString()} Contributions
            </span>
          </div>
        </div>

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-stone/70">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span className="font-ui text-sm">{language.region}</span>
          </div>
          
          <div className="flex items-center gap-2 text-stone/70">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="font-ui text-sm">
              {language.speakers ? language.speakers.toLocaleString() : 'Unknown'} speakers
            </span>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-border/20 flex justify-between items-center relative z-10">
          <span className="font-ui text-xs font-medium text-stone/50 uppercase tracking-widest">
            Enter Archive
          </span>
          <span className="text-gold transform group-hover:translate-x-1 transition-transform">
            →
          </span>
        </div>
      </div>
    </Link>
  )
}
