'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { defineChain } from 'viem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import {
  RainbowKitProvider,
  getDefaultWallets,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'


const ogTestnet = defineChain({
  id:   16602,
  name: '0G Galileo Testnet',
  nativeCurrency: { name: '0G', symbol: 'OG', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
    public:  { http: ['https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Chainscan', url: 'https://chainscan-galileo.0g.ai' },
  },
  testnet: true,
})

const ogMainnet = defineChain({
  id:   16661,
  name: '0G Mainnet',
  nativeCurrency: { name: '0G', symbol: 'OG', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc.0g.ai'] },
    public:  { http: ['https://evmrpc.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Chainscan', url: 'https://chainscan.0g.ai' },
  },
})


const { connectors } = getDefaultWallets({
  appName:   'TrustLance',
  projectId: 'fce1a05f7d9938deb8703f040e7217fd',
})

const wagmiConfig = createConfig({
  chains:     [ogTestnet, ogMainnet],
  transports: {
    [ogTestnet.id]: http(),
    [ogMainnet.id]: http(),
  },
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