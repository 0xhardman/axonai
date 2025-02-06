
import { authGet } from "@/lib/auth";

const BE_API = process.env.NEXT_PUBLIC_BE_API;
if (!BE_API) {
  throw new Error('NEXT_PUBLIC_BE_API environment variable is not set');
}

interface ChatAgent {
  agentId: string;
  state: number;
  stateDescription: string;
}

interface TransactionOptions {
  a: string
  // 可以根据需要添加具体的选项字段
}

interface TransactionTask {
  address: string;
  contractName: string;
  method: string;
  arguments: string[];
  options: TransactionOptions;
}

interface Task {
  tx: TransactionTask;
  txHash: string;
  isReady: boolean;
  response: string;
}

interface ChatAction {
  id: string;
  chatId: string;
  agentId: string;
  skill: string;
  task: Task;
  state: number;
}

interface ChatMessage {
  id: string;
  chatId: string;
  agentId: string;
  content: string;
}

interface ChatDetailResp {
  chatId: string;
  agents: ChatAgent[];
  actions: ChatAction[];
  messages: ChatMessage[];
}

export const getChatDetail = (chatId: string) =>
  authGet<void, ChatDetailResp>(BE_API, `/chat/${chatId}`)();
