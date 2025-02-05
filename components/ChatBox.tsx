import { useState } from 'react';

interface Message {
  id: number;
  role: 'user' | 'ai';
  content: string;
  reasoning?: string;
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
    };

    setMessages([...messages, newMessage]);
    setInput('');
  };

  return (
    <div className="w-[500px] bg-[#1D1D1D] border-2 border-[#373737] rounded-lg shadow-2xl">
      <div className="h-[500px] p-6 flex flex-col">
        <div className="flex-1 overflow-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-[#373737] scrollbar-track-[#1D1D1D]">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`p-4 rounded ${
                message.role === 'user' 
                  ? 'bg-[#2D7D32] ml-8' 
                  : 'bg-[#424242] mr-8'
              }`}
            >
              <div className="font-minecraft text-sm text-gray-300 mb-2">
                {message.role === 'user' ? 'You' : 'AI'}
              </div>
              {message.reasoning && (
                <pre className="bg-[#1D1D1D] p-3 rounded mb-2 text-sm overflow-auto font-minecraft text-gray-300">
                  {message.reasoning}
                </pre>
              )}
              <div className="text-white font-minecraft whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="mt-auto">
          <div className="flex gap-2">
            <input
              name="prompt"
              value={input}
              onChange={handleInputChange}
              className="flex-1 p-3 bg-[#424242] text-white font-minecraft border-2 border-[#373737] rounded focus:outline-none focus:border-[#4CAF50] placeholder-gray-500"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#4CAF50] text-white font-minecraft rounded shadow-lg hover:bg-[#45a049] transition-colors border-b-4 border-[#367d39] hover:border-[#2d682f] active:border-b-0 active:translate-y-0.5"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
