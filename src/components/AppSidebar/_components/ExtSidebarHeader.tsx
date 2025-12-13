import { faker } from "@faker-js/faker";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Loader2, MoreHorizontal, PlusIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import z from "zod";
import { DialogModal } from "@/components/DialogModal";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useCreateData } from "@/hooks/useCreateData";
import { useDeleteData } from "@/hooks/useDeleteData";
import { useReadData } from "@/hooks/useReadData";
import type { RootState } from "@/redux/store";
import { setWorkspace } from "@/redux/workspaceSlice";
import { EUrl, type TWorkspace } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import WorkspaceMenuSidebar from "./WorkspaceMenuSidebar";
import { ManageUsers } from "./WorkspaceMenuItems";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default function ExtSidebarHeader() {
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const user = useSelector((state: RootState) => state.user.entity);
  const workspace = useSelector((state: RootState) => state.workspace.entity);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: faker.company.name() },
  });

  const {
    data: workspaces,
    isPending: isFetching,
    refetch: refetchWorkspaces,
  } = useReadData<{ success: boolean; data: TWorkspace[]; message: string }>(
    "workspace-by-user-id",
    `/workspaces?userId=${user?.id}&type=user-id`,
  );

  const { mutate: createWorkspace, isPending: isCreating } = useCreateData<
    TWorkspace,
    { success: boolean; data: TWorkspace; message: string }
  >("/workspaces");

  const { mutate: deleteWorkspace, isPending: deleteWorkspaceIsPending } = useDeleteData<{
    success: boolean;
    data: null;
    message: string;
  }>("/workspaces");

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!user?.id) {
      router.push(EUrl.SIGNIN);
      return;
    }
    createWorkspace(
      { name: data.name, createdBy: user.id },
      {
        onSuccess: (res) => {
          if (res?.success && res.data) {
            toast.success("Workspace created successfully!", { position: "top-right" });
            setOpen(false);
            refetchWorkspaces();
          } else toast.error("Something went wrong!", { position: "top-right" });
        },
        onError: () => toast.error("Something went wrong!", { position: "top-right" }),
      },
    );
  };

  const handleDelete = (wId: string) => {
    deleteWorkspace(
      { id: wId },
      {
        onSuccess: (res) => {
          if (res?.success) {
            toast.success("Workspace deleted successfully", { position: "top-right" });

            if (workspace?.id === wId) {
              localStorage.removeItem("workspace");
              dispatch(setWorkspace(null));
            }

            refetchWorkspaces();
          } else {
            toast.error("An error occured while deleting workspace", { position: "top-right" });
          }
        },
        onError: () =>
          toast.error("An error occured while deleting workspace", { position: "top-right" }),
      },
    );
  };

  return (
    <SidebarHeader>
      <p className="text-xl font-semibold tracking-tight">Syncly</p>

      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="flex items-center justify-between">
                <span className="truncate">{workspace ? workspace.name : "Select workspace"}</span>
                <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[--radix-popper-anchor-width] p-1 rounded-lg shadow-lg border bg-white/95 backdrop-blur">
              {isFetching && (
                <div className="p-4 flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
                </div>
              )}

              {workspaces && workspaces?.data?.length > 0 &&
                workspaces.data.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-accent transition"
                  >
                    <DropdownMenuItem
                      className="flex-1 text-sm cursor-pointer"
                      onClick={() => {
                        localStorage.setItem("workspace", w.id!);
                        dispatch(setWorkspace(w));
                      }}
                    >
                      {w.name}
                    </DropdownMenuItem>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-muted transition">
                          <MoreHorizontal className="h-4 w-4 opacity-70" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent side="right" align="start" className="rounded-md shadow-lg">
                        <DropdownMenuItem onClick={() => setOpenMenu(true)}>Settings</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(w.id!)}>
                          Delete Workspace
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}

              {workspaces && workspaces?.data?.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => setOpen(true)}
                  >
                    <PlusIcon className="h-4 w-4" /> Add Workspace
                  </DropdownMenuItem>
                </>
              )}

              {workspaces?.data?.length === 0 && (
                <div className="flex flex-col items-center text-center text-xs p-6 gap-2 text-muted-foreground">
                  <p>No workspaces yet</p>
                  <p className="underline cursor-pointer" onClick={() => setOpen(true)}>
                    Create your first workspace
                  </p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <DialogModal
        open={open}
        setOpen={setOpen}
        title="Create Workspace"
        description="Enter workspace details"
        onCancel={() => setOpen(false)}
        onConfirm={form.handleSubmit(onSubmit)}
        isLoading={isCreating}
      >
        <Form {...form}>
          <form>
            <Field>
              <FieldLabel htmlFor="name">Workspace Name</FieldLabel>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input id="name" type="text" placeholder="Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Field>
          </form>
        </Form>
      </DialogModal>

      <DialogModal width="w-[70rem]" open={openMenu} setOpen={setOpenMenu}>
        <div className="h-full min-h-[40rem] flex">
          <div className="w-[15rem] h-full">
            <WorkspaceMenuSidebar />
          </div>
          <div className="flex-1 h-full overflow-auto">
            <ManageUsers workspaceId={workspace?.id!}/>
          </div>
        </div>
      </DialogModal>
    </SidebarHeader>
  );
}
