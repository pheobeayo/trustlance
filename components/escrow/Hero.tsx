'use client'
import Link from 'next/link'
import styles from './Hero.module.css'

const STATS = [
  { value: '$214k', label: 'in escrow today' },
  { value: '1,840', label: 'verified humans' },
  { value: '98.4%', label: 'release success rate' },
]

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.glowOrb} aria-hidden />

      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowLine} />
          Sybil-resistant escrow marketplace
        </p>

        <h1 className={styles.heading}>
          Freelance without<br />
          <em className={styles.accent}>the risk.</em>
        </h1>

        <p className={styles.sub}>
          Every participant is World ID verified. Payments held in USDC escrow,
          released with SLA-guaranteed execution — no middlemen, no scams.
        </p>

        <div className={styles.actions}>
          <Link href="/jobs/post" className={styles.btnPrimary}>
            Post a Job
          </Link>
          <button className={styles.btnGhost}>
            How it works ↓
          </button>
        </div>

        <div className={styles.stats}>
          {STATS.map((s, i) => (
            <div key={i} className={styles.stat}>
              <span className={styles.statVal}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
