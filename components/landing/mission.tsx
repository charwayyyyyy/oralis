const pillars = [
  {
    number: '01',
    title: 'Preserve',
    body:
      'Archive audio recordings, oral histories, and cultural stories directly from native speakers and community elders before they are lost forever.',
  },
  {
    number: '02',
    title: 'Understand',
    body:
      'Every language encodes a unique worldview — ways of perceiving time, nature, kinship, and the cosmos that exist nowhere else. We make this knowledge accessible.',
  },
  {
    number: '03',
    title: 'Revitalize',
    body:
      'Communities can access their own linguistic heritage, enabling language revitalization programs, school curricula, and intergenerational transmission.',
  },
  {
    number: '04',
    title: 'Connect',
    body:
      'Link indigenous communities, academic linguists, governmental agencies, and international organizations in a shared mission of cultural stewardship.',
  },
]

export default function Mission() {
  return (
    <section className="py-24 lg:py-32 bg-earth text-primary-foreground overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-gold/60" />
              <span className="font-ui text-xs text-primary-foreground/40 tracking-widest uppercase">
                Our Mission
              </span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold leading-tight text-balance mb-8">
              Language loss is the silent extinction crisis of our era.
            </h2>
            <p className="font-body text-primary-foreground/70 leading-relaxed text-lg">
              Of the ~7,000 languages spoken today, linguists estimate half
              will be silent by the end of this century. Each lost language takes
              with it a unique system of knowledge — botanical classifications,
              navigation techniques, ecological wisdom, philosophical traditions.
            </p>
            <div className="mt-8 pt-8 border-t border-primary-foreground/10">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="font-display text-3xl font-bold text-gold mb-1">3,500+</p>
                  <p className="font-ui text-sm text-primary-foreground/50">Languages at risk of extinction</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-gold mb-1">~14 days</p>
                  <p className="font-ui text-sm text-primary-foreground/50">Average time between last speaker deaths</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-7 space-y-0">
            {pillars.map((pillar, i) => (
              <div
                key={pillar.number}
                className={`flex gap-6 py-8 ${i < pillars.length - 1 ? 'border-b border-primary-foreground/10' : ''}`}
              >
                <span className="font-mono text-xs text-gold/40 pt-1 shrink-0 w-8">{pillar.number}</span>
                <div>
                  <h3 className="font-display text-xl font-bold text-primary-foreground mb-3">{pillar.title}</h3>
                  <p className="font-body text-primary-foreground/60 leading-relaxed">{pillar.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
