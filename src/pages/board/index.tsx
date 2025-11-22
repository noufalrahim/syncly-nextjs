import { faker } from "@faker-js/faker";
import { useEffect, useState } from "react";
import { TaskSheet } from "@/components/Kanban/_components";
import { KanbanProvider, KanbanItemProps } from "@/components/ui/shadcn-io/kanban";
import { MainLayout } from "@/layout";
import { Columns } from "@/components/Columns";
import { TColumn, TTask } from "@/types";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const columns: TColumn[] = [
  { id: "col-backlog", name: "Backlog", color: "#000000", projectRef: "" },
  { id: "col-planned", name: "Planned", color: "#6B7280", projectRef: "" },
  { id: "col-progress", name: "In Progress", color: "#F59E0B", projectRef: "" },
  { id: "col-done", name: "Done", color: "#10B981", projectRef: "" },
];

const generateTasks = (): TTask[] => {
  return Array.from({ length: 20 }).map(() => {
    const col = columns[Math.floor(Math.random() * columns.length)];

    return {
      id: faker.string.uuid(),
      title: capitalize(faker.company.buzzPhrase()),
      description: faker.lorem.sentence(),
      columnRef: col,
      projectRef: "",
      priority: faker.helpers.arrayElement(["low", "medium", "high"]),
      dueDate: faker.date.future({ years: 0.5 }).toISOString(),
      labelRef: faker.string.uuid(),
      createdAt: faker.date.past({ years: 0.5 }).toISOString(),
    };
  });
};

export default function Board() {
  const [features, setFeatures] = useState<TTask[]>([]);
  const [openSheet, setOpenSheet] = useState<boolean>(true);

  useEffect(() => {
    setFeatures(generateTasks());
  }, []);

  if (features.length === 0) return null;

  const mappedForKanban: KanbanItemProps[] = features.map((t) => ({
    ...t,
    name: t.title,
    column: t.columnRef?.id,
    onClick: () => {},
  }));

  const handleDataChange = (updated: KanbanItemProps[]) => {
    const restored: TTask[] = updated.map((i: KanbanItemProps) => {
      const col = columns.find((c) => c.id === i.columnRef?.id);

      return {
        ...i,
        columnRef: col!,
        title: i.title ?? i.title,
      };
    });

    setFeatures(restored);
  };

  return (
    <MainLayout>
      <KanbanProvider
        columns={columns}
        data={mappedForKanban}
        onDataChange={handleDataChange}
      >
        {(column) => (
          <Columns column={column} setOpen={setOpenSheet} />
        )}
      </KanbanProvider>

      <TaskSheet onOpenChange={setOpenSheet} openSheet={openSheet} />
    </MainLayout>
  );
}
