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
  id: string;
  chatId: string;
  agentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskData {
  tx?: {
    address: string;
    contractName: string;
    methodSignature: string;
    arguments: any[];
    options?: {
      gas?: string;
      gasPrice?: string;
    };
  };
  isReady: boolean;
  response: string;
}

interface Action {
  id: string;
  chatId: string;
  agentId: string;
  skill: string;
  workflowIndex: number;
  state: number;
  task: TaskData | null;
  createdAt: string;
  updatedAt: string;
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [input, setInput] = useState('');
  const [editingTx, setEditingTx] = useState<{ id: string, tx: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address } = useAccount();
  const [agentStates, setAgentStates] = useState<Map<string, string>>(new Map());
  const [agentNames, setAgentNames] = useState<Map<string, string>>(new Map());
  const [isPolling, setIsPolling] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(searchParams.get('chatId') || undefined);
  const pollingRef = useRef<NodeJS.Timeout>(null);
  const { chain } = useAccount();

  // Function to get agent-specific background color
  const getAgentBackgroundColor = (agentId?: string) => {
    if (!agentId) return 'bg-gray-700';
    // Use a green color palette for AI messages
    return 'bg-[#1a472a] hover:bg-[#1f5233] transition-colors';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionStateDisplay = (state: number) => {
    switch (state) {
      case 0:
        return {
          text: 'Pending',
          description: 'Transaction parameters are being prepared',
          icon: '⏳',
          bgColor: 'bg-gray-600/20',
          textColor: 'text-gray-400'
        };
      case 1:
        return {
          text: 'Generating',
          description: 'Agent is generating parameters',
          icon: '🔄',
          bgColor: 'bg-blue-600/20',
          textColor: 'text-blue-400'
        };
      case 2:
        return {
          text: 'Paused',
          description: 'Waiting for more information, continue chatting',
          icon: '⏸️',
          bgColor: 'bg-yellow-600/20',
          textColor: 'text-yellow-400'
        };
      case 3:
        return {
          text: 'Reviewing',
          description: 'Please review and confirm',
          icon: '👀',
          bgColor: 'bg-orange-600/20',
          textColor: 'text-orange-400'
        };
      case 4:
        return {
          text: 'Confirmed',
          description: 'Transaction sent, waiting for blockchain confirmation',
          icon: '📤',
          bgColor: 'bg-indigo-600/20',
          textColor: 'text-indigo-400'
        };
      case 5:
        return {
          text: 'Processed',
          description: 'Transaction completed',
          icon: '✅',
          bgColor: 'bg-green-600/20',
          textColor: 'text-green-400'
        };
      case 6:
        return {
          text: 'Rejected',
          description: 'Transaction rejected',
          icon: '❌',
          bgColor: 'bg-red-600/20',
          textColor: 'text-red-400'
        };
      default:
        return {
          text: 'Unknown',
          description: '',
          icon: '❓',
          bgColor: 'bg-gray-600/20',
          textColor: 'text-gray-400'
        };
    }
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

      if (!response) {
        console.warn('No response from getChatHistory');
        return;
      }

      // Update agent states
      if (response.agents) {
        const newAgentStates = new Map<string, string>();
        response.agents.forEach(agent => {
          newAgentStates.set(agent.agentId, agent.stateDescription);
        });
        setAgentStates(newAgentStates);
      } else {
        console.warn('No agents array in response:', response);
      }

      // Set messages
      setMessages(response.messages || []);

      // Set actions
      setActions(response.actions || []);

    } catch (error) {
      console.error('Failed to load chat history:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chat history",
      });
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

  // 
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
      poll(); // 
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
      id: Date.now().toString(),
      chatId: currentChatId || '',
      agentId: null,
      content: input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

      // ，chatId
      if (!currentChatId && response.chatId) {
        setCurrentChatId(response.chatId);
      }

      //  AI ，
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

  const handleConfirmAction = async (actionId: string, confirm: boolean) => {
    setIsConfirming(true);

    try {
      const action = actions.find(a => a.id === actionId);
      if (!action) return;

      let txData = null;
      if (confirm && editingTx?.id === actionId) {
        try {
          txData = JSON.parse(editingTx.tx);
        } catch (e) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Invalid JSON format in transaction data",
          });
          return;
        }
      }

      await confirmChatAction({
        actionId,
        txData: confirm ? (txData || action.task?.tx) : null,
        confirm
      });

      setEditingTx(null);

      // Refresh chat history
      if (currentChatId) {
        await fetchChatHistory(currentChatId);
      }
    } catch (error) {
      console.error('Failed to confirm action:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to confirm action",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  // Combine user messages and actions into timeline items
  const timelineItems = [
    ...messages.filter(msg => msg.agentId === null), // Only user messages
    ...actions
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="w-[500px] bg-[#1D1D1D] border-2 border-[#373737] rounded-lg shadow-2xl">
      <div className="h-[550px] p-6 flex flex-col">
        <h2 className="text-white text-lg font-bold mb-4">Chat with Your Agent</h2>
        <div className="flex-1 overflow-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-[#373737] scrollbar-track-[#1D1D1D]">
          {/* Timeline items (messages and actions) */}
          {timelineItems.map(item => {
            const isAction = 'task' in item;

            if (isAction) {
              const action = item as Action;
              const { text: stateText, description: stateDescription, icon, bgColor, textColor } = getActionStateDisplay(action.state);

              return (
                <div
                  key={action.id}
                  className={`rounded-lg p-5 mb-6 ${getAgentBackgroundColor(action.agentId)}`}
                >
                  <div className="text-sm text-gray-300 mb-3 flex justify-between items-center">
                    <span className="text-gray-200">
                      {agentNames.get(action.agentId) || 'AI Agent'}
                    </span>
                    <span className="text-xs text-gray-400">{formatTime(action.createdAt)}</span>
                  </div>
                  <div className="text-white whitespace-pre-wrap leading-relaxed">
                    {action.task?.response}
                  </div>
                  <div className="mt-4 border-t border-gray-600 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-300">Transaction Details</div>
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${bgColor}`}>
                        <span className="text-base leading-none">{icon}</span>
                        <span className={`text-xs ${textColor}`}>{stateText}</span>
                      </div>
                    </div>
                    {stateDescription && (
                      <div className={`text-xs mb-3 ${textColor}`}>
                        {stateDescription}
                      </div>
                    )}
                    {action.task && action.task.tx && (
                      <div className={`relative rounded-lg overflow-hidden ${action.state === 3 ? 'ring-2 ring-orange-500/30' : ''
                        }`}>
                        {editingTx?.id === action.id ? (
                          <Textarea
                            value={editingTx.tx}
                            onChange={(e) => setEditingTx({ id: action.id, tx: e.target.value })}
                            className="font-mono text-xs bg-black/30 text-gray-300 mb-3 resize-none"
                            rows={8}
                            disabled={action.state !== 3}
                          />
                        ) : (
                          <pre
                            className={`bg-black/30 p-3 text-xs text-gray-300 mb-3 overflow-x-auto ${action.state === 3 ? 'cursor-pointer hover:bg-black/40' : ''
                              }`}
                            onClick={() => action.state === 3 && action.task && setEditingTx({
                              id: action.id,
                              tx: JSON.stringify(action.task.tx, null, 2)
                            })}
                          >
                            {JSON.stringify(action.task.tx, null, 2)}
                          </pre>
                        )}
                        {action.state === 3 && !editingTx && (
                          <div 
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => action.task && setEditingTx({
                              id: action.id,
                              tx: JSON.stringify(action.task.tx, null, 2)
                            })}
                          >
                            <span className="text-xs text-white bg-black/60 px-2 py-1 rounded">
                              Click to edit
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {action.state === 3 && (
                      <div className="flex justify-end gap-2">
                        {editingTx?.id === action.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTx(null)}
                          >
                            Cancel Edit
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleConfirmAction(action.id, false)}
                          disabled={isConfirming}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleConfirmAction(action.id, true)}
                          disabled={isConfirming}
                        >
                          Confirm
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            } else {
              const message = item as Message;
              return (
                <div
                  key={message.id}
                  className={`rounded-lg p-5 mb-6 ${message.agentId === null ? 'bg-gray-700' : getAgentBackgroundColor(message.agentId)
                    }`}
                >
                  <div className="text-sm text-gray-300 mb-3 flex justify-between items-center">
                    <span className="text-gray-200">
                      {message.agentId ? agentNames.get(message.agentId) || 'AI Agent' : 'You'}
                    </span>
                    <span className="text-xs text-gray-400">{formatTime(message.createdAt)}</span>
                  </div>
                  <div className="text-white whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                  {message.agentId && agentStates.get(message.agentId) && (
                    <div className="w-full text-xs bg-[#0f2b19] text-emerald-300 px-3 py-1.5 mt-2">
                      {agentStates.get(message.agentId)}
                    </div>
                  )}
                </div>
              );
            }
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-auto">
          <div className="flex gap-2">
            <input
              name="prompt"
              value={input}
              onChange={handleInputChange}
              disabled={!isPolling}
              className="flex-1 p-3 bg-[#424242] text-white border-2 border-[#373737] rounded focus:outline-none focus:border-[#4CAF50] placeholder-gray-500 disabled:opacity-50"
              placeholder={!isPolling ? "AI is thinking..." : "Type your message..."}
            />
            <button
              type="submit"
              disabled={!isPolling}
              className="px-6 py-3 bg-[#4CAF50] text-white rounded shadow-lg hover:bg-[#45a049] transition-colors border-b-4 border-[#367d39] hover:border-[#2d682f] active:border-b-0 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
