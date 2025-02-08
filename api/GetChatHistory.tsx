import { authGet } from "@/lib/auth";

interface ChatAgent {
  agentId: string;
  state: number;
  stateDescription: string;
}

interface TaskTransaction {
  address: string;
  contractName: string;
  methodSignature: string;
  arguments: (string | string[])[];
}

interface TaskData {
  tx: TaskTransaction;
  isReady: boolean;
  response: string;
}

interface ChatAction {
  id: string;
  chatId: string;
  agentId: string;
  skill: string;
  workflowIndex: number;
  state: number;
  task: TaskData;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  chatId: string;
  agentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatHistoryResp {
  chatId: string;
  agents: ChatAgent[];
  actions: ChatAction[];
  messages: ChatMessage[];
}

interface GetChatHistoryReq {
  chatId: string;
}

export const getChatHistory = authGet<GetChatHistoryReq, ChatHistoryResp>(
  '/api',
  `/chat/:chatId`
);
