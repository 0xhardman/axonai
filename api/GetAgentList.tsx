import { authGet } from "@/lib/auth";

export interface AgentSkill {
  name: string;
  description: string;
  workflow: string[];
}

export interface AgentListItem {
  id: string;
  name: string;
  description: string;
  chainId: number;
  address: string;
  creatorAddress: string;
  skills: AgentSkill[];
  state: number;
  lastActionTime: number;
  userCount: number;
}

export interface AgentListResp {
  agents: AgentListItem[];
}

export const getAgentList = authGet<void, AgentListResp>(
  '/api',
  `/contract/agents`
);
