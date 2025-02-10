/* eslint-disable @typescript-eslint/no-explicit-any */
import { authGet } from "@/lib/auth";

interface Skill {
  name: string;
  description: string;
  workflow: string[];
}

interface Backstory {
  title: string;
  content: string;
}

export interface AgentResp {
  id: string;
  chainId: string;
  address: string;
  creatorAddress: string;
  name: string;
  description: string;
  skills: Skill[];
  backstories: Backstory[];
  lastActionTime: number;
  contractId: string;
  state: number;
  userCount: number | null;
  createdAt: string;
  updatedAt: string;
  contracts: string[];
  abis: any[]; // You may want to define a more specific type for the ABI structure
}

interface GetAgentDetailReq {
  id: string;
}

export const getAgentDetail = authGet<GetAgentDetailReq, AgentResp>(
  '/api',
  `/contract/agent/:id`
)