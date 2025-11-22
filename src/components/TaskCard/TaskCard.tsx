import { Dot, FlagIcon, GitBranch, Trash2 } from "lucide-react";
import { BadgeComponent } from "@/components/BadgeComponent";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    KanbanCard,
} from "@/components/ui/shadcn-io/kanban";
import { priorityFieldsGenerator } from "@/lib/utils";
import { TTask } from "@/types";

interface ITaskCardProps {
    setOpen: (open: boolean) => void;
    task: TTask;
}

export default function TaskCard({ setOpen, task }: ITaskCardProps) {

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    });


    return (
        <div
            onClick={() => {
                console.log("Clicked");
                setOpen(true);
            }}
        >
            <KanbanCard
                id={task.id}
                key={task.id}
                title={task.title}
                onClick={(e: any) => {
                    e.stopPropagation();
                    setOpen(true);
                }}
            >
                <div
                    className="flex items-center justify-between gap-1"
                    onClick={() => console.log("ew")}
                >
                    <p className="max-w-[90%] text-[15px] font-semibold">{task.title}</p>
                    <Trash2
                        className="cursor-pointer"
                        size={20}
                        color="gray"
                        onClick={() => console.log("fe")}
                    />
                </div>
                <div className="flex items-start justify-start w-full flex-row gap-1 py-3">
                    <BadgeComponent
                        title={priorityFieldsGenerator("high").label}
                        icon={FlagIcon}
                        bgColor={priorityFieldsGenerator("high").color}
                        textColor={priorityFieldsGenerator("high").textColor}
                    />
                    <BadgeComponent
                        title={"Todo"}
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
                            {task.dueDate && dateFormatter.format(new Date(task.dueDate))
                                ? dateFormatter.format(new Date(task.dueDate))
                                : "N/A"}
                        </span>
                    </div>
                    <span className="text-sm text-gray-600 pt-3">{"Syncly"}</span>
                </div>
            </KanbanCard>
        </div>
    )
}
