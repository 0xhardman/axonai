import { authPost } from "@/lib/auth";

interface LoginReq {
  signature: string;
  message: string;
  address: string;
}

interface Agent {
  id: string;
  agentAddress: string;
  ownerAddress: string;
  privateKey: string;
  state: number;
}

interface LoginResp {
  token: string;
  agent: Agent;
}

export const login = authPost<LoginReq, LoginResp>(
  '/api',
  `/user/login`
);
