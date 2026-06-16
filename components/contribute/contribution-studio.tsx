'use client'

import { useState, useRef } from 'react'
import { LANGUAGES, VITALITY_STATUS_COLORS } from '@/lib/data'
import WizardContainer from '@/components/contribution-wizard/WizardContainer'

const STEPS = [
  { number: 1, label: 'Choose a Culture',    description: 'Select the language you are preserving' },
  { number: 2, label: 'Shape the Memory',    description: 'Vocabulary, story, or cultural context' },
  { number: 3, label: 'Capture the Sound',   description: 'Record or upload a pronunciation' },
  { number: 4, label: 'Provide the Context', description: 'Meaning, background, and significance' },
  { number: 5, label: 'Seal the Record',     description: 'Confirm and preserve in the atlas' },
]

type ContentType = 'vocabulary' | 'story' | 'audio' | 'cultural-context'

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

interface SealResult {
  contributionId: string
  PK:             string
  sk:             string
  deleteToken:    string
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
  const [contributorName, setContributorName]   = useState('')
  const [consentChecked, setConsentChecked]     = useState(false)
  const [submitted, setSubmitted]               = useState(false)
  const [submitting, setSubmitting]             = useState(false)
  const [submitError, setSubmitError]           = useState<string | null>(null)
  const [sealResult, setSealResult]             = useState<SealResult | null>(null)
  const [tokenCopied, setTokenCopied]           = useState(false)

  // Audio upload state
  const [audioFile, setAudioFile]               = useState<File | null>(null)
  const [audioUploading, setAudioUploading]     = useState(false)
  const [audioS3Key, setAudioS3Key]             = useState<string | null>(null)
  const [audioUploadError, setAudioUploadError] = useState<string | null>(null)
  const audioInputRef                           = useRef<HTMLInputElement>(null)

  // Registration modal
  const [showRegister, setShowRegister]         = useState(false)
  const [registeredLang, setRegisteredLang]     = useState<NewLanguagePayload | null>(null)
  const [registerSuccess, setRegisterSuccess]   = useState(false)
  const [registerError, setRegisterError]       = useState<string | null>(null)

  const lang = LANGUAGES.find((l) => l.id === selectedLanguage)

  const canProceed = () => {
    if (step === 1) return !!selectedLanguage
    if (step === 2) return !!contentType && !!title
    if (step === 3) return true
    if (step === 4) return !!context && !!contributorName.trim() && consentChecked
    return true
  }

  // ── Audio upload via presigned POST (10MB enforced by S3) ────────────────
  const handleAudioFile = async (file: File) => {
    // Client-side size guard — S3 will also reject server-side
    if (file.size > 10 * 1024 * 1024) {
      setAudioUploadError('File exceeds the 10 MB limit. Please choose a smaller file.')
      return
    }

    setAudioFile(file)
    setAudioUploadError(null)
    setAudioUploading(true)
    try {
      // Step 1: Get pre-signed POST policy from our server
      const urlRes = await fetch('/api/upload-url', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          languageId:   selectedLanguage,
          fileName:     file.name,
          contentType:  file.type,
          contributorId: 'anonymous',
        }),
      })
      const urlData = await urlRes.json()
      if (!urlRes.ok) throw new Error(urlData.error ?? 'Failed to get upload URL')

      // Step 2: Build FormData and POST directly to S3 (presigned POST)
      const formData = new FormData()
      // All policy fields must come BEFORE the file
      Object.entries(urlData.fields as Record<string, string>).forEach(([key, val]) => {
        formData.append(key, val)
      })
      formData.append('file', file) // file MUST be last

      const s3Res = await fetch(urlData.url, { method: 'POST', body: formData })
      if (!s3Res.ok) {
        throw new Error('S3 upload failed. The file may exceed the 10 MB limit or be an invalid type.')
      }

      setAudioS3Key(urlData.s3Key)
    } catch (e) {
      setAudioUploadError(e instanceof Error ? e.message : 'Upload failed')
      setAudioFile(null)
    } finally {
      setAudioUploading(false)
    }
  }

  // ── Handler: language registered ─────────────────────────────────────────
  const handleRegistered = async (payload: NewLanguagePayload) => {
    setRegisterError(null)
    try {
      const res = await fetch('/api/languages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Registration failed')
      setRegisteredLang(payload)
      setShowRegister(false)
      setRegisterSuccess(true)
    } catch (e) {
      setRegisterError(e instanceof Error ? e.message : 'Registration failed. Please try again.')
    }
  }

  // ── Handler: seal contribution ────────────────────────────────────────────
  const handleSeal = async () => {
    if (!lang) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/contribution/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          languageId:      lang.id,
          languageName:    lang.name,
          contentType,
          title,
          body,
          context,
          source,
          location,
          audioS3Key:      audioS3Key ?? undefined,
          contributorName: contributorName.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')

      setSealResult({
        contributionId: data.contributionId,
        PK:             data.PK,
        sk:             data.sk,
        deleteToken:    data.deleteToken,
      })

      // Persist token in localStorage so user can retrieve it later
      if (data.deleteToken && data.contributionId) {
        try {
          const stored = JSON.parse(localStorage.getItem('oralis_tokens') ?? '{}')
          stored[data.contributionId] = {
            token:    data.deleteToken,
            PK:       data.PK,
            sk:       data.sk,
            title,
            language: lang.name,
            date:     new Date().toISOString(),
          }
          localStorage.setItem('oralis_tokens', JSON.stringify(stored))
        } catch {
          // localStorage not critical
        }
      }

      setSubmitted(true)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyToken = () => {
    if (!sealResult?.deleteToken) return
    navigator.clipboard.writeText(sealResult.deleteToken).then(() => {
      setTokenCopied(true)
      setTimeout(() => setTokenCopied(false), 2500)
    })
  }

  // ── Success screen after contribution submitted ────────────────────────────
  if (submitted && sealResult) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-24 h-24 glass-gold rounded-full flex items-center justify-center mx-auto mb-8 animate-seal-stamp">
            <div className="w-16 h-16 border-2 border-gold/40 rounded-full flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12l5 5L20 7" stroke="#C8A96B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <h2 className="font-display text-3xl font-bold text-navy mb-3">Your memory has been sealed.</h2>
          <p className="font-body text-stone leading-relaxed mb-6">
            Your contribution has been received and will be reviewed by our community of guardians.
            Once verified, it becomes part of humanity&apos;s permanent cultural record.
          </p>

          {/* Delete token — prominently displayed */}
          <div className="glass-heavy rounded-2xl p-6 text-left mb-6 border border-gold/20">
            <div className="flex items-center gap-2 mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A96B" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <p className="font-ui text-xs font-bold text-gold tracking-widest uppercase">Your Delete Token — Save This!</p>
            </div>
            <p className="font-body text-xs text-stone/70 mb-4 leading-relaxed">
              This is the only way to delete your contribution later. We cannot recover it for you.
              Copy it somewhere safe, or visit <strong>/profile</strong> to manage your contribution.
            </p>
            <div className="flex items-center gap-3">
              <code className="flex-1 font-mono text-sm text-navy bg-white/60 rounded-lg px-4 py-3 break-all border border-border/30">
                {sealResult.deleteToken}
              </code>
              <button
                onClick={handleCopyToken}
                className="shrink-0 font-ui text-xs px-4 py-3 glass-navy-heavy text-ivory rounded-lg hover:bg-navy transition-colors focus-ring"
                aria-label="Copy delete token"
              >
                {tokenCopied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="glass-heavy rounded-xl p-5 text-left mb-6 inline-block w-full">
            <p className="font-ui text-xs text-stone/50 tracking-widest uppercase mb-2">Your contribution</p>
            <p className="font-display text-base font-bold text-navy">{title}</p>
            <p className="font-ui text-xs text-stone mt-1">{lang?.name} · {contentType}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button
              onClick={() => {
                setSubmitted(false); setSealResult(null); setStep(1); setSelectedLanguage(''); setContentType('')
                setTitle(''); setBody(''); setContext(''); setAudioFile(null); setAudioS3Key(null);
                setConsentChecked(false); setSource(''); setLocation(''); setContributorName('')
              }}
              className="font-ui text-sm px-6 py-3 glass-navy-heavy text-ivory rounded-xl hover:bg-navy transition-colors min-h-[44px] focus-ring"
            >
              Preserve Another Memory
            </button>
            <a href="/profile" className="font-ui text-sm px-6 py-3 glass-gold rounded-xl text-navy font-medium hover:shadow-md transition-all min-h-[44px] focus-ring flex items-center justify-center">
              Manage My Contribution
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Wizard container rendered at root level */}
      {showRegister && (
        <WizardContainer
          onClose={() => setShowRegister(false)}
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
                  No account required. Add your name and your contribution will be permanently preserved
                  in humanity&apos;s cultural record under open cultural license.
                </p>
              </div>

              {/* Registered language badge */}
              {registerSuccess && registeredLang && (
                <div className="mt-4 glass-heavy rounded-xl p-4 border-l-2 border-gold">
                  <p className="font-ui text-[10px] text-gold tracking-widest uppercase mb-1">Registered</p>
                  <p className="font-display text-sm font-bold text-navy">{registeredLang.languageName}</p>
                  <p className="font-body text-xs text-stone/60 mt-0.5">
                    Under review by Oralis curators.
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
                          aria-pressed={selectedLanguage === l.id}
                          className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all text-left min-h-[44px] focus-ring ${
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
                      className="font-ui text-sm text-gold hover:text-navy transition-colors flex items-center gap-2 group min-h-[44px] px-2 -ml-2 rounded-lg focus-ring w-fit"
                    >
                      <span className="w-6 h-6 glass-gold rounded-md flex items-center justify-center text-gold group-hover:bg-gold/20 transition-colors" aria-hidden="true">+</span>
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
                        aria-pressed={contentType === type.id}
                        className={`p-5 rounded-xl text-left transition-all min-h-[44px] focus-ring ${
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
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="contribution-title" className="block font-ui text-xs font-medium tracking-wide text-stone mb-2">
                          Title or Subject *
                        </label>
                        <input
                          id="contribution-title"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder={`Name this ${contentType}...`}
                          className="w-full px-4 py-3 glass rounded-xl font-body text-sm focus-ring text-navy placeholder:text-stone/40 min-h-[44px]"
                          aria-required="true"
                        />
                      </div>
                      {contentType !== 'audio' && (
                        <div>
                          <label htmlFor="contribution-body" className="block font-ui text-xs font-medium tracking-wide text-stone mb-2">
                            Content
                          </label>
                          <textarea
                            id="contribution-body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={6}
                            placeholder="Write the content here..."
                            className="w-full px-4 py-3 glass rounded-xl font-body text-sm focus-ring text-navy placeholder:text-stone/40 resize-none min-h-[44px]"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 3: Audio ────────────────── */}
              {step === 3 && (
                <div>
                  <h2 className="font-display text-3xl font-bold text-navy mb-2">Capture the sound.</h2>
                  <p className="font-body text-stone mb-8">
                    Audio is the most powerful form of cultural preservation. A recording of a native
                    speaker carries meaning that text alone cannot.
                  </p>

                  {/* Hidden file input */}
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleAudioFile(file)
                    }}
                  />

                  <div
                    className={`rounded-xl p-12 text-center transition-all cursor-pointer min-h-[44px] focus-ring ${
                      audioS3Key ? 'glass-gold shadow-md' : audioUploading ? 'glass border-2 border-gold/20 border-dashed' : 'glass hover:shadow-sm border-2 border-dashed border-border/30'
                    }`}
                    onClick={() => !audioUploading && audioInputRef.current?.click()}
                    onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) handleAudioFile(file) }}
                    onDragOver={(e) => e.preventDefault()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && audioInputRef.current?.click()}
                    aria-label={audioS3Key ? `Uploaded ${audioFile?.name}` : 'Upload audio file'}
                  >
                    {audioUploading ? (
                      <div>
                        <div className="w-14 h-14 glass rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M10 4v12M4 10l6-6 6 6" stroke="#C8A96B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <p className="font-display text-base font-bold text-navy mb-1">Uploading to S3…</p>
                        <p className="font-ui text-sm text-stone">{audioFile?.name}</p>
                      </div>
                    ) : audioS3Key ? (
                      <div>
                        <div className="w-14 h-14 glass-gold rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M4 10l4 4 8-8" stroke="#C8A96B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <p className="font-display text-base font-bold text-gold mb-1">{audioFile?.name}</p>
                        <p className="font-ui text-xs text-stone">Uploaded to S3 ✓</p>
                      </div>
                    ) : (
                      <div>
                        <div className="w-14 h-14 glass rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M10 4v12M4 10l6-6 6 6" stroke="#8A7968" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <p className="font-display text-base font-bold text-navy mb-1">Drop audio file here</p>
                        <p className="font-ui text-sm text-stone mb-3">MP3, WAV, FLAC, M4A — up to <strong>10 MB</strong></p>
                        <span className="font-ui text-xs text-gold">Or click to browse</span>
                      </div>
                    )}
                  </div>

                  {audioUploadError && (
                    <p className="mt-3 font-ui text-xs text-red-500">⚠ {audioUploadError}</p>
                  )}

                  <p className="mt-4 font-ui text-xs text-stone/40">
                    Skip this step if contributing vocabulary or cultural context without audio.
                  </p>
                </div>
              )}

              {/* ── Step 4: Cultural context + Contributor name ─────────────── */}
              {step === 4 && (
                <div>
                  <h2 className="font-display text-3xl font-bold text-navy mb-2">Provide the context.</h2>
                  <p className="font-body text-stone mb-8">
                    This is the soul of your contribution. Help future researchers understand the
                    meaning, usage, and cultural significance.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="contribution-context" className="block font-ui text-xs font-medium tracking-wide text-stone mb-2">
                        Cultural significance and context *
                      </label>
                      <textarea
                        id="contribution-context"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        rows={5}
                        placeholder="Describe when and how this is used, who uses it, and why it matters to the community..."
                        className="w-full px-4 py-3 glass rounded-xl font-body text-sm focus-ring text-navy placeholder:text-stone/40 resize-none min-h-[44px]"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label htmlFor="contribution-source" className="block font-ui text-xs font-medium tracking-wide text-stone mb-2">
                        Source or speaker relationship
                      </label>
                      <input
                        id="contribution-source"
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        placeholder="e.g. Elder, community member, recorded in village ceremony..."
                        className="w-full px-4 py-3 glass rounded-xl font-body text-sm focus-ring text-navy placeholder:text-stone/40 min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label htmlFor="contribution-location" className="block font-ui text-xs font-medium tracking-wide text-stone mb-2">
                        Geographic location
                      </label>
                      <input
                        id="contribution-location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Village, region, or community where this was recorded..."
                        className="w-full px-4 py-3 glass rounded-xl font-body text-sm focus-ring text-navy placeholder:text-stone/40 min-h-[44px]"
                      />
                    </div>

                    {/* ── Contributor name — required, no account ── */}
                    <div className="glass rounded-xl p-5 border border-gold/20">
                      <label htmlFor="contributor-name" className="block font-ui text-xs font-medium tracking-wide text-stone mb-2">
                        Your name *
                      </label>
                      <input
                        id="contributor-name"
                        type="text"
                        value={contributorName}
                        onChange={(e) => setContributorName(e.target.value)}
                        placeholder="How should you be credited in the archive?"
                        className="w-full px-4 py-3 glass rounded-xl font-body text-sm focus-ring text-navy placeholder:text-stone/40 min-h-[44px]"
                        aria-required="true"
                        autoComplete="name"
                      />
                      <p className="font-body text-xs text-stone/50 mt-2">
                        No account needed. Your name will appear alongside this contribution.
                        You&apos;ll receive a delete token after submission to manage it later.
                      </p>
                    </div>

                    <div className="flex items-start gap-4 glass rounded-xl p-4">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          id="contribution-consent"
                          checked={consentChecked}
                          onChange={(e) => setConsentChecked(e.target.checked)}
                          className="accent-gold w-5 h-5 rounded focus-ring cursor-pointer"
                        />
                      </div>
                      <label htmlFor="contribution-consent" className="font-body text-sm text-stone leading-relaxed cursor-pointer select-none">
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
                      { label: 'Audio',            value: audioS3Key ? 'Uploaded ✓' : 'Not included' },
                      { label: 'Cultural Context', value: context ? `${context.slice(0, 80)}…` : '—' },
                      { label: 'Location',         value: location || '—' },
                      { label: 'Contributor',      value: contributorName || '—' },
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
                      You will receive a delete token after sealing.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/20">
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  className={`font-ui text-sm text-stone hover:text-navy transition-colors min-h-[44px] px-4 -ml-4 rounded-lg focus-ring ${step === 1 ? 'invisible' : ''}`}
                >
                  ← Back
                </button>

                {submitError && (
                  <p className="font-ui text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg max-w-xs text-center border border-red-200" role="alert">⚠ {submitError}</p>
                )}

                {step < 5 ? (
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canProceed()}
                    className="font-ui text-sm px-8 py-3 glass-navy-heavy text-ivory rounded-xl hover:bg-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] focus-ring shadow-md"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={handleSeal}
                    disabled={submitting}
                    className="font-ui text-sm px-8 py-3 bg-gold text-navy font-bold rounded-xl hover:bg-gold-warm transition-all shadow-lg shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-h-[44px] focus-ring"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                        </svg>
                        Sealing…
                      </>
                    ) : 'Seal the Record'}
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
