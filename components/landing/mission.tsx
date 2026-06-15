const pillars = [
  {
    number: '01',
    title: 'Preserve',
    body: 'Archive audio recordings, oral histories, and cultural stories directly from native speakers and elders before they are lost forever.',
  },
  {
    number: '02',
    title: 'Understand',
    body: 'Every language encodes a unique worldview — ways of perceiving time, nature, kinship, and the cosmos that exist nowhere else. We make this knowledge accessible.',
  },
  {
    number: '03',
    title: 'Revitalize',
    body: 'Communities access their own linguistic heritage to build revitalization programs, school curricula, and intergenerational transmission.',
  },
  {
    number: '04',
    title: 'Connect',
    body: 'Link indigenous communities, academic linguists, governmental agencies, and international organizations in a shared mission of cultural stewardship.',
  },
]

export default function Mission() {
  return (
    <section className="bg-navy text-ivory" aria-label="Mission">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-24 lg:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

          {/* Left — manifesto */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-gold/50" />
              <span className="font-ui text-xs text-ivory/30 tracking-[0.2em] uppercase">Our Mission</span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold leading-tight text-balance mb-8">
              Language loss is the silent extinction crisis of our era.
            </h2>
            <p className="font-body text-ivory/55 leading-relaxed text-base lg:text-lg mb-12">
              Of the ~7,000 languages spoken today, linguists estimate that half will
              be silent by the end of this century. Each lost language takes with it
              a unique system of knowledge — botanical classifications, navigation
              techniques, ecological wisdom, philosophical traditions.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-ivory/10">
              <div>
                <p className="font-display text-3xl font-bold text-gold mb-1">3,500+</p>
                <p className="font-ui text-xs text-ivory/35 leading-snug">Languages at risk of extinction</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-gold mb-1">40 days</p>
                <p className="font-ui text-xs text-ivory/35 leading-snug">Average time between last-speaker deaths</p>
              </div>
            </div>
          </div>

          {/* Right — four pillars */}
          <div className="lg:col-span-7">
            {pillars.map((pillar, i) => (
              <div
                key={pillar.number}
                className={`flex gap-8 py-9 ${i < pillars.length - 1 ? 'border-b border-ivory/10' : ''}`}
              >
                <span className="font-mono text-xs text-gold/25 shrink-0 w-7 pt-1">{pillar.number}</span>
                <div>
                  <h3 className="font-display text-xl font-bold text-ivory mb-3">{pillar.title}</h3>
                  <p className="font-body text-ivory/50 leading-relaxed">{pillar.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
