import { FlagIcon, GitBranch, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useReadData } from "@/hooks/useReadData";
import { priorityFieldsGenerator } from "@/lib/utils";
import type { ProjectType, TColumn, TTask } from "@/types";
import { BadgeComponent } from "../BadgeComponent";
import { Toolbar } from ".";

interface TableView {
  projectId: string | undefined;
}

export default function TableView({ projectId }: TableView) {
  if (!projectId) {
    return;
  }

  const { data: tasksData, isLoading: tasksLoading } = useReadData<
    {
      task: TTask;
      project: ProjectType;
      column: TColumn;
    }[]
  >("tasks", `/tasks/fields/many?projectId=${projectId}`);

  if (tasksLoading) {
    return <Loader2 className="animate-spin" />;
  }

  return (
    <div>
      <div className="border-gray-500 border-dashed py-5 mb-10 border-y">
        <h1 className="text-2xl font-bold mb-2">
          {tasksData && tasksData[0]?.project.name} - Issues
        </h1>
        <Toolbar />
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasksData &&
              tasksData.length > 0 &&
              tasksData.map((record) => (
                <TableRow key={record.task.id!} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{record.task.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 bg-gray-300 text-gray-700">
                        <AvatarFallback className="text-xs">
                          {/* {task.assignee.split(' ').map(n => n[0]).join('')} */}N
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">Noufal Rahim</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {record.task.priority && (
                      <BadgeComponent
                        title={priorityFieldsGenerator(record.task.priority).label}
                        icon={FlagIcon}
                        bgColor={priorityFieldsGenerator(record.task.priority).color}
                        textColor={priorityFieldsGenerator(record.task.priority).textColor}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <BadgeComponent
                      title={record.column.name}
                      icon={GitBranch}
                      bgColor={"bg-gray-100"}
                      textColor={"text-gray-700"}
                    />
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {record?.task?.dueDate ? new Date(record.task.dueDate).toDateString() : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
