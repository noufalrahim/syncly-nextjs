"use client";

import { format } from "date-fns";
import { Dot, FlagIcon, GitBranch, Loader2, Trash2 } from "lucide-react";
import { forwardRef } from "react";
import { priorityFieldsGenerator, withNA } from "@/lib/utils";
import type { TColumn, TTask } from "@/types";
import { BadgeComponent } from "../BadgeComponent";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    task: TTask;
    setOpen: (open: boolean) => void;
    column?: TColumn;
    onDeleteTask: (task: TTask) => void;
    isPending: boolean;
  }
>(function TaskCard({ task, setOpen, column, onDeleteTask, isPending, ...props }, ref) {
  const project = useSelector((state: RootState) => state.project.entity);

  return (
    <div
      ref={ref}
      {...props}
      {...(props as any).attributes}
      {...(props as any).listeners}
      className={`rounded-xl border bg-card p-3 shadow-xs cursor-pointer transition ${isPending ? "opacity-50 pointer-events-none select-none blur-[1px]" : ""}`}
      onClick={() => !isPending && setOpen(true)}
      draggable={!isPending}
      onDragStart={(e) => {
        if (isPending) e.preventDefault();
      }}
    >
      <div className="flex items-center justify-between gap-1">
        <p className="max-w-[90%] text-[15px] font-semibold text-black">{task.title}</p>
        {isPending ? (
          <Loader2 className="animate-spin text-gray-500" />
        ) : (
          <Trash2
            className="cursor-pointer"
            size={20}
            color="gray"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task);
            }}
          />
        )}
      </div>

      <div className="flex items-start justify-start w-full flex-row gap-1 py-3">
        {task?.priority && (
          <BadgeComponent
            title={priorityFieldsGenerator(task.priority).label}
            icon={FlagIcon}
            bgColor={priorityFieldsGenerator(task.priority).color}
            textColor={priorityFieldsGenerator(task.priority).textColor}
          />
        )}
        <BadgeComponent
          title={column?.name!}
          icon={GitBranch}
          bgColor={priorityFieldsGenerator("unknown").color}
          textColor={priorityFieldsGenerator("unknown").textColor}
        />
      </div>

      <Separator orientation="horizontal" />

      <div className="flex items-start justify-start w-full flex-row gap-1 pt-3">
        <BadgeComponent
          title={"Frontend"}
          bgColor={priorityFieldsGenerator("unknown").color}
          textColor={priorityFieldsGenerator("unknown").textColor}
        />
        <BadgeComponent
          title={"Good to have"}
          bgColor={priorityFieldsGenerator("unknown").color}
          textColor={priorityFieldsGenerator("unknown").textColor}
        />
        <BadgeComponent
          title={"+2"}
          bgColor={priorityFieldsGenerator("unknown").color}
          textColor={priorityFieldsGenerator("unknown").textColor}
        />
      </div>

      <div className="w-full border-dashed flex flex-col items-start pt-3 justify-center">
        <div className="flex items-center flex-center">
          <Avatar className="bg-gray-300 w-5 h-5 text-gray-700">
            <AvatarFallback className="text-xs">N</AvatarFallback>
          </Avatar>
          <Dot className="text-blue-600" />
          <span className="text-[12px] text-gray-600">
            {task.dueDate ? format(new Date(task.dueDate), "do MMMM") : "N/A"}
          </span>
        </div>
        <span className="text-sm text-gray-600 pt-3">{withNA(project?.name)}</span>
      </div>
    </div>
  );
});
