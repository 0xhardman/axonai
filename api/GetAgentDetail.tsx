/* eslint-disable @typescript-eslint/no-explicit-any */
import { authGet } from "@/lib/auth";

const BE_API = process.env.NEXT_PUBLIC_BE_API;
if (!BE_API) {
  throw new Error('NEXT_PUBLIC_BE_API environment variable is not set');
}

interface Skill {
  name: string;
  description: string;
  workflow: string[];
}

interface Backstory {
  name: string;
  content: string;
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

export const getAgentDetail = (id: string) => 
  authGet<void, AgentResp>(BE_API, `/contract/agent/${id}`)();
