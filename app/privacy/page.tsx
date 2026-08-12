import Link from 'next/link'

export const metadata = {
  title: 'Privacy & Token Ownership — Oralis',
  description: 'Privacy architecture, no-account token stewardship, DynamoDB and S3 storage transparency on Oralis.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pt-[72px]">
      {/* Header */}
      <div className="bg-navy-abyss text-ivory relative overflow-hidden">
        <span
          className="editorial-bg-text top-8 right-8 text-[16vw] opacity-15 select-none"
          aria-hidden="true"
        >
          PRIVACY
        </span>
        <div className="relative max-w-5xl mx-auto px-6 lg:px-16 py-20 lg:py-28">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-px bg-gold/50" />
            <span className="font-ui text-[11px] text-gold/80 tracking-[0.25em] uppercase font-bold">
              Data Architecture & Rights
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">
            Privacy & Token Stewardship
          </h1>
          <p className="font-body text-ivory/80 text-lg sm:text-xl max-w-2xl leading-relaxed">
            Oralis was engineered from the ground up without invasive user accounts, trackers, or behavioral profiling.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-16 py-16 lg:py-24 space-y-10">
        
        <section className="glass-heavy rounded-2xl p-8 border border-border/40 space-y-4">
          <h2 className="font-display text-2xl font-bold text-navy">1. No Account Required</h2>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            You do not need to create an account, provide an email address, or link a social profile to browse languages, listen to recordings, or contribute cultural memories.
          </p>
        </section>

        <section className="glass-heavy rounded-2xl p-8 border border-border/40 space-y-4">
          <h2 className="font-display text-2xl font-bold text-navy">2. Cryptographic Delete Tokens</h2>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            When you submit a recording or story, our server generates a secure UUID delete token. This token is shown to you once upon sealing the record and is stored alongside the encrypted database item.
          </p>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            Because we do not store your identity, your delete token is your key to delete your contribution at any time.
          </p>
        </section>

        <section className="glass-heavy rounded-2xl p-8 border border-border/40 space-y-4">
          <h2 className="font-display text-2xl font-bold text-navy">3. Media & Database Storage (AWS S3 & DynamoDB)</h2>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            Recordings and metadata are stored securely:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-body text-stone/80 text-base">
            <li><strong>Audio Recordings:</strong> Encrypted and stored in Amazon Simple Storage Service (S3). Audio URLs are signed on demand.</li>
            <li><strong>Linguistic Metadata:</strong> Stored in Amazon DynamoDB with single-table design and encryption at rest.</li>
            <li><strong>Device Storage:</strong> For convenience, your delete tokens are saved to your browser&apos;s <code>localStorage</code> on this device so you can manage them without memorizing keys.</li>
          </ul>
        </section>

        <section className="glass-heavy rounded-2xl p-8 border border-border/40 space-y-4">
          <h2 className="font-display text-2xl font-bold text-navy">4. Rate Limiting & Network Security</h2>
          <p className="font-body text-stone/80 text-base leading-relaxed">
            To prevent automated abuse and denial-of-service, our API enforces an in-memory sliding window rate limit based on client IP addresses. These counters expire after 60 seconds and are never tied to individual contributions or stored in persistent logs.
          </p>
        </section>

        <div className="pt-6 border-t border-border/30 flex justify-between items-center flex-wrap gap-4 font-ui text-xs text-stone/60">
          <Link href="/profile" className="text-gold hover:text-navy underline font-bold">
            Go to Manage My Token Tool →
          </Link>
          <Link href="/terms" className="text-stone hover:text-navy underline">
            Terms of Archiving →
          </Link>
        </div>
      </div>
    </div>
  )
}
