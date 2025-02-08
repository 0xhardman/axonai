
import { authPost } from "@/lib/auth";

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
