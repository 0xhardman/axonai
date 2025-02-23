import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { RetroGrid } from '@/components/ui/retro-grid';

export default function HomePage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-4 px-4 text-center md:gap-10">
        <div className="space-y-6">
          <div className="relative flex h-[240px] w-full flex-col items-center justify-center overflow-hidden rounded-lg  bg-background ">
            <span className="h-20 pointer-events-none z-10 whitespace-pre-wrap bg-gradient-to-b from-[#90EE90] via-[#32CD32] to-[#006400] bg-clip-text text-center text-7xl font-bold leading-none tracking-tighter text-transparent">
              Contract Agent
            </span>

            <RetroGrid />
          </div>
          <p className="mx-auto max-w-[600px] text-muted-foreground text-lg sm:text-xl">
            Your Smart Contract AI Assistant - Interact with blockchain contracts through natural language
          </p>
        </div>

        <div className="w-full max-w-[600px] grid gap-4 text-muted-foreground text-base sm:text-lg">
          <div className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <div className="size-8 flex items-center justify-center rounded-full bg-primary/10">
              <span className="text-primary text-lg">🤖</span>
            </div>
            <p>Create AI agents for your smart contracts</p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <div className="size-8 flex items-center justify-center rounded-full bg-primary/10">
              <span className="text-primary text-lg">💬</span>
            </div>
            <p>Chat with your contracts in natural language</p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <div className="size-8 flex items-center justify-center rounded-full bg-primary/10">
              <span className="text-primary text-lg">🔍</span>
            </div>
            <p>Analyze contract behavior and security</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contract-agent">
            <RainbowButton className="w-full sm:w-auto min-w-[200px]">
              Get Started
            </RainbowButton>
          </Link>
          <Link href="/contract-agent/list">
            <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]">
              View Contracts
            </Button>
          </Link>
        </div>
      </div>
    </main >
  );
}
