import { ChevronDown, ChevronRight, Folder, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

interface IExtSidebarItemProps {
  title: string;
  childrenItems: string[];
}

export default function ExtSidebarItem({ title, childrenItems }: IExtSidebarItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            {open ? <ChevronDown /> : <ChevronRight />}
            <Folder />
            <span>{title}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction>
              <MoreHorizontal />
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            <DropdownMenuItem>Edit Project</DropdownMenuItem>
            <DropdownMenuItem>Delete Project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
        <SidebarMenuSub>
          {childrenItems.map((c) => (
            <SidebarMenuSubItem key={c}>
              <a href="/">
                <span>{c}</span>
              </a>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
