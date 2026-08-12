import Link from 'next/link'

export const metadata = {
  title: 'Community Guidelines & Cultural Stewardship — Oralis',
  description: 'Guidelines for ethical cultural preservation, informed community consent, elder permissions, and respectful linguistic archiving on Oralis.',
}

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-background pt-[72px]">
      {/* Header */}
      <div className="bg-navy-abyss text-ivory relative overflow-hidden">
        <span
          className="editorial-bg-text top-8 right-8 text-[16vw] opacity-15 select-none"
          aria-hidden="true"
        >
          COVENANT
        </span>
        <div className="relative max-w-5xl mx-auto px-6 lg:px-16 py-20 lg:py-28">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-px bg-gold/50" />
            <span className="font-ui text-[11px] text-gold/80 tracking-[0.25em] uppercase font-bold">
              Ethical Stewardship
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">
            Community Preservation Guidelines
          </h1>
          <p className="font-body text-ivory/80 text-lg sm:text-xl max-w-2xl leading-relaxed">
            Every recording preserved in Oralis is an irreplaceable cultural artefact. We hold ourselves and all contributors to the highest standards of cultural respect and community consent.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-16 py-16 lg:py-24 space-y-12">
        
        {/* Section 1 */}
        <section className="glass-heavy rounded-2xl p-8 border border-border/40 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <h2 className="font-display text-2xl font-bold text-navy">1. Informed Consent & Elder Permission</h2>
          </div>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            Before recording or submitting any voice, story, or vocabulary, contributors must ensure that the speaker or their direct family and cultural elders have explicitly granted permission to preserve the material publicly.
          </p>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            Never record an elder or community member without their knowledge and clear agreement on how their voice will be used and shared.
          </p>
        </section>

        {/* Section 2 */}
        <section className="glass-heavy rounded-2xl p-8 border border-border/40 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <h2 className="font-display text-2xl font-bold text-navy">2. Sacred Knowledge & Cultural Boundaries</h2>
          </div>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            Many indigenous traditions maintain ceremonial or sacred knowledge intended strictly for initiated community members or specific ceremonial seasons.
          </p>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            <strong>Do not upload secret, sacred, or restricted ceremonial knowledge to the public atlas.</strong> Preserve everyday vocabulary, public folklore, conversational phrases, oral histories, and linguistic knowledge intended for broader cultural revitalization.
          </p>
        </section>

        {/* Section 3 */}
        <section className="glass-heavy rounded-2xl p-8 border border-border/40 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <h2 className="font-display text-2xl font-bold text-navy">3. Attribution, Accuracy & Dialectal Respect</h2>
          </div>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            Endangered languages often feature multiple vital dialects and distinct regional accents. Always note the regional variant, town, or clan when providing context, and honor the speaker by citing their chosen name or community pseudonym.
          </p>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            Respect every pronunciation as valid within its living context. There is no &ldquo;inferior&rdquo; dialect in cultural preservation.
          </p>
        </section>

        {/* Section 4 */}
        <section className="glass-heavy rounded-2xl p-8 border border-border/40 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <h2 className="font-display text-2xl font-bold text-navy">4. Permanent Deletion & Stewardship Rights</h2>
          </div>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            Every submission is issued a unique cryptographic delete token upon creation. The contributor or community retains the absolute right to permanently delete their contribution at any time with no prior approval or account registration required.
          </p>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            To remove a contribution, visit the <Link href="/profile" className="text-gold font-bold underline">Manage Token</Link> page and input your token.
          </p>
        </section>

        {/* Back Link */}
        <div className="pt-8 text-center">
          <Link
            href="/contribute"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-navy font-ui text-sm font-bold rounded-xl hover:bg-gold-warm transition-all shadow-md focus-ring"
          >
            I Understand — Proceed to Preservation Studio →
          </Link>
        </div>
      </div>
    </div>
  )
}
