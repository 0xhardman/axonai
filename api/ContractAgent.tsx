/* eslint-disable @typescript-eslint/no-explicit-any */
import { authPost } from "@/lib/auth";

interface Backstory {
  title: string;
  content: string;
}

interface Skill {
  name: string;
  description: string;
  workflow: string[];
}

interface CreateAgentReq {
  chainId: number;
  address: string;
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

export const createAgent = authPost<CreateAgentReq, AgentResp>(
  '/api',
  `/contract/agent/create`
);
