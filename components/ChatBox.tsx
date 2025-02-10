/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { sendMessage } from '@/api/SendMessage';
import { getChatHistory } from '@/api/GetChatHistory';
import { confirmChatAction } from '@/api/ConfirmChatAction';
import { getAgentList } from '@/api/GetAgentList';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
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
  agentId?: string;
}

interface ActionConfirmation {
  actionId: string;
  txData: any;
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address } = useAccount();
  const [agentStates, setAgentStates] = useState<Map<string, string>>(new Map());
  const [agentNames, setAgentNames] = useState<Map<string, string>>(new Map());
  const [isPolling, setIsPolling] = useState(true);
  const [confirmationData, setConfirmationData] = useState<ActionConfirmation | null>(null);
  const [txJsonContent, setTxJsonContent] = useState('');
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(searchParams.get('chatId') || undefined);
  const [isConfirming, setIsConfirming] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout>(null);
  const { chain } = useAccount();

  // Function to get agent-specific background color
  const getAgentBackgroundColor = (agentId?: string) => {
    if (!agentId) return 'bg-gray-700';
    // Use a green color palette for AI messages
    return 'bg-[#1a472a] hover:bg-[#1f5233] transition-colors';
  };

  useEffect(() => {
    const fetchAgentNames = async () => {
      try {
        const response = await getAgentList();
        const namesMap = new Map();
        response.agents.forEach(agent => {
          namesMap.set(agent.id, agent.name);
        });
        setAgentNames(namesMap);
      } catch (error) {
        console.error('Failed to fetch agent names:', error);
      }
    };

    fetchAgentNames();
  }, []);

  const fetchChatHistory = async (id: string) => {
    try {
      const response = await getChatHistory({ chatId: id });
      console.log('Response:', response);
      console.log('Agents:', response.agents);

      // Update agent states
      if (Array.isArray(response.agents)) {
        const newAgentStates = new Map(response.agents
          .filter(agent => agent && agent.agentId) // Make sure agent and agentId exist
          .map(agent => {
            console.log('Processing agent:', agent);
            return [
              agent.agentId,
              agent.stateDescription || 'No state description available'
            ];
          }));
        console.log('New agent states:', Array.from(newAgentStates.entries()));
        setAgentStates(newAgentStates);
      } else {
        console.warn('No agents array in response:', response);
      }

      // 设置消息历史
      const historicalMessages: Message[] = response.messages.map(msg => ({
        id: msg.id,
        role: msg.agentId ? 'ai' : 'user' as const,
        content: msg.content,
        agentId: msg.agentId || undefined
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
      // Only show toast if it's not a 503 error
      if (!(error instanceof Error && 'status' in error && error.status === 503)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load chat history. ${error}`,
        });
      }
    }
  };

  // Update URL when chatId changes
  useEffect(() => {
    if (currentChatId) {
      // Create new URLSearchParams with current parameters
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('chatId', currentChatId);
      // Update URL without reloading the page
      router.replace(`?${newParams.toString()}`, { scroll: false });
    }
  }, [currentChatId, router, searchParams]);

  // Load chat history when chatId is available
  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId && chatId !== currentChatId) {
      setCurrentChatId(chatId);
      fetchChatHistory(chatId);
    }
  }, [searchParams]);

  // 初始加载和轮询
  useEffect(() => {
    let isPolling = true;

    const poll = async () => {
      if (!isPolling || !currentChatId) return;

      try {
        await fetchChatHistory(currentChatId);
      } finally {
        if (isPolling) {
          pollingRef.current = setTimeout(poll, 3000);
        }
      }
    };

    if (currentChatId) {
      poll(); // 开始轮询
    }

    return () => {
      isPolling = false;
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, [currentChatId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isPolling) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsPolling(false);

    try {
      const response = await sendMessage({
        message: input,
        chatId: currentChatId || '',
        chainId: chain?.id || 8453 // Use connected wallet's chain ID, fallback to Base
      });

      // 如果是新对话，从响应中获取chatId并开始轮询
      if (!currentChatId && response.chatId) {
        setCurrentChatId(response.chatId);
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
      setIsPolling(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleConfirmAction = async (confirm: boolean) => {
    if (!confirmationData) return;
    setIsConfirming(true);

    try {
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
      if (currentChatId) {
        await fetchChatHistory(currentChatId);
      }
    } catch (error) {
      console.log('Failed to confirm action:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to confirm action. ${error}`,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="w-[500px] bg-[#1D1D1D] border-2 border-[#373737] rounded-lg shadow-2xl">
      {/* Chat Messages */}
      <div className="h-[550px] p-6 flex flex-col">
        <h2 className="text-white text-lg font-bold mb-4">Chat with Your Agent</h2>
        <div className="flex-1 overflow-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-[#373737] scrollbar-track-[#1D1D1D]">
          {/* Display system message for agents without messages */}
          {Array.from(agentStates.entries()).length > 0 && (messages.length === 0 || !messages.some(m => m.role === 'ai')) && (
            <div className="rounded-lg p-4 mb-4 bg-gray-800/50">
              <div className="text-sm text-gray-300 mb-2">
                System
              </div>
              <div className="text-white  space-y-2">
                <div className="text-sm mb-2">Active Agents:</div>
                {Array.from(agentStates.entries()).map(([agentId, state]) => {
                  console.log('Rendering agent status:', agentId, state);
                  return (
                    <div
                      key={agentId}
                      className={`${getAgentBackgroundColor(agentId)} p-2 rounded flex justify-between items-center`}
                    >
                      <span>AI {agentId}</span>
                      <span className="text-xs bg-black/30 px-2 py-1 rounded">
                        {state}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular messages */}
          {messages.map(message => (
            <div
              key={message.id}
              className={`rounded-lg p-5 mb-6 ${message.role === 'user'
                ? 'bg-gray-700'
                : getAgentBackgroundColor(message.agentId)
                }`}
            >
              <div className="text-sm text-gray-300 mb-3 flex justify-between items-center">
                <span className="text-gray-200">
                  {message.role === 'user'
                    ? 'You'
                    : message.agentId
                      ? agentNames.get(message.agentId) || 'AI Agent'
                      : 'AI'
                  }
                </span>
              </div>
              <div className="text-white  whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
              {message.role === 'ai' && message.agentId && agentStates.get(message.agentId) && (
                <div className="w-full text-xs bg-[#0f2b19] text-emerald-300 px-3 py-1.5 mt-2">
                  {agentStates.get(message.agentId)}
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-auto">
          <div className="flex gap-2">
            <input
              name="prompt"
              value={input}
              onChange={handleInputChange}
              disabled={!isPolling}
              className="flex-1 p-3 bg-[#424242] text-white  border-2 border-[#373737] rounded focus:outline-none focus:border-[#4CAF50] placeholder-gray-500 disabled:opacity-50"
              placeholder={!isPolling ? "AI is thinking..." : "Type your message..."}
            />
            <button
              type="submit"
              disabled={!isPolling}
              className="px-6 py-3 bg-[#4CAF50] text-white  rounded shadow-lg hover:bg-[#45a049] transition-colors border-b-4 border-[#367d39] hover:border-[#2d682f] active:border-b-0 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog open={!!confirmationData} onOpenChange={() => !isConfirming && setConfirmationData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={txJsonContent}
              onChange={(e) => setTxJsonContent(e.target.value)}
              className="font-mono text-sm"
              rows={10}
              disabled={isConfirming}
            />
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="destructive"
              onClick={() => handleConfirmAction(false)}
              disabled={isConfirming}
            >
              {isConfirming ? 'Rejecting...' : 'Reject'}
            </Button>
            <Button
              onClick={() => handleConfirmAction(true)}
              disabled={isConfirming}
            >
              {isConfirming ? 'Confirming...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
