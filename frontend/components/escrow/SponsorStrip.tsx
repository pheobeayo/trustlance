'use client'
export function SponsorStrip() {
  const SPONSORS = [
    { badge: 'WORLD ID',  name: 'Proof of Personhood',    desc: 'Sybil-resistant identity layer'     },
    { badge: 'UNISWAP',   name: 'Token-Agnostic Deposits', desc: 'ETH / USDT / DAI → USDC auto-swap' },
    { badge: 'KEEPERHUB', name: 'Guaranteed Release',      desc: 'SLA-backed execution with retry'    },
  ]
  return (
    <div className="flex overflow-x-auto scrollbar-none transition-colors duration-300" style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-base)' }}>
      {SPONSORS.map((s, i) => (
        <div key={i} className="flex-1 min-w-[180px] flex items-center gap-3 px-5 md:px-7 py-3.5 transition-colors"
          style={{ borderRight: '1px solid var(--border-base)' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
          <span className="flex-shrink-0 text-[10px] font-extrabold tracking-wider whitespace-nowrap px-2 py-1 rounded" style={{ color: 'var(--teal-hi)', background: 'rgba(13,158,117,0.1)', border: '1px solid rgba(13,158,117,0.3)' }}>{s.badge}</span>
          <div>
            <div className="text-[12px] font-semibold transition-colors" style={{ color: 'var(--text-secondary)' }}>{s.name}</div>
            <div className="text-[10px] transition-colors" style={{ color: 'var(--text-faint)' }}>{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
