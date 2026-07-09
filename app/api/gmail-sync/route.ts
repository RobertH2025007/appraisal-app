import { google } from "googleapis";
import type { GmailQuoteEntry } from "@/lib/gmail-quotes-store";

function field(plaintext: string, name: string): string {
  const m = plaintext.match(new RegExp(`^${name}:\\s*(.*)$`, "im"));
  return (m?.[1] ?? "").trim().replace(/,\s*$/, "").trim();
}

function splitAddress(full: string): { address: string; city: string } {
  if (!full.trim()) return { address: "", city: "" };
  const m = full.match(/^(.+?),\s*([^,]+?),?\s*CA\b/i);
  if (m) return { address: m[1].trim(), city: `${m[2].trim()}, CA` };
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
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

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

    // Write new submissions to Google Sheet
    let sheetsAdded = 0;
    if (spreadsheetId && quotes.length > 0) {
      try {
        const sheets = google.sheets({ version: "v4", auth });

        // Read existing thread IDs from column O (used for dedup)
        const existingRes = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "Phone Tracking!O:O",
        });
        const existingThreadIds = new Set(
          (existingRes.data.values ?? []).flat().filter(Boolean)
        );

        const newRows = quotes
          .filter((q) => !existingThreadIds.has(q.threadId))
          .map((q) => [
            q.created,          // A: Date
            q.orderedBy,        // B: Client Name
            [q.address, q.city].filter(Boolean).join(", "), // C: Address
            q.detail.contactPhone, // D: Phone
            q.detail.contactEmail, // E: Email
            "Form Completion",  // F: Lead Source
            q.detail.reportType || "", // G: Appraisal Type
            "",                 // H: Contacted
            "No Response",      // I: Status
            "$0.00",            // J: Quote
            "",                 // K: Revenue
            "",                 // L: Intent
            "",                 // M: Comments
            "",                 // N: SEO
            q.threadId,         // O: Thread ID (dedup)
          ]);

        if (newRows.length > 0) {
          // Read columns B–E (name, address, phone, email) for position detection and dedup.
          const colBERes = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Phone Tracking!B:E",
          });
          const beVals = colBERes.data.values ?? [];

          // Dedup by email (column E, index 3) — exact format, no normalization ambiguity.
          // Skip the check when email is empty so blank-email rows aren't falsely deduped.
          const existingEmails = new Set(
            beVals.map((row) => (row[3] ?? "").trim().toLowerCase()).filter(Boolean)
          );

          // Scan column B for insert position, stopping at the first gap of 2+ empty rows.
          // This prevents the scan from wandering into the law-firm/analytics sections below.
          let lastLeadRow = 1;
          let emptyRun = 0;
          for (let i = 0; i < beVals.length; i++) {
            const name = (beVals[i]?.[0] ?? "").trim();
            if (name) {
              lastLeadRow = i + 1; // 1-indexed
              emptyRun = 0;
            } else {
              emptyRun++;
              if (emptyRun >= 2) break;
            }
          }
          const insertRow = lastLeadRow + 1;

          // Filter by email dedup (row[4] = column E in the 15-value row array)
          const dedupedRows = newRows.filter((row) => {
            const email = (row[4] as string ?? "").trim().toLowerCase();
            return !email || !existingEmails.has(email);
          });

          if (dedupedRows.length > 0) {
            await sheets.spreadsheets.values.update({
              spreadsheetId,
              range: `Phone Tracking!A${insertRow}`,
              valueInputOption: "USER_ENTERED",
              requestBody: { values: dedupedRows },
            });
            sheetsAdded = dedupedRows.length;
          }
        }
      } catch (sheetErr) {
        console.error("Sheets write error:", sheetErr);
      }
    }

    return Response.json({ quotes, count: quotes.length, sheetsAdded });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
