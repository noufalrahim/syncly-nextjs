import { useEffect, useMemo, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { MainLayout } from "@/layout";
import { ProtectedRoute } from "@/routes";
import { useReadData } from "@/hooks/useReadData";
import { useRouter } from "next/router";
import { TaskCard } from "@/components/Cards";
import { TColumn, TTask } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusIcon, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddTask, TaskSheet } from "@/components/Kanban";
import { useCreateData } from "@/hooks/useCreateData";
import { toast } from "sonner";
import { Loader } from "@/components/Loader";
import { useDeleteData } from "@/hooks/useDeleteData";

export default function Board() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [isClicked, setIsClicked] = useState(false);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const [newColumnName, setNewColumnName] = useState("");

  const { mutate: createColumn, isPending: createColumnIsPending } = useCreateData<
    {
      name: string;
      project: string;
    },
    {
      data: TColumn;
      message: string;
      success: boolean;
    }
  >('/status-columns');

  const { data: tasksResponse, isPending: taskResponsePending, refetch: refetchTasks } = useReadData<
    {
      data: Record<string, TColumn>;
      message: string;
      success: boolean;
    }
  >(
    "tasks-by-project",
    `/tasks?projectId=${router.query.id}&groupByColumn=true&type=project-id`
  );

  const { mutate: deleteColumn, isPending: deleteColumnIsPending } = useDeleteData<
    {
      success: boolean;
      data: null;
      message: string;
    }
  >('/status-columns');

  const { mutate: deleteTask, isPending: deleteTaskIsPending } = useDeleteData<
    {
      success: boolean;
      data: null;
      message: string;
    }
  >('/tasks');


  const columns = useMemo<Record<string, TColumn>>(
    () => tasksResponse?.data ?? {},
    [tasksResponse]
  );

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;

    const sourceCol = columns[sourceColId];
    const destCol = columns[destColId];
    if (!sourceCol || !destCol) return;

    const sourceTasks = [...(sourceCol.tasks || [])];
    const destTasks = [...(destCol.tasks || [])];

    const [moved] = sourceTasks.splice(source.index, 1);

    if (sourceColId === destColId) {
      sourceTasks.splice(destination.index, 0, moved);
      columns[sourceColId].tasks = sourceTasks;
    } else {
      destTasks.splice(destination.index, 0, moved);
      columns[sourceColId].tasks = sourceTasks;
      columns[destColId].tasks = destTasks;
    }
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
      {
        name: newColumnName.trim(),
        project: router.query.id as string,
      },
      {
        onSuccess: (res) => {
          if (res && res.success && res.data) {
            toast.success('Column added successfully', { position: 'top-right' });
            setIsClicked(false);
            setNewColumnName("");
            refetchTasks();
          }
          else {
            toast.error('An error occured while adding column', { position: 'top-right' });
          }
        },
        onError: () => {
          toast.error('An error occured while adding column', { position: 'top-right' });
        }
      }
    )

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
      {
        id: column.id!
      },
      {
        onSuccess: (res) => {
          if(res && res.success){
            toast.success('Column deleted successfully', { position: 'top-right' });
            refetchTasks();
          }
          else{
            toast.error('An error occured while deleting column', { position: 'top-right' });
          }
        },
        onError: () => {
          toast.error('An error occured while deleting column', { position: 'top-right' });
        }
      }
    )
  };

  const handleDeleteTask = (task: TTask) => {
    deleteTask(
      {
        id: task.id!
      },
      {
        onSuccess: (res) => {
          if(res && res.success){
            toast.success('Task deleted successfully', { position: 'top-right' });
            refetchTasks();
          }
          else{
            toast.error('An error occured while deleting task', { position: 'top-right' });
          }
        },
        onError: () => {
          toast.error('An error occured while deleting task', { position: 'top-right' });
        }
      }
    )
  };

  if(createColumnIsPending || taskResponsePending){
    return <Loader />
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="flex h-full overflow-x-auto overflow-y-hidden no-scrollbar p-5 gap-5">
          <DragDropContext onDragEnd={onDragEnd}>
            {Object.values(columns).map((col) => (
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
                        <Badge
                          variant="secondary"
                          className="bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          {col?.tasks?.length ?? 0}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(col)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {col?.tasks?.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                              }}
                            >
                              <TaskCard task={task} setOpen={() => setOpen(true)} onDeleteTask={handleDeleteTask} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      <AddTask projectId={router.query.id as string} columnId={col.id as string} refetch={refetchTasks} />
                    </div>

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}

            {!isClicked ? (
              <div
                className="bg-gray-100 hover:bg-gray-200 transition p-5 w-[20rem] rounded-xl cursor-pointer flex items-start gap-2 max-h-16 overflow-hidden"
                onClick={() => setIsClicked(true)}
              >
                <PlusIcon size={16} />
                <span className="font-medium text-sm">Add Column</span>
              </div>
            ) : (
              <div
                ref={inputRef}
                className="bg-gray-100 p-3 w-[20rem] rounded-xl flex flex-row gap-3 max-h-16"
              >
                <Input
                  className="h-10 border-0 border-b border-gray-300 rounded-none shadow-none focus:border-b focus:border-black focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none active:outline-none active:ring-0"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  placeholder="Column Name..."
                />
                <Button variant={'secondary'} className="shadow-none" onClick={handleAddColumn}>Add</Button>
              </div>
            )}
          </DragDropContext>
        </div>
        <TaskSheet openSheet={open} onOpenChange={setOpen} />
      </MainLayout>
    </ProtectedRoute>
  );
}
