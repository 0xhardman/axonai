'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAgent } from '@/api/ContractAgent';
import { useToast } from "@/hooks/use-toast";
import { useAccount } from 'wagmi';
import { cn } from "@/lib/utils";
import { RainbowButton } from '@/components/ui/rainbow-button';

interface ContractInfo {
  name: string;
  skillDescription: string;
}

export default function ContractAgentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { chain } = useAccount();
  const [contractAddress, setContractAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
        throw new Error('Invalid contract address format');
      }

      const agent = await createAgent({
        chainId: chain?.id || 8453,
        address: contractAddress,
        backstories: []
      });

      router.push(`/contract-agent/edit?id=${agent.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create agent';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="container flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Create Contract Agent</CardTitle>
            <CardDescription>
              Enter your smart contract address to create an AI agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contractAddress">Contract Address</Label>
                <Input
                  type="text"
                  id="contractAddress"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="0x..."
                  className={cn(
                    error && "border-destructive",
                    "font-mono"
                  )}
                  required
                />
                {error && (
                  <p className="text-sm text-destructive">
                    {error}
                  </p>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <RainbowButton
              onClick={handleSubmit}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Agent'}
            </RainbowButton>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
