export interface StoredOrder {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  property: string;
  type: string;
  orderedBy: string;
  contactEmail: string;
  contactPhone: string;
  orderType: string;
  reportType: string;
  fee: string;
  dueDate: string;
  inspectionDate: string;
  purpose: string;
  loanNumber: string;
  notes: string;
  status: string;
  created: string;
}

const KEY = "am_orders";

function generateId(): string {
  const now = new Date();
  const date = `${String(now.getDate()).padStart(2, "0")}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getFullYear()).slice(-2)}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${date}-${rand}`;
}

export function saveOrder(data: Omit<StoredOrder, "id" | "created"> & { status?: string }): StoredOrder {
  const order: StoredOrder = {
    ...data,
    id: generateId(),
    status: data.status || "In Progress",
    created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };
  const existing = loadOrders();
  localStorage.setItem(KEY, JSON.stringify([order, ...existing]));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("am-orders-updated"));
  }
  return order;
}

export function updateOrderStatus(id: string, status: string): void {
  const orders = loadOrders().map(o => o.id === id ? { ...o, status } : o);
  localStorage.setItem(KEY, JSON.stringify(orders));
}

export function loadOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function deleteOrder(id: string): void {
  const filtered = loadOrders().filter(o => o.id !== id);
  localStorage.setItem(KEY, JSON.stringify(filtered));
}

export interface OrderDetailState {
  completedSteps?: number[];
  isPaid?: boolean;
  paymentRecord?: { method: string; amount: string; date: string; reference: string; notes: string };
  localAddress?: string;
  localCity?: string;
  localState?: string;
  localZip?: string;
  status?: string;
  lineItems?: { id: number; label: string; amount: string }[];
  quoteStatus?: string;
  quoteFee?: string;
  statusDate?: string;
  prospectStatus?: string;
  prospectProperty?: string;
  prospectNotes?: string;
  prospectName?: string;
  prospectEmail?: string;
  prospectPhone?: string;
  localType?: string;
  localProperty?: string;
  orderEmail?: string;
  orderPhone?: string;
}

const detailKey = (id: string) => `am_detail_${id}`;

export function loadOrderDetail(id: string): OrderDetailState {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(detailKey(id)) ?? "{}"); }
  catch { return {}; }
}

export function saveOrderDetail(id: string, state: OrderDetailState): void {
  localStorage.setItem(detailKey(id), JSON.stringify(state));
}
