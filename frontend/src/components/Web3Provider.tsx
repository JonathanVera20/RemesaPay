'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';
import { wagmiConfig } from '../config/web3';
import { useState } from 'react';
import { ClientOnly } from './ClientOnly';

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
      },
    },
  }));

  return (
    <ClientOnly 
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      }
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider
            theme="rounded"
            mode="light"
            options={{
              embedGoogleFonts: true,
              initialChainId: 84532, // Base Sepolia Chain ID
              enforceSupportedChains: true,
              walletConnectCTA: 'both',
            }}
          >
            {children}
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ClientOnly>
  );
}
