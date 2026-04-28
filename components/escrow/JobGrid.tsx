'use client'
import Link from 'next/link'
import { MOCK_JOBS, formatUSDC, shortAddress } from '@/lib/mockData'
import type { Job } from '@/types'
import styles from './JobGrid.module.css'

const STATUS_LABELS: Record<string, string> = {
  Open:       'Open',
  InProgress: 'In Progress',
  Delivered:  'In Review',
  Completed:  'Completed',
  Reclaimed:  'Reclaimed',
}

function JobCard({ job, index }: { job: Job; index: number }) {
  const usdcAmt = formatUSDC(job.amountUSDC)

  return (
    <Link
      href={`/jobs/${job.id}`}
      className={`${styles.card} animate-fade-up stagger-${Math.min(index + 1, 6)}`}
    >
      <div className={styles.cardTop}>
        <span className={styles.catPill}>{job.category}</span>
        <div className={styles.amount}>
          ${usdcAmt}
          <span className={styles.amountSub}>USDC</span>
        </div>
      </div>

      <h3 className={styles.title}>{job.title}</h3>
      <p className={styles.desc}>{job.description}</p>

      <div className={styles.tags}>
        {job.skills?.slice(0, 4).map(s => (
          <span key={s} className={styles.tag}>{s}</span>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.client}>
          <div className={styles.avatar}>
            {job.client.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <div className={styles.clientName}>{shortAddress(job.client)}</div>
            <div className={styles.worldTag}>✓ World ID</div>
          </div>
        </div>
        <div className={styles.right}>
          <span className={`${styles.status} ${styles[`status_${job.status}`]}`}>
            <span className={styles.statusDot} />
            {STATUS_LABELS[job.status]}
          </span>
          <div className={styles.deadline}>
            {job.deadline ? new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
          </div>
        </div>
      </div>
    </Link>
  )
}

export function JobGrid() {
  return (
    <section className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>Open Positions</h2>
        <span className={styles.count}>{MOCK_JOBS.length} jobs available</span>
      </div>
      <div className={styles.grid}>
        {MOCK_JOBS.map((job, i) => (
          <JobCard key={job.id} job={job} index={i} />
        ))}
      </div>
    </section>
  )
}
