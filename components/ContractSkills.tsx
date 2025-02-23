'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Contract Skills</CardTitle>
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger>
                <CircleHelp className="text-muted-foreground w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Define the skills and capabilities of your contract agent</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddSkill}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Skill
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="skillName">Skill Name</Label>
                <Input
                  id="skillName"
                  value={currentSkill.name}
                  onChange={(e) => setCurrentSkill(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter skill name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentSkill.description}
                  onChange={(e) => setCurrentSkill(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px]"
                  placeholder="Describe what this skill does and how to use it"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workflow">Workflow</Label>
                <Textarea
                  id="workflow"
                  value={currentSkill.workflow.join('\n')}
                  onChange={(e) => setCurrentSkill(prev => ({
                    ...prev,
                    workflow: e.target.value.split('\n').filter(line => line.trim() !== '')
                  }))}
                  className="min-h-[100px]"
                  placeholder="Enter workflow steps (one per line)"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSkill}
                  disabled={!currentSkill.name || !currentSkill.description}
                >
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {skills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No skills added yet. Click "Add Skill" to create one.</p>
              </div>
            ) : (
              skills.map((skill) => (
                <Card key={skill.name}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">{skill.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSkill(skill)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSkill(skill.name)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {skill.workflow.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Workflow</h4>
                        <ul className="list-decimal list-inside space-y-1">
                          {skill.workflow.map((step, index) => (
                            <li key={index} className="text-sm text-muted-foreground">{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
