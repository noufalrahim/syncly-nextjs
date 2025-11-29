"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { TLabel, EPriority, TTask } from "@/types";
import { useCreateData } from "@/hooks/useCreateData";
import {
  FlagIcon,
  Loader,
  TagIcon,
  CalendarIcon,
  Loader2,
  PlusCircle,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import TextareaAutosize from "react-textarea-autosize";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { parseDate } from "chrono-node";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { priorityFieldsGenerator } from "@/lib/utils";
import { DialogModal } from "@/components/DialogModal";
import { useReadData } from "@/hooks/useReadData";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddTaskProps {
  projectId: string;
  columnId: string;
  refetch: () => void;
}

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueText: z.string().optional(),
});

export default function AddTask({ projectId, columnId, refetch }: AddTaskProps) {
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("In 2 days");
  const [date, setDate] = useState<Date | undefined>(parseDate(value) || undefined);
  const [month, setMonth] = useState<Date | undefined>(date);

  const [openLabelModal, setOpenLabelModal] = useState<boolean>(false);
  const [selectedLabel, setSelectedLabel] = useState<TLabel | null>(null);
  const [priority, setPriority] = useState<EPriority | null>(null);

  const { data: labelData, isLoading: labelDataIsLoading, refetch: refetchLabelData } =
    useReadData<TLabel[]>("labels", `/labels?projectId=${projectId}`);

  const workspace = useSelector((state: RootState) => state.workspace.entity);

  const { mutate, isPending } = useCreateData<
    {
      title: string;
      description?: string;
      column: string;
      project: string;
      priority?: string;
      dueDate?: string;
      assignee?: string;
      workspace: string;
      label?: string;
    },
    {
      success: boolean;
      data: TTask;
      message: string;
    }
  >("/tasks");

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      dueText: value,
    },
  });

  const submitForm = (data: z.infer<typeof schema>) => {
    
    if (!workspace?.id || !projectId || !columnId) return;

    const payload = {
      title: data.title.trim(),
      description: data.description?.trim(),
      column: columnId,
      project: projectId,
      dueDate: date?.toISOString(),
      priority: priority ?? undefined,
      workspace: workspace.id,
      label: selectedLabel?.id,
    };

    mutate(payload, {
      onSuccess(res) {
        if (res?.success && res?.data) {
          toast.success("Task added successfully", {position: 'top-right'});
          refetch();
          resetForm();
        }
        else {
          toast.error('An error occurred while adding the task!', {position: 'top-right'});
        }
      },
      onError(err) {
        console.log("Error", err);
        toast.error("An error occurred while adding the task!", {position: 'top-right'});
      },
    });
  };

  const resetForm = () => {
    form.reset({
      title: "",
      description: "",
      dueText: "In 2 days",
    });
    setDate(parseDate("In 2 days") || undefined);
    setValue("In 2 days");
    setPriority(null);
    setSelectedLabel(null);
    setAdding(false);
  };

  if (isPending) return <Loader className="animate-spin" />;

  return (
    <>
      {adding ? (
        <Form {...form}>
          <motion.form layout onSubmit={form.handleSubmit(submitForm)}>
            <div className="w-full my-2 rounded border border-black p-2 text-sm text-black placeholder-violet-300 focus:outline-0">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TextareaAutosize
                        minRows={1}
                        value={field.value}
                        onChange={field.onChange}
                        autoFocus
                        placeholder="Title"
                        className="focus:outline-0 w-full bg-transparent border-none shadow-none resize-none font-bold text-lg"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TextareaAutosize
                        minRows={1}
                        placeholder="Description"
                        value={field.value}
                        onChange={field.onChange}
                        className="focus:outline-0 w-full bg-transparent border-none shadow-none resize-none font-normal text-sm"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-2 mt-2">
                <div className="flex flex-row gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white border border-gray-300 shadow-none" size="sm">
                        <TagIcon className="text-gray-700" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56 bg-white" align="start">
                      {labelDataIsLoading && (
                        <div className="w-full py-2">
                          <Loader2 className="animate-spin" />
                        </div>
                      )}

                      {labelData && labelData?.length > 0 &&
                        labelData.map((lbl) => {
                          const isSelected = selectedLabel?.id === lbl.id;
                          return (
                            <DropdownMenuItem
                              key={lbl.id}
                              onClick={() => setSelectedLabel(lbl)}
                              className="flex items-center justify-between"
                            >
                              <span>{lbl.title}</span>
                              {isSelected && <Check className="h-4 w-4 text-gray-800" />}
                            </DropdownMenuItem>
                          );
                        })}

                      {!labelDataIsLoading && (
                        <DropdownMenuItem
                          className="text-gray-700"
                          onClick={() => setOpenLabelModal(true)}
                        >
                          <PlusCircle />
                          <span>Add Label</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white border border-gray-300 shadow-none" size="sm">
                        <FlagIcon className="text-gray-700" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56 bg-white" align="start">
                      {Object.values(EPriority).map((level) => {
                        const { label, color } = priorityFieldsGenerator(level);
                        const isSelected = priority === level;

                        return (
                          <DropdownMenuItem
                            key={level}
                            onClick={() => setPriority(level)}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 ${color} rounded-full`} />
                              <span>{label}</span>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-gray-800" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <FormField
                  control={form.control}
                  name="dueText"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="date" className="px-1 text-gray-600">
                        Schedule Date
                      </Label>

                      <div className="relative flex gap-2">
                        <FormControl>
                          <Input
                            id="date"
                            value={value}
                            placeholder="Tomorrow or next week"
                            className="bg-background pr-10 border border-gray-300"
                            onChange={(e) => {
                              field.onChange(e);
                              setValue(e.target.value);
                              const parsed = parseDate(e.target.value);
                              if (parsed) {
                                setDate(parsed);
                                setMonth(parsed);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "ArrowDown") {
                                e.preventDefault();
                                setOpen(true);
                              }
                            }}
                          />
                        </FormControl>

                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                            >
                              <CalendarIcon className="size-3.5" />
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="w-auto overflow-hidden p-0 bg-white" align="end">
                            <Calendar
                              mode="single"
                              selected={date}
                              captionLayout="dropdown"
                              month={month}
                              onMonthChange={setMonth}
                              onSelect={(d) => {
                                if (d) {
                                  setDate(d);
                                  setValue(formatDate(d));
                                  form.setValue("dueText", formatDate(d));
                                  setOpen(false);
                                }
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="mt-1.5 flex items-center justify-end gap-1.5">
              <button
                onClick={() => setAdding(false)}
                className="px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-gray-200 rounded-md"
                type="button"
              >
                Close
              </button>

              <button
                type="submit"
                className="flex items-center gap-1 hover:bg-gray-200 rounded-lg bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors border border-gray-300"
              >
                <span>Add</span>
                <Plus size={12} />
              </button>
            </div>
          </motion.form>
        </Form>
      ) : (
        <motion.button
          layout
          onClick={() => setAdding(true)}
          className="my-2 flex w-full items-center gap-1 rounded-full px-3 py-1.5 text-xs text-neutral-700 transition-colors duration-200"
        >
          <span>Add Task</span>
          <Plus size={14} />
        </motion.button>
      )}

      <DialogModal
        title="Label"
        description="Add a new label"
        open={openLabelModal}
        setOpen={setOpenLabelModal}
      ></DialogModal>
    </>
  );
}
