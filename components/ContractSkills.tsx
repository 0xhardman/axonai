'use client';

import { useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleHelp } from 'lucide-react';

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
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger className='flex gap-2 items-center'>
                <h2 className="text-xl font-semibold">Contract Skills</h2>
                <CircleHelp className='text-gray-500 w-4 h-4' />
              </TooltipTrigger>
              <TooltipContent>
                <p>This is an example description of this skill, and you can change it by yourself</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <button
          onClick={handleAddSkill}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add Skill
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading initial skills...</p>
        </div>
      ) : (
        <>
          {isEditing ? (
            <div className="bg-white p-4 rounded-md shadow-sm mb-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Name
                </label>
                <input
                  type="text"
                  value={currentSkill.name}
                  onChange={(e) => setCurrentSkill(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter skill name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={currentSkill.description}
                  onChange={(e) => setCurrentSkill(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Describe the skill"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSkill}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.id} className="bg-white p-4 rounded-md shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{skill.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSkill(skill)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600">{skill.description}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
