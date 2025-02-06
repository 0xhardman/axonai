import { authPost } from "@/lib/auth";

const BE_API = process.env.NEXT_PUBLIC_BE_API;
if (!BE_API) {
  throw new Error('NEXT_PUBLIC_BE_API environment variable is not set');
}

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

export const login = authPost<LoginReq, LoginResp>(BE_API, `/user/login`);
