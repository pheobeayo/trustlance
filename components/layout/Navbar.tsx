'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Gem } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/',          label: 'Home'        },
  { href: '/jobs',      label: 'Browse Jobs' },
  { href: '/jobs/post', label: 'Post a Job'  },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-10 h-16 bg-[#060a08]/90 border-b border-[#1e2f24] backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-2 text-[#14c490] font-extrabold text-[18px] tracking-tight flex-shrink-0 hover:opacity-85 transition-opacity">
        <span className="size-6 rounded-[5px] bg-[#0d9e75]/10 border border-[#0a7a5a] flex items-center justify-center text-[10px] rotate-45">✦</span>
        TrustLance
      </Link>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-1">
        {LINKS.map(l => (
          <Link key={l.href} href={l.href}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150',
              pathname === l.href
                ? 'bg-[#0d9e75]/10 text-[#14c490]'
                : 'text-[#567a68] hover:text-[#95b8a5] hover:bg-[#152019]'
            )}>
            {l.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
        </div>
        {/* Mobile drawer */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-[#567a68] hover:text-[#e5f2ea] hover:bg-[#152019] size-9">
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-[#0b1310] border-[#1e2f24] w-[280px] pt-16">
            <div className="flex flex-col gap-1">
              {LINKS.map(l => (
                <Link key={l.href} href={l.href}
                  className={cn(
                    'px-4 py-3 rounded-xl text-[15px] font-medium transition-all',
                    pathname === l.href
                      ? 'bg-[#0d9e75]/10 text-[#14c490]'
                      : 'text-[#95b8a5] hover:bg-[#152019] hover:text-[#e5f2ea]'
                  )}
                  onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              ))}
              <div className="px-4 pt-4 border-t border-[#1e2f24] mt-2">
                <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
