'use client';

import { Scene } from "@/components/Scene";
import { ChatBox } from "@/components/ChatBox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex justify-center p-8">
        <div className="flex gap-8 max-w-[1200px] w-full">
          {/* Left Column: Model and Contract Info */}
          <div className="flex flex-col w-[500px]">
            {/* <div className="h-[400px]"> */}
            <Scene />
            {/* </div> */}

            {/* Contract Info Card */}
            <Card className="w-full border-2 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-minecraft">Contract Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-minecraft text-sm text-gray-500">Contract Address</h3>
                    <p className="font-minecraft break-all">0xb15115A15d5992A756D003AE74C0b832918fAb75</p>
                  </div>
                  <div>
                    <h3 className="font-minecraft text-sm text-gray-500">Name</h3>
                    <p className="font-minecraft">Sample Contract</p>
                  </div>
                  <div>
                    <h3 className="font-minecraft text-sm text-gray-500">Description</h3>
                    <p className="font-minecraft">This is a sample smart contract with basic functionality.</p>
                  </div>
                  <div>
                    <h3 className="font-minecraft text-sm text-gray-500">Skills</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <TooltipProvider>
                        {[
                          { name: "Balance Check", description: "Check the balance of any address in the contract" },
                          { name: "Transfer", description: "Transfer tokens between addresses" },
                          { name: "Mint", description: "Create new tokens" }
                        ].map((skill) => (
                          <Tooltip key={skill.name}>
                            <TooltipTrigger>
                              <Badge
                                variant="secondary"
                                className="font-minecraft bg-[#4CAF50]/10 hover:bg-[#4CAF50]/20 border-2 border-[#367d39] text-[#367d39]"
                              >
                                {skill.name}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="font-minecraft border-2 border-[#367d39] bg-black">
                              <p>{skill.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Chat Box */}
          <div className="flex-1 pt-20">
            <ChatBox />
          </div>
        </div>
      </div>
    </div>
  );
}