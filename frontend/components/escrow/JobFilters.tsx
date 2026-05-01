'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const CATEGORIES = ['All','Smart Contracts','Frontend','Rust / Solana','Auditing','Technical Writing','ZK / Crypto']
const STATUSES   = ['Open','In Progress']

export function JobFilters() {
  const [cat, setCat] = useState('All')
  const [st,  setSt]  = useState('Open')

  const chip = (active: boolean) => ({
    className: cn('px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-150 cursor-pointer whitespace-nowrap'),
    style: active
      ? { borderColor: 'var(--teal)', color: 'var(--teal-hi)', background: 'rgba(13,158,117,0.1)' }
      : { borderColor: 'var(--border-base)', color: 'var(--text-faint)', background: 'transparent' },
  })

  return (
    <div className="flex items-center gap-2 flex-wrap px-5 md:px-10 py-3 overflow-x-auto scrollbar-none transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-base)' }}>
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => <button key={c} {...chip(cat === c)} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div className="w-px h-5 flex-shrink-0 hidden sm:block" style={{ backgroundColor: 'var(--border-strong)' }} />
      <div className="flex gap-2">
        {STATUSES.map(s => <button key={s} {...chip(st === s)} onClick={() => setSt(s)}>{s}</button>)}
      </div>
    </div>
  )
}
