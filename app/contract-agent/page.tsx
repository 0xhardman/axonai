'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scene } from "@/components/Scene";

interface ContractInfo {
  name: string;
  skillDescription: string;
}

export default function ContractAgentPage() {
  const router = useRouter();
  const [contractAddress, setContractAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/contract-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: contractAddress }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contract information');
      }

      const contractInfo: ContractInfo = await response.json();
      
      // Navigate to edit page with contract info
      router.push(`/contract-agent/edit?address=${contractAddress}&name=${encodeURIComponent(contractInfo.name)}&description=${encodeURIComponent(contractInfo.skillDescription)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center gap-8 py-8">
        <Scene />
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Contract Agent</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="contractAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Contract Address
              </label>
              <input
                type="text"
                id="contractAddress"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter contract address"
                required
              />
            </div>

            {error && (
              <div className="mb-4 text-red-500 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Loading...' : 'Next'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
