import { authGet } from "@/lib/auth";

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

interface GetChatDetailReq {
  chatId: string;
}

export const getChatDetail = authGet<GetChatDetailReq, ChatDetailResp>(
  '/api',
  `/chat/detail`
);
