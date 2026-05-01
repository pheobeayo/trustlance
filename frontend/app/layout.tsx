import type { Metadata } from 'next'
import './globals.css'
import { Providers }      from '@/components/layout/Providers'
import { Navbar }         from '@/components/layout/Navbar'
import { ThemeProvider }  from '@/components/layout/ThemeProvider'

export const metadata: Metadata = {
  title: 'TrustLance — Freelance Without the Risk',
  description: 'Sybil-resistant freelance escrow. World ID verified. KeeperHub guaranteed. Uniswap-powered.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
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
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
