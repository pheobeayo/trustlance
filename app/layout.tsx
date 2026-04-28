import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Providers } from '@/components/layout/Providers'

export const metadata: Metadata = {
  title: 'TrustLance — Verified Freelance Escrow',
  description:
    'Sybil-resistant freelance marketplace. Every participant is World ID verified. Payments held in USDC escrow and released via KeeperHub.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
