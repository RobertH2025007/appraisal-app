"use client";

import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useRef } from "react";
import { Sparkles, Upload, Check, ChevronRight, ArrowLeft, FileSpreadsheet, X } from "lucide-react";
import { saveOrder, type StoredOrder } from "@/lib/orders-store";
import { read as xlsxRead, utils as xlsxUtils } from "xlsx";


const PROPERTY_TYPES = [
  { value: "single-family", label: "Single Family" },
  { value: "condo", label: "Condominium" },
  { value: "multi-family", label: "Multi-Family" },
  { value: "commercial", label: "Commercial" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
];

const REPORT_TYPES = [
  "GPAR - 1004 (Single Family)",
  "1073 - Condominium",
  "1025 - Multi-Family (2-4 units)",
  "Desktop Appraisal",
  "Drive-by (2055)",
  "REO / Foreclosure",
  "1007 - Rent Schedule",
  "704b",
];

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: number }) {
  const steps = ["Client Info", "Property", "Order Details", "Review"];
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = num < step;
        const active = num === step;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                done ? "bg-blue-600 text-white" : active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {done ? <Check size={14} /> : num}
              </div>
              <span className={`text-xs mt-1 font-medium ${active ? "text-blue-600" : done ? "text-blue-500" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-32 h-0.5 mx-2 mb-5 transition-colors ${done ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Client Info ──────────────────────────────────────────────────────
function Step1({ data, onChange, onNext, onCancel }: any) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.orderType) e.orderType = "Type of order is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CLIENT INFORMATION</p>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Type of Order <span className="text-red-500">*</span>
            </label>
            <select
              value={data.orderType}
              onChange={e => onChange("orderType", e.target.value)}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white ${errors.orderType ? "border-red-400" : "border-gray-200"}`}
            >
              <option value="">-- Select type of order --</option>
              <option value="private_work">Private Work</option>
              <option value="lender">Lender</option>
              <option value="consulting">Consulting</option>
            </select>
            {errors.orderType && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span>⚠</span> {errors.orderType}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Name</label>
              <input
                type="text"
                value={data.contactName}
                onChange={e => onChange("contactName", e.target.value)}
                placeholder="John Doe"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
              <input
                type="email"
                value={data.contactEmail}
                onChange={e => onChange("contactEmail", e.target.value)}
                placeholder="john@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              />
              <p className="text-xs text-gray-400 mt-1">Auto-filled from client. Override if this order needs a different contact.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Phone</label>
            <input
              type="tel"
              value={data.contactPhone}
              onChange={e => onChange("contactPhone", e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            onClick={() => { if (validate()) onNext(); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-5 py-2 transition-colors"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Property ─────────────────────────────────────────────────────────
function Step2({ data, onChange, onNext, onBack }: any) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.address) e.address = "Property address is required";
    if (!data.city) e.city = "City is required";
    if (!data.zip) e.zip = "ZIP code is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">PROPERTY INFORMATION</p>
      </div>
      <div className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Property Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.address}
            onChange={e => onChange("address", e.target.value)}
            placeholder="Start typing an address..."
            className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 ${errors.address ? "border-red-400" : "border-gray-200"}`}
          />
          {errors.address && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span>⚠</span> {errors.address}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.city}
              onChange={e => onChange("city", e.target.value)}
              placeholder="Springfield"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 ${errors.city ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.city && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span>⚠</span> {errors.city}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
            <div className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500">CA</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ZIP Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.zip}
              onChange={e => onChange("zip", e.target.value)}
              placeholder="62701"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 ${errors.zip ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.zip && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span>⚠</span> {errors.zip}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Property Type</label>
          <select
            value={data.propertyType}
            onChange={e => onChange("propertyType", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white"
          >
            <option value="">Select property type</option>
            {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <button onClick={() => {}} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 border border-gray-200 text-sm text-gray-600 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={14} /> Previous
          </button>
          <button
            onClick={() => { if (validate()) onNext(); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-5 py-2 transition-colors"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Order Details ────────────────────────────────────────────────────
function Step3({ data, onChange, onNext, onBack }: any) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.reportType) e.reportType = "Report type is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ORDER DETAILS</p>
      </div>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Report Type <span className="text-red-500">*</span>
            </label>
            <select
              value={data.reportType}
              onChange={e => onChange("reportType", e.target.value)}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white ${errors.reportType ? "border-red-400" : "border-gray-200"}`}
            >
              <option value="">-- Select report type --</option>
              {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.reportType && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span>⚠</span> {errors.reportType}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fee</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="text"
                value={data.fee}
                onChange={e => onChange("fee", e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
            <input
              type="date"
              value={data.dueDate}
              onChange={e => onChange("dueDate", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Inspection Date / Time</label>
            <input
              type="datetime-local"
              value={data.inspectionDate}
              onChange={e => onChange("inspectionDate", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
          <select
            value={data.status}
            onChange={e => onChange("status", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white"
          >
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Paid">Paid</option>
            <option value="At Risk">At Risk</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose of Appraisal</label>
          <select
            value={data.purpose}
            onChange={e => onChange("purpose", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white"
          >
            <option value="">-- Select purpose --</option>
            <option>Current Market Evaluation</option>
            <option>Date of Death</option>
            <option>Divorce</option>
            <option>Estate/Trust/Probate</option>
            <option>Pre-Listing / Pre-Purchase</option>
            <option>PMI Removal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Loan Number</label>
          <input
            type="text"
            value={data.loanNumber}
            onChange={e => onChange("loanNumber", e.target.value)}
            placeholder="e.g., 1234567890"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes / Special Instructions</label>
          <textarea
            value={data.notes}
            onChange={e => onChange("notes", e.target.value)}
            rows={3}
            placeholder="Add any special instructions or notes for this order..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
          />
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <button onClick={() => {}} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 border border-gray-200 text-sm text-gray-600 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={14} /> Previous
          </button>
          <button
            onClick={() => { if (validate()) onNext(); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-5 py-2 transition-colors"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Review ──────────────────────────────────────────────────────────
function Step4({ data, onBack, onSubmit }: any) {
  const orderTypeLabel: Record<string, string> = {
    private_work: "Private Work", lender: "Lender", consulting: "Consulting",
  };
  const Row = ({ label, value }: { label: string; value: string }) => (
    value ? (
      <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
        <span className="text-sm text-gray-500 w-44 flex-shrink-0">{label}</span>
        <span className="text-sm text-gray-900 font-medium text-right">{value}</span>
      </div>
    ) : null
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">REVIEW ORDER</p>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Client</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <Row label="Order Type" value={orderTypeLabel[data.orderType] ?? data.orderType} />
            <Row label="Contact Name" value={data.contactName} />
            <Row label="Contact Email" value={data.contactEmail} />
            <Row label="Contact Phone" value={data.contactPhone} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Property</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <Row label="Address" value={data.address} />
            <Row label="City / State / ZIP" value={[data.city, data.state, data.zip].filter(Boolean).join(", ")} />
            <Row label="Property Type" value={PROPERTY_TYPES.find(t => t.value === data.propertyType)?.label ?? data.propertyType} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Order Details</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <Row label="Report Type" value={data.reportType} />
            <Row label="Fee" value={data.fee ? `$${data.fee}` : ""} />
            <Row label="Due Date" value={data.dueDate} />
            <Row label="Inspection Date" value={data.inspectionDate} />
            <Row label="Purpose" value={data.purpose} />
            <Row label="Loan Number" value={data.loanNumber} />
            {data.notes && (
              <div className="py-2.5">
                <span className="text-sm text-gray-500">Notes</span>
                <p className="text-sm text-gray-900 mt-1">{data.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <button onClick={() => {}} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 border border-gray-200 text-sm text-gray-600 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={14} /> Previous
          </button>
          <button
            onClick={onSubmit}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-5 py-2 transition-colors"
          >
            <Check size={15} /> Create Order
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CSV helpers ─────────────────────────────────────────────────────────────
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map(h =>
    h.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
  );
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
}

function csvRowToOrder(row: Record<string, string>): Omit<StoredOrder, "id" | "created"> {
  const get = (...keys: string[]) =>
    keys.map(k => row[k] ?? row[k.replace(/_/g, " ")] ?? "").find(v => v) ?? "";
  return {
    address:       get("address", "property_address", "street_address", "street"),
    city:          get("city"),
    state:         get("state") || "CA",
    zip:           get("zip", "zip_code", "postal_code"),
    property:      get("property_type", "property", "prop_type") || "Single-Family",
    type:          get("type", "report_type", "appraisal_type", "form_type") || "GPAR",
    orderedBy:     get("contact_name", "name", "client", "ordered_by", "client_name", "borrower"),
    contactEmail:  get("email", "contact_email", "client_email"),
    contactPhone:  get("phone", "contact_phone", "phone_number"),
    orderType:     get("order_type", "order_source") || "Lender",
    reportType:    get("report_type", "type", "form"),
    fee:           get("fee", "amount", "appraisal_fee"),
    dueDate:       get("due_date", "due", "deadline", "delivery_date"),
    inspectionDate:get("inspection_date", "inspection", "inspection_datetime"),
    purpose:       get("purpose", "appraisal_purpose"),
    loanNumber:    get("loan_number", "loan_num", "loan_no", "loan"),
    notes:         get("notes", "comments", "instructions", "special_instructions"),
    status:        get("status") || "In Progress",
  };
}

// ─── Quick Start ─────────────────────────────────────────────────────────────
function QuickStart({ onSkip, onBulkImport }: { onSkip: () => void; onBulkImport: (rows: Omit<StoredOrder, "id" | "created">[]) => void }) {
  const [mode, setMode] = useState<"smart" | "csv">("smart");
  const [pasteText, setPasteText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);
  const [csvDragging, setCsvDragging] = useState(false);
  const [csvRows, setCsvRows] = useState<Omit<StoredOrder, "id" | "created">[]>([]);
  const [csvError, setCsvError] = useState("");
  const [csvFileName, setCsvFileName] = useState("");

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf") return;
    if (file.size > 25 * 1024 * 1024) return;
    setSelectedFile(file);
  };

  const handleSpreadsheet = (file: File | undefined) => {
    if (!file) return;
    const isCSV = file.name.toLowerCase().endsWith(".csv");
    const isXLSX = file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".xls");
    if (!isCSV && !isXLSX) { setCsvError("Please upload a .csv or .xlsx file."); return; }
    setCsvError("");
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = e => {
      try {
        let rows: Record<string, string>[];
        if (isCSV) {
          const text = e.target?.result as string;
          rows = parseCSV(text);
        } else {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb = xlsxRead(data, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          rows = (xlsxUtils.sheet_to_json(ws, { defval: "" }) as Record<string, unknown>[]).map(r =>
            Object.fromEntries(
              Object.entries(r).map(([k, v]) => [
                k.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
                String(v ?? ""),
              ])
            )
          );
        }
        if (rows.length === 0) { setCsvError("No rows found. Make sure the file has a header row and at least one data row."); return; }
        setCsvRows(rows.map(csvRowToOrder));
      } catch {
        setCsvError("Could not parse the file. Please check the format and try again.");
      }
    };
    if (isCSV) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  };

  const previewCols = ["address", "city", "type", "orderedBy", "dueDate", "fee"] as const;
  const previewLabels: Record<string, string> = {
    address: "Address", city: "City", type: "Type",
    orderedBy: "Client", dueDate: "Due Date", fee: "Fee",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-3xl mx-auto">
      {/* Mode tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setMode("smart")}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors ${mode === "smart" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          <Sparkles size={14} /> Smart Fill
        </button>
        <button
          onClick={() => setMode("csv")}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors ${mode === "csv" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          <FileSpreadsheet size={14} /> CSV Import
        </button>
      </div>

      {mode === "smart" && (
        <>
          <div className="px-8 pt-6 pb-4 text-center">
            <p className="text-sm text-gray-500">
              Paste an address, MLS listing, portal order copy, or order details — or drag a PDF — and we&apos;ll fill in what we can.
            </p>
          </div>

          <div className="px-6 pb-6 grid grid-cols-2 gap-4">
            {/* Paste Text */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-400 text-sm font-mono">T</span>
                <span className="text-sm font-medium text-gray-700">Paste Text</span>
              </div>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                rows={8}
                placeholder={`Paste an address, MLS listing, portal order copy, or order details...\n\nExamples:\n• 123 Main St, Austin, TX 78701\n• Copied AMC/lender portal order details\n• Order/engagement letter content`}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Upload PDF */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Upload size={13} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Upload PDF</span>
              </div>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
              <div
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragging(true); }}
                onDragLeave={e => { e.preventDefault(); setDragging(false); }}
                onDrop={e => { e.preventDefault(); e.stopPropagation(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-48 cursor-pointer transition-colors ${dragging ? "border-blue-400 bg-blue-50" : selectedFile ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                {selectedFile ? (
                  <>
                    <Check size={28} className="text-green-500 mb-2" />
                    <p className="text-sm text-green-700 font-medium text-center px-4 truncate max-w-full">{selectedFile.name}</p>
                    <p className="text-xs text-green-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    <button onClick={e => { e.stopPropagation(); setSelectedFile(null); if (fileRef.current) fileRef.current.value = ""; }} className="text-xs text-gray-400 hover:text-gray-600 mt-2 underline">Remove</button>
                  </>
                ) : (
                  <>
                    <Upload size={28} className="text-gray-300 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Drag & drop order PDF</p>
                    <p className="text-xs text-gray-400">or <span className="text-blue-600">click to browse</span></p>
                    <p className="text-xs text-gray-400 mt-1">PDF, max 25MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 pb-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors">
              <Sparkles size={15} /> Extract Details
            </button>
          </div>

          <div className="pb-5 text-center">
            <button onClick={onSkip} className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2">
              Skip – enter order details manually
            </button>
          </div>
        </>
      )}

      {mode === "csv" && (
        <div className="px-6 py-6">
          <p className="text-sm text-gray-500 mb-4">
            Upload a CSV or Excel file to import multiple orders at once. The first row must be a header row.
            Accepted columns: <span className="font-mono text-xs text-gray-600">address, city, zip, contact_name, email, phone, type, report_type, fee, due_date, status, notes</span>
          </p>

          {/* Drop zone */}
          {csvRows.length === 0 && (
            <>
              <input ref={csvRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => handleSpreadsheet(e.target.files?.[0])} />
              <div
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); setCsvDragging(true); }}
                onDragLeave={e => { e.preventDefault(); setCsvDragging(false); }}
                onDrop={e => { e.preventDefault(); e.stopPropagation(); setCsvDragging(false); handleSpreadsheet(e.dataTransfer.files?.[0]); }}
                onClick={() => csvRef.current?.click()}
                className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-40 cursor-pointer transition-colors ${csvDragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <FileSpreadsheet size={32} className="text-gray-300 mb-2" />
                <p className="text-sm text-gray-600 font-medium">Drag & drop your CSV or Excel file</p>
                <p className="text-xs text-gray-400">or <span className="text-blue-600">click to browse</span></p>
                <p className="text-xs text-gray-400 mt-1">.csv, .xlsx, .xls</p>
              </div>
              {csvError && <p className="text-xs text-red-500 mt-2 flex items-center gap-1">⚠ {csvError}</p>}
            </>
          )}

          {/* Preview table */}
          {csvRows.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet size={15} className="text-green-500" />
                  <span className="text-sm font-medium text-gray-700">{csvFileName}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{csvRows.length} order{csvRows.length !== 1 ? "s" : ""} found</span>
                </div>
                <button onClick={() => { setCsvRows([]); setCsvFileName(""); if (csvRef.current) csvRef.current.value = ""; }} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
                  <X size={13} /> Remove
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 text-gray-500 font-medium">#</th>
                        {previewCols.map(c => (
                          <th key={c} className="text-left px-3 py-2 text-gray-500 font-medium whitespace-nowrap">{previewLabels[c]}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {csvRows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                          {previewCols.map(c => (
                            <td key={c} className="px-3 py-2 text-gray-700 max-w-[140px] truncate">
                              {c === "fee" && row[c] ? `$${row[c]}` : row[c] || <span className="text-gray-300">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={() => onBulkImport(csvRows)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors"
              >
                <Check size={15} /> Import {csvRows.length} Order{csvRows.length !== 1 ? "s" : ""}
              </button>
            </>
          )}

          <div className="mt-4 text-center">
            <button onClick={onSkip} className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2">
              Skip – enter order details manually
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function NewOrderForm() {
  const router = useRouter();
  const [showManual, setShowManual] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    orderType: "", contactName: "", contactEmail: "", contactPhone: "",
    // Step 2
    address: "", city: "", state: "CA", zip: "", propertyType: "",
    // Step 3
    reportType: "", fee: "", dueDate: "", inspectionDate: "", purpose: "", loanNumber: "", notes: "", status: "In Progress",
  });

  const update = (key: string, value: string) => setFormData(d => ({ ...d, [key]: value }));

  const handleBulkImport = (rows: Omit<StoredOrder, "id" | "created">[]) => {
    rows.forEach(r => saveOrder(r));
    router.push("/orders");
  };

  const handleSubmit = () => {
    const propertyTypeLabel = PROPERTY_TYPES.find(t => t.value === formData.propertyType)?.label ?? formData.propertyType;
    const orderTypeLabels: Record<string, string> = { private_work: "Private Work", lender: "Lender", consulting: "Consulting" };
    saveOrder({
      address: formData.address,
      city: `${formData.city}, ${formData.state}`,
      state: formData.state,
      zip: formData.zip,
      property: propertyTypeLabel || "Single-Family",
      type: formData.reportType.split(" ")[0] || "GPAR",
      orderedBy: formData.contactName || "—",
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      orderType: orderTypeLabels[formData.orderType] ?? formData.orderType,
      reportType: formData.reportType,
      fee: formData.fee,
      dueDate: formData.dueDate,
      inspectionDate: formData.inspectionDate,
      purpose: formData.purpose,
      loanNumber: formData.loanNumber,
      notes: formData.notes,
      status: formData.status,
    });
    router.push("/orders");
  };

  return (
    <div className="flex flex-col flex-1">
      <PageHeader breadcrumb="New" />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Create New Order</h1>
          <p className="text-sm text-gray-500">
            {showManual ? "Fill out the form below to create a new appraisal order" : "Paste portal order text, upload an order PDF, or enter details manually"}
          </p>
        </div>

        {!showManual ? (
          <QuickStart onSkip={() => setShowManual(true)} onBulkImport={handleBulkImport} />
        ) : (
          <div className="max-w-2xl mx-auto">
            <StepIndicator step={step} />
            {step === 1 && <Step1 data={formData} onChange={update} onNext={() => setStep(2)} onCancel={() => router.push("/orders")} />}
            {step === 2 && <Step2 data={formData} onChange={update} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && <Step3 data={formData} onChange={update} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
            {step === 4 && <Step4 data={formData} onBack={() => setStep(3)} onSubmit={handleSubmit} />}
          </div>
        )}

        {/* Bottom info bar */}
        <div className="mt-6 max-w-3xl mx-auto">
          <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl px-5 py-3.5">
            <Sparkles size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-500">
              <span className="font-medium">Receive orders automatically?</span>{" "}
              Forward order emails to your import address, paste portal order details into Quick Start, or connect your AMC / Next Level Pro via webhook.{" "}
              <Link href="/settings" className="text-blue-600 hover:underline">Set up in Settings → Integrations</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading...</div>}>
      <NewOrderForm />
    </Suspense>
  );
}
