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
  mainnet,
  optimism,
  optimismSepolia,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const optimismFork = {
  id: 10,
  name: 'OP Fork',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://virtual.optimism.rpc.tenderly.co/320f5d02-bffa-4ba1-b1ca-b09f53e86ecc'],
    },
  },
}

const mainnetFork = {
  id: 1,
  name: 'Mainnet Fork',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://virtual.mainnet.rpc.tenderly.co/35407ebc-58f0-48b7-91fb-1a94dfb773ab'],
    },
  },
}

const DCATest = {
  id: 31337,
  name: 'DCA TEST',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.cryptodca.xyz/'],
    },
  },
}

export const config = getDefaultConfig({
  appName: 'Axon AI',
  projectId: 'a1fc63f578160e84914e2f3788fc6c58',
  chains: [optimism],
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