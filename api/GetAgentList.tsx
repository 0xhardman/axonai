/* eslint-disable @typescript-eslint/no-explicit-any */
import { authGet } from "@/lib/auth";

const BE_API = process.env.NEXT_PUBLIC_BE_API;
if (!BE_API) {
  throw new Error('NEXT_PUBLIC_BE_API environment variable is not set');
}

interface AgentSkill {
  name: string;
  description: string;
}

interface AgentListItem {
  id: string;
  name: string;
  description: string;
  skills: AgentSkill[];
  state: number;
}

interface AgentListResp {
  agents: AgentListItem[];
}

export const getAgentList = () => 
  authGet<void, AgentListResp>(BE_API, `/contract/agents`)();
