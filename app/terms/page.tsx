import Link from 'next/link'

export const metadata = {
  title: 'Terms of Cultural Archiving — Oralis',
  description: 'Terms of cultural preservation, Creative Commons licensing, community ownership, and platform stewardship on Oralis.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pt-[72px]">
      {/* Header */}
      <div className="bg-navy-abyss text-ivory relative overflow-hidden">
        <span
          className="editorial-bg-text top-8 right-8 text-[16vw] opacity-15 select-none"
          aria-hidden="true"
        >
          TERMS
        </span>
        <div className="relative max-w-5xl mx-auto px-6 lg:px-16 py-20 lg:py-28">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-px bg-gold/50" />
            <span className="font-ui text-[11px] text-gold/80 tracking-[0.25em] uppercase font-bold">
              Legal & Open Licensing
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">
            Terms of Cultural Archiving
          </h1>
          <p className="font-body text-ivory/80 text-lg sm:text-xl max-w-2xl leading-relaxed">
            Oralis exists to preserve endangered linguistic knowledge for the public benefit of humanity, educators, and future generations.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-16 py-16 lg:py-24 space-y-10">
        
        <section className="glass-heavy rounded-2xl p-8 border border-border/40 space-y-4">
          <h2 className="font-display text-2xl font-bold text-navy">1. Open Cultural Licensing (CC BY 4.0)</h2>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            All vocabulary, phrases, stories, translations, and audio recordings submitted to Oralis are published under the{' '}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-gold underline font-bold">
              Creative Commons Attribution 4.0 International License (CC BY 4.0)
            </a>.
          </p>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            This ensures that community members, linguists, schools, and cultural institutions around the world can freely study, adapt, and build educational tools with this material while attributing the contributing community.
          </p>
        </section>

        <section className="glass-heavy rounded-2xl p-8 border border-border/40 space-y-4">
          <h2 className="font-display text-2xl font-bold text-navy">2. Community Stewardship & No Commercial Sale</h2>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            Oralis does not claim exclusive copyright over indigenous languages or cultural expressions. The platform does not sell, paywall, or license community memories for proprietary commercial exploitation.
          </p>
        </section>

        <section className="glass-heavy rounded-2xl p-8 border border-border/40 space-y-4">
          <h2 className="font-display text-2xl font-bold text-navy">3. Contributor Warranties</h2>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            When contributing recordings or texts, you affirm that:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-body text-stone/80 text-base">
            <li>You are the speaker, or you have obtained explicit, informed consent from the speaker or their estate.</li>
            <li>The content does not violate tribal confidentiality, sacred knowledge boundaries, or intellectual property rights.</li>
            <li>The contribution does not contain defamatory, malicious, or abusive material.</li>
          </ul>
        </section>

        <section className="glass-heavy rounded-2xl p-8 border border-border/40 space-y-4">
          <h2 className="font-display text-2xl font-bold text-navy">4. Cryptographic Delete Rights</h2>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            Every contribution is sealed with a unique delete token. You or your family can permanently and irreversibly erase the record from our DynamoDB table and S3 storage at any time via the <Link href="/profile" className="text-gold underline font-bold">Manage Token</Link> tool.
          </p>
        </section>

        <div className="pt-6 border-t border-border/30 flex justify-between items-center flex-wrap gap-4 font-ui text-xs text-stone/60">
          <span>Effective: August 2026</span>
          <Link href="/privacy" className="text-gold hover:text-navy underline">
            Read our Privacy Architecture →
          </Link>
        </div>
      </div>
    </div>
  )
}
