/* eslint-disable @typescript-eslint/no-explicit-any */
import { authPost } from "@/lib/auth";

const BE_API = process.env.NEXT_PUBLIC_BE_API;
if (!BE_API) {
  throw new Error('NEXT_PUBLIC_BE_API environment variable is not set');
}

interface DeleteAgentReq {
  agentId: string;
}

export const deleteAgent = authPost<DeleteAgentReq, void>(
  BE_API,
  `/contract/agent/delete`
);
