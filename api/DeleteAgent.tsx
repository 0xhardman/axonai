
import { authPost } from "@/lib/auth";

const BE_API = process.env.NEXT_PUBLIC_BE_API;
if (!BE_API) {
  throw new Error('NEXT_PUBLIC_BE_API environment variable is not set');
}

interface DeleteAgentReq {
  agentId: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface DeleteAgentResp {
  // Add properties of DeleteAgentResp here
}

export const deleteAgent = authPost<DeleteAgentReq, DeleteAgentResp>(
  '/api',
  `/contract/agent/delete`
);
