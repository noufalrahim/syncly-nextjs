import { Trash2 } from "lucide-react";
import { KanbanBoard, KanbanCards, KanbanHeader } from "@/components/ui/shadcn-io/kanban";
import { TColumn, TTask } from "@/types";
import { TaskCard } from "../TaskCard";

interface IColumnProps {
    column: TColumn;
    setOpen: (open: boolean) => void;
}

export default function Columns({ column, setOpen }: IColumnProps) {
    return (
        <KanbanBoard id={column.id} key={column.id}>
            <KanbanHeader className="w-full justify-between items-center flex">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: column.color }} />
                    <span>{column.name}</span>
                    <div className="bg-gray-300 rounded-full w-6 h-6 items-center justify-center flex">
                        <span className="text-xs">12</span>
                    </div>
                </div>
                <div className="hover:bg-red-200 hover:rounded-full p-1 cursor-pointer">
                    <Trash2 size={18} className="text-red-800" />
                </div>
            </KanbanHeader>

            <KanbanCards id={column.id}>
                {(task) => (
                    <TaskCard
                        task={task}
                        key={task.id}
                        setOpen={setOpen}
                    />
                )}
            </KanbanCards>
        </KanbanBoard>
    );
}
