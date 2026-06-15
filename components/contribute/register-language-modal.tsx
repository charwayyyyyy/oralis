'use client'

import { useState } from 'react'

type VitalityStatus = 'safe' | 'vulnerable' | 'endangered' | 'critically-endangered' | 'dormant'

interface RegisteredLanguage {
  // Contributor info
  contributorName: string
  contributorEmail: string
  contributorRole: string
  contributorLocation: string
  contributorRelationship: string
  contributorBio: string
  // Language info
  languageName: string
  nativeName: string
  isoCode: string
  country: string
  region: string
  continent: string
  languageFamily: string
  estimatedSpeakers: string
  vitalityStatus: VitalityStatus
  description: string
  tags: string
  // Sources
  sources: string
  consent: boolean
}

const VITALITY_OPTIONS: { value: VitalityStatus; label: string; desc: string; color: string }[] = [
  { value: 'safe',                label: 'Safe',                desc: '100K+ speakers, strong transmission',     color: '#3E6B48' },
  { value: 'vulnerable',          label: 'Vulnerable',          desc: 'Spoken by most children, some pressure',  color: '#C8A96B' },
  { value: 'endangered',          label: 'Endangered',          desc: 'Children no longer learn it at home',     color: '#8C5A3C' },
  { value: 'critically-endangered', label: 'Critically Endangered', desc: 'Last generation of speakers',         color: '#9B3A2A' },
  { value: 'dormant',             label: 'Dormant / Sleeping',  desc: 'No native speakers, revival underway',    color: '#6B5A4E' },
]

const CONTINENTS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Middle East']

const RELATIONSHIP_OPTIONS = [
  'Native speaker',
  'Heritage speaker',
  'Linguist / researcher',
  'Community member',
  'Cultural ambassador',
  'Academic partner',
  'Family of speaker',
  'Other',
]

interface Props {
  onClose: () => void
  onSuccess: (lang: RegisteredLanguage) => void
}

const EMPTY: RegisteredLanguage = {
  contributorName: '', contributorEmail: '', contributorRole: '', contributorLocation: '',
  contributorRelationship: '', contributorBio: '', languageName: '', nativeName: '',
  isoCode: '', country: '', region: '', continent: '', languageFamily: '',
  estimatedSpeakers: '', vitalityStatus: 'endangered', description: '', tags: '',
  sources: '', consent: false,
}

export default function RegisterLanguageModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<RegisteredLanguage>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof RegisteredLanguage, string>>>({})

  const set = (field: keyof RegisteredLanguage, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }))

  const validateStep = (s: 1 | 2 | 3): boolean => {
    const e: Partial<Record<keyof RegisteredLanguage, string>> = {}
    if (s === 1) {
      if (!form.contributorName.trim())         e.contributorName = 'Your name is required'
      if (!form.contributorEmail.trim())        e.contributorEmail = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(form.contributorEmail)) e.contributorEmail = 'Enter a valid email'
      if (!form.contributorRelationship)        e.contributorRelationship = 'Please describe your relationship to this language'
      if (!form.contributorLocation.trim())     e.contributorLocation = 'Location is required'
    }
    if (s === 2) {
      if (!form.languageName.trim())            e.languageName = 'Language name is required'
      if (!form.country.trim())                 e.country = 'Country is required'
      if (!form.continent)                      e.continent = 'Continent is required'
      if (!form.estimatedSpeakers.trim())       e.estimatedSpeakers = 'Estimated speakers is required'
      if (!form.description.trim())             e.description = 'A description is required'
      if (form.description.trim().length < 60)  e.description = 'Please write at least 60 characters'
    }
    if (s === 3) {
      if (!form.consent)                        e.consent = 'You must confirm accuracy'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (validateStep(step)) {
      if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3)
      else onSuccess(form)
    }
  }

  const Field = ({
    label, id, required, children, error,
  }: { label: string; id: string; required?: boolean; children: React.ReactNode; error?: string }) => (
    <div>
      <label htmlFor={id} className="block font-ui text-xs font-medium tracking-wide text-stone mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 font-ui text-xs text-red-500">{error}</p>}
    </div>
  )

  const inputCls = (err?: string) =>
    `w-full px-4 py-3 glass rounded-lg font-body text-sm focus:outline-none focus:ring-1 ${err ? 'focus:ring-red-400 ring-1 ring-red-300' : 'focus:ring-gold/30'} text-foreground placeholder:text-stone/40`

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Register a new language"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col glass-heavy rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-navy-abyss text-ivory px-8 py-6 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-ui text-[11px] font-bold transition-all ${
                    step > n ? 'bg-gold text-ink' : step === n ? 'bg-gold/20 text-gold border border-gold/40' : 'bg-ivory/10 text-ivory/30'
                  }`}>
                    {step > n ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5 4-4" stroke="#1A1209" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : n}
                  </span>
                  {n < 3 && <div className={`w-10 h-px transition-colors ${step > n ? 'bg-gold/50' : 'bg-ivory/15'}`} />}
                </div>
              ))}
            </div>
            <h2 className="font-display text-xl font-bold text-ivory">
              {step === 1 ? 'About You' : step === 2 ? 'About the Language' : 'Review & Submit'}
            </h2>
            <p className="font-ui text-xs text-ivory/40 mt-1">
              {step === 1 ? 'Tell us who you are and your connection to this language' :
               step === 2 ? 'Provide details about the language you are registering' :
               'Review your submission before sealing the record'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ivory/40 hover:text-ivory transition-colors ml-4 mt-1 shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 px-8 py-6">

          {/* Step 1 — About the contributor */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="glass-gold rounded-xl p-4 mb-2">
                <p className="font-body text-xs text-stone/70 leading-relaxed">
                  Oralis is a community-built atlas. Every language registration is reviewed by our
                  curator team. Your connection to the language helps us verify accuracy and ensure
                  this record honours the community it represents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Your full name" id="cname" required error={errors.contributorName}>
                  <input id="cname" type="text" value={form.contributorName}
                    onChange={(e) => set('contributorName', e.target.value)}
                    placeholder="e.g. Dr. Amara Osei" className={inputCls(errors.contributorName)} />
                </Field>
                <Field label="Email address" id="cemail" required error={errors.contributorEmail}>
                  <input id="cemail" type="email" value={form.contributorEmail}
                    onChange={(e) => set('contributorEmail', e.target.value)}
                    placeholder="you@example.com" className={inputCls(errors.contributorEmail)} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Your role / occupation" id="crole" error={errors.contributorRole}>
                  <input id="crole" type="text" value={form.contributorRole}
                    onChange={(e) => set('contributorRole', e.target.value)}
                    placeholder="e.g. Linguist, Elder, Researcher, Teacher"
                    className={inputCls()} />
                </Field>
                <Field label="Your location" id="cloc" required error={errors.contributorLocation}>
                  <input id="cloc" type="text" value={form.contributorLocation}
                    onChange={(e) => set('contributorLocation', e.target.value)}
                    placeholder="City, Country" className={inputCls(errors.contributorLocation)} />
                </Field>
              </div>

              <Field label="Your relationship to this language" id="crel" required error={errors.contributorRelationship}>
                <div className="grid grid-cols-2 gap-2">
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set('contributorRelationship', opt)}
                      className={`px-3 py-2.5 rounded-lg font-ui text-xs text-left transition-all ${
                        form.contributorRelationship === opt
                          ? 'glass-navy text-ivory shadow-sm'
                          : 'glass hover:shadow-sm text-stone'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {errors.contributorRelationship && (
                  <p className="mt-1 font-ui text-xs text-red-500">{errors.contributorRelationship}</p>
                )}
              </Field>

              <Field label="Brief bio (optional)" id="cbio" error={errors.contributorBio}>
                <textarea id="cbio" value={form.contributorBio}
                  onChange={(e) => set('contributorBio', e.target.value)}
                  rows={3}
                  placeholder="Share your background, connection to the community, or why this language matters to you..."
                  className={`${inputCls()} resize-none`}
                />
              </Field>
            </div>
          )}

          {/* Step 2 — About the language */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Language name (English)" id="lname" required error={errors.languageName}>
                  <input id="lname" type="text" value={form.languageName}
                    onChange={(e) => set('languageName', e.target.value)}
                    placeholder="e.g. Livonian" className={inputCls(errors.languageName)} />
                </Field>
                <Field label="Native name (in the language itself)" id="lnative" error={errors.nativeName}>
                  <input id="lnative" type="text" value={form.nativeName}
                    onChange={(e) => set('nativeName', e.target.value)}
                    placeholder="e.g. Līvõ kēļ" className={inputCls()} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label="ISO 639-3 code (if known)" id="iso" error={errors.isoCode}>
                  <input id="iso" type="text" value={form.isoCode} maxLength={3}
                    onChange={(e) => set('isoCode', e.target.value.toLowerCase())}
                    placeholder="e.g. liv" className={inputCls()} />
                </Field>
                <Field label="Primary country" id="lcountry" required error={errors.country}>
                  <input id="lcountry" type="text" value={form.country}
                    onChange={(e) => set('country', e.target.value)}
                    placeholder="e.g. Latvia" className={inputCls(errors.country)} />
                </Field>
                <Field label="Region / area" id="lregion" error={errors.region}>
                  <input id="lregion" type="text" value={form.region}
                    onChange={(e) => set('region', e.target.value)}
                    placeholder="e.g. Livonia Coast" className={inputCls()} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Continent" id="lcontinent" required error={errors.continent}>
                  <div className="grid grid-cols-3 gap-2">
                    {CONTINENTS.map((c) => (
                      <button key={c} type="button" onClick={() => set('continent', c)}
                        className={`px-2 py-2 rounded-lg font-ui text-xs text-center transition-all ${
                          form.continent === c ? 'glass-navy text-ivory shadow-sm' : 'glass hover:shadow-sm text-stone'
                        }`}>
                        {c}
                      </button>
                    ))}
                  </div>
                  {errors.continent && <p className="mt-1 font-ui text-xs text-red-500">{errors.continent}</p>}
                </Field>
                <Field label="Language family" id="lfamily" error={errors.languageFamily}>
                  <input id="lfamily" type="text" value={form.languageFamily}
                    onChange={(e) => set('languageFamily', e.target.value)}
                    placeholder="e.g. Finno-Ugric, Mayan, isolate..."
                    className={inputCls()} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Estimated number of speakers" id="lspeakers" required error={errors.estimatedSpeakers}>
                  <input id="lspeakers" type="text" value={form.estimatedSpeakers}
                    onChange={(e) => set('estimatedSpeakers', e.target.value)}
                    placeholder="e.g. ~20, 5,000, fewer than 100"
                    className={inputCls(errors.estimatedSpeakers)} />
                </Field>
              </div>

              <Field label="Vitality status" id="lstatus" required error={errors.vitalityStatus}>
                <div className="space-y-2">
                  {VITALITY_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => set('vitalityStatus', opt.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        form.vitalityStatus === opt.value ? 'glass-navy shadow-sm' : 'glass hover:shadow-sm'
                      }`}>
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                      <div>
                        <p className={`font-ui text-sm font-medium ${form.vitalityStatus === opt.value ? 'text-ivory' : 'text-navy'}`}>
                          {opt.label}
                        </p>
                        <p className={`font-body text-xs ${form.vitalityStatus === opt.value ? 'text-ivory/50' : 'text-stone/50'}`}>
                          {opt.desc}
                        </p>
                      </div>
                      {form.vitalityStatus === opt.value && (
                        <svg className="ml-auto shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7l3 3 5-5" stroke="#C8A96B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Description of the language" id="ldesc" required error={errors.description}>
                <textarea id="ldesc" value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={5}
                  placeholder="Describe the language's history, community, unique features, cultural significance, and current preservation efforts..."
                  className={`${inputCls(errors.description)} resize-none`}
                />
                <p className="mt-1 font-ui text-[10px] text-stone/40">{form.description.length} characters (minimum 60)</p>
              </Field>

              <Field label="Tags (comma-separated)" id="ltags" error={errors.tags}>
                <input id="ltags" type="text" value={form.tags}
                  onChange={(e) => set('tags', e.target.value)}
                  placeholder="e.g. isolate, oral tradition, tonal, ceremonial"
                  className={inputCls()} />
              </Field>

              <Field label="Sources or references (optional)" id="lsources" error={errors.sources}>
                <textarea id="lsources" value={form.sources}
                  onChange={(e) => set('sources', e.target.value)}
                  rows={3}
                  placeholder="UNESCO Atlas links, academic papers, community websites, ISO references..."
                  className={`${inputCls()} resize-none`}
                />
              </Field>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Contributor summary */}
              <div>
                <h3 className="font-ui text-[10px] text-stone/50 tracking-widest uppercase mb-3">Your Profile</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Name',         value: form.contributorName },
                    { label: 'Email',        value: form.contributorEmail },
                    { label: 'Role',         value: form.contributorRole || '—' },
                    { label: 'Location',     value: form.contributorLocation },
                    { label: 'Relationship', value: form.contributorRelationship },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-4 border-b border-border/15 pb-3">
                      <span className="font-ui text-xs text-stone/40 w-28 shrink-0">{label}</span>
                      <span className="font-body text-sm text-navy">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language summary */}
              <div>
                <h3 className="font-ui text-[10px] text-stone/50 tracking-widest uppercase mb-3">Language Record</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Name',         value: `${form.languageName}${form.nativeName ? ` / ${form.nativeName}` : ''}` },
                    { label: 'ISO Code',     value: form.isoCode || '—' },
                    { label: 'Location',     value: [form.region, form.country, form.continent].filter(Boolean).join(', ') },
                    { label: 'Family',       value: form.languageFamily || '—' },
                    { label: 'Speakers',     value: form.estimatedSpeakers },
                    { label: 'Status',       value: VITALITY_OPTIONS.find((o) => o.value === form.vitalityStatus)?.label ?? '—' },
                    { label: 'Description',  value: form.description.length > 120 ? form.description.slice(0, 120) + '…' : form.description },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-4 border-b border-border/15 pb-3">
                      <span className="font-ui text-xs text-stone/40 w-28 shrink-0">{label}</span>
                      <span className="font-body text-sm text-navy leading-snug">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consent */}
              <div className={`rounded-xl p-4 border transition-all ${form.consent ? 'glass-gold' : 'glass border-border/20'}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={form.consent}
                    onChange={(e) => set('consent', e.target.checked)}
                    className="mt-1 w-4 h-4 accent-gold shrink-0"
                  />
                  <span className="font-body text-sm text-stone leading-relaxed">
                    I confirm that the information I have provided is accurate to the best of my knowledge,
                    that I have the right to submit this language for registration, and that this record
                    will be made available under the Oralis Cultural Commons License for educational
                    and preservation purposes.
                  </span>
                </label>
                {errors.consent && <p className="mt-2 font-ui text-xs text-red-500 ml-7">{errors.consent}</p>}
              </div>

              <div className="glass rounded-xl p-4">
                <p className="font-ui text-xs text-stone/50 leading-relaxed">
                  Your registration will be reviewed by the Oralis curator team within 5–7 days.
                  You will receive an email at <strong className="text-navy">{form.contributorEmail}</strong> once
                  the language record is live in the atlas.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="shrink-0 px-8 py-5 border-t border-border/20 flex items-center justify-between bg-background/80 backdrop-blur-sm">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="font-ui text-sm text-stone hover:text-navy transition-colors"
            >
              ← Back
            </button>
          ) : (
            <button onClick={onClose} className="font-ui text-sm text-stone hover:text-navy transition-colors">
              Cancel
            </button>
          )}

          <button
            onClick={next}
            className={`font-ui text-sm px-8 py-3 rounded-lg tracking-wide transition-all ${
              step === 3
                ? 'bg-gold/90 text-ink font-medium hover:bg-gold shadow-lg shadow-gold/10'
                : 'glass-navy-heavy text-ivory hover:bg-navy'
            }`}
          >
            {step === 3 ? 'Submit Language Registration' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
