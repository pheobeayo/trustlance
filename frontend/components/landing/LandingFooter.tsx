'use client'

import Image from 'next/image'
import Link from 'next/link'

const NAV_LINKS = ['Docs', 'GitHub', 'Contract', 'How it works', 'ETHGlobal']
const SPONSORS  = ['UNISWAP', 'KEEPERHUB', '0G CHAIN']

export function LandingFooter() {
  return (
    <footer className="transition-colors duration-300" style={{ borderTop: '1px solid var(--border-base)', backgroundColor: 'var(--bg-surface)' }}>
      <div className="px-5 md:px-10 py-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 flex-wrap">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="TrustLance"
              width={140}
              height={44}
              className="object-contain w-auto h-10"
            />
          </Link>

          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {NAV_LINKS.map(l => (
              <a key={l} href="#" className="text-[13px] transition-colors" style={{ color: 'var(--text-faint)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--teal-hi)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}>
                {l}
              </a>
            ))}
          </nav>

          <div className="flex gap-2 flex-wrap">
            {SPONSORS.map(s => (
              <span key={s} className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider transition-colors"
                style={{ color: 'var(--text-faint)', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-base)' }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="my-6 h-px transition-colors" style={{ backgroundColor: 'var(--border-subtle)' }} />
        <p className="text-[12px] text-center transition-colors" style={{ color: 'var(--text-faint)' }}>
          © 2026 TrustLance
        </p>
      </div>
    </footer>
  )
}