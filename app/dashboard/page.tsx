"use client";

import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { mockOrders } from "@/lib/mock-orders";
import { loadOrders, loadOrderDetail, type StoredOrder, type OrderDetailState } from "@/lib/orders-store";
import RevenuePeriodSelect from "@/components/RevenuePeriodSelect";
import { inPeriod, type PeriodKey } from "@/lib/revenue-filter";
import RevenueChart from "@/components/RevenueChart";
import OrderVolumeChart from "@/components/OrderVolumeChart";

const statusColors: Record<string, string> = {
  "In Progress": "bg-blue-100 text-blue-700",
  "Completed": "bg-green-100 text-green-700",
  "At Risk": "bg-red-100 text-red-700",
  "Pending": "bg-yellow-100 text-yellow-700",
  "On Hold": "bg-gray-100 text-gray-700",
  "Cancelled": "bg-red-50 text-red-500",
  "Paid": "bg-purple-100 text-purple-700",
};

interface PaidEntry { date: string; amount: number; }

export default function DashboardPage() {
  const [filter, setFilter] = useState("All");
  const [revenuePeriod, setRevenuePeriod] = useState<PeriodKey>("current-month");
  const [allOrders, setAllOrders] = useState<{ id: string; address: string; city: string; type: string; orderedBy: string; due: string; status: string; created: string }[]>([]);
  const [paidEntries, setPaidEntries] = useState<PaidEntry[]>([]);

  useEffect(() => {
    const loadData = () => {
      const saved: StoredOrder[] = loadOrders();
      const savedIds = new Set(saved.map(o => o.id));
      const details: Record<string, OrderDetailState> = {};
      mockOrders.forEach(o => { details[o.id] = loadOrderDetail(o.id); });

      const merged = [
        ...saved.map(o => ({
          id: o.id, address: o.address, city: o.city, type: o.type,
          orderedBy: o.orderedBy, due: o.dueDate || "—", status: o.status, created: o.created,
        })),
        ...mockOrders
          .filter(o => !savedIds.has(o.id))
          .map(o => {
            const d = details[o.id] ?? {};
            return {
              id: o.id,
              address: d.localAddress || o.address,
              city: d.localCity ? `${d.localCity}${d.localState ? ", " + d.localState : ""}` : o.city,
              type: o.type,
              orderedBy: o.orderedBy,
              due: o.due,
              status: d.status ?? o.status,
              created: o.created,
            };
          }),
      ];
      setAllOrders(merged);

      const paid: PaidEntry[] = [
        ...saved.map(o => {
          const d = details[o.id] ?? {};
          const status = d.status ?? o.status;
          if (!d.isPaid && status !== "Completed") return null;
          const amount = parseFloat(d.quoteFee || o.fee || "0");
          return amount > 0 ? { date: o.created, amount } : null;
        }).filter(Boolean) as PaidEntry[],
        ...mockOrders.filter(o => !savedIds.has(o.id)).map(o => {
          const d = details[o.id] ?? {};
          const status = d.status ?? o.status;
          if (!d.isPaid && status !== "Completed") return null;
          const amount = parseFloat(d.quoteFee || o.detail.fee || "0");
          return amount > 0 ? { date: o.created, amount } : null;
        }).filter(Boolean) as PaidEntry[],
      ];
      setPaidEntries(paid);
    };
    loadData();
    const onVisible = () => { if (document.visibilityState === "visible") loadData(); };
    window.addEventListener("focus", loadData);
    window.addEventListener("am-orders-updated", loadData);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", loadData);
      window.removeEventListener("am-orders-updated", loadData);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const counts = allOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const revenue = paidEntries
    .filter(e => inPeriod(e.date, revenuePeriod))
    .reduce((sum, e) => sum + e.amount, 0);


  const filters = ["All", "Lender", "Private", "Commercial"];

  return (
    <div className="flex flex-col flex-1">
      <PageHeader breadcrumb="Dashboard" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Good afternoon, Robert</p>
          </div>
          <div className="flex items-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-sm px-4 py-1.5 rounded-lg transition-colors ${
                  filter === f
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-blue-600">{allOrders.length}</p>
            <p className="text-xs text-gray-400 mt-1">+0 vs last 30 days</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600">{(counts["In Progress"] ?? 0) + (counts["Risk"] ?? 0) + (counts["At Risk"] ?? 0)}</p>
            <p className="text-xs text-gray-400 mt-1">+0 vs last 30 days</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">{counts["Completed"] ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">+0 vs last 30 days</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-1">
              <p className="text-xs text-gray-500">Revenue (Paid)</p>
              <RevenuePeriodSelect value={revenuePeriod} onChange={setRevenuePeriod} />
            </div>
            <p className="text-2xl font-bold text-purple-600">{revenue > 0 ? `$${revenue.toLocaleString()}` : "$0"}</p>
            <div className="flex items-center gap-1 mt-1">
              {revenue > 0 && <TrendingUp size={12} className="text-green-500" />}
              <p className="text-xs text-gray-400">+0 vs last year</p>
            </div>
          </div>
        </div>

        <RevenueChart entries={paidEntries} />
        <OrderVolumeChart entries={allOrders.filter(o => !o.id.startsWith("QF-")).map(o => ({ date: o.created }))} />

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/orders" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all →</Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">FILE #</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">ADDRESS</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">TYPE</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">CLIENT</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">DUE DATE</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/orders/${order.id}`} className="text-xs font-mono text-blue-600 hover:underline">{order.id}</Link>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-700">{order.address}, {order.city}</td>
                  <td className="px-5 py-3 text-xs text-gray-600">{order.type}</td>
                  <td className="px-5 py-3 text-xs text-gray-600">{order.orderedBy}</td>
                  <td className="px-5 py-3 text-xs text-gray-600">{order.due}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {allOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-xs text-gray-400">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
