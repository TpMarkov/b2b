"use client";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";
import { getWorkspaceColor } from "@/lib/helpers";
import Image from "next/image";

const WorkspaceList = () => {
  const workspaces = [
    {
      id: "1",
      name: "First workspace",
      avatar: "/logo.png",
    },
  ];
  const isActive = true;
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2 mt-3">
        {workspaces.map((ws) => {
          return (
            <Tooltip key={ws.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  className={`size-12 transition-all duration-200 ${getWorkspaceColor(
                    ws.id
                  )} ${
                    isActive ? "rounded-lg" : "rounded-xl hover:rounded-lg"
                  }`}
                >
                  {ws.avatar ? (
                    <Image
                      src={ws.avatar}
                      width={20}
                      height={20}
                      alt="workspace log"
                    />
                  ) : (
                    <span className="text-sm font-semibold">{ws.name[0]}</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {ws.name} {isActive && "Active"}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default WorkspaceList;
