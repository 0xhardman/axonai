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
    <div className="w-[500px] border border-gray-200 rounded-lg shadow-lg bg-white">
      <div className="h-[500px] p-6 flex flex-col">
        <div className="flex-1 overflow-auto space-y-4 mb-4">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`p-4 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-50 ml-8' 
                  : 'bg-gray-50 mr-8'
              }`}
            >
              <div className="font-medium text-sm text-gray-600 mb-2">
                {message.role === 'user' ? 'You' : 'AI'}
              </div>
              {message.reasoning && (
                <pre className="bg-gray-100 p-3 rounded-md mb-2 text-sm overflow-auto font-mono text-gray-700">
                  {message.reasoning}
                </pre>
              )}
              <div className="text-gray-700 whitespace-pre-wrap">
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
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
