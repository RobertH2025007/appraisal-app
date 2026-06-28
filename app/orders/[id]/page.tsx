"use client";

import { useParams, useRouter } from "next/navigation";
import { loadOrders, updateOrderStatus, loadOrderDetail, saveOrderDetail } from "@/lib/orders-store";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Star, ChevronDown, AlertTriangle, CheckCircle2,
  MapPin, User, Mail, Phone, FileText, DollarSign, CalendarDays,
  Upload, Clock, MoreHorizontal, Check, StickyNote, Hash, Briefcase,
  Copy, Printer, Link2, X, CheckCheck, Paperclip, Pencil,
} from "lucide-react";

const MOCK_ORDERS = [
  {
    id: "268426-HQ58", address: "6746 Corie Ln", city: "West Hills", state: "CA",
    property: "Single-Family", type: "GPAR", orderedBy: "Kevin Reed",
    due: "May 4, 2026", created: "Apr 26, 2026", status: "In Progress",
    contactEmail: "kevin.reed@lender.com", contactPhone: "(818) 555-0101",
    orderType: "Lender", reportType: "GPAR - 1004 (Single Family)", fee: "500",
    dueDate: "May 4, 2026", inspectionDate: "Apr 28, 2026 9:00 AM",
    purpose: "Current Market Evaluation", loanNumber: "LN-8842210",
    zip: "91307", notes: "Access via lockbox. Code: 4421. Call borrower 30 min before.",
  },
  {
    id: "268426-HDCT", address: "29867 Sea Breeze Way", city: "Menifee", state: "CA",
    property: "Single-Family", type: "GPAR", orderedBy: "Hernan Ortiz",
    due: "May 3, 2026", created: "Apr 26, 2026", status: "In Progress",
    contactEmail: "h.ortiz@firstcal.com", contactPhone: "(951) 555-0188",
    orderType: "Lender", reportType: "GPAR - 1004 (Single Family)", fee: "475",
    dueDate: "May 3, 2026", inspectionDate: "Apr 27, 2026 11:00 AM",
    purpose: "Current Market Evaluation", loanNumber: "LN-7731045",
    zip: "92584", notes: "",
  },
  {
    id: "268426-ABCD", address: "1234 Sunset Blvd", city: "Los Angeles", state: "CA",
    property: "Single-Family", type: "GPAR", orderedBy: "Jane Smith",
    due: "Apr 28, 2026", created: "Apr 10, 2026", status: "In Progress",
    contactEmail: "jane.smith@privatemail.com", contactPhone: "(323) 555-0244",
    orderType: "Private Work", reportType: "GPAR - 1004 (Single Family)", fee: "550",
    dueDate: "Apr 28, 2026", inspectionDate: "Apr 14, 2026 10:00 AM",
    purpose: "Estate/Trust/Probate", loanNumber: "",
    zip: "90026", notes: "Estate sale. Contact attorney Jane Smith for access.",
  },
  {
    id: "268426-EFGH", address: "5678 Oak Ave", city: "Pasadena", state: "CA",
    property: "Single-Family", type: "GPAR", orderedBy: "Mike Johnson",
    due: "Jun 10, 2026", created: "May 15, 2026", status: "At Risk",
    contactEmail: "mjohnson@westernbank.com", contactPhone: "(626) 555-0377",
    orderType: "Lender", reportType: "GPAR - 1004 (Single Family)", fee: "500",
    dueDate: "Jun 10, 2026", inspectionDate: "Jun 2, 2026 2:00 PM",
    purpose: "Current Market Evaluation", loanNumber: "LN-9954321",
    zip: "91101", notes: "",
  },
  {
    id: "268426-IJKL", address: "910 Pine St", city: "Glendale", state: "CA",
    property: "Condo", type: "GPAR", orderedBy: "Sara Lee",
    due: "Jun 30, 2026", created: "Jun 1, 2026", status: "In Progress",
    contactEmail: "sara.lee@gmail.com", contactPhone: "(818) 555-0512",
    orderType: "Private Work", reportType: "1073 - Condominium", fee: "450",
    dueDate: "Jun 30, 2026", inspectionDate: "Jun 20, 2026 1:00 PM",
    purpose: "Pre-Listing / Pre-Purchase", loanNumber: "",
    zip: "91205", notes: "Unit 4B. Ring intercom.",
  },
];

const WORKFLOW_STEPS = [
  { label: "Accept Order", desc: "Confirm and accept the appraisal order" },
  { label: "Contact Client", desc: "Reach out to schedule and confirm details" },
  { label: "Schedule Inspection", desc: "Set inspection date and time" },
  { label: "Complete Inspection", desc: "Complete the property inspection" },
  { label: "Complete Report", desc: "Write and finalize the appraisal report" },
  { label: "Deliver & Mark Complete", desc: "Deliver report and close the order" },
];

const STATUS_COLORS: Record<string, string> = {
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  "At Risk": "bg-red-100 text-red-700 border-red-200",
  "Completed": "bg-green-100 text-green-700 border-green-200",
  "Paid": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Pending": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "On Hold": "bg-orange-100 text-orange-700 border-orange-200",
  "Cancelled": "bg-gray-100 text-gray-500 border-gray-200",
};

function defaultSteps(status: string): Set<number> {
  const n = status === "Completed" || status === "Paid" ? 6
    : status === "At Risk" ? 3
    : status === "In Progress" ? 2
    : 0;
  return new Set(Array.from({ length: n }, (_, i) => i));
}

type OrderData = {
  id: string; address: string; city: string; state: string; zip: string;
  property: string; type: string; orderedBy: string; contactEmail: string;
  contactPhone: string; orderType: string; reportType: string; fee: string;
  dueDate: string; inspectionDate: string; purpose: string; loanNumber: string;
  notes: string; status: string; created: string;
};

type LineItem = { id: number; label: string; amount: string };
type PaymentRecord = { method: string; amount: string; date: string; reference: string; notes: string };

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState("In Progress");
  const [activeTab, setActiveTab] = useState("AT A GLANCE");
  const [showLineItems, setShowLineItems] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [nextLineId, setNextLineId] = useState(4);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState<PaymentRecord>({ method: "Check", amount: "", date: "", reference: "", notes: "" });
  const [editingAddress, setEditingAddress] = useState(false);
  const [localAddress, setLocalAddress] = useState("");
  const [localCity, setLocalCity] = useState("");
  const [localState, setLocalState] = useState("");
  const [localZip, setLocalZip] = useState("");
  const [paymentLinkCopied, setPaymentLinkCopied] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [quoteStatus, setQuoteStatus] = useState<"draft" | "sent" | "accepted" | "declined">("draft");
  const [statusDate, setStatusDate] = useState("");
  const [quoteFee, setQuoteFee] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const reportFileRef = useRef<HTMLInputElement>(null);
  const hasLoaded = useRef(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyPaymentLink = () => {
    const fakeLink = `https://pay.theappraisalstation.com/inv/${order?.id}`;
    navigator.clipboard.writeText(fakeLink).then(() => {
      setPaymentLinkCopied(true);
      showToast("Payment link copied to clipboard");
      setTimeout(() => setPaymentLinkCopied(false), 2500);
    }).catch(() => {
      // Fallback: use legacy execCommand
      const el = document.createElement("textarea");
      el.value = fakeLink;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setPaymentLinkCopied(true);
      showToast("Payment link copied to clipboard");
      setTimeout(() => setPaymentLinkCopied(false), 2500);
    });
  };

  const handleGenerateInvoice = () => {
    showToast("Opening print dialog…");
    setTimeout(() => window.print(), 400);
  };

  const handleReportUpload = (files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files).map(f => f.name);
    setUploadedFiles(prev => [...prev, ...names]);
    showToast(`${names.length} file${names.length > 1 ? "s" : ""} uploaded successfully`);
  };

  const totalFee = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const balanceDue = isPaid ? 0 : totalFee;

  const addLineItem = () => {
    setLineItems(prev => [...prev, { id: nextLineId, label: "Additional fee", amount: "0" }]);
    setNextLineId(n => n + 1);
  };

  const updateLineItem = (itemId: number, field: keyof LineItem, value: string) => {
    setLineItems(prev => prev.map(li => li.id === itemId ? { ...li, [field]: value } : li));
  };

  const removeLineItem = (itemId: number) => {
    setLineItems(prev => prev.filter(li => li.id !== itemId));
  };

  const handleRecordPayment = () => {
    const amt = paymentRecord.amount || String(totalFee);
    const isUpdate = isPaid;
    setIsPaid(true);
    setShowPaymentForm(false);
    showToast(isUpdate ? `Payment updated — $${amt} via ${paymentRecord.method}` : `Payment of $${amt} recorded via ${paymentRecord.method}`);
  };

  useEffect(() => {
    const initAddress = (o: OrderData, detail: ReturnType<typeof loadOrderDetail>) => {
      setLocalAddress(detail.localAddress ?? o.address ?? "");
      setLocalCity(detail.localCity ?? o.city ?? "");
      setLocalState(detail.localState ?? o.state ?? "");
      setLocalZip(detail.localZip ?? o.zip ?? "");
    };

    const initLineItems = (o: OrderData, detail: ReturnType<typeof loadOrderDetail>) => {
      if (detail.lineItems?.length) {
        setLineItems(detail.lineItems);
      } else {
        setLineItems([
          { id: 1, label: `${o.reportType || o.type} — Appraisal`, amount: o.fee || "0" },
          { id: 2, label: "Rush fee", amount: "0" },
          { id: 3, label: "Mileage", amount: "0" },
        ]);
      }
    };

    const saved = loadOrders();
    const found = saved.find(o => o.id === id);
    const detail = loadOrderDetail(id);

    const applyOrder = (o: OrderData) => {
      setOrder(o);
      setStatus(detail.status ?? o.status);
      setCompletedSteps(detail.completedSteps ? new Set(detail.completedSteps) : defaultSteps(o.status));
      initLineItems(o, detail);
      initAddress(o, detail);
      setQuoteFee(detail.quoteFee ?? detail.lineItems?.[0]?.amount ?? o.fee ?? "");
      if (detail.quoteStatus) setQuoteStatus(detail.quoteStatus as "draft" | "sent" | "accepted" | "declined");
      if (detail.isPaid !== undefined) setIsPaid(detail.isPaid);
      if (detail.paymentRecord) setPaymentRecord(detail.paymentRecord);
      setStatusDate(detail.statusDate ?? new Date().toISOString().slice(0, 10));
    };

    if (found) {
      applyOrder(found);
    } else {
      const mock = MOCK_ORDERS.find(m => m.id === id);
      if (mock) applyOrder(mock);
    }

    setLoading(false);
    hasLoaded.current = true;
  }, [id]);

  useEffect(() => {
    if (!hasLoaded.current || !id) return;
    saveOrderDetail(id, {
      completedSteps: [...completedSteps],
      isPaid,
      paymentRecord,
      status,
      lineItems,
      quoteStatus,
      quoteFee,
      statusDate,
      // Only persist address fields once the user has actually edited them
      ...(localAddress ? { localAddress } : {}),
      ...(localCity ? { localCity } : {}),
      ...(localState ? { localState } : {}),
      ...(localZip ? { localZip } : {}),
    });
  }, [completedSteps, isPaid, paymentRecord, localAddress, localCity, localState, localZip, status, lineItems, quoteStatus, quoteFee, statusDate, id]);

  const toggleStep = (i: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setStatusDate(new Date().toISOString().slice(0, 10));
    updateOrderStatus(id, newStatus);
    if (order) setOrder({ ...order, status: newStatus });
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-3 text-gray-400">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-3 text-gray-400">
        <p className="text-sm">Order not found</p>
        <Link href="/orders" className="text-blue-600 text-sm hover:underline">← Back to Orders</Link>
      </div>
    );
  }

  const isOverdue = order.dueDate && new Date(order.dueDate) < new Date();
  const progressPct = Math.round((completedSteps.size / WORKFLOW_STEPS.length) * 100);
  const tabs = ["AT A GLANCE", "Photos", "Comps", "Narratives", "Files", "Workfile"];

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-gray-50">
      {/* Hidden file input for report upload */}
      <input
        ref={reportFileRef}
        type="file"
        multiple
        accept=".pdf,.xml,.zap,.env,.zip"
        className="hidden"
        onChange={e => handleReportUpload(e.target.files)}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCheck size={13} className="text-green-400" />
          {toast}
          <button onClick={() => setToast(null)} className="ml-1 opacity-60 hover:opacity-100">
            <X size={11} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/orders")}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-300 hover:text-yellow-400 transition-colors">
            <Star size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-gray-900 truncate">{localAddress}</h1>
            <p className="text-xs text-gray-500">{localCity}, {localState} {localZip}</p>
          </div>

          {/* Status selector + date */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={status}
                onChange={e => handleStatusChange(e.target.value)}
                className={`text-xs font-medium pl-3 pr-7 py-1.5 rounded-full border cursor-pointer outline-none appearance-none ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
              >
                {["In Progress","Pending","Completed","Paid","At Risk","On Hold","Cancelled"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
            </div>
            <input
              type="date"
              value={statusDate}
              onChange={e => setStatusDate(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-400 text-gray-600"
              title="Status date"
            />
          </div>

          <button
            onClick={() => handleStatusChange("Completed")}
            className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Check size={12} /> MARK COMPLETE
          </button>
          <button className="border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
            Export <ChevronDown size={11} />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-6 py-1.5 text-xs text-gray-400 flex items-center gap-1.5">
        <span className="text-gray-300">Portal</span>
        <span>/</span>
        <Link href="/orders" className="hover:text-blue-600 transition-colors">Orders</Link>
        <span>/</span>
        <span className="text-gray-700">{order.address}</span>
      </div>

      {/* Overdue alert */}
      {isOverdue && (
        <div className="mx-6 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700 font-medium flex-1">
            At Risk: Past due — Due {order.dueDate}
          </p>
          <button className="text-xs text-red-600 border border-red-200 bg-white rounded-lg px-2.5 py-1 hover:bg-red-50 transition-colors flex items-center gap-1">
            <Upload size={11} /> Upload Contract
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 mt-4">
        <div className="flex items-center gap-0">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
              }`}
            >
              {tab}{i > 0 && <span className="text-gray-300 ml-1.5 font-normal">0</span>}
            </button>
          ))}
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex gap-4 p-6 flex-1 items-start">

        {/* LEFT column */}
        <div className="w-60 flex-shrink-0 space-y-3">

          {/* Property card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 pb-2">
              <div className="flex items-start gap-2 mb-3">
                <MapPin size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
                {editingAddress ? (
                  <div className="flex-1 space-y-1.5">
                    <input
                      value={localAddress}
                      onChange={e => setLocalAddress(e.target.value)}
                      placeholder="Street address"
                      className="w-full text-xs font-bold text-gray-800 border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400 uppercase"
                    />
                    <div className="flex gap-1">
                      <input
                        value={localCity}
                        onChange={e => setLocalCity(e.target.value)}
                        placeholder="City"
                        className="flex-1 text-xs text-gray-500 border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400 min-w-0"
                      />
                      <input
                        value={localState}
                        onChange={e => setLocalState(e.target.value)}
                        placeholder="ST"
                        className="w-10 text-xs text-gray-500 border border-gray-200 rounded px-1 py-1 outline-none focus:border-blue-400 text-center"
                      />
                      <input
                        value={localZip}
                        onChange={e => setLocalZip(e.target.value)}
                        placeholder="ZIP"
                        className="w-16 text-xs text-gray-500 border border-gray-200 rounded px-1 py-1 outline-none focus:border-blue-400"
                      />
                    </div>
                    <div className="flex gap-1.5 pt-0.5">
                      <button
                        onClick={() => { setEditingAddress(false); showToast("Address updated"); }}
                        className="text-[10px] bg-blue-600 text-white rounded px-2 py-1 hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setLocalAddress(order.address || ""); setLocalCity(order.city || ""); setLocalState(order.state || ""); setLocalZip(order.zip || ""); setEditingAddress(false); }}
                        className="text-[10px] text-gray-500 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 group relative">
                    <p className="text-xs font-bold text-gray-800 uppercase leading-tight">{localAddress}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{localCity}, {localState} {localZip}</p>
                    <button
                      onClick={() => setEditingAddress(true)}
                      className="absolute -top-0.5 right-0 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                      title="Edit address"
                    >
                      <Pencil size={10} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Map placeholder */}
            <div className="w-full h-32 bg-gradient-to-br from-green-100 via-green-50 to-blue-50 relative flex items-center justify-center border-y border-gray-100">
              <div className="text-center">
                <MapPin size={18} className="text-green-500 mx-auto mb-1" />
                <p className="text-[10px] text-gray-400">Map / Satellite</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <button className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 shadow-sm">Map</button>
                <button className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 shadow-sm">Satellite</button>
              </div>
            </div>
            <div className="p-4 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Owner</span>
                <span className="text-gray-700 font-medium text-right">{order.orderedBy?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Property</span>
                <span className="text-gray-700">{order.property}</span>
              </div>
            </div>
            <div className="px-4 pb-3 flex gap-2">
              <button className="flex-1 text-[10px] font-medium border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50 transition-colors text-gray-600">
                MARK AS RUSH
              </button>
              <button className="flex-1 text-[10px] font-medium border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50 transition-colors text-gray-600">
                ADD REVISION
              </button>
            </div>
          </div>

          {/* Order metadata */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Order Details</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Hash size={11} className="text-gray-300 flex-shrink-0" />
                <span className="text-gray-400">File #</span>
                <span className="text-gray-700 font-mono ml-auto">{order.id}</span>
              </div>
              {(order.reportType || order.type) && (
                <div className="flex items-start gap-2">
                  <FileText size={11} className="text-gray-300 flex-shrink-0 mt-0.5" />
                  <span className="text-blue-600">{order.reportType || order.type}</span>
                </div>
              )}
              {order.orderType && (
                <div className="flex items-center gap-2">
                  <Briefcase size={11} className="text-gray-300 flex-shrink-0" />
                  <span className="text-gray-600">{order.orderType}</span>
                </div>
              )}
              {order.loanNumber && (
                <div className="flex items-center gap-2">
                  <Hash size={11} className="text-gray-300 flex-shrink-0" />
                  <span className="text-gray-400">Loan #</span>
                  <span className="text-gray-700 ml-auto">{order.loanNumber}</span>
                </div>
              )}
              {order.purpose && (
                <div className="text-gray-500">
                  <span className="text-gray-400">Purpose: </span>{order.purpose}
                </div>
              )}
              <div className="h-px bg-gray-50" />
              <div className="flex items-center gap-2">
                <CalendarDays size={11} className="text-gray-300 flex-shrink-0" />
                <span className="text-gray-400">Ordered</span>
                <span className="text-gray-700 ml-auto">{order.created}</span>
              </div>
              {order.dueDate && (
                <div className="flex items-center gap-2">
                  <CalendarDays size={11} className="text-red-400 flex-shrink-0" />
                  <span className="text-gray-400">Due</span>
                  <span className={`ml-auto font-medium ${isOverdue ? "text-red-600" : "text-gray-700"}`}>{order.dueDate}</span>
                </div>
              )}
              {order.inspectionDate && (
                <div className="flex items-center gap-2">
                  <CalendarDays size={11} className="text-gray-300 flex-shrink-0" />
                  <span className="text-gray-400">Inspection</span>
                  <span className="text-gray-700 ml-auto text-right">{order.inspectionDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Team */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Order Team</p>
              <button className="text-[10px] text-blue-600 hover:underline">+ Add</button>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">RH</div>
              <div>
                <p className="text-xs font-medium text-gray-800">Robert Howlett</p>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">PRIMARY</span>
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Contacts</p>
              <button className="text-[10px] text-blue-600 hover:underline">Change</button>
            </div>
            <p className="text-[10px] text-gray-400 mb-2">Client / Company</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User size={12} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-800 font-medium">{order.orderedBy}</span>
              </div>
              {order.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600">{order.contactEmail}</span>
                </div>
              )}
              {order.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600">{order.contactPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes</p>
              <div className="flex items-start gap-2">
                <StickyNote size={11} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 leading-relaxed">{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* CENTER column */}
        <div className="flex-1 space-y-3 min-w-0">

          {/* Workflow */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Workflow</p>
                  <span className="text-xs text-gray-400 font-medium">{completedSteps.size}/{WORKFLOW_STEPS.length}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Progress</p>
                <p className="text-2xl font-bold text-gray-900">{progressPct}%</p>
              </div>
            </div>

            {order.dueDate && (
              <div className="mb-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Appraisal Due On</p>
                <p className={`text-xl font-bold ${isOverdue ? "text-red-600" : "text-gray-800"}`}>{order.dueDate}</p>
                {isOverdue && <p className="text-xs text-red-400 mt-0.5">Past due</p>}
              </div>
            )}

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Current + Next task highlight */}
            {completedSteps.size < WORKFLOW_STEPS.length && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide mb-1">In Progress</p>
                  <p className="text-xs font-semibold text-blue-800">
                    {WORKFLOW_STEPS[completedSteps.size]?.label}
                  </p>
                  <button
                    onClick={() => toggleStep(completedSteps.size)}
                    className="mt-2 text-[10px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-2.5 py-1 transition-colors flex items-center gap-1"
                  >
                    <Check size={10} /> Mark complete
                  </button>
                </div>
                {completedSteps.size + 1 < WORKFLOW_STEPS.length && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Next Task</p>
                    <p className="text-xs font-semibold text-gray-600">
                      {WORKFLOW_STEPS[completedSteps.size + 1]?.label}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Full checklist */}
            <div className="space-y-2">
              {WORKFLOW_STEPS.map((step, i) => {
                const done = completedSteps.has(i);
                const isCurrent = !done && (i === 0 || completedSteps.has(i - 1));
                return (
                  <div
                    key={step.label}
                    onClick={() => toggleStep(i)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all select-none ${
                      done
                        ? "bg-green-50 border border-green-100"
                        : isCurrent
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50 border border-gray-100"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        done ? "bg-green-500" : isCurrent ? "bg-blue-500" : "bg-gray-200"
                      }`}
                    >
                      {done && <Check size={11} className="text-white" />}
                      {!done && isCurrent && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${done ? "text-green-700 line-through" : isCurrent ? "text-blue-800" : "text-gray-400"}`}>
                        {step.label}
                      </p>
                      <p className={`text-[10px] ${done ? "text-green-500" : isCurrent ? "text-blue-500" : "text-gray-300"}`}>
                        {step.desc}
                      </p>
                    </div>
                    {done && <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3">{completedSteps.size} of {WORKFLOW_STEPS.length} tasks complete</p>
          </div>

          {/* Fee quote */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-800">Fee Quote</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                quoteStatus === "accepted" ? "bg-green-100 text-green-700" :
                quoteStatus === "declined" ? "bg-red-100 text-red-600" :
                quoteStatus === "sent" ? "bg-blue-100 text-blue-700" :
                "bg-yellow-100 text-yellow-700"
              }`}>
                {quoteStatus === "accepted" ? "Accepted" : quoteStatus === "declined" ? "Declined" : quoteStatus === "sent" ? "Sent" : "Draft"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Billing type</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white">
                  <option>Flat fee</option>
                  <option>Hourly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Property type</label>
                <input
                  defaultValue={order.property}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Flat fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    value={quoteFee}
                    onChange={e => {
                      setQuoteFee(e.target.value);
                      updateLineItem(1, "amount", e.target.value);
                    }}
                    className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Purpose</label>
                <input
                  defaultValue={order.purpose}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Notes</label>
              <textarea
                defaultValue={order.notes}
                rows={2}
                placeholder="e.g. Quoted high because of opposing-expert testimony anticipated."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setQuoteStatus("draft"); showToast("Quote saved as draft"); }}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-gray-600 transition-colors"
              >
                Save quote
              </button>
              <button
                onClick={() => { setQuoteStatus("sent"); showToast("Quote marked as sent"); }}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-gray-600 transition-colors"
              >
                Mark sent
              </button>
              <button
                onClick={() => { setQuoteStatus("accepted"); showToast("Quote accepted"); }}
                className="text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1"
              >
                <Check size={10} /> Accepted
              </button>
              <button
                onClick={() => { setQuoteStatus("declined"); showToast("Quote marked as declined"); }}
                className="text-xs border border-red-200 text-red-500 hover:bg-red-50 rounded-lg px-3 py-1.5 transition-colors ml-auto"
              >
                Declined
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT column */}
        <div className="w-60 flex-shrink-0 space-y-3">

          {/* Fees & Costs */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <DollarSign size={11} /> Fees & Costs
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[10px] text-gray-400 mb-1 uppercase">Report Fee</p>
                <p className="text-xl font-bold text-gray-900">${totalFee.toFixed(0)}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {isPaid ? "Paid" : "Unpaid"}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 mb-1 uppercase">Appraiser's Fee</p>
                <p className="text-xl font-bold text-gray-900">${totalFee.toFixed(0)}</p>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">Payroll</span>
              </div>
            </div>

            {/* Mark as Paid button */}
            {!isPaid && !showPaymentForm && (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="w-full text-xs font-medium py-1.5 rounded-lg transition-colors mb-3 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check size={11} /> Mark as Paid
              </button>
            )}

            {isPaid && !showPaymentForm && (
              <div className="mb-3 bg-green-50 border border-green-100 rounded-lg p-2.5">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-[10px] font-semibold text-green-700 flex items-center gap-1">
                    <CheckCheck size={10} /> Payment Recorded
                  </p>
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="text-[10px] text-green-600 hover:text-green-800 flex items-center gap-0.5 hover:underline"
                  >
                    <Pencil size={9} /> Edit
                  </button>
                </div>
                <p className="text-[10px] text-green-600">${paymentRecord.amount || totalFee.toFixed(0)} via {paymentRecord.method}</p>
                {paymentRecord.date && <p className="text-[10px] text-green-500 mt-0.5">{paymentRecord.date}</p>}
                {paymentRecord.reference && <p className="text-[10px] text-green-500">Ref: {paymentRecord.reference}</p>}
                {paymentRecord.notes && <p className="text-[10px] text-green-500 italic mt-0.5">{paymentRecord.notes}</p>}
                <button onClick={() => { setIsPaid(false); setShowPaymentForm(false); }} className="text-[10px] text-green-600 hover:underline mt-1.5 block">
                  Undo payment
                </button>
              </div>
            )}

            {/* Inline payment form */}
            {showPaymentForm && (
              <div className="mb-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[10px] font-semibold text-gray-700">{isPaid ? "Edit Payment" : "Record Payment"}</p>
                  <button onClick={() => setShowPaymentForm(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={11} />
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-0.5">Payment method</label>
                    <select
                      value={paymentRecord.method}
                      onChange={e => setPaymentRecord(p => ({ ...p, method: e.target.value }))}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-blue-400"
                    >
                      <option>Check</option>
                      <option>ACH / Wire</option>
                      <option>Credit Card</option>
                      <option>Cash</option>
                      <option>Zelle</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-0.5">Amount received</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                      <input
                        type="number"
                        value={paymentRecord.amount}
                        onChange={e => setPaymentRecord(p => ({ ...p, amount: e.target.value }))}
                        placeholder={totalFee.toFixed(0)}
                        className="w-full text-xs border border-gray-200 rounded-lg pl-6 pr-2 py-1.5 outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-0.5">Date received</label>
                    <input
                      type="date"
                      value={paymentRecord.date}
                      onChange={e => setPaymentRecord(p => ({ ...p, date: e.target.value }))}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-0.5">Reference / Check #</label>
                    <input
                      value={paymentRecord.reference}
                      onChange={e => setPaymentRecord(p => ({ ...p, reference: e.target.value }))}
                      placeholder="e.g. 1042"
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-0.5">Notes</label>
                    <input
                      value={paymentRecord.notes}
                      onChange={e => setPaymentRecord(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Optional"
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-400"
                    />
                  </div>
                  <button
                    onClick={handleRecordPayment}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-1"
                  >
                    <Check size={11} /> {isPaid ? "Update Payment" : "Record Payment"}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowLineItems(v => !v)}
              className="w-full text-xs text-blue-600 hover:underline text-left mb-3 flex items-center gap-1"
            >
              {showLineItems ? "Hide" : "Show"} line items & payment details
              <ChevronDown size={10} className={`transition-transform ${showLineItems ? "rotate-180" : ""}`} />
            </button>

            {showLineItems && (
              <div className="mb-3 border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-2 py-1.5 text-left text-gray-500 font-medium">Item</th>
                      <th className="px-2 py-1.5 text-right text-gray-500 font-medium">Amount</th>
                      <th className="w-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map(item => (
                      <tr key={item.id} className="border-b border-gray-50 group">
                        <td className="px-2 py-1">
                          <input
                            value={item.label}
                            onChange={e => updateLineItem(item.id, "label", e.target.value)}
                            className="w-full text-[10px] text-gray-700 bg-transparent outline-none hover:bg-white focus:bg-white border border-transparent hover:border-gray-200 focus:border-blue-300 rounded px-1 py-0.5"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <div className="flex items-center justify-end gap-0.5">
                            <span className="text-[10px] text-gray-400">$</span>
                            <input
                              type="number"
                              value={item.amount}
                              onChange={e => updateLineItem(item.id, "amount", e.target.value)}
                              className="w-14 text-[10px] text-right text-gray-800 font-medium bg-transparent outline-none hover:bg-white focus:bg-white border border-transparent hover:border-gray-200 focus:border-blue-300 rounded px-1 py-0.5"
                            />
                          </div>
                        </td>
                        <td className="pr-1">
                          {item.id !== 1 && (
                            <button
                              onClick={() => removeLineItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity"
                            >
                              <X size={9} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 border-t border-gray-100">
                      <td className="px-2 py-1.5 text-gray-700 font-semibold text-[10px]">Total</td>
                      <td className="px-2 py-1.5 text-right text-gray-900 font-bold text-[10px]">${totalFee.toFixed(0)}</td>
                      <td />
                    </tr>
                  </tbody>
                </table>
                <div className={`px-3 py-2 border-t flex items-center justify-between ${isPaid ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
                  <span className={`text-[10px] font-medium ${isPaid ? "text-green-600" : "text-red-600"}`}>Balance Due</span>
                  <span className={`text-[10px] font-bold ${isPaid ? "text-green-700" : "text-red-700"}`}>${balanceDue.toFixed(0)}</span>
                </div>
                <div className="px-3 py-2 border-t border-gray-100">
                  <button
                    onClick={addLineItem}
                    className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                  >
                    + Add fee
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerateInvoice}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 mb-2"
            >
              <Printer size={12} /> Generate PDF Invoice
            </button>
            <button
              onClick={handleCopyPaymentLink}
              className={`w-full border text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                paymentLinkCopied
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 hover:bg-gray-50 text-gray-600"
              }`}
            >
              {paymentLinkCopied ? <><Check size={12} /> Copied!</> : <><Link2 size={12} /> Payment Link</>}
            </button>
          </div>

          {/* Final Report */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <FileText size={11} /> Final Report
            </p>
            <button
              onClick={() => reportFileRef.current?.click()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 mb-2"
            >
              <Upload size={12} /> UPLOAD FINAL REPORT
            </button>
            {uploadedFiles.length > 0 ? (
              <div className="space-y-1">
                {uploadedFiles.map((name, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-600 bg-gray-50 rounded px-2 py-1">
                    <Paperclip size={9} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                Upload final report package: PDF, XML, ZAP, ENV. Select multiple files for the full delivery package.
              </p>
            )}
          </div>

          {/* Activity Feed */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Clock size={11} /> Activity Feed
            </p>
            <div className="space-y-3">
              <div className="flex gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-700">Status Changed</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Order created as {order.status}</p>
                  <p className="text-[10px] text-gray-300 mt-1">{order.created} · Robert Howlett</p>
                </div>
              </div>
              {order.inspectionDate && (
                <div className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">Appointment Scheduled</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Inspection set for {order.inspectionDate}</p>
                    <p className="text-[10px] text-gray-300 mt-1">{order.created} · Robert Howlett</p>
                  </div>
                </div>
              )}
              {completedSteps.size > 0 && (
                <div className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">Task Completed</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{WORKFLOW_STEPS[completedSteps.size - 1]?.label} was completed</p>
                    <p className="text-[10px] text-gray-300 mt-1">Recently · Robert Howlett</p>
                  </div>
                </div>
              )}
            </div>
            <button className="text-xs text-blue-600 hover:underline mt-3 block">
              View full history
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
