import type { Metadata } from 'next'
import './globals.css'
import { Providers }             from '@/components/layout/Providers'
import { Navbar }                from '@/components/layout/Navbar'
import { ThemeProvider }         from '@/components/layout/ThemeProvider'
import { UnsupportedChainBanner } from '@/components/layout/UnsupportedChain'

export const metadata: Metadata = {
  title: 'TrustLance — Freelance Without the Risk',
  description: 'Freelance escrow on 0G Chain. Uniswap-powered deposits. KeeperHub-guaranteed release.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
          themes={['dark', 'light']}
        >
          <Providers>
            <Navbar />
            <main className="pt-16">{children}</main>
            <UnsupportedChainBanner />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
