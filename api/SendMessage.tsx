
import { authPost } from "@/lib/auth";

interface SendMessageReq {
  message: string;
  chatId: string;
  chainId: number;
}

interface SendMessageResp {
  chatId: string;
  agentIds: string[];
  messages: string[];
}

export const sendMessage = authPost<SendMessageReq, SendMessageResp>(
  '/api',
  `/chat/send`
);
