'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleHelp, Pencil, Trash2, Plus } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  description: string;
}

interface ContractSkillsProps {
  contractAddress: string;
  contractName: string;
  onSkillsUpdate: (skills: Skill[]) => void;
}

// Mock initial skills
const mockInitialSkills = [
  {
    id: '1',
    name: 'Swap',
    description: 'Exchange tokens using the contract\'s liquidity pools with optimal routing and minimal slippage.'
  },
  {
    id: '2',
    name: 'Check Allowance',
    description: 'View and verify token approval amounts for specific addresses and contracts.'
  },
  {
    id: '3',
    name: 'Add Liquidity',
    description: 'Provide liquidity to the pool by depositing token pairs at the current ratio.'
  }
];

export function ContractSkills({ contractAddress, contractName, onSkillsUpdate }: ContractSkillsProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [currentSkill, setCurrentSkill] = useState<Skill>({
    id: '',
    name: '',
    description: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setSkills(mockInitialSkills);
      onSkillsUpdate(mockInitialSkills);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [onSkillsUpdate]);

  const handleAddSkill = () => {
    setIsEditing(true);
    setCurrentSkill({
      id: Date.now().toString(),
      name: '',
      description: ''
    });
  };

  const handleSaveSkill = () => {
    if (!currentSkill.name || !currentSkill.description) return;

    const updatedSkills = [...skills];
    const existingIndex = skills.findIndex(s => s.id === currentSkill.id);

    if (existingIndex >= 0) {
      updatedSkills[existingIndex] = currentSkill;
    } else {
      updatedSkills.push(currentSkill);
    }

    setSkills(updatedSkills);
    onSkillsUpdate(updatedSkills);
    setIsEditing(false);
    setCurrentSkill({ id: '', name: '', description: '' });
  };

  const handleEditSkill = (skill: Skill) => {
    setCurrentSkill(skill);
    setIsEditing(true);
  };

  const handleDeleteSkill = (skillId: string) => {
    const updatedSkills = skills.filter(s => s.id !== skillId);
    setSkills(updatedSkills);
    onSkillsUpdate(updatedSkills);
  };

  return (
    <Card className="w-full border-2 border-[#367d39] bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-minecraft">Contract Skills</CardTitle>
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger>
                <CircleHelp className="text-gray-500 w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent className="border-2 border-[#367d39] bg-white">
                <p className="font-minecraft">This is an example description of this skill, and you can change it by yourself</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          variant="minecraft"
          size="sm"
          onClick={handleAddSkill}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Skill
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#4CAF50] border-r-transparent"></div>
            <p className="mt-2 text-gray-600 font-minecraft">Loading initial skills...</p>
          </div>
        ) : (
          <>
            {isEditing ? (
              <Card className="border-2 border-[#367d39]">
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <label className="block text-sm font-minecraft text-gray-700 mb-2">
                      Skill Name
                    </label>
                    <input
                      type="text"
                      value={currentSkill.name}
                      onChange={(e) => setCurrentSkill(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-[#367d39] rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] font-minecraft text-sm"
                      placeholder="Enter skill name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-minecraft text-gray-700 mb-2">
                      Description
                    </label>
                    <Textarea
                      value={currentSkill.description}
                      onChange={(e) => setCurrentSkill(prev => ({ ...prev, description: e.target.value }))}
                      className="font-minecraft border-2 border-[#367d39] focus:ring-2 focus:ring-[#4CAF50] min-h-[100px]"
                      placeholder="Describe the skill"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="font-minecraft"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="minecraft"
                      onClick={handleSaveSkill}
                      className="font-minecraft"
                      disabled={!currentSkill.name || !currentSkill.description}
                    >
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {skills.map((skill) => (
                  <Card key={skill.id} className="border-2 border-[#367d39]">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-minecraft">{skill.name}</h3>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSkill(skill)}
                            className="h-8 w-8 p-0 hover:bg-[#4CAF50]/10"
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSkill(skill.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600 font-minecraft text-sm">{skill.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
