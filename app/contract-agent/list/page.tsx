'use client';

import { useEffect, useState } from 'react';
import { getAgentList } from '@/api/GetAgentList';
import type { AgentListItem } from '@/api/GetAgentList';
import { AgentResp, getAgentDetail } from '@/api/GetAgentDetail';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ClockIcon, UsersIcon } from "lucide-react";

interface AgentSkill {
  name: string;
  description: string;
  workflow: string[];
}

export default function ContractAgentListPage() {
  const [agents, setAgents] = useState<AgentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentResp | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { toast } = useToast();
  const { address } = useAccount();
  const router = useRouter();

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
        return <Badge variant="default">Active</Badge>;
      case 1:
        return <Badge variant="default">Active</Badge>;
      case 2:
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatLastActionTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <h1 className="text-3xl font-bold mb-8 ">Contract Agents</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card
            key={agent.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleAgentClick(agent.id)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="">{agent.name}</CardTitle>
                {getStateLabel(agent.state)}
              </div>
              <CardDescription>{agent.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {agent.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill.name}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>Last active: {formatLastActionTime(agent.lastActionTime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  <span>{agent.userCount} users</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogHeader>

        </DialogHeader>
        <DialogContent className="max-w-2xl h-[calc(100vh-2rem)] overflow-y-scroll">
          {loadingDetail ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : selectedAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="">{selectedAgent.name}</DialogTitle>
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
                <div>
                  <h3 className="font-semibold mb-2">Contract Creator</h3>
                  <p>{selectedAgent.creatorAddress}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Last Action Time</h3>
                  <p>{new Date(selectedAgent.lastActionTime).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Contract ID</h3>
                  <p>{selectedAgent.contractId}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">User Count</h3>
                  <p>{selectedAgent.userCount !== null ? selectedAgent.userCount : 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Created At</h3>
                  <p>{new Date(selectedAgent.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Updated At</h3>
                  <p>{new Date(selectedAgent.updatedAt).toLocaleString()}</p>
                </div>
              </div>
              <DialogFooter>
                {selectedAgent?.creatorAddress.toLowerCase() === address?.toLowerCase() && <Button onClick={() => router.push(`/contract-agent/edit?id=${selectedAgent?.id}`)}>Edit</Button>}
              </DialogFooter>
            </>
          )}
        </DialogContent>

      </Dialog>
    </div>
  );
}
