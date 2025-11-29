"use client";

import { InfoIcon, Link as LinkIcon, Paperclip } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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

interface ITaskSheetProps {
  openSheet: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TaskSheet({ openSheet, onOpenChange }: ITaskSheetProps) {
  const [date, setDate] = useState<Date | undefined>();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [content, setContent] = useState(``);
  const [comment, setComment] = useState(``);
  const [references, setReferences] = useState<{ title: string; url: string }[]>([]);
  const [refTitle, setRefTitle] = useState("");
  const [refUrl, setRefUrl] = useState("");

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

  return (
    <Sheet open={openSheet} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Task</SheetTitle>
          <SheetDescription>Update task details and metadata.</SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-10">
          <div>
            <Input
              autoFocus
              className="!text-2xl !font-semibold border-none outline-none shadow-none py-6"
              placeholder="Task title"
            />
          </div>

          <div className="space-y-3">
            <Label>Description</Label>
            <MinimalTiptap
              content={content}
              onChange={setContent}
              placeholder="Start typing your content here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select>
                <SelectTrigger className="border-none shadow-none p-0 !focus:ring-0 !focus:border-0">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="noufalrahim">
                    <div className="items-center justify-start flex flex-row gap-2">
                      <Avatar>
                        <AvatarFallback className="bg-gray-700 text-white">NR</AvatarFallback>
                      </Avatar>
                      <p>Noufal Rahim</p>
                    </div>
                  </SelectItem>
                  <SelectItem value="abcd">
                    <div className="items-center justify-start flex flex-row gap-2">
                      <Avatar>
                        <AvatarFallback className="bg-gray-700 text-white">JJ</AvatarFallback>
                      </Avatar>
                      <p>Jonnathan James</p>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex flex-row items-center justify-start gap-1">
                <Label>Dependency</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon size={15} className="text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64" side="right">
                    <p>
                      This task will be depended on other tasks. It can move forward only after all
                      of its dependencies are completed.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a task to add dependency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">1-EA09</SelectItem>
                  <SelectItem value="b">1-EV29</SelectItem>
                  <SelectItem value="c">1-ED89</SelectItem>
                  <SelectItem value="d">1-EL09</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {date ? date.toDateString() : "Pick a due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Labels</Label>
              <Input placeholder="Add labels comma-separated" />
            </div>
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

          <div className="space-y-3">
            <Label>Comments</Label>
            <MinimalTiptap
              content={comment}
              onChange={setComment}
              placeholder="Start typing your content here..."
            />
            <Button size="sm" className="mt-1">
              Add Comment
            </Button>
          </div>

          <div className="space-y-3">
            <Label>History</Label>
            <div className="border rounded-md p-3 space-y-2 text-sm text-muted-foreground">
              <div>Task created on Nov 20, 2025</div>
              <div>Priority changed to High on Nov 21, 2025</div>
              <div>Assignee updated on Nov 21, 2025</div>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button>Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
