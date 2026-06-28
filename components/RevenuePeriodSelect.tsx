"use client";

import { ChevronDown } from "lucide-react";
import { getPeriodOptions, type PeriodKey } from "@/lib/revenue-filter";

export default function RevenuePeriodSelect({
  value,
  onChange,
  className = "",
}: {
  value: PeriodKey;
  onChange: (key: PeriodKey) => void;
  className?: string;
}) {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        value={value}
        onChange={e => onChange(e.target.value as PeriodKey)}
        className="appearance-none border border-gray-200 rounded-lg pl-2 pr-6 py-1 text-[11px] text-gray-600 outline-none bg-white hover:border-gray-300 cursor-pointer leading-tight"
      >
        {getPeriodOptions().map(opt => (
          <option key={opt.key} value={opt.key}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
    </div>
  );
}
