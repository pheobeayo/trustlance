'use client'
import { useState } from 'react'
import styles from './JobFilters.module.css'

const CATEGORIES = [
  'All',
  'Smart Contracts',
  'Frontend',
  'Rust / Solana',
  'Auditing',
  'Technical Writing',
  'ZK / Crypto',
]

const STATUSES = ['Open', 'In Progress']

export function JobFilters() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeStatus, setActiveStatus]     = useState('Open')

  return (
    <div className={styles.bar}>
      <div className={styles.group}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`${styles.chip} ${activeCategory === c ? styles.on : ''}`}
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className={styles.divider} />
      <div className={styles.group}>
        {STATUSES.map(s => (
          <button
            key={s}
            className={`${styles.chip} ${activeStatus === s ? styles.on : ''}`}
            onClick={() => setActiveStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
