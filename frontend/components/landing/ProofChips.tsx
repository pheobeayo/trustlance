'use client'

import { Globe, RefreshCw, Zap, Lock, Link2 } from 'lucide-react'
import { PROOF_CHIPS } from './data'

const ICONS = [Globe, RefreshCw, Zap, Lock, Link2]

export function ProofChips() {
  return (
    <div className="py-5 overflow-x-auto scrollbar-none transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border-base)' }}>
      <div className="flex gap-3 px-5 md:px-10 min-w-max mx-auto lg:justify-center">
        {PROOF_CHIPS.map((c, i) => {
          const Icon = ICONS[i]
          return (
            <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-2.5 flex-shrink-0 group cursor-default transition-all duration-200"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-base)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--teal-lo)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-base)')}>
              <div className="size-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ background: 'rgba(13,158,117,0.1)', border: '1px solid rgba(13,158,117,0.2)' }}>
                <Icon className="size-4" style={{ color: 'var(--teal-hi)' }} />
              </div>
              <div>
                <div className="text-[13px] font-bold leading-none transition-colors" style={{ color: 'var(--text-primary)' }}>{c.val}</div>
                <div className="text-[10px] mt-1 transition-colors" style={{ color: 'var(--text-faint)' }}>{c.sub}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
