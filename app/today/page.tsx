"use client";

import PageHeader from "@/components/PageHeader";
import { AlertTriangle, TrendingUp, Zap, RefreshCw, ChevronUp, Calendar, Clock, Users } from "lucide-react";

const attentionItems = [
  { label: "Overdue", count: 0, color: "bg-red-500" },
  { label: "Due Within 48 Hours", count: 0, color: "bg-orange-400" },
  { label: "Needs Appointment", count: 0, color: "bg-yellow-400" },
  { label: "Inspections Completed (24h)", count: 0, color: "bg-blue-400" },
  { label: "Appointments Today", count: 0, color: "bg-green-400" },
  { label: "Unstarted Appraisals", count: 0, color: "bg-purple-400" },
  { label: "Revisions Required", count: 0, color: "bg-pink-400" },
  { label: "Tentative Appointments", count: 0, color: "bg-gray-400" },
];

export default function TodayPage() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="flex flex-col flex-1">
      <PageHeader breadcrumb="Today" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">☀️</span>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Today</h1>
              <p className="text-sm text-gray-500">Good {greeting}, Robert. Here's what to work on.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
              Manage Widgets
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
              ✏️ Customize
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* AI Daily Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Zap size={14} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">AI Daily Summary</p>
                  <p className="text-xs text-gray-400">Updated 12:17 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-gray-100 rounded"><RefreshCw size={13} className="text-gray-400" /></button>
                <button className="p-1 hover:bg-gray-100 rounded"><ChevronUp size={13} className="text-gray-400" /></button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">Good {greeting}, Robert! Here's your business snapshot:</p>

            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">HIGHLIGHTS</p>
              <ul className="space-y-1">
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-blue-400 mt-0.5">›</span>
                  0 orders completed this week with no revenue invoiced in June so far
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-blue-400 mt-0.5">›</span>
                  25 pending quotes are awaiting client responses — pipeline has potential
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-blue-400 mt-0.5">›</span>
                  0 overdue invoices means collections are clean with no outstanding debt
                </li>
              </ul>
            </div>

            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">INSIGHTS</p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2 bg-orange-50 rounded-lg p-2">
                  <AlertTriangle size={12} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-700">No completed orders or invoiced revenue signals a slow production period</p>
                </div>
                <div className="flex items-start gap-2 bg-orange-50 rounded-lg p-2">
                  <AlertTriangle size={12} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-700">0 inspections scheduled suggests no near-term revenue in the pipeline</p>
                </div>
                <div className="flex items-start gap-2 bg-green-50 rounded-lg p-2">
                  <TrendingUp size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-700">25 open quotes represent opportunity — conversion is the key focus today</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">SUGGESTED ACTIONS</p>
              <ul className="space-y-1">
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-gray-400 mt-0.5">›</span>
                  Follow up on all 25 pending quotes — prioritize those over 48 hours old
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-gray-400 mt-0.5">›</span>
                  Proactively reach out to past clients to generate new inspection bookings
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-gray-400 mt-0.5">›</span>
                  Review marketing or referral channels to identify why new orders are stalled
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            {/* Today at a Glance */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">Today at a Glance</p>
              <p className="text-sm font-medium opacity-90">{dateStr}</p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {[
                  { label: "Inspections", count: 0, icon: Calendar },
                  { label: "Deadlines", count: 0, icon: Clock },
                  { label: "Meetings", count: 0, icon: Users },
                ].map(({ label, count, icon: Icon }) => (
                  <div key={label} className="text-center">
                    <Icon size={16} className="mx-auto mb-1 opacity-70" />
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs opacity-70">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What Needs Attention */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-900">What needs attention</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <button className="hover:text-gray-700">Mine</button>
                  <span>|</span>
                  <button className="hover:text-gray-700 font-medium text-gray-700">5 Items</button>
                </div>
              </div>
              <div className="space-y-0.5">
                {attentionItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-xs text-gray-600">{item.label}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leads & Follow-ups */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users size={13} className="text-gray-500" />
                  <p className="text-sm font-semibold text-gray-900">LEADS & FOLLOW-UPS</p>
                </div>
                <span className="text-xs text-green-600 font-medium">All caught up</span>
              </div>
              <p className="text-xs text-gray-400 text-center py-4">No new leads or follow-ups right now. Nice work.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
