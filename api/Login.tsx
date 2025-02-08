import { post } from "@/lib/auth";

const API_ENDPOINT = '/api';

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

export const login = post<LoginReq, LoginResp>(
  API_ENDPOINT,
  `/auth/login`
);
