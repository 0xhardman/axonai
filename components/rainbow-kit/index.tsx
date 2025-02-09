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
  sepolia,
  optimism,
  optimismSepolia,
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  polygon,
  avalanche,
  avalancheFuji,
  zkSync,
  celo,
  celoAlfajores,
  linea,
  lineaSepolia,
  scroll,
  scrollSepolia,
  bsc,
  Chain,
} from 'wagmi/chains';

// Define custom chains that aren't in wagmi/chains
const blast: Chain = {
  id: 81457,
  name: 'Blast',
  network: 'blast',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.blast.io'] },
    public: { http: ['https://rpc.blast.io'] },
  },
};

const blastSepolia: Chain = {
  id: 168587773,
  name: 'Blast Sepolia',
  network: 'blast-sepolia',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.blast.io'] },
    public: { http: ['https://sepolia.blast.io'] },
  },
  testnet: true,
};

const mantle: Chain = {
  id: 5000,
  name: 'Mantle',
  network: 'mantle',
  nativeCurrency: { name: 'Mantle', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.mantle.xyz'] },
    public: { http: ['https://rpc.mantle.xyz'] },
  },
};

const mantleSepolia: Chain = {
  id: 5003,
  name: 'Mantle Sepolia',
  network: 'mantle-sepolia',
  nativeCurrency: { name: 'Mantle', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] },
    public: { http: ['https://rpc.sepolia.mantle.xyz'] },
  },
  testnet: true,
};

const holesky: Chain = {
  id: 17000,
  name: 'Holesky',
  network: 'holesky',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://ethereum-holesky.publicnode.com'] },
    public: { http: ['https://ethereum-holesky.publicnode.com'] },
  },
  testnet: true,
};

const zkSyncSepolia: Chain = {
  id: 300,
  name: 'zkSync Sepolia',
  network: 'zksync-sepolia',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.era.zksync.dev'] },
    public: { http: ['https://sepolia.era.zksync.dev'] },
  },
  testnet: true,
};

import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

export const config = getDefaultConfig({
  appName: 'Axon AI',
  projectId: 'a1fc63f578160e84914e2f3788fc6c58',
  chains: [
    // Mainnets
    mainnet,
    polygon,
    optimism,
    arbitrum,
    bsc,
    linea,
    base,
    blast,
    avalanche,
    celo,
    zkSync,
    mantle,
    scroll,
    // Testnets
    sepolia,
    holesky,
    lineaSepolia,
    baseSepolia,
    blastSepolia,
    optimismSepolia,
    arbitrumSepolia,
    avalancheFuji,
    celoAlfajores,
    zkSyncSepolia,
    mantleSepolia,
    scrollSepolia,
  ],
  ssr: true,
});

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