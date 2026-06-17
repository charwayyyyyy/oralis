'use client'

interface ContributionItemProps {
  contribution: {
    id: string
    text: string
    translation?: string
    context?: string
    audioUrl?: string
    usage?: string
    createdAt: string
  }
}

export default function ContributionItem({ contribution }: ContributionItemProps) {
  const date = new Date(contribution.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className="glass rounded-2xl p-6 lg:p-8 relative overflow-hidden transition-all hover:shadow-md hover:bg-white/40">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
        {/* Core content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            {contribution.usage && (
              <span className="px-3 py-1 rounded-full glass-gold text-gold font-ui text-[10px] uppercase tracking-widest font-medium">
                {contribution.usage}
              </span>
            )}
            <span className="font-ui text-xs text-stone/40 uppercase tracking-widest">
              Archived {date}
            </span>
          </div>

          <h4 className="font-display text-2xl lg:text-3xl font-bold text-navy leading-tight mb-2">
            "{contribution.text || (contribution as any).title}"
          </h4>

          {(contribution.translation || (contribution as any).body) && (
            <p className="font-body text-lg text-stone/80 italic mb-4 whitespace-pre-line">
              {contribution.translation || (contribution as any).body}
            </p>
          )}

          {contribution.context && (
            <div className="mt-4 pt-4 border-t border-border/20">
              <p className="font-ui text-[10px] uppercase tracking-widest text-stone/40 mb-2">Cultural Context</p>
              <p className="font-body text-sm leading-relaxed text-stone/70">
                {contribution.context}
              </p>
            </div>
          )}
        </div>

        {/* Audio Player Area */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col justify-center">
          {contribution.audioUrl ? (
            <div className="glass-heavy rounded-xl p-4 flex flex-col gap-3 border border-gold/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <span className="font-ui text-xs font-medium text-navy uppercase tracking-widest">Original Recording</span>
              </div>
              <audio 
                controls 
                src={contribution.audioUrl} 
                className="w-full h-10 custom-audio-player"
                controlsList="nodownload noplaybackrate"
              />
            </div>
          ) : (
            <div className="glass rounded-xl p-6 flex flex-col items-center justify-center border border-dashed border-stone/20 text-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone/30 mb-2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
              <p className="font-ui text-xs text-stone/40 uppercase tracking-widest">No audio recorded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
