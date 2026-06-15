const FACTS = [
  { figure: '43%',    caption: "of the world's languages are endangered" },
  { figure: '1',      caption: 'language lost every 40 days on average' },
  { figure: '7,000+', caption: 'living languages spoken on Earth today' },
  { figure: '3,500',  caption: 'at risk of disappearing this century' },
]

export default function Metrics() {
  return (
    <section className="bg-ivory border-b border-border" aria-label="Scale of language loss">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

          {/* Left — narrative pull */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-gold" />
              <span className="font-ui text-xs text-stone tracking-[0.2em] uppercase">The crisis</span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-navy leading-tight text-balance mb-7">
              When a language disappears, an entire world goes silent.
            </h2>
            <p className="font-body text-stone leading-relaxed text-base lg:text-lg">
              Languages are not merely means of communication — they are vessels of cosmologies,
              ecological knowledge, legal systems, and ways of being human that exist nowhere else on Earth.
              Their loss is irreversible.
            </p>
          </div>

          {/* Right — four editorial figures */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-px bg-border">
              {FACTS.map(({ figure, caption }) => (
                <div key={caption} className="bg-ivory p-9 lg:p-11">
                  <p className="font-display text-5xl lg:text-6xl font-bold text-navy mb-4 leading-none">
                    {figure}
                  </p>
                  <p className="font-body text-stone text-sm lg:text-base leading-snug">
                    {caption}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
