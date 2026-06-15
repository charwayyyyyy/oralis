'use client'

import { useState } from 'react'
import { LANGUAGES } from '@/lib/data'

const STEPS = [
  { number: 1, label: 'Choose Language', description: 'Select the language you are preserving' },
  { number: 2, label: 'Add Content', description: 'Vocabulary, story, or cultural context' },
  { number: 3, label: 'Upload Audio', description: 'Record or upload a pronunciation' },
  { number: 4, label: 'Cultural Context', description: 'Provide meaning and background' },
  { number: 5, label: 'Review & Submit', description: 'Confirm and send to the archive' },
]

type ContentType = 'vocabulary' | 'story' | 'audio' | 'cultural-context'

export default function ContributionStudio() {
  const [step, setStep] = useState(1)
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [contentType, setContentType] = useState<ContentType | ''>('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [context, setContext] = useState('')
  const [audioUploaded, setAudioUploaded] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const lang = LANGUAGES.find((l) => l.id === selectedLanguage)

  const canProceed = () => {
    if (step === 1) return !!selectedLanguage
    if (step === 2) return !!contentType && !!title
    if (step === 3) return true
    if (step === 4) return !!context
    return true
  }

  if (submitted) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 text-center">
        <div className="max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-forest/15 flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12l5 5L20 7" stroke="var(--forest)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-3">
            Thank you for your contribution.
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed mb-8">
            Your submission has been received and will be reviewed by our community verifiers.
            Once verified, it will become part of humanity&apos;s permanent cultural archive —
            accessible to researchers, communities, and future generations worldwide.
          </p>
          <div className="inline-block border border-border p-4 text-left mb-8">
            <p className="font-ui text-xs text-muted-foreground tracking-widest uppercase mb-2">Your contribution</p>
            <p className="font-display text-base font-bold text-foreground">{title}</p>
            <p className="font-ui text-xs text-muted-foreground mt-1">{lang?.name} · {contentType}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setSubmitted(false)
                setStep(1)
                setSelectedLanguage('')
                setContentType('')
                setTitle('')
                setBody('')
                setContext('')
                setAudioUploaded(false)
              }}
              className="font-ui text-sm px-6 py-3 bg-earth text-primary-foreground hover:bg-clay transition-colors"
            >
              Contribute Again
            </button>
            <a href="/explore" className="font-ui text-sm px-6 py-3 border border-border text-foreground hover:bg-muted transition-colors">
              Explore Languages
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Steps sidebar */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 className="font-ui text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">
              Contribution Process
            </h2>
            <div className="space-y-0">
              {STEPS.map((s, i) => (
                <div key={s.number} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-ui text-xs font-bold transition-all ${
                        step > s.number
                          ? 'bg-forest text-white'
                          : step === s.number
                          ? 'bg-earth text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {step > s.number ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M2.5 6l2.5 2.5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : s.number}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-px flex-1 min-h-[2rem] transition-colors ${step > s.number ? 'bg-forest' : 'bg-border'}`} />
                    )}
                  </div>
                  <div className="pb-6 pt-1">
                    <p className={`font-ui text-sm font-medium transition-colors ${step === s.number ? 'text-foreground' : step > s.number ? 'text-forest' : 'text-muted-foreground'}`}>
                      {s.label}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-earth/5 border border-border">
              <p className="font-ui text-xs text-muted-foreground leading-relaxed">
                Your contribution will be permanently stored in our distributed AWS DynamoDB archive
                and made available under open cultural license.
              </p>
            </div>
          </div>
        </aside>

        {/* Step content */}
        <div className="lg:col-span-8">
          <div className="border border-border bg-surface p-8 lg:p-10">

            {/* Step 1: Choose Language */}
            {step === 1 && (
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  Which language are you preserving?
                </h2>
                <p className="font-body text-muted-foreground mb-8">
                  Select from our archive of documented languages, or register a new one.
                </p>
                <div className="space-y-2 mb-6">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLanguage(l.id)}
                      className={`w-full flex items-center justify-between px-5 py-4 border transition-all text-left ${
                        selectedLanguage === l.id
                          ? 'border-earth bg-earth/5'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <div>
                        <span className="font-display text-base font-bold text-foreground">{l.name}</span>
                        <span className="font-body text-sm text-muted-foreground ml-2">{l.nativeName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-ui text-xs text-muted-foreground">{l.country}</span>
                        {selectedLanguage === l.id && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <circle cx="8" cy="8" r="7" fill="var(--earth)" />
                            <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <button className="font-ui text-sm text-clay hover:text-earth transition-colors flex items-center gap-2">
                  + Register a new language
                </button>
              </div>
            )}

            {/* Step 2: Content type */}
            {step === 2 && (
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  What are you contributing?
                </h2>
                <p className="font-body text-muted-foreground mb-8">
                  Choose the type of cultural content you are adding to the {lang?.name} archive.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {([
                    { id: 'vocabulary', icon: '—', label: 'Vocabulary', desc: 'Words, phrases, or grammar' },
                    { id: 'story', icon: '◇', label: 'Oral Story', desc: 'Narrative, myth, or history' },
                    { id: 'audio', icon: '◉', label: 'Pronunciation', desc: 'Audio recording' },
                    { id: 'cultural-context', icon: '○', label: 'Cultural Context', desc: 'Traditions, practices, knowledge' },
                  ] as { id: ContentType; icon: string; label: string; desc: string }[]).map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setContentType(type.id)}
                      className={`p-5 border text-left transition-all ${
                        contentType === type.id
                          ? 'border-earth bg-earth/5'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <span className="font-mono text-xl text-gold mb-3 block">{type.icon}</span>
                      <p className="font-display text-base font-bold text-foreground mb-1">{type.label}</p>
                      <p className="font-body text-xs text-muted-foreground">{type.desc}</p>
                    </button>
                  ))}
                </div>

                {contentType && (
                  <div>
                    <label className="block font-ui text-xs font-medium tracking-wide text-muted-foreground mb-2">
                      Title or Subject
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={`Name this ${contentType}...`}
                      className="w-full px-4 py-3 border border-border bg-background font-body text-sm focus:outline-none focus:border-earth text-foreground placeholder:text-muted-foreground/40"
                    />
                    {contentType !== 'audio' && (
                      <div className="mt-4">
                        <label className="block font-ui text-xs font-medium tracking-wide text-muted-foreground mb-2">
                          Content
                        </label>
                        <textarea
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          rows={6}
                          placeholder="Write the content here..."
                          className="w-full px-4 py-3 border border-border bg-background font-body text-sm focus:outline-none focus:border-earth text-foreground placeholder:text-muted-foreground/40 resize-none"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Audio upload */}
            {step === 3 && (
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  Upload an audio recording.
                </h2>
                <p className="font-body text-muted-foreground mb-8">
                  Audio is the most powerful form of cultural preservation. A recording of a native
                  speaker carries meaning that text alone cannot.
                </p>

                <div
                  className={`border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
                    audioUploaded ? 'border-forest bg-forest/5' : 'border-border hover:border-gold/40'
                  }`}
                  onClick={() => setAudioUploaded(!audioUploaded)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setAudioUploaded(!audioUploaded)}
                  aria-label="Upload audio file"
                >
                  {audioUploaded ? (
                    <div>
                      <div className="w-12 h-12 rounded-full bg-forest/15 flex items-center justify-center mx-auto mb-3">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path d="M4 10l4 4 8-8" stroke="var(--forest)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <p className="font-display text-base font-bold text-forest mb-1">audio_recording.wav</p>
                      <p className="font-ui text-xs text-muted-foreground">3:24 · 44.1kHz · Stereo</p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path d="M10 4v12M4 10l6-6 6 6" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <p className="font-display text-base font-bold text-foreground mb-1">Drop audio file here</p>
                      <p className="font-ui text-sm text-muted-foreground mb-3">MP3, WAV, FLAC, M4A — up to 500MB</p>
                      <span className="font-ui text-xs text-clay">Or click to browse</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="font-ui text-xs text-muted-foreground">Don&apos;t have a file?</span>
                  <button className="font-ui text-xs text-clay hover:text-earth transition-colors">
                    Record in browser &rarr;
                  </button>
                </div>

                <p className="mt-6 font-ui text-xs text-muted-foreground/60">
                  Skip this step if you are contributing vocabulary or cultural context without audio.
                </p>
              </div>
            )}

            {/* Step 4: Cultural context */}
            {step === 4 && (
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  Provide cultural context.
                </h2>
                <p className="font-body text-muted-foreground mb-8">
                  This is the soul of your contribution. Help future readers and researchers
                  understand the meaning, usage, and cultural significance.
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="block font-ui text-xs font-medium tracking-wide text-muted-foreground mb-2">
                      Cultural significance and context *
                    </label>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={5}
                      placeholder="Describe when and how this is used, who uses it, and why it matters to the community..."
                      className="w-full px-4 py-3 border border-border bg-background font-body text-sm focus:outline-none focus:border-earth text-foreground placeholder:text-muted-foreground/40 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block font-ui text-xs font-medium tracking-wide text-muted-foreground mb-2">
                      Source or speaker relationship
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Elder, community member, recorded in village ceremony..."
                      className="w-full px-4 py-3 border border-border bg-background font-body text-sm focus:outline-none focus:border-earth text-foreground placeholder:text-muted-foreground/40"
                    />
                  </div>
                  <div>
                    <label className="block font-ui text-xs font-medium tracking-wide text-muted-foreground mb-2">
                      Geographic location
                    </label>
                    <input
                      type="text"
                      placeholder="Village, region, or community where this was recorded..."
                      className="w-full px-4 py-3 border border-border bg-background font-body text-sm focus:outline-none focus:border-earth text-foreground placeholder:text-muted-foreground/40"
                    />
                  </div>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="consent" className="mt-1" />
                    <label htmlFor="consent" className="font-body text-sm text-muted-foreground leading-relaxed">
                      I confirm that I have the right to share this content and that the speaker(s)
                      have given informed consent for cultural archiving purposes.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  Review your contribution.
                </h2>
                <p className="font-body text-muted-foreground mb-8">
                  Once submitted, your contribution will be reviewed by community verifiers before
                  being added to the permanent archive.
                </p>

                <div className="space-y-4">
                  {[
                    { label: 'Language', value: lang?.name ?? '—' },
                    { label: 'Content Type', value: contentType || '—' },
                    { label: 'Title', value: title || '—' },
                    { label: 'Audio', value: audioUploaded ? 'Uploaded' : 'Not included' },
                    { label: 'Cultural Context', value: context ? `${context.slice(0, 80)}...` : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-4 border-b border-border pb-4">
                      <span className="font-ui text-xs text-muted-foreground w-32 shrink-0 pt-0.5 tracking-wide">{label}</span>
                      <span className="font-body text-sm text-foreground leading-snug">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-earth/5 border border-border">
                  <p className="font-ui text-xs text-muted-foreground leading-relaxed">
                    By submitting, you agree that this contribution will be stored in the Oralis
                    distributed archive and made available under Creative Commons Attribution 4.0
                    International license.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className={`font-ui text-sm text-muted-foreground hover:text-foreground transition-colors ${step === 1 ? 'invisible' : ''}`}
              >
                &larr; Back
              </button>
              {step < 5 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed()}
                  className="font-ui text-sm px-8 py-3 bg-earth text-primary-foreground hover:bg-clay transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Continue &rarr;
                </button>
              ) : (
                <button
                  onClick={() => setSubmitted(true)}
                  className="font-ui text-sm px-8 py-3 bg-gold font-medium hover:bg-gold/90 transition-colors"
                  style={{ color: '#1F1F1F' }}
                >
                  Submit to Archive
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
