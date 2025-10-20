import React from "react";
import WorkspaceHeader from "./_components/WorkspaceHeader";
import CreateNewChannel from "./_components/CreateNewChannel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import ChannelList from "./_components/ChannelList";
import MembersList from "./_components/MembersList";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { orpc } from "@/lib/orpc";

type Props = {
  children: React.ReactNode;
};

const ChannelListLayout = async ({ children }: Props) => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(orpc.channel.list.queryOptions());

  return (
    <>
      <div className="flex h-full w-80 flex-col bg-secondary border-r border-border">
        {/* Header */}
        <div className="flex items-center px-4 h-14 border-b border-border">
          <HydrateClient client={queryClient}>
            <WorkspaceHeader />
          </HydrateClient>
        </div>

        <div className="px-4 py-2">
          <CreateNewChannel />
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto px-4">
          <Collapsible defaultOpen={true}>
            <CollapsibleTrigger
              className="w-full flex items-center justify-between font-medium text-muted-foreground
            hover:text-accent-foreground [&[data-state=open]>svg]:rotate-180

            "
            >
              Main
              <ChevronDownIcon className="size-4 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <HydrateClient client={queryClient}>
                <ChannelList />
              </HydrateClient>
            </CollapsibleContent>
          </Collapsible>
        </div>
        {/* Members list */}
        <div className="px-4 py-2 border-t border-border">
          <Collapsible defaultOpen={true}>
            <CollapsibleTrigger
              className="w-full flex items-center justify-between px-2 py-1 text-sm font-medium text-muted-foreground hover:text-accent-foreground [&[data-state=closed]>svg]:rotate-180
            "
            >
              Members
              <ChevronDownIcon className="size-4 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <HydrateClient client={queryClient}>
                <MembersList />
              </HydrateClient>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
      {children}
    </>
  );
};

export default ChannelListLayout;
