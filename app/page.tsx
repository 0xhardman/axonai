import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scene } from '@/components/Scene';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-[1200px] w-full flex gap-12 items-center">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl  text-gray-900">
              Contract Agent
            </h1>
            <p className="text-xl  text-gray-600">
              Your Smart Contract AI Assistant
            </p>
            <div className="space-y-4 text-gray-600 ">
              <p>🤖 Create AI agents for your smart contracts</p>
              <p>💬 Chat with your contracts in natural language</p>
              <p>🔍 Analyze contract behavior and security</p>
            </div>
            <div className="pt-6">
              <Link href="/contract-agent">
                <Button variant="minecraft" size="lg" className="text-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-[500px]">
            <Scene />
          </div>
        </div>
      </div>
    </div>
  );
}
