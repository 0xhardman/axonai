'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createAgent } from '@/api/ContractAgent';
import { useToast } from "@/hooks/use-toast";
import { useAccount } from 'wagmi';

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

      //  agent
      const agent = await createAgent({
        chainId: chain?.id || 8453,
        address: contractAddress,
        backstories: []
      });

      // ， agent id
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
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center py-8">
        <Card className="w-full max-w-md border-2 border-[#367d39] bg-white">
          <CardHeader>
            <CardTitle className="text-2xl  text-center">Create Contract Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contractAddress" className="block text-sm  text-gray-700 mb-2">
                  Contract Address
                </label>
                <input
                  type="text"
                  id="contractAddress"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#367d39] rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50]  text-sm"
                  placeholder="Enter contract address"
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm ">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                variant="minecraft"
                className="w-full"
              >
                {loading ? 'Loading...' : 'Next'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
