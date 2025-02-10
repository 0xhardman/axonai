'use client';

import { ChatBox } from "@/components/ChatBox";
import { Suspense } from "react";
import AgentAddress from "./AgentAddress";

export default function ChatPage() {
  return (
    <div className="flex justify-center items-center h-[calc(100vh-66px)] bg-gray-50 flex-col">
      <Suspense fallback={<div>Loading...</div>}>
        <ChatBox />
        <AgentAddress />
      </Suspense>
    </div>
  );
}