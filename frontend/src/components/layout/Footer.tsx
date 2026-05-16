import Link from 'next/link'
import { Github, Linkedin, Twitter } from 'lucide-react'

const PRODUCT_LINKS = ['Dashboard', 'Packages', 'Alerts', 'Integrations', 'Changelog']
const COMPANY_LINKS = ['About', 'Blog', 'Careers', 'Press', 'Contact']
const LEGAL_LINKS = ['Privacy Policy', 'Terms of Service', 'Security', 'Cookie Policy']

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.08em] text-dl-hint">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map((label) => (
          <li key={label}>
            <Link
              href="#"
              className="text-[13px] text-dl-sage-light/55 transition-colors hover:text-dl-cream"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="bg-dl-nav">
      <div className="mx-auto max-w-[1200px] px-6 pb-10 pt-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[17px] font-semibold text-dl-sage-light">DriftLogg</p>
            <p className="mt-3 max-w-[200px] text-[13px] leading-relaxed text-dl-sage-light/55">
              Predict dependency rot before it hits production.
            </p>
            <div className="mt-5 flex gap-4">
              <Link href="#" aria-label="GitHub" className="text-dl-sage-light/50 hover:text-dl-sage-light">
                <Github className="h-[18px] w-[18px]" />
              </Link>
              <Link href="#" aria-label="Twitter" className="text-dl-sage-light/50 hover:text-dl-sage-light">
                <Twitter className="h-[18px] w-[18px]" />
              </Link>
              <Link href="#" aria-label="LinkedIn" className="text-dl-sage-light/50 hover:text-dl-sage-light">
                <Linkedin className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </div>

          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>

        <div className="mt-12 border-t border-dl-sage-light/10 pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-dl-hint">© 2025 DriftLogg. All rights reserved.</p>
            <p className="text-xs italic text-dl-sage-light/40">
              Built for engineers who ship.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
