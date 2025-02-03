'use client';

import { Scene } from "@/components/Scene";
import { ChatBox } from "@/components/ChatBox";

export default function ChatPage() {
  return (
    <div className="flex h-screen items-center justify-center gap-8 bg-gray-50">
      <Scene />
      <ChatBox />
    </div>
  );
}