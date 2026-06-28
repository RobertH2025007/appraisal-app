export interface GmailQuoteEntry {
  id: string;
  threadId: string;
  created: string;
  orderedBy: string;
  address: string;
  city: string;
  type: "Quote";
  property: string;
  status: "Quote";
  appraiser: string;
  appointment: string;
  due: string;
  task: string;
  tag: string;
  isQuote: true;
  detail: {
    contactEmail: string;
    contactPhone: string;
    orderType: string;
    notes: string;
    reportType: string;
    fee: string;
    dueDate: string;
    inspectionDate: string;
    purpose: string;
    loanNumber: string;
    zip: string;
  };
}

const KEY = "am_gmail_quotes";

export function loadGmailQuotes(): GmailQuoteEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveGmailQuotes(quotes: GmailQuoteEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(quotes));
}
