"use client"

import { TaskCalendarView } from "./tasks/calendar-view"

export function CalendarModule() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TaskCalendarView />
    </div>
  )
}
