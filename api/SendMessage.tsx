/* eslint-disable @typescript-eslint/no-explicit-any */
import { authPost } from "@/lib/auth";

const BE_API = process.env.NEXT_PUBLIC_BE_API;
if (!BE_API) {
  throw new Error('NEXT_PUBLIC_BE_API environment variable is not set');
}

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
