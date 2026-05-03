'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
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
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-10 h-16 backdrop-blur-xl border-b transition-colors duration-300 overflow-hidden"
      style={{ backgroundColor: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)', borderColor: 'var(--border-base)' }}>

      {/* Logo */}
      <Link href="/" className="flex items-center flex-shrink-0 hover:opacity-80 transition-opacity h-full py-2">
        <Image
          src="/logo.png"
          alt="TrustLance"
          width={140}
          height={44}
          className="object-contain h-full w-auto"
          priority
        />
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-1">
        {LINKS.map(l => (
          <Link key={l.href} href={l.href}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150',
              pathname === l.href
                ? 'text-[var(--teal-hi)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            )}
            style={pathname === l.href ? { background: 'rgba(13,158,117,0.1)' } : {}}>
            {l.label}
          </Link>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="hidden sm:block">
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon"
              className="md:hidden size-9 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] pt-16 transition-colors duration-300"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-base)' }}>
            <div className="flex flex-col gap-1">
              {/* Logo in drawer */}
              <div className="px-4 pb-4 mb-2" style={{ borderBottom: '1px solid var(--border-base)' }}>
                <Image
                  src="/logo.png"
                  alt="TrustLance"
                  width={120}
                  height={48}
                  className="object-contain"
                />
              </div>

              {LINKS.map(l => (
                <Link key={l.href} href={l.href}
                  className={cn(
                    'px-4 py-3 rounded-xl text-[15px] font-medium transition-all',
                    pathname === l.href
                      ? 'text-[var(--teal-hi)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  )}
                  style={pathname === l.href ? { background: 'rgba(13,158,117,0.1)' } : {}}
                  onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              ))}
              <div className="px-4 pt-4 mt-2" style={{ borderTop: '1px solid var(--border-base)' }}>
                <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
              </div>
              <div className="px-4 pt-2 flex items-center gap-2">
                <ThemeToggle />
                <span className="text-[12px] text-[var(--text-muted)]">Toggle theme</span>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}