import Link from 'next/link'
import Image from 'next/image'

const footerLinks = {
  Platform: [
    { label: 'Explore Languages', href: '/explore' },
    { label: 'Contribute', href: '/contribute' },
    { label: 'Observatory', href: '/insights' },
    { label: 'Your Profile', href: '/profile' },
  ],
  Mission: [
    { label: 'About Oralis', href: '#' },
    { label: 'Research Partners', href: '#' },
    { label: 'UNESCO Partnership', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Community: [
    { label: 'Contributors', href: '#' },
    { label: 'Researchers', href: '#' },
    { label: 'Indigenous Communities', href: '#' },
    { label: 'API Access', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-navy text-ivory" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 pt-16 pb-10">

        {/* Top */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 pb-12 border-b border-ivory/10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6" aria-label="Oralis — Home">
              <Image
                src="/oralis-logo.png"
                alt="Oralis"
                width={110}
                height={44}
                className="h-9 w-auto object-contain brightness-0 invert opacity-80"
              />
            </Link>
            <p className="font-body text-ivory/45 leading-relaxed text-sm max-w-xs">
              A living archive of humanity&apos;s linguistic heritage — preserving
              endangered languages, oral traditions, and indigenous knowledge
              for future generations.
            </p>
            <div className="mt-8 flex items-center gap-2">
              <span className="font-ui text-[11px] text-ivory/25 tracking-widest uppercase">Infrastructure</span>
              <span className="font-ui text-[11px] text-ivory/15 mx-1">&mdash;</span>
              <span className="font-mono text-[11px] text-gold/50">AWS</span>
              <span className="font-ui text-[11px] text-ivory/15">&middot;</span>
              <span className="font-mono text-[11px] text-gold/50">Vercel</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-ui text-[10px] font-medium tracking-[0.2em] uppercase text-ivory/25 mb-5">
                {section}
              </h3>
              <ul className="space-y-3.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-ui text-sm text-ivory/45 hover:text-ivory transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-ui text-xs text-ivory/20">
            &copy; {new Date().getFullYear()} Oralis. Preserving cultural memory at global scale.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Accessibility'].map((item) => (
              <Link key={item} href="#" className="font-ui text-xs text-ivory/20 hover:text-ivory/50 transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
