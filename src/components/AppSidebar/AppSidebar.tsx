"use client";

import {
  Calendar,
  ChartGantt,
  Home,
  Inbox,
  LayoutTemplate,
  Plus,
  Search,
  Settings,
  Table,
} from "lucide-react";

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
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import z from "zod";
import { faker } from "@faker-js/faker";
import { useReadData } from "@/hooks/useReadData";
import { EUrl, TProject } from "@/types";
import { useCreateData } from "@/hooks/useCreateData";
import { DialogModal } from "../DialogModal";
import { DynamicForm } from "../DynamicForm";
import { toast } from "sonner";
import { useDeleteData } from "@/hooks/useDeleteData";

const appItems = [
  { title: "Home", url: "#", icon: Home },
  { title: "Inbox", url: "#", icon: Inbox },
  { title: "Search", url: "#", icon: Search },
  { title: "Settings", url: "#", icon: Settings },
];

const formSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    emoji: z.string().min(1, "Emoji is required"),
  });

export default function AppSidebar() {
  const skeletons = Array.from({ length: 5 });

  const [open, setOpen] = useState<boolean>(false);

  const user = useSelector((state: RootState) => state.user.entity);
  const workspace = useSelector((state: RootState) => state.workspace.entity);

  const { data: projects, isPending: isFetching, refetch: refetchProjects } = useReadData<
    {
      success: boolean;
      data: TProject[];
      message: string;
    }
  >('project-by-workspace-id', `/projects?workspaceId=${workspace?.id}&type=workspace-id`);


  const { mutate: createProject, isPending: isCreating } = useCreateData<
    TProject,
    {
      success: boolean;
      data: TProject;
      message: string;
    }
  >('/projects');

    const { mutate: deleteProject, isPending: deleteProjectIsPending } = useDeleteData<
    {
      success: boolean;
      data: null;
      message: string;
    }
  >('/projects');

  const handleDeleteProject = (projectId: string) => {
    deleteProject(
      {
        id: projectId
      },
      {
        onSuccess: (res) => {
          if (res && res.success) {
            toast.success('Project deleted successfully', { position: 'top-right' });
            refetchProjects();
          }
          else {
            toast.error('An error occured while deleting project', { position: 'top-right' });
          }
        },
        onError: () => {
          toast.error('An error occured while deleting project', { position: 'top-right' });
        }
      }
    )
  };

  const handleOnSubmit = (data: z.infer<typeof formSchema>) => {
    if (!workspace || !workspace?.id || !user || !user?.id) {
      console.log("No workspace or user found");
      return;
    }
    createProject(
      {
        name: data.name,
        workspace: workspace.id!,
        emoji: data.emoji,
        createdBy: user.id!,
      },
      {
        onSuccess: (res) => {
          if (res && res.success && res.data) {
            refetchProjects();
            toast.success('Project created successfully!', { position: 'top-right' });
            setOpen(false);
          }
          else {
            toast.error('An unknown error occured!', { position: 'top-right' });
          }
        },
        onError: (err) => {
          console.log("Error creating project ", err);
          toast.error('An unknown error occured!', { position: 'top-right' });
        }
      }
    )
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader />
      <SidebarContent>
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
            <Plus onClick={() => setOpen(true)} />
            <span className="sr-only">Add Project</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            {
              isFetching && (
                (
                  <SidebarMenu>
                    {skeletons.map((_, index) => (
                      <SidebarMenuItem key={index}>
                        <SidebarMenuSkeleton />
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                )
              )
            }
            {
              projects && projects?.data?.length > 0 && (
                projects?.data?.map((p, i) => (
                  <ExtSidebarItem
                    key={i}
                    projectId={p.id!}
                    title={p.name}
                    onDeleteProject={handleDeleteProject}
                    childrenItems={
                      [
                        {
                          key: 'board',
                          url: EUrl.BOARD.replace(":id", p.id!),
                          name: 'Board',
                          icon: LayoutTemplate,
                        },
                        {
                          key: 'table',
                          url: EUrl.TABLE.replace(":id", p.id!),
                          name: 'Table',
                          icon: Table,
                        },
                        {
                          key: 'gantt',
                          url: EUrl.GANTT.replace(":id", p.id!),
                          name: 'Gantt',
                          icon: ChartGantt,
                        },
                        {
                          key: 'calendar',
                          url: EUrl.CALENDAR.replace(":id", p.id!),
                          name: 'Calendar',
                          icon: Calendar,
                        }
                      ]
                    } />
                ))
              )
            }
            {
              projects && projects?.data?.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center text-xs p-6 gap-2">
                  <p className="italic text-gray-500">No Projects yet!</p>
                  <p
                    className="underline italic cursor-pointer hover:text-gray-700 transition"
                    onClick={() => setOpen(true)}
                  >
                    Click here to add your first project
                  </p>
                </div>
              )
            }
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
      <DialogModal title="Create Project" description="Enter your project details here" open={open} setOpen={setOpen}>
        <DynamicForm
          formClass="space-y-6"
          gridClass="grid grid-cols-12 gap-6"
          schema={[
            {
              name: "emoji",
              label: "Project Emoji",
              type: "text",
              placeholder: "Emoji..",
              constraint: "emoji",
              layout: { colSpan: 3 },
              wrapperClass: "space-y-2",
              labelClass: "text-sm font-medium text-gray-700",
              inputClass: "h-12 text-2xl text-center border rounded-xl bg-gray-50",
            },
            {
              name: "name",
              label: "Project Name",
              type: "text",
              placeholder: "Name..",
              layout: { colSpan: 9 },
              wrapperClass: "space-y-2",
              labelClass: "text-sm font-medium text-gray-700",
              inputClass: "h-12 px-4 border rounded-xl bg-gray-50",
            }
          ]}
          defaultValues={{
            name: faker.company.name(),
            emoji: faker.internet.emoji(),
          }}
          onSubmit={(data) => handleOnSubmit(data)}
          loading={isCreating}
        />
      </DialogModal>
    </Sidebar>
  );
}
