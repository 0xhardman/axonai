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
import { Card, CardContent } from './ui/card';
import { RainbowButton } from './ui/rainbow-button';

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

interface CallResult {
  value: string | number;
  success: boolean;
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
  result?: TransactionReceipt | CallResult;
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
  result?: TransactionReceipt | CallResult;
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
        chatId: id
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

  const getActionStateDisplay = (state: number, chainId: number, task: TaskData | null) => {
    switch (state) {
      case 0:
        return {
          text: 'Pending',
          description: 'Transaction parameters are being prepared',
          icon: '⏳',
          bgColor: 'bg-muted',
          textColor: 'text-muted-foreground'
        };
      case 1:
        return {
          text: 'Generating',
          description: 'Agent is generating parameters',
          icon: '🔄',
          bgColor: 'bg-blue-500/10',
          textColor: 'text-blue-500'
        };
      case 2:
        return {
          text: 'Paused',
          description: 'Waiting for more information, continue chatting',
          icon: '⏸️',
          bgColor: 'bg-yellow-500/10',
          textColor: 'text-yellow-500'
        };
      case 3:
        return {
          text: 'Reviewing',
          description: 'Please review and confirm',
          icon: '👀',
          bgColor: 'bg-warning/10',
          textColor: 'text-warning'
        };
      case 4:
        return {
          text: 'Confirmed',
          description: 'Transaction sent, waiting for blockchain confirmation',
          icon: '📤',
          bgColor: 'bg-primary/10',
          textColor: 'text-primary'
        };
      case 5:
        return {
          text: task?.isCall ? 'Call completed' : 'Transaction completed',
          description: task?.tx?.address ?
            <span>
              {task.isCall ? 'Call completed: ' : 'Transaction completed: '}<a
                href={getExplorerUrl(chainId, task.tx.address, 'address')}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary/80"
              >
                View Contract on Explorer
              </a>
            </span> :
            task?.isCall ? 'Call completed' : 'Transaction completed',
          icon: '✅',
          bgColor: 'bg-success/10',
          textColor: 'text-success'
        };
      case 6:
        return {
          text: 'Rejected',
          description: 'Transaction rejected',
          icon: '❌',
          bgColor: 'bg-destructive/10',
          textColor: 'text-destructive'
        };
      default:
        return {
          text: 'Unknown',
          description: '',
          icon: '❓',
          bgColor: 'bg-muted',
          textColor: 'text-muted-foreground'
        };
    }
  };

  return (
    <div className="w-full max-w-6xl border rounded-lg bg-background">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <h2 className="text-3xl font-bold">Chat with Your Agent</h2>

          {/* Agent Address Info */}
          <Card className="w-fit">
            <CardContent className="flex items-center gap-4 py-3">
              <div className="flex flex-col space-y-1">
                <div className="flex text-sm text-muted-foreground gap-2">
                  <span>Agent Address</span>
                  {agentBalance && (
                    <div className="text-sm text-muted-foreground">
                      Balance: {agentBalance} ETH
                    </div>
                  )}
                </div>
                <div className="font-mono text-sm truncate max-w-[400px]">
                  {agentAddress || 'No address available'}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => agentAddress && fetchAgentBalance(agentAddress)}
                  size="sm"
                  variant="outline"
                >
                  Refresh
                </Button>
                <Button
                  onClick={copyAgentAddress}
                  disabled={!agentAddress}
                  size="sm"
                  variant="outline"
                >
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Messages Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Messages</h3>
            <div className="h-[500px] overflow-auto space-y-4 pr-4">
              {messages.map(message => (
                <Card key={message.id} className={`border ${message.agentId === null ? 'bg-muted' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">
                        {message.agentId === null
                          ? 'You'
                          : agentNames.get(message.agentId) || 'AI Agent'
                        }
                      </span>
                      <span className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</span>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    {message.agentId && message.state && (
                      <div className="mt-2 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md">
                        {message.state}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="flex gap-2">
                <input
                  name="prompt"
                  value={input}
                  onChange={handleInputChange}
                  disabled={!isPolling}
                  className="flex-1 h-10 px-3 rounded-md bg-background border text-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  placeholder={!isPolling ? "AI is thinking..." : "Type your message..."}
                />
                <RainbowButton type="submit" disabled={!isPolling}>
                  Send
                </RainbowButton>
              </div>
            </form>
          </div>

          {/* Actions Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="h-[560px] overflow-auto space-y-4 pr-4">
              {actions.map(action => (
                <Card key={action.id} className="border">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {agentNames.get(action.agentId) || 'AI Agent'}: {action.skill}
                        </span>
                        {action.task?.tx && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${action.task.isCall
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              : 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                            }`}>
                            {action.task.isCall ? 'CALL' : 'SEND'}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTime(action.createdAt)}</span>
                    </div>

                    <div className="whitespace-pre-wrap leading-relaxed">
                      {action.task?.response}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">Transaction Details</div>
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${getActionStateDisplay(action.state, searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 1, action.task).bgColor}`}>
                          <span className="text-base leading-none">
                            {getActionStateDisplay(action.state, searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 1, action.task).icon}
                          </span>
                          <span className={`text-xs ${getActionStateDisplay(action.state, searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 1, action.task).textColor}`}>
                            {getActionStateDisplay(action.state, searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 1, action.task).text}
                          </span>
                        </div>
                      </div>

                      {getActionStateDisplay(action.state, searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 1, action.task).description && (
                        <div className={`text-xs mb-3 ${getActionStateDisplay(action.state, searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 1, action.task).textColor}`}>
                          {getActionStateDisplay(action.state, searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 1, action.task).description}
                        </div>
                      )}

                      {action.task && action.task.tx && (
                        <div className={`relative rounded-lg overflow-hidden ${action.state === 3 ? 'ring-2 ring-warning' : ''}`}>
                          {editingTx?.id === action.id ? (
                            <Textarea
                              value={editingTx.tx}
                              onChange={(e) => setEditingTx({ id: action.id, tx: e.target.value })}
                              className="font-mono text-xs min-h-[100px]"
                            />
                          ) : (
                            <pre className="p-3 text-xs font-mono bg-muted rounded-lg overflow-x-auto">
                              {JSON.stringify(action.task.tx, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}

                      {action.result && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-sm font-medium mb-2">
                            {action.task?.isCall ? 'Call Result' : 'Transaction Result'}
                          </div>
                          <div className="space-y-2">
                            {action.task?.isCall ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Return Value:</span>
                                <span className="text-xs font-mono">
                                  {((action.result as CallResult) ?? 'No data').toString()}
                                </span>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Status:</span>
                                  <span className={`text-xs ${(action.result as TransactionReceipt).status === 1 ? 'text-success' : 'text-destructive'}`}>
                                    {(action.result as TransactionReceipt).status === 1 ? 'Success' : 'Failed'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Hash:</span>
                                  <a
                                    href={getExplorerUrl(searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 1, (action.result as TransactionReceipt).hash, 'tx')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:text-primary/80 truncate"
                                  >
                                    {(action.result as TransactionReceipt).hash}
                                  </a>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Block:</span>
                                  <span className="text-xs">{(action.result as TransactionReceipt).blockNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Gas Used:</span>
                                  <span className="text-xs">{(action.result as TransactionReceipt).gasUsed}</span>
                                </div>
                              </>
                            )}
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
