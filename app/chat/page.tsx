'use client';

import { ChatBox } from "@/components/ChatBox";
import { Suspense } from "react";

export default function ChatPage() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-66px)] bg-gray-50 flex-col">
      <Suspense fallback={<div>Loading...</div>}>
        <ChatBox />
      </Suspense>
    </div>
  );
}