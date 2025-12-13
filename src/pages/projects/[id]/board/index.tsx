import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { PlusIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { TaskCard } from "@/components/Cards";
import { AddTask, TaskSheet } from "@/components/Kanban";
import { Loader } from "@/components/Loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateData } from "@/hooks/useCreateData";
import { useDeleteData } from "@/hooks/useDeleteData";
import { useReadData } from "@/hooks/useReadData";
import { MainLayout } from "@/layout";
import { ProtectedRoute } from "@/routes";
import type { TColumn, TTask } from "@/types";
import { useModifyData } from "@/hooks/useModifyData";
import { TaskSkeleton } from "@/components/Skeletons";

export default function Board() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [isClicked, setIsClicked] = useState(false);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [localColumns, setLocalColumns] = useState<Record<string, TColumn>>({});
  const [activeTask, setActiveTask] = useState<TTask | null>(null);

  const { mutate: createColumn, isPending: createColumnIsPending } = useCreateData<
    { name: string; project: string },
    { data: TColumn; message: string; success: boolean }
  >("/status-columns");

  const {
    data: tasksResponse,
    isFetching: taskResponsePending,
    refetch: refetchTasks,
  } = useReadData<{ data: Record<string, TColumn>; message: string; success: boolean }>(
    "tasks-by-project",
    `/tasks?projectId=${router.query.id}&groupByColumn=true&type=project-id`
  );

  const { mutate: modifyTasks, isPending: modifyTasksPending } = useModifyData<
    {
      _id: string;
      column: string;
    },
    {
      success: boolean;
      message: string;
    }
  >("/tasks");

  const { mutate: deleteColumn } = useDeleteData<
    {
      success: boolean;
      message: string;
    }
  >("/status-columns");

  const { mutate: deleteTask } = useDeleteData<
    {
      success: boolean;
      message: string;
    }
  >("/tasks");

  useEffect(() => {
    if (tasksResponse?.data) {
      setLocalColumns(tasksResponse.data);
    }
  }, [tasksResponse]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;

    if (sourceColId === destColId) return;

    modifyTasks(
      {
        identifier: {
          key: "_id",
          value: draggableId
        },
        updates: {
          column: destColId
        }
      },
      {
        onSuccess: (res) => {
          if (res?.success) {
            toast.success("Task moved successfully", { position: "top-right" });
            refetchTasks();
          } else {
            toast.error("Failed to move task", { position: "top-right" });
          }
        },
        onError: () => {
          toast.error("Failed to move task", { position: "top-right" });
        }
      }
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsClicked(false);
        setNewColumnName("");
      }
    };
    if (isClicked) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isClicked]);

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    createColumn(
      { name: newColumnName.trim(), project: router.query.id as string },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success("Column added successfully", { position: "top-right" });
            setIsClicked(false);
            setNewColumnName("");
            refetchTasks();
          }
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddColumn();
    if (e.key === "Escape") {
      setNewColumnName("");
      setIsClicked(false);
    }
  };

  const handleDelete = (column: TColumn) => {
    deleteColumn(
      { id: column.id! },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success("Column deleted", { position: "top-right" });
            refetchTasks();
          }
        },
      }
    );
  };

  const handleDeleteTask = (task: TTask) => {
    setDeletingTaskId(task.id!);
    deleteTask(
      { id: task.id! },
      {
        onSuccess: (res) => {
          setDeletingTaskId(null);
          if (res.success) {
            toast.success("Task deleted", { position: "top-right" });
            refetchTasks();
          }
        },
        onError: () => {
          setDeletingTaskId(null);
          toast.error("Error deleting task", { position: "top-right" });
        },
      }
    );
  };

  const handleOpenTask = (task: TTask) => {
    setActiveTask(task);
    setOpen(true);
  };

  if (createColumnIsPending || taskResponsePending) return <Loader />;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="flex h-full overflow-x-auto overflow-y-hidden no-scrollbar p-5 gap-5">
          <DragDropContext onDragEnd={onDragEnd}>
            {Object.values(localColumns).map((col) => (
              <Droppable key={col.id} droppableId={col.id!}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-100 p-3 w-[20rem] rounded-xl flex flex-col"
                  >
                    <div className="flex items-center justify-between px-1 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{col.name}</span>
                        <Badge className="bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center">
                          {col?.tasks?.length ?? 0}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(col)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {modifyTasksPending ? (
                        <TaskSkeleton />
                      ) : (
                        col?.tasks?.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id!} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <TaskCard
                                  task={task}
                                  setOpen={() => handleOpenTask(task)}
                                  onDeleteTask={handleDeleteTask}
                                  isPending={deletingTaskId === task.id}
                                  column={col}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}

                      {!modifyTasksPending && (
                        <AddTask
                          projectId={router.query.id as string}
                          columnId={col.id as string}
                          refetch={refetchTasks}
                        />
                      )}
                    </div>

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}

            {!isClicked ? (
              <div
                className="bg-gray-100 hover:bg-gray-200 transition p-5 w-[20rem] rounded-xl cursor-pointer flex items-start gap-2 max-h-16"
                onClick={() => setIsClicked(true)}
              >
                <PlusIcon size={16} />
                <span className="font-medium text-sm">Add Column</span>
              </div>
            ) : (
              <div ref={inputRef} className="bg-gray-100 p-3 w-[20rem] rounded-xl flex gap-3 max-h-16">
                <Input
                  className="h-10 border-0 border-b border-gray-300 rounded-none shadow-none"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  placeholder="Column Name..."
                />
                <Button variant="secondary" onClick={handleAddColumn}>
                  Add
                </Button>
              </div>
            )}
          </DragDropContext>
        </div>

        <TaskSheet openSheet={open} onOpenChange={setOpen} task={activeTask}/>
      </MainLayout>
    </ProtectedRoute>
  );
}
