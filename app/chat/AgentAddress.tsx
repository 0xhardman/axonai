'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/auth";
import JWT from "jsonwebtoken";
import { createPublicClient, http, formatEther } from 'viem';
import { mainnet } from 'viem/chains';

export default function AgentAddress() {
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState<string>('');

    const client = createPublicClient({
        chain: mainnet,
        transport: http(process.env.NEXT_PUBLIC_RPC_URL)
    });

    const fetchBalance = async (addr: string) => {
        try {
            const balanceWei = await client.getBalance({ address: addr as `0x${string}` });
            const balanceEth = formatEther(balanceWei);
            setBalance(parseFloat(balanceEth).toFixed(4));
        } catch (error) {
            console.error('Error fetching balance:', error);
            setBalance('Error');
        }
    };

    useEffect(() => {
        const token = getToken();
        if (token) {
            try {
                const decoded = JWT.decode(token.value);
                if (decoded && typeof decoded === 'object' && 'agent' in decoded) {
                    const agentAddress = decoded.agent.agentAddress;
                    setAddress(agentAddress);
                    fetchBalance(agentAddress);
                }
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    }, []);

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address)
                .then(() => {
                    console.log('Address copied to clipboard');
                })
                .catch(err => {
                    console.error('Failed to copy address:', err);
                });
        }
    };

    return (
        <div className="w-[500px] bg-[#1D1D1D] border-2 border-[#373737] rounded-lg p-4 mt-4">
            <div className="flex flex-col items-start justify-between">
                <div className="flex flex-col space-y-1">
                    <div className="font-minecraft text-sm text-gray-300">Agent Address</div>
                    <div className="text-white font-minecraft truncate">{address || 'No address available'}</div>
                    {balance && (
                        <div className="text-sm text-gray-300 font-minecraft">
                            Balance: {balance} ETH
                        </div>
                    )}
                </div>
                <div className="flex gap-2 mt-2">
                    <Button
                        onClick={() => address && fetchBalance(address)}
                        size="sm"
                        className="bg-[#4CAF50] hover:bg-[#45a049] text-white font-minecraft"
                    >
                        Refresh
                    </Button>
                    <Button
                        onClick={copyAddress}
                        disabled={!address}
                        size="sm"
                        className="bg-[#373737] hover:bg-[#424242] text-white font-minecraft disabled:opacity-50"
                    >
                        Copy
                    </Button>
                </div>
            </div>
        </div>
    );
}