'use client';

import { Scene } from "@/components/Scene";
import { ChatBox } from "@/components/ChatBox";
import { MinecraftNav } from "@/components/MinecraftNav";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MinecraftNav />
      <div className="flex-1 flex items-center justify-center gap-8 py-8">
        <Scene />
        <ChatBox />
      </div>
    </div>
  );
}