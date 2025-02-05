'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';

export function MinecraftNav() {
  return (
    <nav className="bg-[#1D1D1D] border-b-2 border-[#373737] px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/assets/minecraft-logo.png"
            alt="Minecraft Logo"
            width={40}
            height={40}
            className="pixelated"
          />
          <span className="text-white font-minecraft text-xl">AxonAI</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <Link
            href="/contract-agent"
            className="text-gray-300 hover:text-white font-minecraft px-4 py-2 hover:bg-[#373737] rounded transition-colors"
          >
            Create
          </Link>
          <Link
            href="/contract-agent/list"
            className="text-gray-300 hover:text-white font-minecraft px-4 py-2 hover:bg-[#373737] rounded transition-colors"
          >
            List
          </Link>
          <Link
            href="/chat"
            className="text-gray-300 hover:text-white font-minecraft px-4 py-2 hover:bg-[#373737] rounded transition-colors"
          >
            Chat
          </Link>
        </div>

        {/* Login Button */}
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        className="h-10 flex items-center justify-center bg-[#4CAF50] hover:bg-[#45a049] text-white font-minecraft px-6 rounded shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 border-b-4 border-[#367d39] hover:border-[#2d682f] active:border-b-0 active:translate-y-0.5"
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        className="h-10 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-minecraft px-6 rounded shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 border-b-4 border-red-700 hover:border-red-800 active:border-b-0 active:translate-y-0.5"
                      >
                        Wrong Network
                      </button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={openChainModal}
                        className="h-10 flex items-center justify-center bg-[#4CAF50] hover:bg-[#45a049] text-white font-minecraft px-4 rounded shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 border-b-4 border-[#367d39] hover:border-[#2d682f] active:border-b-0 active:translate-y-0.5"
                      >
                        {chain.hasIcon && (
                          <div className="mr-2">
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                className="w-5 h-5"
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </button>

                      <button
                        onClick={openAccountModal}
                        className="h-10 flex items-center justify-center bg-[#4CAF50] hover:bg-[#45a049] text-white font-minecraft px-4 rounded shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 border-b-4 border-[#367d39] hover:border-[#2d682f] active:border-b-0 active:translate-y-0.5"
                      >
                        {account.displayName}
                        {account.displayBalance && (
                          <span className="ml-2">
                            {account.displayBalance}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </nav>
  );
}
