import { Globe, RefreshCw, Zap, Lock, Link2 } from 'lucide-react'
import { PROOF_CHIPS } from './data'

const ICONS = [Globe, RefreshCw, Zap, Lock, Link2]

export function ProofChips() {
  return (
    <div className="bg-[#060a08] border-b border-[#1e2f24] py-5 overflow-x-auto scrollbar-none">
      <div className="flex gap-3 px-5 md:px-10 min-w-max mx-auto lg:justify-center">
        {PROOF_CHIPS.map((c, i) => {
          const Icon = ICONS[i]
          return (
            <div key={i} className="flex items-center gap-3 bg-[#0b1310] border border-[#1e2f24] rounded-xl px-4 py-2.5 hover:border-[#0a7a5a] transition-colors duration-200 flex-shrink-0 group cursor-default">
              <div className="size-8 rounded-lg bg-[#0d9e75]/10 border border-[#0d9e75]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#0d9e75]/15 transition-colors">
                <Icon className="size-4 text-[#14c490]" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-[#e5f2ea] leading-none">{c.val}</div>
                <div className="text-[10px] text-[#344d3f] mt-1">{c.sub}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
