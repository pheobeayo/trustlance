'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useReadContract } from 'wagmi'
import { TRUSTLANCE_ABI, TRUSTLANCE_ADDRESS } from '@/lib/contracts'
import { base } from 'wagmi/chains'
import styles from './Navbar.module.css'

export function Navbar() {
  const pathname = usePathname()
  const { address, isConnected } = useAccount()

  const { data: isVerified } = useReadContract({
    address: TRUSTLANCE_ADDRESS[base.id],
    abi: TRUSTLANCE_ABI,
    functionName: 'isVerified',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <Link href="/jobs" className={styles.logo}>
          <span className={styles.logoOrb}>✦</span>
          TrustLance
        </Link>
        <div className={styles.tabs}>
          <Link
            href="/jobs"
            className={`${styles.tab} ${pathname === '/jobs' || pathname === '/' ? styles.active : ''}`}
          >
            Browse Jobs
          </Link>
          <Link
            href="/jobs/post"
            className={`${styles.tab} ${pathname === '/jobs/post' ? styles.active : ''}`}
          >
            Post a Job
          </Link>
        </div>
      </div>

      <div className={styles.right}>
        {isConnected && (
          <div className={isVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
            <span className={isVerified ? styles.dotGreen : styles.dotAmber} />
            {isVerified ? 'World ID Verified' : 'Not Verified'}
          </div>
        )}
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="avatar"
        />
      </div>
    </nav>
  )
}
