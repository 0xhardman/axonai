'use client';
import '@rainbow-me/rainbowkit/styles.css';
import {
  darkTheme,
  getDefaultConfig,
  lightTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  base
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";


export const config = getDefaultConfig({
  appName: 'Axon AI',
  projectId: 'a1fc63f578160e84914e2f3788fc6c58',
  chains: [base],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

export const RainbowProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme({
          accentColor: '#000000',
          borderRadius: 'small',
          fontStack: 'system',
          overlayBlur: 'small',
        })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};