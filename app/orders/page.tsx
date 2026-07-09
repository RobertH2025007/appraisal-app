"use client";

import React from "react";
import PageHeader from "@/components/PageHeader";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Filter, Table2, Map, LayoutGrid, Clock, Trash2, ChevronRight, ChevronDown, RefreshCw, Pencil, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { loadOrders, loadOrderDetail, saveOrderDetail, deleteOrder, updateOrderStatus, type StoredOrder, type OrderDetailState } from "@/lib/orders-store";
import { loadGmailQuotes, saveGmailQuotes, type GmailQuoteEntry } from "@/lib/gmail-quotes-store";
import { mockOrders as orders } from "@/lib/mock-orders";
import RevenuePeriodSelect from "@/components/RevenuePeriodSelect";
import { inPeriod, type PeriodKey } from "@/lib/revenue-filter";
import RevenueChart from "@/components/RevenueChart";
import OrderVolumeChart from "@/components/OrderVolumeChart";

const statusColors: Record<string, string> = {
  "In Progress": "bg-blue-100 text-blue-700",
  "At Risk": "bg-red-100 text-red-700",
  "Completed": "bg-green-100 text-green-700",
  "Paid": "bg-emerald-100 text-emerald-700",
  "Pending": "bg-yellow-100 text-yellow-700",
  "On Hold": "bg-orange-100 text-orange-700",
  "Cancelled": "bg-gray-100 text-gray-500",
  "Quote": "bg-purple-100 text-purple-700",
  "Declined": "bg-gray-100 text-gray-500",
};

const prospectStatusColors: Record<string, string> = {
  "New":          "bg-blue-50 text-blue-600 border-blue-200",
  "Contacted":    "bg-amber-50 text-amber-600 border-amber-200",
  "Hold":         "bg-orange-50 text-orange-600 border-orange-200",
  "Converted":    "bg-green-50 text-green-600 border-green-200",
  "Passed":       "bg-gray-50 text-gray-500 border-gray-200",
  "Not Relevant": "bg-gray-50 text-gray-400 border-gray-200",
  "Referred":     "bg-purple-50 text-purple-600 border-purple-200",
};

const PROSPECT_STATUSES = ["New", "Contacted", "Hold", "Converted", "Passed", "Not Relevant", "Referred"];
const ORDER_STATUSES = ["In Progress", "At Risk", "Pending", "Assigned", "Completed", "On Hold", "Cancelled", "Declined"];
const STATUS_SORT_ORDER: Record<string, number> = {
  "At Risk": 0, "In Progress": 1, "Pending": 2, "Assigned": 3,
  "On Hold": 4, "Completed": 5, "Cancelled": 6, "Declined": 7,
};
const ORDER_TYPES = ["GPAR", "704B", "1004", "1073", "1025", "Land"];
const ORDER_PROPERTY_TYPES = ["SFR", "Condo", "Multi-Family", "Land", "Commercial"];
const PROPERTY_TYPES = ["SFR", "Condo/TwnHse", "Multi Family", "Land", "Other"];

function mapPropertyType(raw: string): string {
  const r = (raw ?? "").toLowerCase();
  if (r.includes("condo") || r.includes("town")) return "Condo/TwnHse";
  if (r.includes("multi")) return "Multi Family";
  if (r.includes("land") || r.includes("vacant")) return "Land";
  return "SFR";
}

function EditableCell({
  value, onSave, placeholder = "—", textClass = "text-xs text-gray-600",
}: { value: string; onSave: (v: string) => void; placeholder?: string; textClass?: string }) {
  const [val, setVal] = React.useState(value);
  const [editing, setEditing] = React.useState(false);
  React.useEffect(() => { if (!editing) setVal(value); }, [value, editing]);
  if (editing) {
    return (
      <input
        autoFocus
        type="text"
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={() => { setEditing(false); onSave(val); }}
        onKeyDown={e => { if (e.key === "Enter") { setEditing(false); onSave(val); } }}
        className={`w-full ${textClass} border border-blue-300 rounded px-1 py-0.5 outline-none bg-white`}
        onClick={e => e.stopPropagation()}
      />
    );
  }
  return (
    <span
      className={`${textClass} cursor-text rounded px-1 py-0.5 -mx-1 hover:bg-gray-100 block`}
      onClick={e => { e.stopPropagation(); setEditing(true); }}
    >
      {val || <span className="text-gray-300 italic">{placeholder}</span>}
    </span>
  );
}

function NoteCell({ id, initial }: { id: string; initial: string }) {
  const [value, setValue] = React.useState(initial);
  return (
    <input
      type="text"
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={() => {
        const current = loadOrderDetail(id);
        saveOrderDetail(id, { ...current, prospectNotes: value });
      }}
      placeholder="Add notes..."
      className="w-full min-w-[140px] text-xs text-gray-600 border border-transparent hover:border-gray-200 focus:border-blue-300 rounded px-2 py-1 outline-none bg-transparent focus:bg-white transition-colors"
      onClick={e => e.stopPropagation()}
    />
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [tab, setTab] = useState("Orders");
  const [view, setView] = useState("Table");
  const [dueFilter, setDueFilter] = useState("Overdue");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [revenuePeriod, setRevenuePeriod] = useState<PeriodKey>("current-month");
  const [savedOrders, setSavedOrders] = useState<StoredOrder[]>([]);
  const [mockDetails, setMockDetails] = useState<Record<string, OrderDetailState>>({});
  const [gmailQuotes, setGmailQuotes] = useState<GmailQuoteEntry[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [deletedQuoteIds, setDeletedQuoteIds] = useState<Set<string>>(new Set());
  const [hiddenOrderIds, setHiddenOrderIds] = useState<Set<string>>(new Set());
  const [dateSortDir, setDateSortDir] = useState<"asc" | "desc" | null>(null);

  useEffect(() => {
    const loadData = () => {
      const saved = loadOrders();
      setSavedOrders(saved);
      const details: Record<string, OrderDetailState> = {};
      orders.forEach(o => { details[o.id] = loadOrderDetail(o.id); });
      saved.forEach(o => { details[o.id] = loadOrderDetail(o.id); });
      const gmail = loadGmailQuotes();
      gmail.forEach(q => { details[q.id] = loadOrderDetail(q.id); });
      setGmailQuotes(gmail);
      setMockDetails(details);
      const deleted: string[] = JSON.parse(localStorage.getItem("am_deleted_quotes") ?? "[]");
      setDeletedQuoteIds(new Set(deleted));
      const hidden: string[] = JSON.parse(localStorage.getItem("am_hidden_orders") ?? "[]");
      setHiddenOrderIds(new Set(hidden));
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

  const handleDelete = (id: string) => {
    deleteOrder(id);
    setSavedOrders(loadOrders());
  };

  const handleProspectStatus = (id: string, value: string) => {
    const current = loadOrderDetail(id);
    const updated = { ...current, prospectStatus: value };
    saveOrderDetail(id, updated);
    setMockDetails(prev => ({ ...prev, [id]: updated }));
    if (value === "Converted") {
      router.push("/orders/new");
    }
  };

  const handleTabChange = (t: string) => {
    setTab(t);
    setStatusFilter(null);
    setDateSortDir(null);
  };

  const toggleDateSort = () => {
    setDateSortDir(prev => prev === null ? "asc" : prev === "asc" ? "desc" : null);
  };

  const parseDateSafe = (value: string): number | null => {
    if (!value || value === "—") return null;
    const t = new Date(value).getTime();
    return Number.isNaN(t) ? null : t;
  };

  const compareByDate = (aVal: string, bVal: string, dir: "asc" | "desc"): number => {
    const at = parseDateSafe(aVal);
    const bt = parseDateSafe(bVal);
    if (at === null && bt === null) return 0;
    if (at === null) return 1;
    if (bt === null) return -1;
    return dir === "asc" ? at - bt : bt - at;
  };

  const getFeeTotal = (id: string, baseFee: string): number => {
    const d = mockDetails[id] ?? {};
    if (d.lineItems?.length) {
      return d.lineItems.reduce((sum, li) => sum + (parseFloat(li.amount) || 0), 0);
    }
    if (d.quoteFee) return parseFloat(d.quoteFee) || 0;
    return parseFloat(baseFee) || 0;
  };

  const getPaymentTotal = (id: string, feeTotal: number): number => {
    const d = mockDetails[id] ?? {};
    if (!d.isPaid) return 0;
    return parseFloat(d.paymentRecord?.amount || "") || feeTotal;
  };

  const handleDeleteQuote = (id: string) => {
    if (id.startsWith("gmail-")) {
      const updated = gmailQuotes.filter(q => q.id !== id);
      saveGmailQuotes(updated);
      setGmailQuotes(updated);
    } else {
      const updated = new Set([...deletedQuoteIds, id]);
      setDeletedQuoteIds(updated);
      localStorage.setItem("am_deleted_quotes", JSON.stringify([...updated]));
    }
  };

  const handleDetailField = (id: string, field: keyof OrderDetailState, value: string) => {
    const current = loadOrderDetail(id);
    const updated = { ...current, [field]: value };
    saveOrderDetail(id, updated);
    setMockDetails(prev => ({ ...prev, [id]: updated }));
  };

  const handleProspectField = handleDetailField;

  const handleOrderStatusChange = (id: string, status: string) => {
    if (savedIds.has(id)) updateOrderStatus(id, status);
    handleDetailField(id, "status", status);
  };

  const handleHideOrder = (id: string) => {
    if (savedIds.has(id)) {
      handleDelete(id);
    } else {
      const updated = new Set([...hiddenOrderIds, id]);
      setHiddenOrderIds(updated);
      localStorage.setItem("am_hidden_orders", JSON.stringify([...updated]));
    }
  };

  const handleGmailSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/gmail-sync");
      const data = await res.json();
      if (!res.ok) {
        setSyncMsg({ ok: false, text: data.setup ?? data.error ?? "Sync failed" });
        return;
      }
      // Skip any that are already covered by a QF-* entry (same name)
      const qfNames = new Set(orders.filter(o => o.id.startsWith("QF-")).map(o => o.orderedBy.toLowerCase()));
      const existing = loadGmailQuotes();
      const existingIds = new Set(existing.map(q => q.id));
      const incoming = (data.quotes as GmailQuoteEntry[]).filter(
        q => !qfNames.has(q.orderedBy.toLowerCase()) && !existingIds.has(q.id)
      );
      const merged = [...existing, ...incoming];
      saveGmailQuotes(merged);
      setGmailQuotes(merged);
      const newDetails = { ...mockDetails };
      incoming.forEach(q => { newDetails[q.id] = loadOrderDetail(q.id); });
      setMockDetails(newDetails);
      setSyncMsg({ ok: true, text: incoming.length > 0 ? `${incoming.length} new quote${incoming.length !== 1 ? "s" : ""} imported.` : "Already up to date." });
    } catch (err) {
      setSyncMsg({ ok: false, text: err instanceof Error ? err.message : "Sync failed" });
    } finally {
      setSyncing(false);
    }
  };

  const savedIds = new Set(savedOrders.map(o => o.id));

  const revenueEntries = React.useMemo(() => {
    const result: { date: string; amount: number }[] = [];
    savedOrders.forEach(o => {
      const d = mockDetails[o.id] ?? {};
      const status = d.status ?? o.status;
      if (!d.isPaid && status !== "Completed") return;
      const amount = parseFloat(d.quoteFee || o.fee || "0");
      if (amount > 0) result.push({ date: o.created, amount });
    });
    orders.filter(o => !savedIds.has(o.id) && !o.id.startsWith("QF-")).forEach(o => {
      const d = mockDetails[o.id] ?? {};
      const status = d.status ?? o.status;
      if (!d.isPaid && status !== "Completed") return;
      const amount = parseFloat(d.quoteFee || o.detail?.fee || "0");
      if (amount > 0) result.push({ date: o.created, amount });
    });
    return result;
  }, [savedOrders, mockDetails]);

  const allOrders = [
    ...savedOrders.map(o => {
      const d = mockDetails[o.id] ?? {};
      return {
        id: o.id,
        address: d.localAddress || o.address,
        city: d.localCity ? `${d.localCity}${d.localState ? ", " + d.localState : ""}` : o.city,
        type: d.localType || o.type,
        property: d.localProperty || o.property,
        orderedBy: o.orderedBy,
        appointment: "Just added",
        due: o.dueDate || "—",
        created: o.created,
        status: d.status ?? o.status,
        appraiser: "Robert Ho...",
        task: "", tag: "",
        isQuote: false,
        email: d.orderEmail ?? o.contactEmail ?? "",
        phone: d.orderPhone ?? o.contactPhone ?? "",
        fee: o.fee ?? "",
        detail: { contactEmail: o.contactEmail, contactPhone: o.contactPhone },
      };
    }),
    ...orders
      .filter(o => !savedIds.has(o.id))
      .map(o => {
        const d = mockDetails[o.id] ?? {};
        const isQuote = o.id.startsWith("QF-");
        return {
          ...o,
          status: isQuote ? "Quote" : (d.status ?? o.status),
          address: d.localAddress || o.address,
          city: d.localCity ? `${d.localCity}${d.localState ? ", " + d.localState : ""}` : o.city,
          type: d.localType || o.type,
          property: d.localProperty || o.property,
          isQuote,
          email: d.orderEmail ?? o.detail?.contactEmail ?? "",
          phone: d.orderPhone ?? o.detail?.contactPhone ?? "",
          fee: o.detail?.fee ?? "",
        };
      }),
    ...gmailQuotes,
  ];

  const isQuotesTab = tab === "Quotes";

  // Quotes tab: show all QF-* entries (always); Orders tab: exclude them
  const tabOrders = isQuotesTab
    ? allOrders
        .filter(o => (o.isQuote || o.status === "Quote") && !deletedQuoteIds.has(o.id))
        .sort((a, b) => dateSortDir
          ? compareByDate(a.created, b.created, dateSortDir)
          : new Date(b.created).getTime() - new Date(a.created).getTime())
    : tab === "Bids"
    ? []
    : allOrders
        .filter(o => !o.isQuote && o.status !== "Quote" && !hiddenOrderIds.has(o.id))
        .sort((a, b) => {
          if (dateSortDir) return compareByDate(a.due, b.due, dateSortDir);
          const sd = (STATUS_SORT_ORDER[a.status] ?? 99) - (STATUS_SORT_ORDER[b.status] ?? 99);
          if (sd !== 0) return sd;
          return new Date(a.due).getTime() - new Date(b.due).getTime();
        });

  const filteredOrders = (statusFilter && !isQuotesTab)
    ? tabOrders.filter(o => o.status === statusFilter)
    : tabOrders;

  const statusCounts = allOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const revenue = [
    ...savedOrders.map(o => {
      const d = mockDetails[o.id] ?? {};
      if (!d.isPaid) return 0;
      return inPeriod(o.created, revenuePeriod) ? parseFloat(d.quoteFee || o.fee || "0") : 0;
    }),
    ...orders.filter(o => !savedIds.has(o.id)).map(o => {
      const d = mockDetails[o.id] ?? {};
      if (!d.isPaid) return 0;
      return inPeriod(o.created, revenuePeriod) ? parseFloat(d.quoteFee || o.detail.fee || "0") : 0;
    }),
  ].reduce((a, b) => a + b, 0);
  const revenueFormatted = revenue > 0 ? `$${revenue.toLocaleString()}` : "$0";

  const quoteCount = allOrders.filter(o => o.isQuote || o.status === "Quote").length;

  const tabs = ["Orders", "Quotes", "Bids"];
  const views = [
    { label: "Table", icon: Table2 },
    { label: "Map", icon: Map },
    { label: "Board", icon: LayoutGrid },
    { label: "Pending", icon: Clock },
  ];
  const dueFilters = ["Overdue", "Today", "Tomorrow", "This Week"];

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        breadcrumb="Orders"
        actions={
          <Link href="/orders/new" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors">
            <Plus size={13} /> New Order
          </Link>
        }
      />

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500">Manage and track all appraisal orders</p>
          </div>
          <button className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50 flex items-center gap-1.5">
            <Clock size={13} /> Calendar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === t ? "bg-white border border-gray-200 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "Orders" && <Table2 size={13} />}
              {t === "Quotes" && <LayoutGrid size={13} />}
              {t === "Bids" && <Clock size={13} />}
              {t}
              {t === "Quotes" && quoteCount > 0 && (
                <span className="ml-0.5 bg-purple-100 text-purple-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  {quoteCount}
                </span>
              )}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium">TAGS</span>
            {["Private Work", "Lender", "Consulting"].map((tag) => (
              <button key={tag} className="flex items-center gap-1 border border-gray-200 rounded px-2 py-0.5 bg-white hover:bg-gray-50">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {tag}
              </button>
            ))}
            <button className="border border-gray-200 rounded px-2 py-0.5 bg-white hover:bg-gray-50">Last 30 Days ▾</button>
          </div>
        </div>


        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {!isQuotesTab ? (
            <>
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 uppercase font-medium">REVENUE COLLECTED</p>
                  <RevenuePeriodSelect value={revenuePeriod} onChange={setRevenuePeriod} />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">{revenueFormatted}</p>
                <p className="text-xs text-gray-400 mt-0.5">+0 vs last 30 days</p>
              </div>
              {[
                { label: "IN PROGRESS", value: String(statusCounts["In Progress"] ?? 0) },
                { label: "PENDING", value: String(statusCounts["Pending"] ?? 0) },
                { label: "TOTAL ORDERS", value: String(tabOrders.length) },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                  <p className="text-xs text-gray-400 uppercase font-medium">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">+0 vs last 30 days</p>
                </div>
              ))}
            </>
          ) : (
            <>
              {(() => {
                const qDetails = Object.entries(mockDetails).filter(([id]) => id.startsWith("QF-") || id.startsWith("gmail-"));
                const byStatus = (s: string) => qDetails.filter(([, d]) => (d.prospectStatus ?? "New") === s).length;
                return [
                  { label: "TOTAL PROSPECTS", value: String(quoteCount), color: "text-purple-600" },
                  { label: "NEW", value: String(byStatus("New") + qDetails.filter(([, d]) => !d.prospectStatus).length), color: "text-blue-600" },
                  { label: "CONTACTED", value: String(byStatus("Contacted")), color: "text-amber-600" },
                  { label: "CONVERTED", value: String(byStatus("Converted")), color: "text-green-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                    <p className="text-xs text-gray-400 uppercase font-medium">{s.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                  </div>
                ));
              })()}
            </>
          )}
        </div>

        {/* Workflow Status — Orders tab only */}
        {!isQuotesTab && (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 uppercase font-medium">WORKFLOW STATUS <span className="text-gray-300">ORDERS BY STAGE</span></p>
              {statusFilter && (
                <button onClick={() => setStatusFilter(null)} className="text-xs text-blue-600 hover:underline">
                  Clear filter ×
                </button>
              )}
            </div>
            <div className="grid grid-cols-9 divide-x divide-gray-100">
              {[
                { label: "Quotes",      action: () => handleTabChange("Quotes"), color: "text-gray-600",  count: quoteCount },
                { label: "Risk",        filterKey: "Risk",         color: "text-gray-600",  count: statusCounts["Risk"] ?? 0 },
                { label: "At Risk",     filterKey: "At Risk",      color: "text-red-600",   count: statusCounts["At Risk"] ?? 0 },
                { label: "Pending",     filterKey: "Pending",      color: "text-gray-600",  count: statusCounts["Pending"] ?? 0 },
                { label: "Assigned",    filterKey: "Assigned",     color: "text-gray-600",  count: statusCounts["Assigned"] ?? 0 },
                { label: "In Progress", filterKey: "In Progress",  color: "text-blue-600",  count: statusCounts["In Progress"] ?? 0 },
                { label: "Completed",   filterKey: "Completed",    color: "text-green-600", count: statusCounts["Completed"] ?? 0 },
                { label: "Declined",    filterKey: "Declined",     color: "text-gray-600",  count: statusCounts["Declined"] ?? 0 },
                { label: "Cancelled",   filterKey: "Cancelled",    color: "text-gray-600",  count: statusCounts["Cancelled"] ?? 0 },
              ].map((stage) => {
                const filterKey = "filterKey" in stage ? stage.filterKey : undefined;
                const isActive = statusFilter === filterKey && !!filterKey;
                return (
                  <button
                    key={stage.label}
                    onClick={() => {
                      if ("action" in stage && stage.action) { stage.action(); return; }
                      if (filterKey) setStatusFilter(statusFilter === filterKey ? null : filterKey);
                    }}
                    className={`text-center px-3 py-1 rounded transition-colors hover:bg-gray-50 cursor-pointer ${isActive ? "bg-blue-50 ring-1 ring-blue-200 rounded-lg" : ""}`}
                  >
                    <p className={`text-xl font-bold ${stage.color}`}>{stage.count}</p>
                    <p className={`text-xs mt-0.5 ${isActive ? "text-blue-600 font-medium" : "text-gray-400"}`}>{stage.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Revenue Chart — Orders tab only */}
        {!isQuotesTab && tab !== "Bids" && (
          <>
            <RevenueChart entries={revenueEntries} />
            <OrderVolumeChart entries={allOrders.filter(o => !o.isQuote).map(o => ({ date: o.created }))} />
          </>
        )}

        {/* Due Filter + View Toggle — Orders tab only */}
        {!isQuotesTab && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-500">Due:</span>
              {dueFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setDueFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    dueFilter === f
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {f} {f === "Overdue" ? "5" : ""}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {views.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => setView(label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    view === label ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <input
              type="text"
              placeholder={isQuotesTab ? "Search prospects..." : "Search orders..."}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 outline-none focus:border-blue-400 w-48"
            />
            {!isQuotesTab && (
              <>
                <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                  📋 Saved Views
                </button>
                <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                  <Filter size={12} /> Filters
                </button>
              </>
            )}
            {isQuotesTab && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGmailSync}
                  disabled={syncing}
                  className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 bg-white disabled:opacity-50"
                >
                  <RefreshCw size={11} className={syncing ? "animate-spin" : ""} />
                  {syncing ? "Syncing..." : "Sync Gmail"}
                </button>
                {syncMsg && (
                  <span className={`text-xs ${syncMsg.ok ? "text-green-600" : "text-red-500"}`}>
                    {syncMsg.text}
                  </span>
                )}
              </div>
            )}
            <div className="ml-auto text-xs text-gray-500">
              {filteredOrders.length} {isQuotesTab ? "prospect" : "order"}{filteredOrders.length !== 1 ? "s" : ""} found
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2.5 text-left"><input type="checkbox" className="rounded" /></th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">
                  {isQuotesTab ? "PROSPECT STATUS" : "STATUS"}
                </th>
                {!isQuotesTab && <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">TYPE</th>}
                {isQuotesTab && <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">FILE #</th>}
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">ADDRESS</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">PROPERTY</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">
                  {isQuotesTab ? "PROSPECT" : "ORDERED BY"}
                </th>
                {!isQuotesTab && <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">FEE TOTAL</th>}
                {!isQuotesTab && <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">PAYMENT TOTAL</th>}
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">
                  <button
                    onClick={toggleDateSort}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    title="Sort by this column"
                  >
                    {isQuotesTab ? "DATE ADDED" : "DUE DATE"}
                    {dateSortDir === "asc" && <ArrowUp size={11} />}
                    {dateSortDir === "desc" && <ArrowDown size={11} />}
                    {dateSortDir === null && <ArrowUpDown size={11} className="opacity-40" />}
                  </button>
                </th>
                {isQuotesTab && <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">EMAIL</th>}
                {isQuotesTab && <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">PHONE</th>}
                {isQuotesTab && <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">NOTES</th>}
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">QUICK ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const prospectStatus = mockDetails[order.id]?.prospectStatus ?? "New";
                const psColor = prospectStatusColors[prospectStatus] ?? "bg-gray-50 text-gray-500 border-gray-200";
                return (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      {isQuotesTab ? (
                        <div className="relative inline-flex items-center">
                          <select
                            value={prospectStatus}
                            onChange={e => handleProspectStatus(order.id, e.target.value)}
                            className={`appearance-none border rounded-lg pl-2.5 pr-7 py-1 text-xs font-medium outline-none cursor-pointer ${psColor}`}
                          >
                            {PROSPECT_STATUSES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="relative inline-flex items-center">
                            <select
                              value={order.status}
                              onChange={e => handleOrderStatusChange(order.id, e.target.value)}
                              className={`appearance-none border-0 rounded-full pl-2.5 pr-6 py-0.5 text-xs font-medium outline-none cursor-pointer ${statusColors[order.status] ?? "bg-gray-100 text-gray-700"}`}
                            >
                              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                          </div>
                          {order.task && <p className="text-xs text-gray-400">{order.task}</p>}
                          {order.tag && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">{order.tag}</span>}
                        </div>
                      )}
                    </td>
                    {!isQuotesTab && (
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="relative inline-flex items-center">
                          <select
                            value={order.type}
                            onChange={e => handleDetailField(order.id, "localType", e.target.value)}
                            className="appearance-none border border-gray-200 rounded-lg pl-2 pr-6 py-1 text-xs text-gray-600 outline-none bg-white hover:border-gray-300 cursor-pointer"
                          >
                            {ORDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                        </div>
                      </td>
                    )}
                    {isQuotesTab && (
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <Link href={`/orders/${order.id}`} className="text-xs font-mono text-blue-600 hover:text-blue-800 hover:underline">{order.id}</Link>
                      </td>
                    )}
                    <td className="px-4 py-3 min-w-[160px]" onClick={e => e.stopPropagation()}>
                      <EditableCell value={order.address} placeholder="No address" textClass="text-xs font-medium text-gray-800" onSave={v => handleDetailField(order.id, "localAddress", v)} />
                      <EditableCell value={order.city} placeholder="No city" textClass="text-xs text-gray-400" onSave={v => handleDetailField(order.id, "localCity", v)} />
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      {isQuotesTab ? (
                        <div className="relative inline-flex items-center">
                          <select
                            value={mockDetails[order.id]?.prospectProperty ?? mapPropertyType(order.property)}
                            onChange={e => handleDetailField(order.id, "prospectProperty", e.target.value)}
                            className="appearance-none border border-gray-200 rounded-lg pl-2 pr-6 py-1 text-xs text-gray-600 outline-none bg-white hover:border-gray-300 cursor-pointer"
                          >
                            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                        </div>
                      ) : (
                        <div className="relative inline-flex items-center">
                          <select
                            value={order.property}
                            onChange={e => handleDetailField(order.id, "localProperty", e.target.value)}
                            className="appearance-none border border-gray-200 rounded-lg pl-2 pr-6 py-1 text-xs text-gray-600 outline-none bg-white hover:border-gray-300 cursor-pointer"
                          >
                            {ORDER_PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 min-w-[120px]">
                      {isQuotesTab ? (
                        <EditableCell value={mockDetails[order.id]?.prospectName ?? order.orderedBy} placeholder="No name" textClass="text-xs text-gray-700" onSave={v => handleDetailField(order.id, "prospectName", v)} />
                      ) : (
                        <p className="text-xs text-gray-700">{order.orderedBy}</p>
                      )}
                    </td>
                    {!isQuotesTab && (() => {
                      const feeTotal = getFeeTotal(order.id, (order as { fee?: string }).fee ?? "");
                      const paymentTotal = getPaymentTotal(order.id, feeTotal);
                      return (
                        <>
                          <td className="px-4 py-3 min-w-[100px]">
                            <p className="text-xs font-medium text-gray-800">${feeTotal.toFixed(0)}</p>
                          </td>
                          <td className="px-4 py-3 min-w-[100px]">
                            <p className={`text-xs font-medium ${paymentTotal > 0 ? "text-green-600" : "text-gray-400"}`}>
                              ${paymentTotal.toFixed(0)}
                            </p>
                          </td>
                        </>
                      );
                    })()}
                    <td className="px-4 py-3">
                      {isQuotesTab ? (
                        <p className="text-xs text-gray-600">{order.created}</p>
                      ) : (
                        <p className={`text-xs font-medium ${order.due && order.due !== "—" ? "text-red-600" : "text-gray-400"}`}>{order.due}</p>
                      )}
                    </td>
                    {isQuotesTab && (
                      <td className="px-4 py-3 min-w-[160px]">
                        <EditableCell
                          value={mockDetails[order.id]?.prospectEmail ?? (order as { detail?: { contactEmail?: string } }).detail?.contactEmail ?? ""}
                          placeholder="No email"
                          textClass="text-xs text-gray-600"
                          onSave={v => handleProspectField(order.id, "prospectEmail", v)}
                        />
                      </td>
                    )}
                    {isQuotesTab && (
                      <td className="px-4 py-3 min-w-[120px]">
                        <EditableCell
                          value={mockDetails[order.id]?.prospectPhone ?? (order as { detail?: { contactPhone?: string } }).detail?.contactPhone ?? ""}
                          placeholder="No phone"
                          textClass="text-xs text-gray-600"
                          onSave={v => handleProspectField(order.id, "prospectPhone", v)}
                        />
                      </td>
                    )}
                    {isQuotesTab && (
                      <td className="px-4 py-3">
                        <NoteCell id={order.id} initial={mockDetails[order.id]?.prospectNotes ?? ""} />
                      </td>
                    )}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      {isQuotesTab ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteQuote(order.id); }}
                            className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove prospect"
                          >
                            <Trash2 size={13} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); router.push(`/orders/${order.id}`); }}
                            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-colors"
                            title="View quote details"
                          >
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={e => { e.stopPropagation(); router.push(`/orders/${order.id}`); }}
                            className="p-1 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit order"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleHideOrder(order.id); }}
                            className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete order"
                          >
                            <Trash2 size={13} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); router.push(`/orders/${order.id}`); }}
                            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-colors"
                            title="View order detail"
                          >
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={isQuotesTab ? 11 : 10} className="px-4 py-10 text-center text-xs text-gray-400">
                    {isQuotesTab ? "No quote prospects yet" : "No orders found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
