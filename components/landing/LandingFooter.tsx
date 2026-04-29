'use client'

import Link from 'next/link'

const NAV_LINKS = ['Docs', 'GitHub', 'Contract', 'How it works', 'ETHGlobal']
const SPONSORS  = ['WORLD ID', 'UNISWAP', 'KEEPERHUB', 'BASE']

export function LandingFooter() {
  return (
    <footer className="transition-colors duration-300" style={{ borderTop: '1px solid var(--border-base)', backgroundColor: 'var(--bg-surface)' }}>
      <div className="px-5 md:px-10 py-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 flex-wrap">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg flex-shrink-0" style={{ color: 'var(--teal-hi)' }}>
            <span className="size-5 rounded-[4px] flex items-center justify-center text-[9px] rotate-45" style={{ background: 'rgba(13,158,117,0.1)', border: '1px solid var(--teal-lo)' }}>✦</span>
            TrustLance
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {NAV_LINKS.map(l => (
              <a key={l} href="#" className="text-[13px] transition-colors" style={{ color: 'var(--text-faint)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--teal-hi)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}>{l}</a>
            ))}
          </nav>
          <div className="flex gap-2 flex-wrap">
            {SPONSORS.map(s => (
              <span key={s} className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider transition-colors" style={{ color: 'var(--text-faint)', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-base)' }}>{s}</span>
            ))}
          </div>
        </div>
        <div className="my-6 h-px transition-colors" style={{ backgroundColor: 'var(--border-subtle)' }} />
        <p className="text-[12px] text-center transition-colors" style={{ color: 'var(--text-faint)' }}>© 2026 TrustLance · MIT License</p>
      </div>
    </footer>
  )
}
