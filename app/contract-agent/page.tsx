'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createAgent } from '@/api/ContractAgent';
import { useToast } from "@/hooks/use-toast";

interface ContractInfo {
  name: string;
  skillDescription: string;
}

export default function ContractAgentPage() {
  const router = useRouter();
  const { toast } = useToast();
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

      // 创建 agent
      const agent = await createAgent({
        chainId: 8453, // 默认使用以太坊主网
        address: contractAddress,
        backstories: [] // 初始化时没有背景故事
      });

      // 导航到编辑页面，只传入 agent id
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
            <CardTitle className="text-2xl font-minecraft text-center">Create Contract Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contractAddress" className="block text-sm font-minecraft text-gray-700 mb-2">
                  Contract Address
                </label>
                <input
                  type="text"
                  id="contractAddress"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#367d39] rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] font-minecraft text-sm"
                  placeholder="Enter contract address"
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm font-minecraft">
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
