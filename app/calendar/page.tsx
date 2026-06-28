"use client";

import PageHeader from "@/components/PageHeader";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const eventColors: Record<string, string> = {
  Pending: "bg-yellow-400",
  Assigned: "bg-blue-400",
  "In Progress": "bg-blue-600",
  Completed: "bg-green-500",
  "On Hold": "bg-gray-400",
  Revision: "bg-orange-400",
  Deadline: "bg-red-500",
  Meeting: "bg-purple-500",
  Other: "bg-gray-500",
  "Order Due": "bg-pink-500",
};

const filterTypes = Object.keys(eventColors);

const calendarEvents: Record<number, { label: string; type: string }[]> = {
  1: [{ label: "ROGM Accountability Meeting", type: "Meeting" }, { label: "Rog weekly accountability meet...", type: "Other" }],
  2: [{ label: "Realty ONE Group Masters", type: "Meeting" }],
  3: [{ label: "NLP Weekly Meeting - Christian...", type: "Meeting" }, { label: "Next Level Pro Office Hours Call", type: "Meeting" }],
  4: [{ label: "Pay Verizon Bill", type: "Other" }],
  8: [{ label: "ROGM Accountability Meeting", type: "Meeting" }, { label: "Rog weekly accountability meet...", type: "Other" }],
  9: [{ label: "Realty ONE Group Masters", type: "Meeting" }],
  10: [{ label: "NLP Weekly Meeting - Christian...", type: "Meeting" }, { label: "Next Level Pro Office Hours Call", type: "Meeting" }],
  12: [{ label: "Asset Analysis", type: "Other" }],
  15: [{ label: "Rog weekly accountability meet...", type: "Other" }],
  16: [{ label: "Realty ONE Group Masters", type: "Meeting" }, { label: "Church Council", type: "Meeting" }],
  17: [{ label: "NLP Weekly Meeting - Christian...", type: "Meeting" }, { label: "Next Level Pro Office Hours Call", type: "Meeting" }],
  20: [{ label: "A La Mode System Down", type: "Other" }],
  22: [{ label: "ROGM Accountability Meeting", type: "Meeting" }],
  23: [{ label: "Realty ONE Group Masters", type: "Meeting" }],
  24: [{ label: "NLP Weekly Meeting - Christian...", type: "Meeting" }],
  29: [{ label: "ROGM Accountability Meeting", type: "Meeting" }, { label: "Rog weekly accountability meet...", type: "Other" }],
  30: [{ label: "Realty ONE Group Masters", type: "Meeting" }, { label: "Cancel Menus.AI", type: "Other" }, { label: "NLP Weekly Meeting - Christian...", type: "Meeting" }, { label: "Next Level Pro Office Hours Call", type: "Meeting" }],
};

const upcomingEvents = [
  { title: "ROGM Accountability Meeting - Robert Howlett", date: "May 25", time: "2:00 PM - 3:00 PM", location: "IN OFFICE" },
  { title: "Rog weekly accountability meeting", date: "May 25", time: "2:00 PM - 2:30 PM", location: "" },
  { title: "Realty ONE Group Masters", date: "May 26", time: "10:00 AM - 11:00 AM", location: "" },
  { title: "PFAC Conference", date: "May 27", time: "8:00 AM - 8:30 AM", location: "" },
  { title: "NLP Weekly Meeting - Christiana / Robert Howlett", date: "May 27", time: "10:00 AM - 12:00 PM", location: "" },
  { title: "Next Level Pro Office Hours Call", date: "May 27", time: "11:00 AM - 12:00 PM", location: "https://nextlevelpro.ai/officehours" },
];

export default function CalendarPage() {
  const [view, setView] = useState("Month");
  const [activeFilters, setActiveFilters] = useState(new Set(filterTypes));

  const toggleFilter = (f: string) => {
    const next = new Set(activeFilters);
    if (next.has(f)) next.delete(f); else next.add(f);
    setActiveFilters(next);
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = 27;
  const firstDayOffset = 0; // June 2026 starts on Monday (offset 1 from Sun)
  const daysInMonth = 30;

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < 1; i++) cells.push(null); // June starts on Monday
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        breadcrumb="Calendar"
        actions={
          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg px-3 py-1.5">
            <Plus size={13} /> New Event
          </button>
        }
      />

      <div className="p-6 flex gap-4 flex-1">
        {/* Main Calendar */}
        <div className="flex-1">
          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">June 2026</h2>
              <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} /></button>
              <button className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1 bg-white hover:bg-gray-50">Today</button>
              <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16} /></button>
            </div>
            <div className="flex items-center gap-1">
              {["Month", "Week", "List"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    view === v ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Filter legend */}
          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
            <span className="text-gray-500">Filter:</span>
            {filterTypes.map((f) => (
              <button
                key={f}
                onClick={() => toggleFilter(f)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-colors ${
                  activeFilters.has(f) ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-100 opacity-40"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${eventColors[f]}`} />
                {f}
              </button>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-100">
              {daysOfWeek.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                const events = day ? (calendarEvents[day] ?? []) : [];
                const isToday = day === today;
                return (
                  <div
                    key={i}
                    className={`min-h-24 p-1.5 border-b border-r border-gray-100 last:border-r-0 ${
                      day ? "hover:bg-gray-50 cursor-pointer" : "bg-gray-50/50"
                    }`}
                  >
                    {day && (
                      <>
                        <span className={`text-xs font-medium ${isToday ? "w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center" : "text-gray-700"}`}>
                          {day}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {events.filter((e) => activeFilters.has(e.type)).slice(0, 3).map((ev, ei) => (
                            <div
                              key={ei}
                              className={`text-[10px] text-white px-1 py-0.5 rounded truncate ${eventColors[ev.type]}`}
                            >
                              {ev.label}
                            </div>
                          ))}
                          {events.filter((e) => activeFilters.has(e.type)).length > 3 && (
                            <p className="text-[10px] text-gray-400">+{events.length - 3} more</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">UPCOMING EVENTS</p>
            </div>
            <div className="overflow-y-auto max-h-[600px]">
              {upcomingEvents.map((ev, i) => (
                <div key={i} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-medium text-gray-800 flex-1 pr-2 leading-tight">{ev.title}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0">{ev.date}</span>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <p className="text-xs text-gray-500 flex items-center gap-1">🕐 {ev.time}</p>
                    {ev.location && (
                      <p className="text-xs text-blue-500 truncate">📍 {ev.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
