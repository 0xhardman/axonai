'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Scene } from "@/components/Scene";
import { ContractSkills } from "@/components/ContractSkills";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Rocket } from "lucide-react";

type ContextType = 'Role' | 'Goal' | 'Backstory';

interface ContractContext {
  type: ContextType;
  content: string;
}

interface Skill {
  id: string;
  name: string;
  description: string;
}

interface ContractData {
  address: string;
  name: string;
  skills: Skill[];
  contexts: ContractContext[];
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContextType, setSelectedContextType] = useState<ContextType | null>(null);
  const [editingContextIndex, setEditingContextIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const [contractData, setContractData] = useState<ContractData>({
    address: '',
    name: '',
    skills: [],
    contexts: []
  });

  useEffect(() => {
    const address = searchParams.get('address') || '';
    const name = searchParams.get('name') || '';

    setContractData(prev => ({
      ...prev,
      address,
      name,
    }));
  }, [searchParams]);

  const handleSkillsUpdate = (skills: Skill[]) => {
    setContractData(prev => ({
      ...prev,
      skills
    }));
  };

  const handleContextSelect = (type: ContextType) => {
    // 如果正在编辑，允许选择当前类型
    if (editingContextIndex !== null && contractData.contexts[editingContextIndex].type === type) {
      setSelectedContextType(type);
      return;
    }

    // 检查是否已存在该类型的 context
    const exists = contractData.contexts.some(context => context.type === type);
    if (!exists) {
      setSelectedContextType(type);
    }
  };

  const handleSaveContext = () => {
    if (selectedContextType) {
      if (editingContextIndex !== null) {
        // Edit existing context
        setContractData(prev => {
          const newContexts = [...prev.contexts];
          newContexts[editingContextIndex] = {
            type: selectedContextType,
            content: editingContent
          };
          return { ...prev, contexts: newContexts };
        });
      } else {
        // Add new context
        setContractData(prev => ({
          ...prev,
          contexts: [...prev.contexts, { type: selectedContextType, content: editingContent }]
        }));
      }
      handleCloseDialog();
    }
  };

  const handleEditContext = (index: number) => {
    const context = contractData.contexts[index];
    setEditingContextIndex(index);
    setSelectedContextType(context.type);
    setEditingContent(context.content);
    setIsDialogOpen(true);
  };

  const handleDeleteContext = (index: number) => {
    setContractData(prev => ({
      ...prev,
      contexts: prev.contexts.filter((_, i) => i !== index)
    }));
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedContextType(null);
    setEditingContent('');
    setEditingContextIndex(null);
  };

  // 检查某个类型是否已存在
  const isContextTypeExists = (type: ContextType) => {
    return contractData.contexts.some(context =>
      context.type === type && (editingContextIndex === null || contractData.contexts[editingContextIndex].type !== type)
    );
  };

  const handleDeploy = () => {
    // TODO: 实现部署逻辑
    console.log('Deploying contract with data:', contractData);
    // Navigate to chat page
    router.push('/chat');
  };

  // // 检查是否可以部署
  // const canDeploy = () => {
  //   // 确保每种类型的 context 都存在且有内容
  //   const hasAllContexts = ['Role', 'Goal', 'Backstory'].every(type =>
  //     contractData.contexts.some(context =>
  //       context.type === type && context.content.trim() !== ''
  //     )
  //   );

  //   // 确保至少有一个技能
  //   const hasSkills = contractData.skills.length > 0;

  //   return hasAllContexts && hasSkills;
  // };

  return (
    <Card className="w-full max-w-2xl mx-auto">
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
                    <span className="font-mono">{contractData.address}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium min-w-24">Name:</span>
                    <span>{contractData.name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium min-w-24">Skills:</span>
                    <span>{contractData.skills.length}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium min-w-24">Balance:</span>
                    <span>0.1 ETH</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  {contractData.contexts.map((context, index) => (
                    <div key={index} className="text-sm flex items-center justify-between group font-minecraft">
                      <p>
                        <span className="font-medium">{context.type}:</span>{' '}
                        <span className="text-gray-600">{context.content || '(Empty)'}</span>
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
                    onClick={handleDeploy}
                    // disabled={!canDeploy()}
                    className="w-full"
                  >
                    Deploy
                  </Button>
                  {/* {!canDeploy() && (
                    <p className="text-sm text-gray-500 mt-2 font-minecraft text-center">
                      Click Deploy to create your contract agent
                    </p>
                  )} */}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 max-w-2xl">
            <ContractSkills
              contractAddress={contractData.address}
              contractName={contractData.name}
              onSkillsUpdate={handleSkillsUpdate}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
