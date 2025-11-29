import { ChevronDown, ChevronRight, Folder, LucideIcon, MoreHorizontal } from "lucide-react";
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
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setProject } from "@/redux/projectSlice";

interface IExtSidebarItemProps {
  title: string;
  projectId: string;
  childrenItems: {
    key: string;
    url: string;
    name: string;
    icon: LucideIcon;
  }[];
  onDeleteProject: (pId: string) => void;
}

export default function ExtSidebarItem({ title, projectId, childrenItems, onDeleteProject }: IExtSidebarItemProps) {
  const [open, setOpen] = useState<boolean>(false);

  const dispatch = useDispatch();

  return (
    <Collapsible open={open} onOpenChange={() => {
      if (!open) {
        localStorage.setItem("project", projectId);
        dispatch(setProject(projectId))
      }
      setOpen(!open)
    }} className="group/collapsible">
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
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => onDeleteProject(projectId)}>Delete Project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
        <SidebarMenuSub>
          {childrenItems.map((c) => (
            <SidebarMenuSubItem key={c.key}>
              <Link href={c.url} className="flex flex-row items-center gap-2 hover:bg-gray-200 p-1 rounded-md">
                <c.icon size={14} />
                <span>{c.name}</span>
              </Link>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
