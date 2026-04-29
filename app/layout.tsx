import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { Navbar } from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'TrustLance — Freelance Without the Risk',
  description: 'Sybil-resistant freelance escrow. World ID verified. KeeperHub guaranteed. Uniswap-powered.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#040705] text-[#e5f2ea] min-h-screen">
        <Providers>
          <Navbar />
          <main className="pt-16">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
