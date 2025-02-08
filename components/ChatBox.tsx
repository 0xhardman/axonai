/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { sendMessage } from '@/api/SendMessage';
import { getChatHistory } from '@/api/GetChatHistory';
import { confirmChatAction } from '@/api/ConfirmChatAction';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string | number;
  role: 'user' | 'ai';
  content: string;
}

interface ActionConfirmation {
  actionId: string;
  txData: any;
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentState, setAgentState] = useState<string>('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationData, setConfirmationData] = useState<ActionConfirmation | null>(null);
  const [txJsonContent, setTxJsonContent] = useState('');
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId') || undefined;
  const pollingRef = useRef<NodeJS.Timeout>(null);
  const currentChatId = searchParams.get('chatId') || undefined;
  const [currentChatIdState, setCurrentChatIdState] = useState<string | undefined>(currentChatId);

  const fetchChatHistory = async (id: string) => {
    try {
      const response = await getChatHistory({ chatId: id });
      console.log('Response:', response);

      // 设置 agent 状态
      const agent = response.agents[0]; // 假设我们关注第一个 agent
      if (agent) {
        setAgentState(agent.stateDescription || 'No state description available');
      }

      // 设置消息历史
      const historicalMessages: Message[] = response.messages.map(msg => ({
        id: msg.id,
        role: msg.agentId ? 'ai' : 'user' as const,
        content: msg.content
      }));
      console.log('Historical messages:', historicalMessages);
      setMessages(historicalMessages);

      // Check for actions requiring confirmation
      const pendingAction = response.actions?.find(action => action.state === 3);
      if (pendingAction) {
        setConfirmationData({
          actionId: pendingAction.id,
          txData: pendingAction.task.tx
        });
        setTxJsonContent(JSON.stringify(pendingAction.task.tx, null, 2));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to load chat history. ${error}`,
      });
    }
  };

  // 初始加载和轮询
  useEffect(() => {
    let isPolling = true;

    const poll = async () => {
      if (!isPolling || !currentChatIdState) return;

      try {
        await fetchChatHistory(currentChatIdState);
      } finally {
        if (isPolling) {
          pollingRef.current = setTimeout(poll, 2000);
        }
      }
    };

    if (currentChatIdState) {
      poll(); // 开始轮询
    }

    return () => {
      isPolling = false;
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, [currentChatIdState]);

  // 当URL中的chatId变化时更新currentChatId
  useEffect(() => {
    setCurrentChatIdState(chatId);
  }, [chatId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage({
        message: input,
        chatId: currentChatIdState || '',
        chainId: 8453 // 默认使用 chainId 1，如果需要可以从配置或其他地方获取
      });

      // 如果是新对话，从响应中获取chatId并开始轮询
      if (!currentChatIdState && response.chatId) {
        setCurrentChatIdState(response.chatId);
      }

      // 不需要立即添加 AI 消息，因为轮询会自动获取最新消息
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleConfirmAction = async (confirm: boolean) => {
    try {
      if (!confirmationData) return;

      const txData = confirm ? JSON.parse(txJsonContent) : null;
      await confirmChatAction({
        actionId: confirmationData.actionId,
        txData,
        confirm
      });

      // Clear confirmation dialog
      setConfirmationData(null);
      setTxJsonContent('');

      // Refresh chat history
      if (currentChatIdState) {
        await fetchChatHistory(currentChatIdState);
      }
    } catch (error) {
      console.error('Failed to confirm action:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to confirm action. ${error}`,
      });
    }
  };

  return (
    <div className="w-[500px] bg-[#1D1D1D] border-2 border-[#373737] rounded-lg shadow-2xl">
      {/* Agent Status Bar */}
      {agentState && (
        <div className="px-6 py-3 bg-[#2D2D2D] border-b border-[#373737] rounded-t-lg">
          <div className="font-minecraft text-sm text-gray-300">Agent Status:</div>
          <div className="text-white font-minecraft">{agentState}</div>
        </div>
      )}
      {/* Chat Messages */}
      <div className="h-[450px] p-6 flex flex-col">
        <div className="flex-1 overflow-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-[#373737] scrollbar-track-[#1D1D1D]">
          {messages.map(message => (
            <div
              key={message.id}
              className={`p-4 rounded ${message.role === 'user'
                ? 'bg-[#2D7D32] ml-8'
                : 'bg-[#424242] mr-8'
                }`}
            >
              <div className="font-minecraft text-sm text-gray-300 mb-2">
                {message.role === 'user' ? 'You' : 'AI'}
              </div>
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
              disabled={isLoading}
              className="flex-1 p-3 bg-[#424242] text-white font-minecraft border-2 border-[#373737] rounded focus:outline-none focus:border-[#4CAF50] placeholder-gray-500 disabled:opacity-50"
              placeholder={isLoading ? "AI is thinking..." : "Type your message..."}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-[#4CAF50] text-white font-minecraft rounded shadow-lg hover:bg-[#45a049] transition-colors border-b-4 border-[#367d39] hover:border-[#2d682f] active:border-b-0 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog open={!!confirmationData} onOpenChange={() => setConfirmationData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={txJsonContent}
              onChange={(e) => setTxJsonContent(e.target.value)}
              className="min-h-[200px] font-mono"
              placeholder="Transaction data in JSON format"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleConfirmAction(false)}>
              Reject
            </Button>
            <Button onClick={() => handleConfirmAction(true)}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
