import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, MoreHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogModal } from "@/components/DialogModal";
import { DynamicForm } from "@/components/DynamicForm";
import { useCreateData } from "@/hooks/useCreateData";
import { toast } from "sonner";
import { useReadData } from "@/hooks/useReadData";
import { TUser, TWorkspaceMember } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface IManageUsers {
  workspaceId: string;
}

export default function ManageUsers({ workspaceId }: IManageUsers) {
  const [openAddPeople, setOpenAddPeople] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>("");

  const { mutate: sendEmailMutate, isPending: sendEmailPending } = useCreateData("/dispatch");

  const { data: workspaceMembers, isPending: workspaceMembersPending } = useReadData<
    {
      success: boolean;
      message: string;
      data: TWorkspaceMember[];
    }
  >("get_all_workspace_users", `/workspace-members?type=workspace-id&workspaceId=${workspaceId}`);

  const { data: searchUsers, isPending: searchUsersPending } = useReadData<
    {
      success: boolean;
      message: string;
      data: TUser[];
    }
  >("get_many_by_email", keyword.length >= 7 ? `/users?type=get_many_by_email&keyword=${keyword}` : null);

  return (
    <div className="h-full">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Manage Users</h1>
          <p className="italic text-muted-foreground text-xs">Manage all users, roles and permissions</p>
        </div>
        <Button onClick={() => setOpenAddPeople(true)}>Add people</Button>
      </div>

      <div className="py-10">
        <Table>
          <TableCaption>List of users in the workspace.</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {workspaceMembersPending && (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!workspaceMembersPending &&
              workspaceMembers?.data?.map((dt) => (
                <TableRow key={dt.user.id}>
                  <TableCell className="font-medium">{dt.user.email}</TableCell>
                  <TableCell>{dt.user.name}</TableCell>
                  <TableCell>{dt.role}</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" aria-label="Open menu" size="sm">
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-40" align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>Total users</TableCell>
              <TableCell className="text-right">{workspaceMembers?.data?.length ?? 0}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <DialogModal open={openAddPeople} setOpen={setOpenAddPeople} title="Add People" description="Search by email">
        <DynamicForm
          schema={[
            {
              name: "email",
              label: "Email",
              type: "autocomplete",
              placeholder: "Enter email...",
              options: searchUsers?.data?.map((usr) => ({ label: usr.email, value: usr.email })) ?? [],
              layout: { colSpan: 12 },
              onSearch: (value: string) => {
                setKeyword(value);
              },
              isLoading: searchUsersPending,
            },
            {
              name: "role",
              label: "Role",
              type: "dropdown",
              placeholder: "Select role..",
              options: [
                { label: "Admin", value: "admin" },
                { label: "Editor", value: "editor" },
                { label: "Viewer", value: "viewer" },
              ],
              layout: { colSpan: 12 },
            },
          ]}
          defaultValues={{
            email: "noufalrahim6784@gmail.com",
            role: "member",
          }}
          onSubmit={(data) => {
            sendEmailMutate(data, {
              onSuccess: () => {
                toast.success("Invitation sent successfully", { position: "top-right" });
              },
              onError: () => {
                toast.error("Something went wrong", { position: "top-right" });
              },
            });
          }}
          loading={sendEmailPending}
        />
      </DialogModal>
    </div>
  );
}
