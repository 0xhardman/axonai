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
  mainnet,
  sepolia,
  optimism,
  optimismSepolia,
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  polygon,
  avalanche,
  avalancheFuji,
  zkSync,
  celo,
  celoAlfajores,
  linea,
  lineaSepolia,
  scroll,
  scrollSepolia,
  bsc,
} from 'wagmi/chains';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getToken } from "@/lib/auth";
import JWT from "jsonwebtoken";
import { createPublicClient, http, formatEther } from 'viem';

interface Message {
  id: string;
  chatId: string;
  agentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  state?: string;
}

interface TransactionLog {
  _type: string;
  address: string;
  blockHash: string;
  blockNumber: number;
  data: string;
  index: number;
  topics: string[];
  transactionHash: string;
  transactionIndex: number;
}

interface TransactionReceipt {
  _type: string;
  blockHash: string;
  blockNumber: number;
  contractAddress: string | null;
  cumulativeGasUsed: string;
  from: string;
  gasPrice: string;
  blobGasUsed: string | null;
  blobGasPrice: string | null;
  gasUsed: string;
  hash: string;
  index: number;
  logs: TransactionLog[];
  logsBloom: string;
  status: number;
  to: string;
}

interface TaskData {
  tx?: {
    address: string;
    contractName: string;
    methodSignature: string;
    arguments: (string | number)[];
  };
  isCall: boolean;
  isReady: boolean;
  response: string;
}

interface ChatAction {
  id: string;
  chatId: string;
  agentId: string;
  sessionId: string;
  skill: string;
  workflowIndex: number;
  state: number;
  task: TaskData | null;
  result?: TransactionReceipt;
  createdAt: string;
  updatedAt: string;
}

interface Action {
  id: string;
  chatId: string;
  agentId: string;
  sessionId: string;
  skill: string;
  workflowIndex: number;
  state: number;
  task: TaskData | null;
  result?: TransactionReceipt;
  createdAt: string;
  updatedAt: string;
}

export function ChatBox() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { chain } = useAccount();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [input, setInput] = useState('');
  const [editingTx, setEditingTx] = useState<{ id: string, tx: string } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(searchParams.get('chatId') || undefined);
  const [agentAddress, setAgentAddress] = useState('');
  const [agentBalance, setAgentBalance] = useState<string>('');
  const [isPolling, setIsPolling] = useState(true);
  const [loading, setLoading] = useState(false);
  const [agentNames, setAgentNames] = useState<Map<string, string>>(new Map());

  const client = createPublicClient({
    chain: mainnet,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL)
  });

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

  const getExplorerUrl = (chainId: number, value: string, type: 'address' | 'tx' = 'address') => {
    const chain = {
      [mainnet.id]: mainnet,
      [sepolia.id]: sepolia,
      [optimism.id]: optimism,
      [optimismSepolia.id]: optimismSepolia,
      [arbitrum.id]: arbitrum,
      [arbitrumSepolia.id]: arbitrumSepolia,
      [base.id]: base,
      [baseSepolia.id]: baseSepolia,
      [polygon.id]: polygon,
      [avalanche.id]: avalanche,
      [avalancheFuji.id]: avalancheFuji,
      [zkSync.id]: zkSync,
      [celo.id]: celo,
      [celoAlfajores.id]: celoAlfajores,
      [linea.id]: linea,
      [lineaSepolia.id]: lineaSepolia,
      [scroll.id]: scroll,
      [scrollSepolia.id]: scrollSepolia,
      [bsc.id]: bsc,
      // Custom chains
      81457: { blockExplorers: { default: { url: 'https://blastscan.io' } } },
      168587773: { blockExplorers: { default: { url: 'https://testnet.blastscan.io' } } },
      5000: { blockExplorers: { default: { url: 'https://explorer.mantle.xyz' } } },
      5003: { blockExplorers: { default: { url: 'https://explorer.testnet.mantle.xyz' } } },
      17000: { blockExplorers: { default: { url: 'https://holesky.etherscan.io' } } },
      300: { blockExplorers: { default: { url: 'https://sepolia.explorer.zksync.io' } } },
    }[chainId];

    const baseUrl = chain?.blockExplorers?.default?.url || 'https://etherscan.io';
    return `${baseUrl}/${type}/${value}`;
  };

  const fetchAgentBalance = async (addr: string) => {
    try {
      const balanceWei = await client.getBalance({ address: addr as `0x${string}` });
      const balanceEth = formatEther(balanceWei);
      setAgentBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error('Error fetching balance:', error);
      setAgentBalance('Error');
    }
  };

  const copyAgentAddress = () => {
    if (agentAddress) {
      navigator.clipboard.writeText(agentAddress)
        .then(() => {
          toast({
            title: "Success",
            description: "Address copied to clipboard",
          });
        })
        .catch(err => {
          console.error('Failed to copy address:', err);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to copy address",
          });
        });
    }
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded = JWT.decode(token.value);
        if (decoded && typeof decoded === 'object' && 'agent' in decoded) {
          const address = decoded.agent.agentAddress;
          setAgentAddress(address);
          fetchAgentBalance(address);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

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

    if (searchParams.get('chatId')) {
      fetchAgentNames();
    }
  }, [searchParams]);

  const fetchChatHistory = async (id: string) => {
    try {
      const response = await getChatHistory({
        chatId: searchParams.get('chatId')!
      });

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
        // setAgentStates(newAgentStates);
      } else {
        console.warn('No agents array in response:', response);
      }

      // Set messages
      setMessages(response.messages || []);

      // Set actions
      setActions((response.actions || []) as Action[]);

    } catch (error: any) {
      // Only show toast for client errors (status < 500)
      console.error("Error fetching chat history:", error);
      if (error?.response?.status < 500) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load chat history",
          duration: 2000,
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

  const getActionStateDisplay = (state: number, chainId: number, tx?: { address: string }) => {
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
          description: tx?.address ?
            <span>
              Transaction completed: <a
                href={getExplorerUrl(chainId, tx.address, 'address')}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-green-300"
              >
                View Contract on Explorer
              </a>
            </span> :
            'Transaction completed',
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

  return (
    <div className="w-full max-w-6xl bg-[#1D1D1D] border-2 border-[#373737] rounded-lg shadow-2xl mt-10">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-white text-3xl font-bold">Chat with Your Agent</h2>

          {/* Agent Address Info */}
          <div className="flex items-center gap-4 bg-[#252525] rounded-lg p-3">
            <div className="flex flex-col space-y-1">
              <div className="flex text-sm text-gray-300 gap-2">
                <span>Agent Address</span>
                {agentBalance && (
                  <div className="text-sm text-gray-300">
                    Balance: {agentBalance} ETH
                  </div>
                )}
              </div>
              <div className="text-white font-mono text-sm truncate max-w-[400px]">
                {agentAddress || 'No address available'}
              </div>

            </div>
            <div className="flex  gap-2">
              <Button
                onClick={() => agentAddress && fetchAgentBalance(agentAddress)}
                size="sm"
                variant="outline"
                className="px-3 py-1 h-7"
              >
                Refresh
              </Button>
              <Button
                onClick={copyAgentAddress}
                disabled={!agentAddress}
                size="sm"
                variant="outline"
                className="px-3 py-1 h-7"
              >
                Copy
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Messages Column */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-md font-semibold mb-3 px-1">Messages</h3>
            <div className="h-[500px] overflow-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-[#373737] scrollbar-track-[#1D1D1D]">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`rounded-lg p-5 mb-6 ${message.agentId === null
                    ? 'bg-gray-700'
                    : 'bg-gray-800/50 border border-gray-700'
                    }`}
                >
                  <div className="text-sm text-gray-300 mb-3 flex justify-between items-center">
                    <span className="text-gray-200">
                      {message.agentId === null
                        ? 'You'
                        : agentNames.get(message.agentId) || 'AI Agent'
                      }
                    </span>
                    <span className="text-xs text-gray-400">{formatTime(message.createdAt)}</span>
                  </div>
                  <div className="text-white whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                  {message.agentId && message.state && (
                    <div className="mt-2 text-xs bg-[#0f2b19] text-emerald-300 px-3 py-1.5 rounded">
                      {message.state}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Actions Column */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-md font-semibold mb-3 px-1">Actions</h3>
            <div className="h-[500px] overflow-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-[#373737] scrollbar-track-[#1D1D1D]">
              {actions.map(action => (
                <div
                  key={action.id}
                  className="rounded-lg p-5 mb-6 bg-gray-800/50"
                >
                  <div className="text-sm text-gray-300 mb-3 flex justify-between items-center">
                    <span className="text-gray-200">
                      {agentNames.get(action.agentId) || 'AI Agent'}: {action.skill}
                    </span>
                    <span className="text-xs text-gray-400">{formatTime(action.createdAt)}</span>
                  </div>
                  <div className="text-white whitespace-pre-wrap leading-relaxed">
                    {action.task?.response}
                  </div>
                  <div className="mt-4 border-t border-gray-600 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-300">Transaction Details</div>
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${getActionStateDisplay(action.state, searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 1, action.task?.tx).bgColor}`}>
                        <span className="text-base leading-none">{getActionStateDisplay(action.state, searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 1, action.task?.tx).icon}</span>
                        <span className={`text-xs ${getActionStateDisplay(action.state, searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 1, action.task?.tx).textColor}`}>
                          {getActionStateDisplay(action.state, searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 1, action.task?.tx).text}
                        </span>
                      </div>
                    </div>
                    {getActionStateDisplay(action.state, searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 1, action.task?.tx).description && (
                      <div className={`text-xs mb-3 ${getActionStateDisplay(action.state, searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 1, action.task?.tx).textColor}`}>
                        {getActionStateDisplay(action.state, searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 1, action.task?.tx).description}
                      </div>
                    )}
                    {action.task && action.task.tx && (
                      <div className={`relative rounded-lg overflow-hidden ${action.state === 3 ? 'ring-2 ring-orange-500/30' : ''}`}>
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
                            className={`bg-black/30 p-3 text-xs text-gray-300 mb-3 overflow-x-auto ${action.state === 3 ? 'cursor-pointer hover:bg-black/40' : ''}`}
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
                    {action.result && (
                      <div className="mt-4 border-t border-gray-600 pt-4">
                        <div className="text-sm text-gray-300 mb-2">Transaction Result</div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Status:</span>
                            <span className={`text-xs ${action.result.status === 1 ? 'text-green-400' : 'text-red-400'}`}>
                              {action.result.status === 1 ? 'Success' : 'Failed'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Hash:</span>
                            <a
                              href={getExplorerUrl(searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 1, action.result.hash, 'tx')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 truncate"
                            >
                              {action.result.hash}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Block:</span>
                            <span className="text-xs text-gray-300">{action.result.blockNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Gas Used:</span>
                            <span className="text-xs text-gray-300">{action.result.gasUsed}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {action.state === 3 && (
                      <div className="flex justify-end gap-2 mt-4">
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
              ))}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="mt-3">
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
