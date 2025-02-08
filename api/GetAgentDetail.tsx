/* eslint-disable @typescript-eslint/no-explicit-any */
import { authGet } from "@/lib/auth";

const API = '/api';

interface Skill {
  name: string;
  description: string;
  workflow: string[];
}

interface Backstory {
  title: string;
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

interface GetAgentDetailReq {
  id: string;
}

export const getAgentDetail = (id: string) => 
  authGet<GetAgentDetailReq, AgentResp>(
    API,
    `/contract/agent/${id}`
  )({ id });
