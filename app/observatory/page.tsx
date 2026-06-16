'use client'

import { useEffect, useState, useCallback } from 'react'
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

interface FeedItem {
  id:              string
  PK:              string
  SK:              string
  languageName:    string
  languageId:      string
  type?:           string
  title?:          string
  context?:        string
  contributorName?: string
  createdAt:       string
  audioUrl?:       string
}

type Tab = 'atlas' | 'feed'

export default function ObservatoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('atlas')

  // ── Language Atlas state ──────────────────────────────────────────────────
  const [languages, setLanguages]   = useState<Language[]>([])
  const [langLoading, setLangLoading] = useState(true)
  const [langError, setLangError]   = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // ── Global Feed state ─────────────────────────────────────────────────────
  const [feedItems, setFeedItems]   = useState<FeedItem[]>([])
  const [feedLoading, setFeedLoading] = useState(false)
  const [feedError, setFeedError]   = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [feedFetched, setFeedFetched] = useState(false)

  // ── Load languages ────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const res = await fetch('/api/language/list', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch languages')
        const data = await res.json()
        const activeLanguages = (data.languages || []).filter(
          (lang: Language) => ((lang.audioCount || 0) + (lang.storiesArchived || 0)) > 0,
        )
        setLanguages(activeLanguages)
      } catch (e: unknown) {
        setLangError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLangLoading(false)
      }
    }
    fetchLanguages()
  }, [])

  // ── Load global feed (first page) ────────────────────────────────────────
  const fetchFeed = useCallback(async (cursor?: string) => {
    const isFirstPage = !cursor
    if (isFirstPage) {
      setFeedLoading(true)
      setFeedError(null)
    } else {
      setLoadingMore(true)
    }

    try {
      const url = `/api/feed?limit=20${cursor ? `&cursor=${cursor}` : ''}`
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch feed')
      const data = await res.json()

      setFeedItems((prev) => isFirstPage ? (data.items ?? []) : [...prev, ...(data.items ?? [])])
      setNextCursor(data.nextCursor ?? null)
      setFeedFetched(true)
    } catch (e: unknown) {
      setFeedError(e instanceof Error ? e.message : 'Failed to load feed')
    } finally {
      setFeedLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // Fetch feed when the user switches to the Feed tab (lazy load)
  useEffect(() => {
    if (activeTab === 'feed' && !feedFetched) {
      fetchFeed()
    }
  }, [activeTab, feedFetched, fetchFeed])

  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.region.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-sand pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
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

          {activeTab === 'atlas' && (
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
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 mb-10 glass rounded-xl p-1 w-fit">
          {([
            { id: 'atlas', label: 'Language Atlas',    icon: '◈' },
            { id: 'feed',  label: 'Chronological Feed', icon: '◉' },
          ] as { id: Tab; label: string; icon: string }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-ui text-sm px-5 py-2.5 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'glass-navy-heavy text-ivory shadow-md'
                  : 'text-stone hover:text-navy'
              }`}
            >
              <span className="mr-2 opacity-60">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Language Atlas tab ─────────────────────────────────────────── */}
        {activeTab === 'atlas' && (
          <>
            {langLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 glass rounded-2xl bg-white/10" />
                ))}
              </div>
            ) : langError ? (
              <div className="glass-heavy rounded-2xl p-12 text-center max-w-lg mx-auto border-red-500/20">
                <p className="font-ui text-sm text-red-500 mb-4">Error loading observatory</p>
                <p className="font-body text-stone">{langError}</p>
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
                {filteredLanguages.map((lang) => (
                  <LanguageCard key={lang.id} language={lang} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Global Feed tab ───────────────────────────────────────────── */}
        {activeTab === 'feed' && (
          <div className="max-w-3xl mx-auto">
            {feedLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 glass rounded-2xl animate-pulse bg-white/10" />
                ))}
              </div>
            ) : feedError ? (
              <div className="glass-heavy rounded-2xl p-12 text-center">
                <p className="font-ui text-sm text-red-500 mb-2">Error loading feed</p>
                <p className="font-body text-stone text-sm">{feedError}</p>
                <button
                  onClick={() => fetchFeed()}
                  className="mt-4 font-ui text-sm px-5 py-2 glass-navy-heavy text-ivory rounded-lg hover:bg-navy transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : feedItems.length === 0 ? (
              <div className="glass rounded-2xl p-24 text-center border border-dashed border-stone/20">
                <h3 className="font-display text-2xl font-bold text-navy mb-4">No contributions yet.</h3>
                <p className="font-body text-stone/60 mb-6">Be the first to preserve a cultural memory.</p>
                <a href="/contribute" className="font-ui text-sm px-6 py-3 bg-gold text-navy font-bold rounded-xl hover:bg-gold-warm transition-all shadow-md">
                  Leave a Memory
                </a>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {feedItems.map((item) => (
                    <div key={`${item.PK}-${item.SK}`} className="glass-heavy rounded-2xl p-6 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-display text-lg font-bold text-navy">
                            {item.title || '(Untitled)'}
                          </h3>
                          <p className="font-ui text-xs text-gold/80 tracking-wide mt-0.5">
                            {item.languageName}
                            {item.type && <span className="text-stone/40 ml-2">· {item.type}</span>}
                          </p>
                        </div>
                        <span className="font-ui text-[10px] text-stone/30 shrink-0 mt-1">
                          {new Date(item.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </div>

                      {item.context && (
                        <p className="font-body text-sm text-stone/70 leading-relaxed mb-3 line-clamp-3">
                          {item.context}
                        </p>
                      )}

                      {item.audioUrl && (
                        <audio
                          controls
                          src={item.audioUrl}
                          className="w-full mt-2 rounded-lg h-10"
                          aria-label={`Audio for ${item.title}`}
                        />
                      )}

                      {item.contributorName && (
                        <p className="font-ui text-[11px] text-stone/40 mt-3">
                          Preserved by <span className="text-navy/60 font-medium">{item.contributorName}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Load More */}
                {nextCursor && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => fetchFeed(nextCursor)}
                      disabled={loadingMore}
                      className="font-ui text-sm px-8 py-3 glass-navy-heavy text-ivory rounded-xl hover:bg-navy transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                      {loadingMore ? (
                        <>
                          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                          </svg>
                          Loading…
                        </>
                      ) : 'Load More'}
                    </button>
                  </div>
                )}

                {!nextCursor && feedItems.length > 0 && (
                  <p className="text-center font-ui text-xs text-stone/30 mt-8">
                    — All {feedItems.length} contributions loaded —
                  </p>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
