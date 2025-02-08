/* eslint-disable @typescript-eslint/no-explicit-any */
import { authPost } from "@/lib/auth";

interface Skill {
  name: string;
  description: string;
  workflow: string[];
}

interface Backstory {
  title: string;
  content: string;
}

interface EditAgentReq {
  agentId: string;
  chainId: number;
  address: string;
  name: string;
  description: string;
  skills: Skill[];
  backstories: Backstory[];
}

interface AgentResp {
  id: string;
  chainId: string;
  address: string;
  creatorAddress: string;
  name: string;
  description: string;
  contracts: string[];
  abis: any[][];
  skills: Skill[];
  backstories: Backstory[];
  state: number;
}

export const editAgent = authPost<EditAgentReq, AgentResp>(
  '/api',
  `/contract/agent/edit`
);
