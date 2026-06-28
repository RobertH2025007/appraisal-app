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

const FIREBRICK = "#8B1A1A";
const GOLD = "#FFD700";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const vol: number = payload.find((p: any) => p.dataKey === "orders")?.value ?? 0;
  const trend: number = payload.find((p: any) => p.dataKey === "trend")?.value ?? 0;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-xs">
      <p className="font-semibold text-black mb-1">{label}</p>
      {vol > 0 && <p style={{ color: FIREBRICK }}>Orders: <span className="font-medium">{vol}</span></p>}
      <p className="text-gray-400">Trend: <span className="font-medium">{trend.toFixed(1)}</span></p>
    </div>
  );
}

interface Props {
  entries: { date: string }[];
  year?: number;
}

export default function OrderVolumeChart({ entries, year = new Date().getFullYear() }: Props) {
  const today = new Date();
  const curMonth = today.getMonth();

  const monthly = MONTHS.map((_, i) =>
    entries.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === i;
    }).length
  );

  const trend = linearRegression(monthly);

  const data = MONTHS.map((m, i) => ({
    month: m,
    orders: monthly[i],
    trend: parseFloat(trend[i].toFixed(2)),
  }));

  const ytdTotal = monthly.slice(0, curMonth + 1).reduce((s, v) => s + v, 0);
  const trendUp = trend[11] - trend[0] > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Order Volume · {year}</h2>
          <p className="text-xs text-gray-400 mt-0.5">All orders by month received</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: GOLD, border: "1px solid #D4A017" }} />
              Monthly
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="6"><line x1="0" y1="3" x2="14" y2="3" stroke={FIREBRICK} strokeWidth="2" strokeDasharray="3 2"/></svg>
              Trendline
            </span>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-400">YTD {year}</p>
            <div className="flex items-center gap-1 justify-end">
              <p className="text-base font-bold" style={{ color: FIREBRICK }}>{ytdTotal}</p>
              {ytdTotal > 0 && (
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
            width={28}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
          <Bar dataKey="orders" name="Orders" maxBarSize={32} radius={[3, 3, 0, 0]} fill={GOLD} />
          <Line type="linear" dataKey="trend" name="Trend" stroke={FIREBRICK} strokeWidth={2} strokeDasharray="4 2" dot={false} activeDot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
