import { Globe, RefreshCw, Zap } from 'lucide-react'

const SPONSORS = [
  { badge: 'WORLD ID',  name: 'Proof of Personhood',    desc: 'Sybil-resistant identity layer'     },
  { badge: 'UNISWAP',   name: 'Token-Agnostic Deposits', desc: 'ETH / USDT / DAI → USDC auto-swap' },
  { badge: 'KEEPERHUB', name: 'Guaranteed Release',      desc: 'SLA-backed execution with retry'    },
]

export function SponsorStrip() {
  return (
    <div className="flex bg-[#0b1310] border-b border-[#1e2f24] overflow-x-auto scrollbar-none">
      {SPONSORS.map((s, i) => (
        <div key={i} className="flex-1 min-w-[180px] flex items-center gap-3 px-5 md:px-7 py-3.5 border-r border-[#1e2f24] last:border-r-0 hover:bg-[#0f1a14] transition-colors">
          <span className="flex-shrink-0 text-[10px] font-extrabold tracking-wider text-[#14c490] bg-[#0d9e75]/10 border border-[#0d9e75]/30 px-2 py-1 rounded whitespace-nowrap">{s.badge}</span>
          <div>
            <div className="text-[12px] font-semibold text-[#95b8a5]">{s.name}</div>
            <div className="text-[10px] text-[#344d3f]">{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
