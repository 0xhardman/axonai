
import { authGet } from "@/lib/auth";

interface AgentSkill {
  name: string;
  description: string;
}

interface AgentListItem {
  id: string;
  name: string;
  description: string;
  skills: AgentSkill[];
  state: number;
}

interface AgentListResp {
  agents: AgentListItem[];
}

export const getAgentList = authGet<void, AgentListResp>(
  '/api',
  `/contract/agent/list`
);
