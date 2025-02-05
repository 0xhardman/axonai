'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Scene } from "@/components/Scene";
import { ContractSkills } from "@/components/ContractSkills";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  };

  // 检查是否可以部署
  const canDeploy = () => {
    // 确保每种类型的 context 都存在且有内容
    const hasAllContexts = ['Role', 'Goal', 'Backstory'].every(type =>
      contractData.contexts.some(context => 
        context.type === type && context.content.trim() !== ''
      )
    );
    
    // 确保至少有一个技能
    const hasSkills = contractData.skills.length > 0;

    return hasAllContexts && hasSkills;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-start justify-center gap-8 p-8">
        <div className="sticky top-8">
          <Scene />
          <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Contract Info</h3>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Context
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingContextIndex !== null ? 'Edit Context' : 'Add Context'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-3 gap-2">
                      {(['Role', 'Goal', 'Backstory'] as const).map((type) => (
                        <Button
                          key={type}
                          variant={selectedContextType === type ? "default" : "outline"}
                          onClick={() => handleContextSelect(type)}
                          className="w-full"
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
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveContext}
                      disabled={!selectedContextType || !editingContent.trim()}
                    >
                      {editingContextIndex !== null ? 'Save' : 'Add'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Address:</span>{' '}
                <span className="font-mono">{contractData.address}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium">Name:</span>{' '}
                {contractData.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Skills:</span>{' '}
                {contractData.skills.length}
              </p>
              <p className="text-sm">
                <span className="font-medium">Balance:</span>{' '}
                0.1 ETH
              </p>
              {contractData.contexts.map((context, index) => (
                <div key={index} className="text-sm flex items-center justify-between group">
                  <p>
                    <span className="font-medium">{context.type}:</span>{' '}
                    <span className="text-gray-600">{context.content || '(Empty)'}</span>
                  </p>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditContext(index)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteContext(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t">
              <Button 
                className="w-full"
                size="lg"
                onClick={handleDeploy}
                disabled={!canDeploy()}
              >
                <Rocket className="w-4 h-4 mr-2" />
                Deploy Contract Agent
              </Button>
              {!canDeploy() && (
                <p className="text-sm text-gray-500 mt-2">
                  Please ensure you have added all contexts (Role, Goal, Backstory) and at least one skill before deploying.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-2xl">
          <ContractSkills
            contractAddress={contractData.address}
            contractName={contractData.name}
            onSkillsUpdate={handleSkillsUpdate}
          />
        </div>
      </div>
    </div>
  );
}
