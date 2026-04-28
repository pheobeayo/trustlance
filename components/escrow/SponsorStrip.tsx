import styles from './SponsorStrip.module.css'

const SPONSORS = [
  {
    badge:       'WORLD ID',
    name:        'Proof of Personhood',
    description: 'Sybil-resistant identity — every user is a unique human',
  },
  {
    badge:       'UNISWAP',
    name:        'Token-Agnostic Deposits',
    description: 'ETH / USDT / DAI → USDC auto-swapped via Universal Router',
  },
  {
    badge:       'KEEPERHUB',
    name:        'Guaranteed Release',
    description: 'SLA-backed payment execution with retry and audit trail',
  },
]

export function SponsorStrip() {
  return (
    <div className={styles.strip}>
      {SPONSORS.map((s, i) => (
        <div key={i} className={styles.item}>
          <span className={styles.badge}>{s.badge}</span>
          <div className={styles.text}>
            <div className={styles.name}>{s.name}</div>
            <div className={styles.desc}>{s.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
