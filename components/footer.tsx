import Link from 'next/link'

const footerLinks = {
  Platform: [
    { label: 'Explore Languages', href: '/explore' },
    { label: 'Contribute', href: '/contribute' },
    { label: 'Cultural Insights', href: '/insights' },
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
    <footer className="bg-earth text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-8">
        {/* Top */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 pb-12 border-b border-primary-foreground/10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full border border-gold/60 flex items-center justify-center">
                <span className="text-xs font-display font-bold text-gold tracking-widest">O</span>
              </div>
              <span className="font-display font-bold text-xl tracking-wide">Oralis</span>
            </Link>
            <p className="font-body text-primary-foreground/70 leading-relaxed text-sm max-w-xs">
              A living archive of humanity&apos;s linguistic heritage. Preserving
              endangered languages, oral traditions, and indigenous knowledge
              for future generations.
            </p>
            <div className="mt-8 flex items-center gap-2">
              <span className="font-ui text-xs text-primary-foreground/40 tracking-widest uppercase">
                Built on
              </span>
              <span className="font-mono text-xs text-gold/70">AWS DynamoDB</span>
              <span className="font-ui text-xs text-primary-foreground/20">·</span>
              <span className="font-mono text-xs text-gold/70">Vercel</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-ui text-xs font-medium tracking-widest uppercase text-primary-foreground/40 mb-4">
                {section}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-ui text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
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
          <p className="font-ui text-xs text-primary-foreground/30">
            &copy; {new Date().getFullYear()} Oralis. Preserving cultural memory at global scale.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="font-ui text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="font-ui text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors">
              Terms
            </Link>
            <Link href="#" className="font-ui text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
