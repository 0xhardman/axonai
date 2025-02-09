'use client';

import { useEffect, useState } from 'react';
import { getAgentList } from '@/api/GetAgentList';
import { getAgentDetail } from '@/api/GetAgentDetail';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

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

interface AgentDetail {
  id: string;
  chainId: string;
  address: string;
  creatorAddress: string;
  name: string;
  description: string;
  skills: AgentSkill[];
  backstories: { title: string; content: string; }[];
}

export default function ContractAgentListPage() {
  const [agents, setAgents] = useState<AgentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentDetail | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await getAgentList();
      setAgents(response.agents);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch agents: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAgentClick = async (agentId: string) => {
    setDetailDialogOpen(true);
    setLoadingDetail(true);
    try {
      const detail = await getAgentDetail({ id: agentId });
      setSelectedAgent(detail);
    } catch (error) {
      console.error('Failed to fetch agent details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch agent details: ${error}`,
      });
      setDetailDialogOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStateLabel = (state: number) => {
    switch (state) {
      case 0:
        return <Badge variant="secondary">Inactive</Badge>;
      case 1:
        return <Badge variant="success">Active</Badge>;
      case 2:
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-66px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 font-minecraft">Contract Agents</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card 
            key={agent.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleAgentClick(agent.id)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="font-minecraft">{agent.name}</CardTitle>
                {getStateLabel(agent.state)}
              </div>
              <CardDescription>{agent.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {agent.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          {loadingDetail ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : selectedAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="font-minecraft">{selectedAgent.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Contract Address</h3>
                  <p className="font-mono text-sm">{selectedAgent.address}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Chain ID</h3>
                  <p>{selectedAgent.chainId}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p>{selectedAgent.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="cursor-help" title={skill.description}>
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedAgent.backstories.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Backstories</h3>
                    <div className="space-y-2">
                      {selectedAgent.backstories.map((story, index) => (
                        <div key={index} className="bg-secondary/20 p-3 rounded-md">
                          <h4 className="font-medium mb-1">{story.title}</h4>
                          <p className="text-sm">{story.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
