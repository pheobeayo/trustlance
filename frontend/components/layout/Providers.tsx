'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import {
  RainbowKitProvider,
  getDefaultWallets,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

const { connectors } = getDefaultWallets({
  appName: 'TrustLance',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'demo',
})

const wagmiConfig = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
  connectors,
})

const queryClient = new QueryClient()

const DARK_THEME = darkTheme({
  accentColor:           '#0d9e75',
  accentColorForeground: '#ffffff',
  borderRadius:          'medium',
  fontStack:             'system',
  overlayBlur:           'small',
})

const LIGHT_THEME = lightTheme({
  accentColor:           '#0d9e75',
  accentColorForeground: '#ffffff',
  borderRadius:          'medium',
  fontStack:             'system',
  overlayBlur:           'small',
})

function RainbowKitWithTheme({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  return (
    <RainbowKitProvider theme={resolvedTheme === 'light' ? LIGHT_THEME : DARK_THEME}>
      {children}
    </RainbowKitProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitWithTheme>
          {children}
        </RainbowKitWithTheme>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
