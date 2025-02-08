'use client';

import { ChatBox } from "@/components/ChatBox";

export default function ChatPage() {
  return (
    <div className="flex justify-center items-center h-[calc(100vh-66px)] bg-gray-50  flex-col">

      <ChatBox />
    </div>
  );
}