'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Scene } from "@/components/Scene";
import { ContractSkills } from "@/components/ContractSkills";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getAgentDetail } from '@/api/GetAgentDetail';
import { editAgent } from '@/api/EditAgent';

type ContextType = 'Role' | 'Goal' | 'Backstory';

interface ContractContext {
  type: ContextType;
  content: string;
}

interface Skill {
  name: string;
  description: string;
  workflow: string[];
}

interface Backstory {
  title: string;
  content: string;
}

interface ContractData {
  id: string;
  chainId: string;
  address: string;
  name: string;
  description: string;
  skills: Skill[];
  backstories: Backstory[];
  state: number;
}

export default function EditContractAgentPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto py-8">
        <Suspense fallback={
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        }>
          <EditContractAgentContent />
        </Suspense>
      </div>
    </div>
  );
}

function EditContractAgentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContextType, setSelectedContextType] = useState<ContextType | null>(null);
  const [editingContextIndex, setEditingContextIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const [contractData, setContractData] = useState<ContractData | null>(null);

  useEffect(() => {
    const agentId = searchParams.get('id');
    if (!agentId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No agent ID provided",
      });
      router.push('/contract-agent');
      return;
    }

    const fetchAgentData = async () => {
      try {
        setLoading(true);
        const data = await getAgentDetail({ id: agentId });
        setContractData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agent data';
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [searchParams, router, toast]);

  const handleSkillsUpdate = (skills: Skill[]) => {
    if (!contractData) return;
    setContractData(prev => ({
      ...prev!,
      skills
    }));
  };

  const handleContextSelect = (type: ContextType) => {
    if (editingContextIndex !== null && contractData?.backstories[editingContextIndex]?.title === type) {
      setSelectedContextType(type);
      return;
    }

    const exists = contractData?.backstories.some(story => story.title === type);
    if (!exists) {
      setSelectedContextType(type);
    }
  };

  const handleSaveContext = () => {
    if (!contractData || !selectedContextType) return;

    if (editingContextIndex !== null) {
      // Edit existing context
      setContractData(prev => {
        if (!prev) return prev;
        const newBackstories = [...prev.backstories];
        newBackstories[editingContextIndex] = {
          title: selectedContextType,
          content: editingContent
        };
        return { ...prev, backstories: newBackstories };
      });
    } else {
      // Add new context
      setContractData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          backstories: [...prev.backstories, { title: selectedContextType, content: editingContent }]
        };
      });
    }
    handleCloseDialog();
  };

  const handleEditContext = (index: number) => {
    if (!contractData) return;
    const story = contractData.backstories[index];
    setEditingContextIndex(index);
    setSelectedContextType(story.title as ContextType);
    setEditingContent(story.content);
    setIsDialogOpen(true);
  };

  const handleDeleteContext = (index: number) => {
    setContractData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        backstories: prev.backstories.filter((_, i) => i !== index)
      };
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedContextType(null);
    setEditingContent('');
    setEditingContextIndex(null);
  };

  const isContextTypeExists = (type: ContextType) => {
    if (!contractData) return false;
    return contractData.backstories.some(story =>
      story.title === type && (editingContextIndex === null || contractData.backstories[editingContextIndex].title !== type)
    );
  };

  const handleSave = async () => {
    if (!contractData) return;
    console.log(contractData);
    try {
      setLoading(true);
      await editAgent({
        agentId: contractData.id,
        chainId: parseInt(contractData.chainId),
        address: contractData.address,
        name: contractData.name,
        description: contractData.description,
        skills: contractData.skills,
        backstories: contractData.backstories
      });

      toast({
        title: "Success",
        description: "Agent updated successfully",
      });

      router.push('/chat');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update agent';
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!contractData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mx-auto">
      <CardContent className="pt-6">
        <div className="flex-1 flex items-start justify-center gap-8 p-8">
          <div className="sticky top-8">
            <Scene />
            <Card className="mt-4 max-w-[40vw]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-minecraft">Contract Info</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="minecraft" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Context
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-minecraft">
                        {editingContextIndex !== null ? 'Edit Context' : 'Add Context'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-3 gap-2">
                        {(['Role', 'Goal', 'Backstory'] as const).map((type) => (
                          <Button
                            key={type}
                            variant={selectedContextType === type ? "minecraft" : "outline"}
                            onClick={() => handleContextSelect(type)}
                            className="w-full font-minecraft"
                            disabled={isContextTypeExists(type)}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        placeholder="Enter context content..."
                        className="min-h-[100px] font-minecraft"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={handleCloseDialog} className="font-minecraft">
                        Cancel
                      </Button>
                      <Button
                        variant="minecraft"
                        onClick={handleSaveContext}
                        disabled={!selectedContextType || !editingContent.trim()}
                        className="font-minecraft"
                      >
                        {editingContextIndex !== null ? 'Save' : 'Add'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid gap-2 font-minecraft">
                  <div className="flex items-center text-sm">
                    <span className="font-medium min-w-24">Address:</span>
                    <span>{contractData.address}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium min-w-24">Name:</span>
                    <span>{contractData.name}</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <span className="font-medium min-w-24">Description:</span>
                    <span>{contractData.description}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium min-w-24">Skills:</span>
                    <span>{contractData.skills.length}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  {contractData.backstories.map((story, index) => (
                    <div key={index} className="text-sm flex items-center justify-between group font-minecraft">
                      <p>
                        <span className="font-medium">{story.title}:</span>{' '}
                        <span className="text-gray-600">{story.content || '(Empty)'}</span>
                      </p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditContext(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContext(index)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t mt-6">
                  <Button
                    variant="minecraft"
                    size="lg"
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 max-w-2xl">
            <ContractSkills
              contractAddress={contractData.address}
              contractName={contractData.name}
              onSkillsUpdate={handleSkillsUpdate}
              initialSkills={contractData.skills}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
