'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Scene } from "@/components/Scene";
import { ContractSkills } from "@/components/ContractSkills";

interface Skill {
  id: string;
  name: string;
  description: string;
}

interface ContractData {
  address: string;
  name: string;
  skills: Skill[];
}

export default function EditContractAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [contractData, setContractData] = useState<ContractData>({
    address: '',
    name: '',
    skills: []
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-start justify-center gap-8 p-8">
        <div className="sticky top-8">
          <Scene />
          <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-2">Contract Info</h3>
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
