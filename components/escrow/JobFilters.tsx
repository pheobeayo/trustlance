'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const CATEGORIES = ['All', 'Smart Contracts', 'Frontend', 'Rust / Solana', 'Auditing', 'Technical Writing', 'ZK / Crypto']
const STATUSES   = ['Open', 'In Progress']

export function JobFilters() {
  const [cat, setCat] = useState('All')
  const [st,  setSt]  = useState('Open')

  const chip = (active: boolean) => cn(
    'px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-150 cursor-pointer whitespace-nowrap',
    active
      ? 'border-[#0d9e75] text-[#14c490] bg-[#0d9e75]/10'
      : 'border-[#1e2f24] text-[#344d3f] hover:border-[#0a7a5a] hover:text-[#0d9e75]'
  )

  return (
    <div className="flex items-center gap-2 flex-wrap px-5 md:px-10 py-3 bg-[#0b1310] border-b border-[#1e2f24] overflow-x-auto scrollbar-none">
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => <button key={c} className={chip(cat === c)} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div className="w-px h-5 bg-[#294038] mx-1 hidden sm:block flex-shrink-0" />
      <div className="flex gap-2">
        {STATUSES.map(s => <button key={s} className={chip(st === s)} onClick={() => setSt(s)}>{s}</button>)}
      </div>
    </div>
  )
}
