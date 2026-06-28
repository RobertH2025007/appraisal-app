"use client";

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function linearRegression(values: number[]): number[] {
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((s, v) => s + v, 0) / n;
  const num = values.reduce((s, v, i) => s + (i - xMean) * (v - yMean), 0);
  const den = values.reduce((s, _, i) => s + (i - xMean) ** 2, 0);
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  return values.map((_, i) => Math.max(0, slope * i + intercept));
}

interface Entry { date: string; amount: number; }

interface Props {
  entries: Entry[];
  year?: number;
}

const FIREBRICK = "#8B1A1A";
const GOLD = "#FFD700";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const rev: number = payload.find((p: any) => p.dataKey === "revenue")?.value ?? 0;
  const trend: number = payload.find((p: any) => p.dataKey === "trend")?.value ?? 0;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-xs">
      <p className="font-semibold text-black mb-1">{label}</p>
      {rev > 0 && <p style={{ color: FIREBRICK }}>Revenue: <span className="font-medium">${rev.toLocaleString()}</span></p>}
      <p className="text-gray-400">Trend: <span className="font-medium">${Math.round(trend).toLocaleString()}</span></p>
    </div>
  );
}

export default function RevenueChart({ entries, year = new Date().getFullYear() }: Props) {
  const today = new Date();
  const curMonth = today.getMonth();

  const monthly = MONTHS.map((_, i) =>
    entries
      .filter(e => { const d = new Date(e.date); return d.getFullYear() === year && d.getMonth() === i; })
      .reduce((s, e) => s + e.amount, 0)
  );

  const trend = linearRegression(monthly);

  const data = MONTHS.map((m, i) => ({
    month: m,
    revenue: monthly[i],
    trend: Math.round(trend[i]),
    isCurrent: i === curMonth,
  }));

  const ytd = monthly.slice(0, curMonth + 1).reduce((s, v) => s + v, 0);
  const trendSlope = trend[11] - trend[0];
  const trendUp = trendSlope > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Revenue · {year}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Completed &amp; paid orders</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: FIREBRICK }} />
              Monthly
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="6"><line x1="0" y1="3" x2="14" y2="3" stroke={GOLD} strokeWidth="2" strokeDasharray="3 2"/></svg>
              Trendline
            </span>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-400">YTD {year}</p>
            <div className="flex items-center gap-1 justify-end">
              <p className="text-base font-bold" style={{ color: FIREBRICK }}>${ytd.toLocaleString()}</p>
              {ytd > 0 && (
                <span className={`text-[10px] font-medium px-1 py-0.5 rounded ${trendUp ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                  {trendUp ? "↑" : "↓"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="month"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tick={(props: any) => {
              const { x, y, payload } = props;
              const isCur = payload.index === curMonth;
              return (
                <text x={x} y={y + 10} textAnchor="middle" fontSize={10}
                  fill={isCur ? FIREBRICK : "#9ca3af"}
                  fontWeight={isCur ? 700 : 400}>
                  {payload.value}
                </text>
              );
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
          <Bar dataKey="revenue" name="Revenue" maxBarSize={32} radius={[3, 3, 0, 0]} fill={FIREBRICK} />
          <Line type="linear" dataKey="trend" name="Trend" stroke={GOLD} strokeWidth={2} strokeDasharray="4 2" dot={false} activeDot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
