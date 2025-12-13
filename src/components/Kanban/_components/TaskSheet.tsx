"use client";

import { InfoIcon, Link as LinkIcon, Paperclip } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MinimalTiptap } from "@/components/ui/shadcn-io/minimal-tiptap";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TTask } from "@/types";

interface ITaskSheetProps {
  openSheet: boolean;
  onOpenChange: (open: boolean) => void;
  task: TTask | null;
}

const formSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  assignee: z.string().optional(),
  priority: z.string().optional(),
  dependency: z.string().optional(),
  dueDate: z.date().optional(),
  labels: z.string().optional(),
  comment: z.string().optional(),
});

export default function TaskSheet({ openSheet, onOpenChange, task }: ITaskSheetProps) {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [references, setReferences] = useState<{ title: string; url: string }[]>([]);
  const [refTitle, setRefTitle] = useState("");
  const [refUrl, setRefUrl] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title,
      description: task?.description,
      assignee: task?.assignee,
      priority: task?.priority,
      dependency: "",
      labels: "",
      comment: "",
    },
  });

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setAttachments((prev) => [...prev, ...Array.from(files)]);
  };

  const removeFile = (file: File) => {
    setAttachments((prev) => prev.filter((f) => f !== file));
  };

  const addReference = () => {
    if (!refUrl.trim()) return;
    setReferences((prev) => [...prev, { title: refTitle || refUrl, url: refUrl }]);
    setRefTitle("");
    setRefUrl("");
  };

  const removeReference = (url: string) => {
    setReferences((prev) => prev.filter((r) => r.url !== url));
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log({
      ...values,
      attachments,
      references,
    });
  };

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description,
        assignee: task.assignee,
        priority: task.priority,
        dependency: "",
        labels: "",
        comment: "",
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      });
    }
  }, [task]);

  return (
    <Sheet open={openSheet} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Task</SheetTitle>
          <SheetDescription>Update task details and metadata.</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="py-6 space-y-10">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TextareaAutosize
                      minRows={1}
                      {...field}
                      autoFocus
                      placeholder="Title"
                      className="focus:outline-0 w-full bg-transparent border-none shadow-none resize-none font-bold text-2xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <MinimalTiptap
                      content={field.value}
                      onChange={field.onChange}
                      placeholder="Start typing your content here..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="noufalrahim">
                          <div className="items-center flex gap-2">
                            <Avatar>
                              <AvatarFallback className="bg-gray-700 text-white">NR</AvatarFallback>
                            </Avatar>
                            <p>Noufal Rahim</p>
                          </div>
                        </SelectItem>

                        <SelectItem value="abcd">
                          <div className="items-center flex gap-2">
                            <Avatar>
                              <AvatarFallback className="bg-gray-700 text-white">JJ</AvatarFallback>
                            </Avatar>
                            <p>Jonathan James</p>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dependency"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1">
                      <FormLabel>Dependency</FormLabel>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon size={15} className="text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-64" side="right">
                          <p>
                            This task will be depended on other tasks. It can move forward only after
                            all dependencies are completed.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a task" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="a">1-EA09</SelectItem>
                        <SelectItem value="b">1-EV29</SelectItem>
                        <SelectItem value="c">1-ED89</SelectItem>
                        <SelectItem value="d">1-EL09</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full justify-start">
                            {field.value ? field.value.toDateString() : "Pick a due date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="labels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labels</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select labels" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="a">1-EA09</SelectItem>
                        <SelectItem value="b">1-EV29</SelectItem>
                        <SelectItem value="c">1-ED89</SelectItem>
                        <SelectItem value="d">1-EL09</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />


            </div>

            <div className="space-y-3">
              <Label>Attachments</Label>
              <div className="flex items-center gap-3">
                <input
                  id="fileUpload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("fileUpload")?.click()}
                >
                  <Paperclip className="mr-2 h-4 w-4" /> Add Files
                </Button>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2 border rounded-md p-3">
                  {attachments.map((file, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span>{file.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeFile(file)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>References</Label>

              <div className="flex gap-2">
                <Input
                  value={refTitle}
                  onChange={(e) => setRefTitle(e.target.value)}
                  placeholder="Title (optional)"
                />
                <Input
                  value={refUrl}
                  onChange={(e) => setRefUrl(e.target.value)}
                  placeholder="https://example.com"
                />
                <Button onClick={addReference}>
                  <LinkIcon size={16} className="mr-1" /> Add
                </Button>
              </div>

              {references.length > 0 && (
                <div className="space-y-2 border rounded-md p-3">
                  {references.map((ref, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <a
                        href={ref.url}
                        target="_blank"
                        className="flex items-center gap-2 text-sm underline"
                      >
                        <Image
                          src={`https://www.google.com/s2/favicons?sz=32&domain_url=${ref.url}`}
                          className="h-4 w-4 rounded"
                          alt=""
                          width={16}
                          height={16}
                        />
                        <span>{ref.title}</span>
                      </a>
                      <Button variant="ghost" size="sm" onClick={() => removeReference(ref.url)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <MinimalTiptap
                      content={field.value}
                      onChange={field.onChange}
                      placeholder="Start typing your content here..."
                    />
                  </FormControl>

                  <Button size="sm" className="mt-1">
                    Add Comment
                  </Button>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <Label>History</Label>
              <div className="border rounded-md p-3 space-y-2 text-sm text-muted-foreground">
                <div>Task created on Nov 20, 2025</div>
                <div>Priority changed to High on Nov 21, 2025</div>
                <div>Assignee updated on Nov 21, 2025</div>
              </div>
            </div>

            <SheetFooter className="mt-6">
              <SheetClose asChild>
                <Button type="submit">Save changes</Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
