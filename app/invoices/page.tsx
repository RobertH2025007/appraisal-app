"use client";

import PageHeader from "@/components/PageHeader";
import { Plus, MoreHorizontal, Send } from "lucide-react";
import { useState } from "react";
import RevenuePeriodSelect from "@/components/RevenuePeriodSelect";
import { inPeriod, type PeriodKey } from "@/lib/revenue-filter";

const invoices = [
  { id: "INV-0041", client: "Kelly Hartman", property: "6001 Via De Mansion #6001 Hartman", date: "Apr 11, 2026", due: "Mar 15, 2026", amount: 400, balance: 0, status: "Paid" },
  { id: "INV-0040", client: "Kathleen Hanson", property: "9443 Hillhaven Ave #9443 Hanson", date: "Apr 11, 2026", due: "Mar 7, 2026", amount: 500, balance: 0, status: "Paid" },
  { id: "INV-0039", client: "Paul Mandry / Sandra Flores", property: "15010 Sandalwood Ln #15010 Mandry", date: "Apr 11, 2026", due: "Apr 1, 2026", amount: 418, balance: 0, status: "Paid" },
  { id: "INV-0038", client: "Michael James Kelly", property: "19362 Coralwood Ln #19362 Kelly", date: "Apr 11, 2026", due: "Mar 17, 2026", amount: 400, balance: 0, status: "Paid" },
  { id: "INV-0037", client: "Jon Leslie", property: "1261 N Roeder Ave #1261 Leslie", date: "Apr 11, 2026", due: "Mar 15, 2026", amount: 450, balance: 0, status: "Paid" },
  { id: "INV-0036", client: "Wael Ghabrial", property: "145 Draw", date: "Apr 11, 2026", due: "Mar 16, 2026", amount: 550, balance: 0, status: "Paid" },
  { id: "INV-0001", client: "Draft Client", property: "456 Draft St", date: "Jun 27, 2026", due: "Jul 15, 2026", amount: 400, balance: 400, status: "Draft" },
  { id: "INV-0042", client: "Overdue Client", property: "789 Late Ave", date: "Apr 1, 2026", due: "Apr 15, 2026", amount: 400, balance: 400, status: "Overdue" },
];

const statusConfig: Record<string, { bg: string; text: string }> = {
  Paid: { bg: "bg-green-100", text: "text-green-700" },
  Draft: { bg: "bg-gray-100", text: "text-gray-700" },
  Overdue: { bg: "bg-red-100", text: "text-red-700" },
  Sent: { bg: "bg-blue-100", text: "text-blue-700" },
  Partial: { bg: "bg-yellow-100", text: "text-yellow-700" },
  Void: { bg: "bg-gray-100", text: "text-gray-400 line-through" },
};

const statusCountsList = [
  { label: "Draft", count: 1 },
  { label: "Sent", count: 0 },
  { label: "Viewed", count: 0 },
  { label: "Partial", count: 0 },
  { label: "Paid", count: 40 },
  { label: "Overdue", count: 1 },
  { label: "Void", count: 0 },
];

export default function InvoicesPage() {
  const [revenuePeriod, setRevenuePeriod] = useState<PeriodKey>("current-month");

  const paidThisPeriod = invoices
    .filter(inv => inv.status === "Paid" && inPeriod(inv.date, revenuePeriod))
    .reduce((sum, inv) => sum + inv.amount, 0);

  const outstanding = invoices
    .filter(inv => inv.balance > 0 && inv.status !== "Void")
    .reduce((sum, inv) => sum + inv.balance, 0);

  const overdue = invoices
    .filter(inv => inv.status === "Overdue")
    .reduce((sum, inv) => sum + inv.balance, 0);

  const fmt = (n: number) => n > 0 ? `$${n.toLocaleString()}` : "$0";

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        breadcrumb="Invoices"
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 bg-white">
              <Send size={12} /> Send Collection Reminders
            </button>
            <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg px-3 py-1.5">
              <Plus size={13} /> New Invoice
            </button>
          </div>
        }
      />

      <div className="p-6">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500">Create, send, and track invoices</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-400 uppercase font-medium">TOTAL OUTSTANDING</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(outstanding)}</p>
            <p className="text-xs text-gray-400">{invoices.filter(i => i.balance > 0).length} invoice{invoices.filter(i => i.balance > 0).length !== 1 ? "s" : ""}</p>
          </div>
          <div className="bg-white rounded-xl border border-red-200 px-4 py-3">
            <p className="text-xs text-gray-400 uppercase font-medium">OVERDUE</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{fmt(overdue)}</p>
            <p className="text-xs text-gray-400">{invoices.filter(i => i.status === "Overdue").length} invoice{invoices.filter(i => i.status === "Overdue").length !== 1 ? "s" : ""}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 uppercase font-medium">PAID THIS PERIOD</p>
              <RevenuePeriodSelect value={revenuePeriod} onChange={setRevenuePeriod} />
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{fmt(paidThisPeriod)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-400 uppercase font-medium">DRAFT INVOICES</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{invoices.filter(i => i.status === "Draft").length}</p>
          </div>
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-4">
          <p className="text-xs text-gray-500 uppercase font-medium mb-3">INVOICE STATUS <span className="text-gray-300">OVERVIEW BY STATUS</span></p>
          <div className="grid grid-cols-7 divide-x divide-gray-100">
            {statusCountsList.map((s) => (
              <div key={s.label} className="text-center px-3">
                <p className={`text-xl font-bold ${s.count > 0 ? (s.label === "Overdue" ? "text-red-600" : "text-blue-600") : "text-gray-700"}`}>{s.count}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <input type="text" placeholder="Search invoices..." className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 outline-none focus:border-blue-400 w-48" />
            <div className="ml-auto flex items-center gap-2">
              <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 outline-none bg-white">
                <option>All statuses</option>
                <option>Draft</option><option>Sent</option><option>Paid</option><option>Overdue</option>
              </select>
              <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 outline-none bg-white">
                <option>All aging</option>
              </select>
              <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 outline-none bg-white">
                <option>All dates</option>
              </select>
              <span className="text-xs text-gray-400">41 invoices</span>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2.5"><input type="checkbox" className="rounded" /></th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">INVOICE # ↕</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">CLIENT ↕</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">PROPERTY ↕</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">DATE ↕</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">DUE DATE</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">AMOUNT ↕</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">BALANCE ↕</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">STATUS ↕</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const cfg = statusConfig[inv.status] ?? { bg: "bg-gray-100", text: "text-gray-600" };
                return (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><input type="checkbox" className="rounded" /></td>
                    <td className="px-4 py-3 text-xs font-medium text-blue-600 cursor-pointer hover:underline">{inv.id}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{inv.client}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{inv.property}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{inv.date}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{inv.due}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">${inv.amount.toLocaleString()}.00</td>
                    <td className="px-4 py-3 text-xs text-green-600 font-medium">${inv.balance.toLocaleString()}.00</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>{inv.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><MoreHorizontal size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
