"use client";

import { Calendar, Home, Inbox, Plus, Search, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ExtSidebarItem, SidebarFooter, SidebarHeader } from "./_components";

const appItems = [
  { title: "Home", url: "#", icon: Home },
  { title: "Inbox", url: "#", icon: Inbox },
  { title: "Calendar", url: "#", icon: Calendar },
  { title: "Search", url: "#", icon: Search },
  { title: "Settings", url: "#", icon: Settings },
];

const projects = [
  {
    title: "Project Alpha",
    children: ["Overview", "Tasks", "Team"],
  },
  {
    title: "Project Beta",
    children: ["Dashboard", "Files", "Settings"],
  },
  {
    title: "Project Gamma",
    children: ["Data", "Reports", "Settings"],
  },
];

export default function AppSidebar() {
  const skeletons = Array.from({ length: 5 });

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader />

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {skeletons.map((_, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuSkeleton />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {appItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupAction title="Add Project">
            <Plus />
            <span className="sr-only">Add Project</span>
          </SidebarGroupAction>

          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((p, i) => (
                <ExtSidebarItem key={i} title={p.title} childrenItems={p.children} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
