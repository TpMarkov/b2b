import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";
import { getWorkspaceColor } from "@/lib/helpers";

type Props = {};
type workspace = {
  id: number;
  name: string;
  avatar: string;
};
const workspaces = [
  {
    id: "1",
    name: "Team-flow-1",
    avatar: "FF",
  },
  {
    id: "2",
    name: "Team-flow-2",
    avatar: "FF",
  },
  {
    id: "3",
    name: "Team-flow-3",
    avatar: "FF",
  },
  {
    id: "4",
    name: "Team-flow-4",
    avatar: "FF",
  },
  {
    id: "5",
    name: "Team-flow-5",
    avatar: "FF",
  },
  {
    id: "6",
    name: "Team-flow-6",
    avatar: "FF",
  },
];

const WorkspaceList = (props: Props) => {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2">
        {workspaces.map((workspace) => (
          <Tooltip key={workspace.id}>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className={`size-12 transition-all duration-200 ${getWorkspaceColor(
                  workspace.id
                )}`}
              >
                <span className="text-sm font-semibold">
                  {workspace.avatar}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{workspace.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default WorkspaceList;
