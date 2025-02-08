/* eslint-disable @typescript-eslint/no-explicit-any */
import { authPost } from "@/lib/auth";

const BE_API = process.env.NEXT_PUBLIC_BE_API;
if (!BE_API) {
  throw new Error('NEXT_PUBLIC_BE_API environment variable is not set');
}

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
