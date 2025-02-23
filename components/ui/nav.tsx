'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { message } from '@/api/GetLoginMessage';
import { login } from '@/api/Login';
import { setupToken, getToken } from '@/lib/auth';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function MainNav() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { toast } = useToast();

  useEffect(() => {
    const handleLogin = async () => {
      if (!isConnected || !address) return;

      // Check if we already have a valid token
      const existingToken = getToken("login");
      if (existingToken?.isValid()) {
        console.log("Already have valid token, skipping login");
        return;
      }

      try {
        // 1. Get login message
        const { message: loginMessage } = await message({ address });

        // 2. Sign the message
        const signature = await signMessageAsync({ message: loginMessage });

        // 3. Login with signature
        const { token } = await login({
          signature,
          message: loginMessage,
          address
        });

        // 4. Setup token in auth system with default type
        setupToken(token, "login");
        toast({
          title: "Login Successful",
          description: "You have successfully logged in with your wallet",
        });
      } catch (error) {
        console.error('Login failed:', error);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error instanceof Error ? error.message : "Failed to login with wallet",
        });
      }
    };

    handleLogin();
  }, [address, isConnected, signMessageAsync, toast]);

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-10">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="AxonAI Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-xl font-bold">AxonAI</span>
        </Link>
        <nav className="flex items-center space-x-6 ml-6">
          <Link
            href="/contract-agent"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary"
            )}
          >
            Create
          </Link>
          <Link
            href="/contract-agent/list"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary"
            )}
          >
            List
          </Link>
          <Link
            href="/chat"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary"
            )}
          >
            Chat
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </div>
    </nav>
  );
}
