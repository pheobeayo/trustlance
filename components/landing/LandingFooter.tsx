import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

const NAV_LINKS = ['Docs', 'GitHub', 'Contract', 'How it works', 'ETHGlobal']
const SPONSORS  = ['WORLD ID', 'UNISWAP', 'KEEPERHUB', 'BASE']

export function LandingFooter() {
  return (
    <footer className="border-t border-[#1e2f24] bg-[#0b1310]">
      <div className="px-5 md:px-10 py-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 flex-wrap">
          <Link href="/" className="flex items-center gap-2 text-[#14c490] font-extrabold text-lg flex-shrink-0">
            <span className="size-5 rounded-[4px] bg-[#0d9e75]/10 border border-[#0a7a5a] flex items-center justify-center text-[9px] rotate-45">✦</span>
            TrustLance
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {NAV_LINKS.map(l => (
              <a key={l} href="#" className="text-[13px] text-[#344d3f] hover:text-[#14c490] transition-colors">{l}</a>
            ))}
          </nav>
          <div className="flex gap-2 flex-wrap">
            {SPONSORS.map(s => (
              <span key={s} className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider text-[#344d3f] border border-[#1e2f24] bg-[#152019]">{s}</span>
            ))}
          </div>
        </div>
        <Separator className="my-6 bg-[#162118]" />
        <p className="text-[12px] text-[#344d3f] text-center">© 2026 TrustLance · MIT License</p>
      </div>
    </footer>
  )
}
