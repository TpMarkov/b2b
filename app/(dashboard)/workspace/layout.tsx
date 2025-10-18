import React from "react";
import WorkspaceList from "./_components/WorkspaceList";
import Createworkspace from "./_components/Createworkspace";
import UserNav from "./_components/UserNav";
import { orpc } from "@/lib/orpc";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { HydrationBoundary } from "@tanstack/react-query";

type Props = {
  children: React.ReactNode;
};

const WorkspaceLayout = async ({ children }: Props) => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(orpc.workspace.list.queryOptions());
  return (
    <div className="flex w-full h-screen">
      <div className="flex h-full w-16 flex-col items-center bg-secondary p-y-3 p-x-3 border-r border-border">
        <HydrateClient client={queryClient}>
          <WorkspaceList />
        </HydrateClient>

        <div className="mt-4">
          <Createworkspace />
        </div>

        <div className="mt-auto mb-2">
          <UserNav />
        </div>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
