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
import { useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";

const WorkspaceList = () => {
  const {
    data: { workspaces, currentWorkspace },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2 mt-3">
        {workspaces.map((ws) => {
          const isActive = currentWorkspace.orgCode === ws.id;
          return (
            <Tooltip key={ws.id}>
              <TooltipTrigger asChild>
                <LoginLink orgCode={ws.id}>
                  <Button
                    variant="default"
                    size="icon"
                    className={cn(
                      `size-12 transition-all duration-200`,
                      getWorkspaceColor(ws.id),
                      isActive ? "rounded-lg" : "rounded-xl hover:rounded-lg"
                    )}
                  >
                    <span className="text-sm font-semibold">{ws.name[0]}</span>
                  </Button>
                </LoginLink>
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
