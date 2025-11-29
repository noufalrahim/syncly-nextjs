/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { faker } from "@faker-js/faker";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import { useMemo, useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Navigate,
  type Event as RBCEvent,
  type ToolbarProps,
  type View,
  Views,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarIcon, CheckCircle, Clock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MainLayout } from "@/layout";
import { withNA } from "@/lib/utils";
import type { TTask } from "@/types";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type Event = RBCEvent & {
  color?: string;
  task?: TTask;
};

export default function MyCalendar() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 9, 12));

  const calendarLoading = false;

  const calendarData = {
    success: true,
    data: Array.from({ length: 20 }).map(
      () =>
        ({
          id: faker.string.uuid(),
          title: faker.company.buzzPhrase(),
          startTime: faker.date.between({ from: "2025-10-01", to: "2025-10-30" }).toISOString(),
          description: faker.lorem.sentence(),
          columnRef: { id: faker.string.uuid(), title: "ToDo" },
          project: "",
          priority: faker.helpers.arrayElement(["low", "medium", "high"]),
          dueDate: faker.date.future().toISOString(),
          labelRef: faker.string.uuid(),
          createdAt: faker.date.past().toISOString(),
        }) as unknown as TTask,
    ),
  };

  const colors = ["#4a90e2", "#f5a623", "#7ed321", "#e94e77", "#9b59b6"];
  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  const events: Event[] = useMemo(() => {
    if (!calendarData || !calendarData.success) return [];
    return calendarData.data.map((task: TTask) => ({
      title: withNA(task.title),
      start: new Date(task.dueDate || task.createdAt || new Date().toISOString()),
      end: new Date(task.dueDate || task.createdAt || new Date().toISOString()),
      color: getRandomColor(),
      task,
    }));
  }, [calendarData]);

  const eventStyleGetter = (event: Event) => ({
    style: {
      backgroundColor: event.color || "#4a90e2",
      borderRadius: "0.5rem",
      opacity: 0.9,
      color: "white",
      border: "1px solid rgba(0,0,0,0.1)",
      padding: "0.25rem 0.5rem",
      fontSize: "0.875rem",
      fontWeight: 500,
      cursor: "pointer",
    },
  });

  if (calendarLoading) return <Loader />;

  const CustomToolbar = ({ label, onNavigate, onView, view }: ToolbarProps<Event>) => {
    const views = [
      { key: Views.MONTH, label: "Month" },
      { key: Views.WEEK, label: "Week" },
      { key: Views.DAY, label: "Day" },
      { key: Views.AGENDA, label: "Agenda" },
    ];

    return (
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-1">
          <Button
            variant="outline"
            className="px-3 py-1"
            onClick={() => onNavigate(Navigate.PREVIOUS)}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            className="px-3 py-1"
            onClick={() => onNavigate(Navigate.TODAY)}
          >
            Today
          </Button>
          <Button variant="outline" className="px-3 py-1" onClick={() => onNavigate(Navigate.NEXT)}>
            Next
          </Button>
        </div>

        <span className="font-bold text-lg">{label}</span>

        <div className="flex gap-1">
          {views.map((v) => (
            <Button
              key={v.key}
              className={
                view === v.key
                  ? "px-3 py-1 bg-primary text-white"
                  : "px-3 py-1 bg-gray-200 text-gray-800"
              }
              onClick={() => onView(v.key)}
            >
              {v.label}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="h-[80vh] bg-white rounded-xl shadow-sm border border-secondary-300 p-5 m-5">
        <TooltipProvider>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            view={currentView}
            date={currentDate}
            onView={setCurrentView}
            onNavigate={setCurrentDate}
            eventPropGetter={eventStyleGetter}
            popup
            onSelectEvent={(event) => {
              if (event.task?.id) {
                router.push(`/tasks/${event.task.id}`);
              }
            }}
            components={{
              toolbar: (props) => <CustomToolbar {...props} view={currentView} />,
              event: ({ event, title }: { event: Event; title: string }) => {
                return (
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <div className="w-full h-full truncate cursor-pointer">{title}</div>
                    </TooltipTrigger>

                    <TooltipContent
                      side="right"
                      className="bg-white border-2 border-secondary-300 shadow-lg rounded-lg p-4 flex flex-col gap-2 min-w-[220px]"
                      onClick={() => router.push(`/tasks/${event.task?.id}`)}
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        <CalendarIcon size={16} />
                        <span>{event.title}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={14} />
                        <span>
                          {event.start && format(event.start, "PPpp", { locale: enUS })} -{" "}
                          {event.end && format(event.end, "PPpp", { locale: enUS })}
                        </span>
                      </div>

                      {event.task && (
                        <>
                          <div className="flex items-center gap-2 text-gray-700">
                            <User size={14} />
                            <span>{withNA(event.task.title)}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-700">
                            <CheckCircle size={14} />
                            <span>{withNA(event.task.priority)}</span>
                          </div>
                        </>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              },
            }}
          />
        </TooltipProvider>
      </div>
    </MainLayout>
  );
}
