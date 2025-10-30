import React from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { CloudyIcon, PlusCircleIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

interface EmptystateProps {
  title: string;
  description: string;
  buttonText: string;
  href: string;
}

const EmptyState = ({
  title,
  description,
  buttonText,
  href,
}: EmptystateProps) => {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-primary/10">
          <CloudyIcon className="size-5 text-primary" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
        <EmptyContent>
          <Link href={href} className={buttonVariants({ variant: "default" })}>
            <PlusCircleIcon />
            {buttonText}
          </Link>
        </EmptyContent>
      </EmptyHeader>
    </Empty>
  );
};

export default EmptyState;
