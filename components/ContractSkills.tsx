'use client';

import { useState } from 'react';
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
  name: string;
  description: string;
  workflow: string[];
}

interface ContractSkillsProps {
  contractAddress: string;
  contractName: string;
  initialSkills?: Skill[];
  onSkillsUpdate: (skills: Skill[]) => void;
}

export function ContractSkills({ 
  contractAddress, 
  contractName, 
  initialSkills = [], 
  onSkillsUpdate 
}: ContractSkillsProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [currentSkill, setCurrentSkill] = useState<Skill>({
    name: '',
    description: '',
    workflow: []
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleAddSkill = () => {
    setIsEditing(true);
    setCurrentSkill({
      name: '',
      description: '',
      workflow: []
    });
  };

  const handleSaveSkill = () => {
    if (!currentSkill.name || !currentSkill.description) return;

    const updatedSkills = [...skills];
    const existingIndex = skills.findIndex(s => s.name === currentSkill.name);

    if (existingIndex >= 0) {
      updatedSkills[existingIndex] = currentSkill;
    } else {
      updatedSkills.push(currentSkill);
    }

    setSkills(updatedSkills);
    onSkillsUpdate(updatedSkills);
    setIsEditing(false);
    setCurrentSkill({ name: '', description: '', workflow: [] });
  };

  const handleEditSkill = (skill: Skill) => {
    setCurrentSkill(skill);
    setIsEditing(true);
  };

  const handleDeleteSkill = (skillName: string) => {
    const updatedSkills = skills.filter(s => s.name !== skillName);
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
                <p className="font-minecraft">Define the skills and capabilities of your contract agent</p>
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
                  placeholder="Describe what this skill does and how to use it"
                />
              </div>
              <div>
                <label className="block text-sm font-minecraft text-gray-700 mb-2">
                  Workflow
                </label>
                <Textarea
                  value={currentSkill.workflow.join('\n')}
                  onChange={(e) => setCurrentSkill(prev => ({ 
                    ...prev, 
                    workflow: e.target.value.split('\n').filter(line => line.trim() !== '')
                  }))}
                  className="font-minecraft border-2 border-[#367d39] focus:ring-2 focus:ring-[#4CAF50] min-h-[100px]"
                  placeholder="Enter workflow steps (one per line)"
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
              <Card key={skill.name} className="border-2 border-[#367d39]">
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
                        onClick={() => handleDeleteSkill(skill.name)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-600 font-minecraft text-sm">{skill.description}</p>
                    {skill.workflow.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-minecraft text-gray-700 mb-2">Workflow:</h4>
                        <ul className="list-decimal list-inside space-y-1">
                          {skill.workflow.map((step, index) => (
                            <li key={index} className="text-sm text-gray-600 font-minecraft">{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
