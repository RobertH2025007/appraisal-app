"use client";

import PageHeader from "@/components/PageHeader";
import { Download, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";

const revenueData = [
  { month: "Jun '25", orders: 8, revenue: 3200 },
  { month: "Jul '25", orders: 12, revenue: 5400 },
  { month: "Aug '25", orders: 15, revenue: 6750 },
  { month: "Sep '25", orders: 10, revenue: 4500 },
  { month: "Oct '25", orders: 18, revenue: 8100 },
  { month: "Nov '25", orders: 14, revenue: 6300 },
  { month: "Dec '25", orders: 9, revenue: 4050 },
  { month: "Jan '26", orders: 11, revenue: 4950 },
  { month: "Feb '26", orders: 16, revenue: 7200 },
  { month: "Mar '26", orders: 20, revenue: 9000 },
  { month: "Apr '26", orders: 22, revenue: 9900 },
  { month: "May '26", orders: 77, revenue: 36993 },
];

const reportTypes = [
  { name: "GPAR (1004)", value: 65, color: "#3b82f6" },
  { name: "Condo (1073)", value: 15, color: "#8b5cf6" },
  { name: "Multi-Family", value: 10, color: "#10b981" },
  { name: "Desktop", value: 10, color: "#f59e0b" },
];

const leadSources = [
  { source: "Direct / Referral", count: 45 },
  { source: "Website", count: 18 },
  { source: "Lender Portal", count: 32 },
  { source: "Phone", count: 12 },
  { source: "Other", count: 5 },
];

const goalProgress = [
  { label: "Monthly Revenue", current: 0, goal: 20000, pct: 0 },
  { label: "Monthly Orders", current: 0, goal: 40, pct: 0 },
  { label: "Yearly Revenue", current: 36993, goal: 200000, pct: 18 },
  { label: "Yearly Orders", current: 77, goal: 480, pct: 16 },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        breadcrumb="Analytics"
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 bg-white">
              Last 30 Days ▾
            </button>
            <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 bg-white">
              <Download size={12} /> Export
            </button>
            <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 bg-white">
              <Sparkles size={12} /> Analyze with AI
            </button>
          </div>
        }
      />

      <div className="p-6">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">Performance insights and business metrics</p>
        </div>

        {/* Goal Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-blue-500">🎯</span>
            <p className="text-sm font-semibold text-gray-900">Goal Progress</p>
            <span className="text-xs text-gray-400">June 2026</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {goalProgress.map((g) => (
              <div key={g.label}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">{g.label}</p>
                  <span className={`text-xs font-medium ${g.pct > 50 ? "text-green-600" : g.pct > 20 ? "text-yellow-600" : "text-gray-500"}`}>{g.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${g.pct}%` }} />
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                  <span>{g.current.toLocaleString()}</span>
                  <span>Goal: {g.goal.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {[
            { label: "TOTAL REVENUE", value: "$36,993", sub: "vs previous 30 days" },
            { label: "TOTAL ORDERS", value: "77", sub: "vs previous 30 days" },
            { label: "ACTIVE CLIENTS", value: "74", sub: "vs previous 30 days" },
            { label: "AVG TURNAROUND", value: "8.2 days", sub: "vs previous 4 days" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-400 uppercase font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Revenue & Orders Chart */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Revenue & Orders</p>
                <p className="text-xs text-gray-400">Monthly performance overview</p>
              </div>
              <select className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-600 outline-none bg-white">
                <option>Last 12 Months</option>
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={false} name="Orders" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Order Status Distribution</p>
            <p className="text-xs text-gray-400 mb-4">Current month breakdown</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={reportTypes} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                  {reportTypes.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {reportTypes.map((r) => (
                <div key={r.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-xs text-gray-600">{r.name}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700">{r.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Report Type Mix */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Report Type Mix</p>
            <p className="text-xs text-gray-400 mb-4">77 orders · All time</p>
            <div className="space-y-2">
              {reportTypes.map((r) => (
                <div key={r.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">{r.name}</span>
                    <span className="text-gray-700 font-medium">{r.value}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${r.value}%`, backgroundColor: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Sources */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Lead Sources</p>
            <p className="text-xs text-gray-400 mb-4">77 tracked · All time</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={leadSources} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="source" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
