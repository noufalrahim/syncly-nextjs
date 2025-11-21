"use client";
import { faker } from "@faker-js/faker";
import { Dot, FlagIcon, GitBranch, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BadgeComponent } from "@/components/BadgeComponent";
import { TaskSheet } from "@/components/Kanban/_components";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/ui/shadcn-io/kanban";
import { MainLayout } from "@/layout";
import { priorityFieldsGenerator } from "@/lib/priorityFieldsGenerator";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const columns = [
  { id: "col-backlog", name: "Backlog", color: "#000000" },
  { id: "col-planned", name: "Planned", color: "#6B7280" },
  { id: "col-progress", name: "In Progress", color: "#F59E0B" },
  { id: "col-done", name: "Done", color: "#10B981" },
];

export default function Board() {
  const [features, setFeatures] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [openSheet, setOpenSheet] = useState<boolean>(true);

  useEffect(() => {
    const u = Array.from({ length: 4 }).map(() => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      image: faker.image.avatar(),
    }));

    const f = Array.from({ length: 20 }).map(() => ({
      id: faker.string.uuid(),
      name: capitalize(faker.company.buzzPhrase()),
      startAt: faker.date.past({ years: 0.5 }),
      endAt: faker.date.future({ years: 0.5 }),
      column: columns[Math.floor(Math.random() * columns.length)].id,
      owner: u[Math.floor(Math.random() * u.length)],
    }));

    setUsers(u);
    setFeatures(f);
  }, []);

  if (features.length === 0) return null;

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
    <MainLayout>
      <KanbanProvider columns={columns} data={features} onDataChange={setFeatures}>
        {(column) => (
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
              {(feature: any) => (
                <div
                  onClick={() => {
                    console.log("Clicked");
                    setOpenSheet(true);
                  }}
                >
                  <KanbanCard
                    column={column.id}
                    id={feature.id}
                    key={feature.id}
                    name={feature.name}
                    onClick={(e: any) => {
                      e.stopPropagation();
                      setOpenSheet(true);
                    }}
                  >
                    <div
                      className="flex items-center justify-between gap-1"
                      onClick={() => console.log("ew")}
                    >
                      <p className="max-w-[90%] text-[15px] font-semibold">{feature.name}</p>
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
                          {dateFormatter.format(feature.endAt)
                            ? dateFormatter.format(feature.endAt)
                            : "N/A"}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 pt-3">{"Syncly"}</span>
                    </div>
                  </KanbanCard>
                </div>
              )}
            </KanbanCards>
          </KanbanBoard>
        )}
      </KanbanProvider>
      <TaskSheet onOpenChange={setOpenSheet} openSheet={openSheet} />
    </MainLayout>
  );
}
