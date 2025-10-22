import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { client } from "@/lib/orpc";
import { ArrowUpRightIcon, CloudIcon } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";
import CreateNewChannel from "./_components/CreateNewChannel";

interface iAppProps {
  params: Promise<{ workspaceId: string }>;
}
const WorkspaceIdPage = async ({ params }: iAppProps) => {
  const { channels } = await client.channel.list();
  const { workspaceId } = await params;

  if (channels.length > 0) {
    return redirect(`/workspace/${workspaceId}/channel/${channels[0].id}`);
  }
  return (
    <div className="flex flex-1 p-15">
      <Empty
        className="border-dashed border from-muted/50 to-background h-full bg-gradient-to-b from-30%
      "
      >
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CloudIcon />
          </EmptyMedia>
          <EmptyTitle>No Channels Yet</EmptyTitle>
          <EmptyDescription>
            Create your first channel to get started
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="max-w-xs mx-auto">
          <CreateNewChannel />
        </EmptyContent>
        <Button
          variant="link"
          asChild
          className="text-muted-foreground"
          size="sm"
        >
          <a href="#">
            Learn More <ArrowUpRightIcon />
          </a>
        </Button>
      </Empty>
    </div>
  );
};

export default WorkspaceIdPage;
