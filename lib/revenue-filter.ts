export const CURRENT_YEAR = new Date().getFullYear();

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export type PeriodKey =
  | "current-month"
  | "ytd"
  | `month-${number}`
  | "q1" | "q2" | "q3" | "q4"
  | "all";

export interface PeriodOption {
  label: string;
  key: PeriodKey;
}

export function getPeriodOptions(): PeriodOption[] {
  const cur = MONTH_NAMES[new Date().getMonth()];
  return [
    { label: `Current Month (${cur} ${CURRENT_YEAR})`, key: "current-month" },
    { label: `Year to Date ${CURRENT_YEAR}`, key: "ytd" },
    ...MONTH_NAMES.map((m, i) => ({ label: `${m} ${CURRENT_YEAR}`, key: `month-${i}` as PeriodKey })),
    { label: `Q1 ${CURRENT_YEAR} (Jan–Mar)`, key: "q1" },
    { label: `Q2 ${CURRENT_YEAR} (Apr–Jun)`, key: "q2" },
    { label: `Q3 ${CURRENT_YEAR} (Jul–Sep)`, key: "q3" },
    { label: `Q4 ${CURRENT_YEAR} (Oct–Dec)`, key: "q4" },
    { label: "All Time", key: "all" },
  ];
}

export function parseRecordDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === "—") return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function inPeriod(dateStr: string, key: PeriodKey): boolean {
  if (key === "all") return true;
  const d = parseRecordDate(dateStr);
  if (!d) return false;
  const y = d.getFullYear();
  const m = d.getMonth();
  const today = new Date();
  if (key === "ytd") return y === CURRENT_YEAR && d <= today;
  if (key === "current-month") return y === CURRENT_YEAR && m === today.getMonth();
  if (key.startsWith("month-")) return y === CURRENT_YEAR && m === parseInt(key.slice(6));
  if (key === "q1") return y === CURRENT_YEAR && m < 3;
  if (key === "q2") return y === CURRENT_YEAR && m >= 3 && m < 6;
  if (key === "q3") return y === CURRENT_YEAR && m >= 6 && m < 9;
  if (key === "q4") return y === CURRENT_YEAR && m >= 9;
  return true;
}

export function periodLabel(key: PeriodKey): string {
  return getPeriodOptions().find(o => o.key === key)?.label ?? key;
}
