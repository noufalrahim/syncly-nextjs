import { ChevronDown, Loader2, MoreHorizontal, PlusIcon } from "lucide-react";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { useReadData } from "@/hooks/useReadData";
import { EUrl, TWorkspace } from "@/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useState } from "react";
import { DialogModal } from "@/components/DialogModal";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faker } from "@faker-js/faker";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateData } from "@/hooks/useCreateData";
import { useRouter } from "next/router";
import { setWorkspace } from "@/redux/workspaceSlice";
import { toast } from "sonner";
import { ContextMenu } from "@/components/ui/context-menu";
import { useDeleteData } from "@/hooks/useDeleteData";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default function ExtSidebarHeader() {
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.user.entity);
  const workspace = useSelector((state: RootState) => state.workspace.entity);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: faker.company.name() },
  });

  const { data: workspaces, isPending: isFetching, refetch: refetchWorkspaces } =
    useReadData<{ success: boolean; data: TWorkspace[]; message: string }>(
      "workspace-by-user-id",
      `/workspaces?userId=${user?.id}&type=user-id`
    );

  const { mutate: createWorkspace, isPending: isCreating } = useCreateData<
    TWorkspace,
    { success: boolean; data: TWorkspace; message: string }
  >("/workspaces");

  const { mutate: deleteWorkspace, isPending: deleteWorkspaceIsPending } =
    useDeleteData<{ success: boolean; data: null; message: string }>("/workspaces");

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
      }
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
      }
    );
  };

  return (
    <SidebarHeader>
      <div>
        <p className="text-lg font-bold">Syncly</p>
      </div>

      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                {workspace ? workspace.name : "Select workspace"}
                <ChevronDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
              {(!workspaces || isFetching) && (
                <div className="p-5 flex items-center justify-center">
                  <Loader2 className="animate-spin" />
                </div>
              )}

              {workspaces && workspaces?.data?.length > 0 &&
                workspaces.data.map((wrkspc) => (
                  <DropdownMenuItem
                    key={wrkspc.id}
                    className="text-sm flex items-center justify-between"
                    onClick={() => {
                      localStorage.setItem("workspace", wrkspc.id!);
                      dispatch(setWorkspace(wrkspc));
                    }}
                  >
                    {wrkspc.name}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="ml-auto p-1">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem>Settings</DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(wrkspc.id!);
                          }}
                        >
                          Delete Workspace
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </DropdownMenuItem>
                ))}

              {workspaces && workspaces?.data?.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center justify-center gap-2 py-3 cursor-pointer text-sm font-medium"
                    onClick={() => setOpen(true)}
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Workspace</span>
                  </DropdownMenuItem>
                </>
              )}

              {workspaces?.data?.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center text-xs p-6 gap-2">
                  <p className="italic text-gray-500">No workspaces yet!</p>
                  <p
                    className="underline italic cursor-pointer hover:text-gray-700 transition"
                    onClick={() => setOpen(true)}
                  >
                    Click here to add your first workspace
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
        description="Enter your workspace details here"
        onCancel={() => setOpen(false)}
        onConfirm={form.handleSubmit(onSubmit)}
        isLoading={isCreating}
      >
        <Form {...form}>
          <form>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input id="name" type="text" placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Field>
          </form>
        </Form>
      </DialogModal>
    </SidebarHeader>
  );
}
