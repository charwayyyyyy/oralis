'use client'

import { useState } from 'react'
import { LANGUAGES, VITALITY_STATUS_COLORS } from '@/lib/data'
import RegisterLanguageModal from './register-language-modal'

const STEPS = [
  { number: 1, label: 'Choose a Culture',    description: 'Select the language you are preserving' },
  { number: 2, label: 'Shape the Memory',    description: 'Vocabulary, story, or cultural context' },
  { number: 3, label: 'Capture the Sound',   description: 'Record or upload a pronunciation' },
  { number: 4, label: 'Provide the Context', description: 'Meaning, background, and significance' },
  { number: 5, label: 'Seal the Record',     description: 'Confirm and preserve in the atlas' },
]

type ContentType = 'vocabulary' | 'story' | 'audio' | 'cultural-context'

// Flat type for the language registration payload
// ready for DynamoDB PutItem when AWS is wired in
export interface NewLanguagePayload {
  contributorName: string
  contributorEmail: string
  contributorRole: string
  contributorLocation: string
  contributorRelationship: string
  contributorBio: string
  languageName: string
  nativeName: string
  isoCode: string
  country: string
  region: string
  continent: string
  languageFamily: string
  estimatedSpeakers: string
  vitalityStatus: string
  description: string
  tags: string
  sources: string
  consent: boolean
}

export default function ContributionStudio() {
  const [step, setStep]                         = useState(1)
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [contentType, setContentType]           = useState<ContentType | ''>('')
  const [title, setTitle]                       = useState('')
  const [body, setBody]                         = useState('')
  const [context, setContext]                   = useState('')
  const [source, setSource]                     = useState('')
  const [location, setLocation]                 = useState('')
  const [consentChecked, setConsentChecked]     = useState(false)
  const [audioUploaded, setAudioUploaded]       = useState(false)
  const [submitted, setSubmitted]               = useState(false)

  // Registration modal
  const [showRegister, setShowRegister]         = useState(false)
  const [registeredLang, setRegisteredLang]     = useState<NewLanguagePayload | null>(null)
  const [registerSuccess, setRegisterSuccess]   = useState(false)

  const lang = LANGUAGES.find((l) => l.id === selectedLanguage)

  const canProceed = () => {
    if (step === 1) return !!selectedLanguage
    if (step === 2) return !!contentType && !!title
    if (step === 3) return true
    if (step === 4) return !!context && consentChecked
    return true
  }

  // ── Handler: language registered ─────────────────────────────────────
  const handleRegistered = (payload: NewLanguagePayload) => {
    setRegisteredLang(payload)
    setShowRegister(false)
    setRegisterSuccess(true)
    // TODO: POST to /api/languages when AWS is connected
    // await fetch('/api/languages', { method: 'POST', body: JSON.stringify(payload) })
    console.log('[ORALIS] New language registration payload (ready for DynamoDB):', payload)
  }

  // ── Success screen after contribution submitted ────────────────────────
  if (submitted) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 text-center">
        <div className="max-w-lg mx-auto">
          <div className="w-24 h-24 glass-gold rounded-full flex items-center justify-center mx-auto mb-8 animate-seal-stamp">
            <div className="w-16 h-16 border-2 border-gold/40 rounded-full flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12l5 5L20 7" stroke="#C8A96B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <h2 className="font-display text-3xl font-bold text-navy mb-3">Your memory has been sealed.</h2>
          <p className="font-body text-stone leading-relaxed mb-8">
            Your contribution has been received and will be reviewed by our community of guardians.
            Once verified, it becomes part of humanity&apos;s permanent cultural record.
          </p>
          <div className="glass-heavy rounded-xl p-5 text-left mb-8 inline-block">
            <p className="font-ui text-xs text-stone/50 tracking-widest uppercase mb-2">Your contribution</p>
            <p className="font-display text-base font-bold text-navy">{title}</p>
            <p className="font-ui text-xs text-stone mt-1">{lang?.name} · {contentType}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setSubmitted(false); setStep(1); setSelectedLanguage(''); setContentType('')
                setTitle(''); setBody(''); setContext(''); setAudioUploaded(false)
                setConsentChecked(false); setSource(''); setLocation('')
              }}
              className="font-ui text-sm px-6 py-3 glass-navy-heavy text-ivory rounded-lg hover:bg-navy transition-colors"
            >
              Preserve Another Memory
            </button>
            <a href="/explore" className="font-ui text-sm px-6 py-3 glass rounded-lg text-foreground hover:shadow-md transition-all">
              Explore the Atlas
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Register modal rendered at root level */}
      {showRegister && (
        <RegisterLanguageModal
          onClose={() => setShowRegister(false)}
          onSuccess={handleRegistered}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Sidebar — preservation path */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="font-ui text-xs font-medium tracking-widest uppercase text-stone/50 mb-6">
                Preservation Path
              </p>
              <div className="space-y-0">
                {STEPS.map((s, i) => (
                  <div key={s.number} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-ui text-xs font-bold transition-all ${
                        step > s.number ? 'bg-gold/20 text-gold backdrop-blur-sm'
                          : step === s.number ? 'glass-navy-heavy text-ivory shadow-md'
                          : 'glass text-stone'
                      }`}>
                        {step > s.number ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M2.5 6l2.5 2.5 5-5" stroke="#C8A96B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : s.number}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`w-px flex-1 min-h-[2rem] transition-colors ${step > s.number ? 'bg-gold/30' : 'bg-border/30'}`} />
                      )}
                    </div>
                    <div className="pb-6 pt-1">
                      <p className={`font-ui text-sm font-medium transition-colors ${
                        step === s.number ? 'text-navy' : step > s.number ? 'text-gold' : 'text-stone/40'
                      }`}>{s.label}</p>
                      <p className="font-body text-xs text-stone/50 mt-0.5">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 glass-gold rounded-xl p-4">
                <p className="font-ui text-xs text-stone/60 leading-relaxed">
                  No account required. Your contribution will be permanently preserved
                  in humanity&apos;s cultural record under open cultural license.
                </p>
              </div>

              {/* Registered language badge */}
              {registerSuccess && registeredLang && (
                <div className="mt-4 glass-heavy rounded-xl p-4 border-l-2 border-gold">
                  <p className="font-ui text-[10px] text-gold tracking-widest uppercase mb-1">Registered</p>
                  <p className="font-display text-sm font-bold text-navy">{registeredLang.languageName}</p>
                  <p className="font-body text-xs text-stone/60 mt-0.5">
                    Under review by Oralis curators. You&apos;ll hear from us at {registeredLang.contributorEmail}.
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* Main step content */}
          <div className="lg:col-span-8">
            <div className="glass-heavy rounded-xl p-8 lg:p-10 animate-page-enter" key={step}>

              {/* ── Step 1: Choose Culture ─────────────────────── */}
              {step === 1 && (
                <div>
                  <h2 className="font-display text-3xl font-bold text-navy mb-2">
                    Which culture are you preserving?
                  </h2>
                  <p className="font-body text-stone mb-6">
                    Select a language from the atlas, or register a new one.
                  </p>

                  <div className="space-y-2 mb-6 max-h-[400px] overflow-y-auto pr-1">
                    {LANGUAGES.map((l) => {
                      const vitColor = VITALITY_STATUS_COLORS[l.status]
                      return (
                        <button
                          key={l.id}
                          onClick={() => setSelectedLanguage(l.id)}
                          className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all text-left ${
                            selectedLanguage === l.id
                              ? 'glass-navy text-ivory shadow-md'
                              : 'glass hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: vitColor }} />
                            <span className={`font-display text-base font-bold ${selectedLanguage === l.id ? 'text-ivory' : 'text-navy'}`}>
                              {l.name}
                            </span>
                            <span className={`font-body text-sm italic ${selectedLanguage === l.id ? 'text-gold/60' : 'text-stone/60'}`}>
                              {l.nativeName}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-ui text-xs ${selectedLanguage === l.id ? 'text-ivory/40' : 'text-stone/40'}`}>
                              {l.country}
                            </span>
                            {selectedLanguage === l.id && (
                              <div className="w-5 h-5 bg-gold/20 rounded-lg flex items-center justify-center">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                                  <path d="M2 5l2 2 4-4" stroke="#C8A96B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="border-t border-border/20 pt-5">
                    <p className="font-ui text-xs text-stone/50 mb-3">
                      Don&apos;t see your language in the atlas?
                    </p>
                    <button
                      onClick={() => setShowRegister(true)}
                      className="font-ui text-sm text-gold hover:text-navy transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-6 h-6 glass-gold rounded-lg flex items-center justify-center text-gold group-hover:bg-gold/20 transition-colors">+</span>
                      Register a new language
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Content type ───────────────────────── */}
              {step === 2 && (
                <div>
                  <h2 className="font-display text-3xl font-bold text-navy mb-2">
                    What memory are you shaping?
                  </h2>
                  <p className="font-body text-stone mb-8">
                    Choose the form of cultural knowledge for the <strong>{lang?.name}</strong> archive.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {([
                      { id: 'vocabulary',       icon: '—', label: 'Vocabulary',      desc: 'Words, phrases, or grammar' },
                      { id: 'story',            icon: '◇', label: 'Oral Tradition',   desc: 'Narrative, myth, or history' },
                      { id: 'audio',            icon: '◉', label: 'Pronunciation',    desc: 'Audio recording' },
                      { id: 'cultural-context', icon: '○', label: 'Cultural Context', desc: 'Traditions, practices, knowledge' },
                    ] as { id: ContentType; icon: string; label: string; desc: string }[]).map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setContentType(type.id)}
                        className={`p-5 rounded-xl text-left transition-all ${
                          contentType === type.id ? 'glass-navy text-ivory shadow-md' : 'glass hover:shadow-sm'
                        }`}
                      >
                        <span className={`font-mono text-xl mb-3 block ${contentType === type.id ? 'text-gold' : 'text-gold/50'}`}>{type.icon}</span>
                        <p className={`font-display text-base font-bold mb-1 ${contentType === type.id ? 'text-ivory' : 'text-navy'}`}>{type.label}</p>
                        <p className={`font-body text-xs ${contentType === type.id ? 'text-ivory/40' : 'text-stone/60'}`}>{type.desc}</p>
                      </button>
                    ))}
                  </div>

                  {contentType && (
                    <div className="space-y-4">
                      <div>
                        <label className="block font-ui text-xs font-medium tracking-wide text-stone mb-2">
                          Title or Subject *
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder={`Name this ${contentType}...`}
                          className="w-full px-4 py-3 glass rounded-lg font-body text-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-foreground placeholder:text-stone/40"
                        />
                      </div>
                      {contentType !== 'audio' && (
                        <div>
                          <label className="block font-ui text-xs font-medium tracking-wide text-stone mb-2">
                            Content
                          </label>
                          <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={6}
                            placeholder="Write the content here..."
                            className="w-full px-4 py-3 glass rounded-lg font-body text-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-foreground placeholder:text-stone/40 resize-none"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 3: Audio ──────────────────────────────── */}
              {step === 3 && (
                <div>
                  <h2 className="font-display text-3xl font-bold text-navy mb-2">Capture the sound.</h2>
                  <p className="font-body text-stone mb-8">
                    Audio is the most powerful form of cultural preservation. A recording of a native
                    speaker carries meaning that text alone cannot.
                  </p>

                  <div
                    className={`rounded-xl p-12 text-center transition-all cursor-pointer ${
                      audioUploaded ? 'glass-gold shadow-md' : 'glass hover:shadow-sm border-2 border-dashed border-border/30'
                    }`}
                    onClick={() => setAudioUploaded(!audioUploaded)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setAudioUploaded(!audioUploaded)}
                    aria-label="Upload audio file"
                  >
                    {audioUploaded ? (
                      <div>
                        <div className="w-14 h-14 glass-gold rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M4 10l4 4 8-8" stroke="#C8A96B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <p className="font-display text-base font-bold text-gold mb-1">audio_recording.wav</p>
                        <p className="font-ui text-xs text-stone">3:24 · 44.1kHz · Stereo</p>
                      </div>
                    ) : (
                      <div>
                        <div className="w-14 h-14 glass rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M10 4v12M4 10l6-6 6 6" stroke="#8A7968" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <p className="font-display text-base font-bold text-navy mb-1">Drop audio file here</p>
                        <p className="font-ui text-sm text-stone mb-3">MP3, WAV, FLAC, M4A — up to 500MB</p>
                        <span className="font-ui text-xs text-gold">Or click to browse</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="font-ui text-xs text-stone">{"Don't have a file?"}</span>
                    <button className="font-ui text-xs text-gold hover:text-navy transition-colors">
                      Record in browser →
                    </button>
                  </div>
                  <p className="mt-4 font-ui text-xs text-stone/40">
                    Skip this step if contributing vocabulary or cultural context without audio.
                  </p>
                </div>
              )}

              {/* ── Step 4: Cultural context ───────────────────── */}
              {step === 4 && (
                <div>
                  <h2 className="font-display text-3xl font-bold text-navy mb-2">Provide the context.</h2>
                  <p className="font-body text-stone mb-8">
                    This is the soul of your contribution. Help future researchers understand the
                    meaning, usage, and cultural significance.
                  </p>

                  <div className="space-y-5">
                    <div>
                      <label className="block font-ui text-xs font-medium tracking-wide text-stone mb-2">
                        Cultural significance and context *
                      </label>
                      <textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        rows={5}
                        placeholder="Describe when and how this is used, who uses it, and why it matters to the community..."
                        className="w-full px-4 py-3 glass rounded-lg font-body text-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-foreground placeholder:text-stone/40 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block font-ui text-xs font-medium tracking-wide text-stone mb-2">
                        Source or speaker relationship
                      </label>
                      <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        placeholder="e.g. Elder, community member, recorded in village ceremony..."
                        className="w-full px-4 py-3 glass rounded-lg font-body text-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-foreground placeholder:text-stone/40"
                      />
                    </div>
                    <div>
                      <label className="block font-ui text-xs font-medium tracking-wide text-stone mb-2">
                        Geographic location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Village, region, or community where this was recorded..."
                        className="w-full px-4 py-3 glass rounded-lg font-body text-sm focus:outline-none focus:ring-1 focus:ring-gold/30 text-foreground placeholder:text-stone/40"
                      />
                    </div>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="contribution-consent"
                        checked={consentChecked}
                        onChange={(e) => setConsentChecked(e.target.checked)}
                        className="mt-1 accent-gold w-4 h-4 shrink-0"
                      />
                      <label htmlFor="contribution-consent" className="font-body text-sm text-stone leading-relaxed cursor-pointer">
                        I confirm that I have the right to share this content and that the speaker(s)
                        have given informed consent for cultural archiving purposes.
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 5: Review & Seal ──────────────────────── */}
              {step === 5 && (
                <div>
                  <h2 className="font-display text-3xl font-bold text-navy mb-2">Seal your contribution.</h2>
                  <p className="font-body text-stone mb-8">
                    Once sealed, your memory enters the permanent cultural record.
                  </p>

                  <div className="space-y-4">
                    {[
                      { label: 'Culture',          value: lang?.name ?? '—' },
                      { label: 'Memory Type',      value: contentType || '—' },
                      { label: 'Title',            value: title || '—' },
                      { label: 'Audio',            value: audioUploaded ? 'Captured' : 'Not included' },
                      { label: 'Cultural Context', value: context ? `${context.slice(0, 80)}…` : '—' },
                      { label: 'Location',         value: location || '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-start gap-4 border-b border-border/20 pb-4">
                        <span className="font-ui text-xs text-stone/50 w-36 shrink-0 pt-0.5 tracking-wide">{label}</span>
                        <span className="font-body text-sm text-navy leading-snug">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 glass-gold rounded-xl p-4">
                    <p className="font-ui text-xs text-stone/60 leading-relaxed">
                      By sealing this record, you confirm this contribution will be preserved in the Oralis
                      cultural atlas and made available under Creative Commons Attribution 4.0 International license.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/20">
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  className={`font-ui text-sm text-stone hover:text-navy transition-colors ${step === 1 ? 'invisible' : ''}`}
                >
                  ← Back
                </button>
                {step < 5 ? (
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canProceed()}
                    className="font-ui text-sm px-8 py-3 glass-navy-heavy text-ivory rounded-lg hover:bg-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={() => setSubmitted(true)}
                    className="font-ui text-sm px-8 py-3 bg-gold/90 backdrop-blur-sm text-ink font-medium rounded-lg hover:bg-gold transition-all shadow-lg shadow-gold/10"
                  >
                    Seal the Record
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
