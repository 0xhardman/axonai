'use client';

import { useChat } from 'ai/react';
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { MinecraftVillager } from '@/components/MinecraftVillager';
import { Scene } from '@/components/Scene';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit, error } = useChat();

  return (
    <div className="flex h-screen">
      {/* Chat Section */}
      <div className="w-1/2 h-full p-4 overflow-auto flex flex-col">
        <div className="flex-1 overflow-auto space-y-4">
          {messages.map(message => (
            <div key={message.id} className={`p-4 rounded-lg ${message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
              <div className="font-bold mb-2">
                {message.role === 'user' ? 'You' : 'AI'}
              </div>
              {message.reasoning && (
                <pre className="bg-gray-50 p-2 rounded mb-2 text-sm overflow-auto">
                  {message.reasoning}
                </pre>
              )}
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex gap-2">
            <input
              name="prompt"
              value={input}
              onChange={handleInputChange}
              className="flex-1 p-2 border rounded"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* 3D Scene */}
      <Scene />
    </div>
  );
}