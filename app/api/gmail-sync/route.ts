import { google } from "googleapis";
import type { GmailQuoteEntry } from "@/lib/gmail-quotes-store";

function field(plaintext: string, name: string): string {
  const m = plaintext.match(new RegExp(`^${name}:\\s*(.*)$`, "im"));
  return (m?.[1] ?? "").trim().replace(/,\s*$/, "").trim();
}

function splitAddress(full: string): { address: string; city: string } {
  if (!full.trim()) return { address: "", city: "" };
  // "123 Main St, Los Angeles, CA" or "123 Main St, Los Angeles CA"
  const m = full.match(/^(.+?),\s*([^,]+?),?\s*CA\b/i);
  if (m) return { address: m[1].trim(), city: `${m[2].trim()}, CA` };
  // "123 Main St Los Angeles CA" (space-separated)
  const m2 = full.match(/^(.+?)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)*),?\s*CA\b/);
  if (m2) return { address: m2[1].trim(), city: `${m2[2].trim()}, CA` };
  return { address: full, city: "" };
}

function decodeBase64(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

function parseEmail(plaintext: string, date: string, threadId: string): GmailQuoteEntry {
  const f = (name: string) => field(plaintext, name);
  const fullAddress = f("Property Address");
  const { address, city } = splitAddress(fullAddress);
  const propertyType = f("Property Type") || "Single-Family";
  const appraisalType = f("Type of Appraisal");
  const orderedBy = f("Name") || "(Unknown)";

  return {
    id: `gmail-${threadId}`,
    threadId,
    created: date,
    orderedBy,
    address,
    city,
    type: "Quote",
    property: propertyType,
    status: "Quote",
    appraiser: "Robert Ho...",
    appointment: "—",
    due: "—",
    task: "",
    tag: "",
    isQuote: true,
    detail: {
      contactEmail: f("Email"),
      contactPhone: f("Phone"),
      orderType: "Private Work",
      notes: f("Message"),
      reportType: appraisalType || "Quote",
      fee: "0",
      dueDate: "—",
      inspectionDate: "",
      purpose: "Current Market Evaluation",
      loanNumber: "",
      zip: "",
    },
  };
}

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return Response.json(
      {
        error: "Gmail credentials not configured.",
        setup: "Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN to .env.local — see .env.local.example for setup steps.",
      },
      { status: 503 }
    );
  }

  try {
    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: "v1", auth });

    const listRes = await gmail.users.threads.list({
      userId: "me",
      q: 'subject:"New Free Quote Submission" from:Robert@theappraisalstation.com',
      maxResults: 100,
    });

    const threads = listRes.data.threads ?? [];
    const quotes: GmailQuoteEntry[] = [];

    for (const t of threads) {
      if (!t.id) continue;
      const thread = await gmail.users.threads.get({ userId: "me", id: t.id, format: "full" });
      const msg = thread.data.messages?.[0];
      if (!msg) continue;

      let plaintext = "";
      const parts = msg.payload?.parts ?? [];
      const textPart = parts.find((p) => p.mimeType === "text/plain");
      if (textPart?.body?.data) {
        plaintext = decodeBase64(textPart.body.data);
      } else if (msg.payload?.body?.data) {
        plaintext = decodeBase64(msg.payload.body.data);
      }

      if (!plaintext.includes("Name:")) continue;

      const date = msg.internalDate
        ? new Date(parseInt(msg.internalDate)).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

      quotes.push(parseEmail(plaintext, date, t.id));
    }

    return Response.json({ quotes, count: quotes.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
