// import type { TColumn, TTask } from "@/types";
// import { PlusIcon, Trash2 } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { TaskCard } from "../Cards";
// import { useRef, useState, useEffect } from "react";
// import { Input } from "../ui/input";
// import { AddTask } from "../Kanban";

// interface IColumnProps {
//   taskList: Record<string, TTask[]>;
//   columns: TColumn[];
//   setOpen: (open: boolean) => void;
//   onAddColumn: (name: string) => void;
//   onDeleteColumn: (column: TColumn) => void;
//   refetchTasks: () => void;
// }

// export default function Columns({ columns, taskList, setOpen, onAddColumn, onDeleteColumn, refetchTasks }: IColumnProps) {
//   const [isClicked, setIsClicked] = useState<boolean>(false);
//   const [newColumnName, setNewColumnName] = useState<string>("");
//   const inputRef = useRef<HTMLDivElement | null>(null);

//   const handleAddColumn = () => {
//     if (!newColumnName.trim()) return;
//     onAddColumn?.(newColumnName.trim());
//     setIsClicked(false);
//     setNewColumnName("");
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") handleAddColumn();
//     if (e.key === "Escape") {
//       setNewColumnName("");
//       setIsClicked(false);
//     }
//   };

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
//         setIsClicked(false);
//         setNewColumnName("");
//       }
//     };
//     if (isClicked) document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isClicked]);

//   const handleDelete = (column: TColumn) => {
//     onDeleteColumn(column);
//   };

//   return (
//     <div className="flex flex-row gap-4 w-full overflow-x-auto overflow-y-hidden no-scrollbar">
//       {columns.map((col) => (
//         <Kanban.Column key={col.id} value={col.id!} className="w-[20rem] flex-shrink-0">
//           <div className="flex items-center justify-between px-1 pb-1">
//             <div className="flex items-center gap-2">
//               <span className="font-semibold text-sm">{col.name}</span>
//               <Badge
//                 variant="secondary"
//                 className="bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center"
//               >
//                 {taskList[col.id!]?.length ?? 0}
//               </Badge>
//             </div>
//             <Button variant="ghost" size="icon" onClick={() => handleDelete(col)}>
//               <Trash2 className="h-4 w-4" />
//             </Button>
//           </div>

//           <div className="flex flex-col gap-2 p-1">
//             {taskList[col.id!]?.map((task) => (
//               <Kanban.Item key={task.id} value={task.id}>
//                 <Kanban.ItemHandle>
//                   <TaskCard task={task} setOpen={setOpen} column={col} />
//                 </Kanban.ItemHandle>
//               </Kanban.Item>

//             ))}
//             <AddTask projectId={col.project} columnId={col.id!} refetch={refetchTasks} />
//           </div>
//         </Kanban.Column>
//       ))}

//       <Kanban.Column value="add-column" className="w-[20rem] flex-shrink-0">
//         {!isClicked ? (
//           <button
//             className="w-full h-10 rounded-md flex items-center justify-start gap-2 text-gray-600 hover:bg-gray-100 transition cursor-pointer"
//             onClick={() => setIsClicked(true)}
//           >
//             <PlusIcon size={14} />
//             <span className="font-medium text-sm">Add Column</span>
//           </button>
//         ) : (
//           <div ref={inputRef} className="w-full flex flex-row items-center gap-2">
//             <Input
//               className="h-10 border-0 border-b border-gray-300 rounded-none shadow-none focus:border-b focus:border-black focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none active:outline-none active:ring-0"
//               value={newColumnName}
//               onChange={(e) => setNewColumnName(e.target.value)}
//               onKeyDown={handleKeyDown}
//               autoFocus
//               placeholder="Column Name..."
//             />
//             <Button variant="secondary" className="h-10 !shadow-none" onClick={handleAddColumn}>
//               Add
//             </Button>
//           </div>
//         )}
//       </Kanban.Column>
//     </div>
//   );
// }
