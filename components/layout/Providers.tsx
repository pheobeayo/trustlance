'use client'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  RainbowKitProvider,
  getDefaultWallets,
  darkTheme,
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

const customTheme = darkTheme({
  accentColor:          '#0d9e75',
  accentColorForeground: '#ffffff',
  borderRadius:         'medium',
  fontStack:            'system',
  overlayBlur:          'small',
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
