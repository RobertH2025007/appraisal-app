"use client";

import PageHeader from "@/components/PageHeader";
import { useState } from "react";
import { Search, BookOpen, ChevronRight } from "lucide-react";

const categories = [
  {
    title: "Property Characteristics",
    items: ["Location", "Site Area", "View", "Design (Style)", "Quality of Construction", "Age", "Condition", "Above Grade Room Count", "Gross Living Area", "Basement & Finished Rooms", "Functional Utility", "Heating/Cooling", "Energy Efficient Items", "Garage/Carport", "Porch/Patio/Deck"],
  },
  {
    title: "Sale/Financing Concessions",
    items: ["Seller Concessions", "Financing Concessions", "Date of Sale/Time", "Adjustment Ranges"],
  },
  {
    title: "Income Approach",
    items: ["Gross Rent Multiplier", "Monthly Market Rent", "Indicated Value"],
  },
  {
    title: "Condition Ratings (C1-C6)",
    items: ["C1 - New construction", "C2 - No deferred maintenance", "C3 - Well-maintained", "C4 - Adequately maintained", "C5 - Obvious deferred maintenance", "C6 - Substantial damage"],
  },
  {
    title: "Quality Ratings (Q1-Q6)",
    items: ["Q1 - Unique/exceptional", "Q2 - Excellent", "Q3 - Above average", "Q4 - Average", "Q5 - Below average", "Q6 - Lowest quality"],
  },
  {
    title: "View Ratings",
    items: ["Neutral", "Beneficial", "Adverse"],
  },
];

const conditionDescriptions: Record<string, string> = {
  "C1 - New construction": "The improvements have been very recently constructed and have not previously been occupied. The entire structure and all components are new and the dwelling features no physical depreciation.",
  "C2 - No deferred maintenance": "The improvements feature no deferred maintenance, little or no physical depreciation, and require no repairs. Virtually all building components are new or have been recently repaired, refinished, or rehabilitated.",
  "C3 - Well-maintained": "The improvements are well-maintained and feature limited physical depreciation due to normal wear and tear. Some components, but not every major building component, may be updated or recently rehabilitated.",
  "C4 - Adequately maintained": "The improvements feature some minor deferred maintenance and physical deterioration due to normal wear and tear. The dwelling has been adequately maintained and requires only minimal repairs to building components/mechanical systems and cosmetic repairs.",
  "C5 - Obvious deferred maintenance": "The improvements feature obvious deferred maintenance and are in need of some significant repairs. Some building components need repairs, rehabilitation, or updating. The functional utility and overall livability is somewhat diminished due to condition, but the dwelling remains useable and functional as a residence.",
  "C6 - Substantial damage": "The improvements have substantial damage or deferred maintenance with deficiencies or defects that are severe enough to affect the safety, soundness, or structural integrity of the improvements.",
};

export default function UADReferencePage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col flex-1">
      <PageHeader breadcrumb="UAD 3.6 Reference" />

      <div className="p-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={18} className="text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">UAD 3.6 Reference</h1>
          </div>
          <p className="text-sm text-gray-500">Uniform Appraisal Dataset field definitions, condition and quality ratings, and abbreviations</p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search UAD fields, ratings, abbreviations..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Category List */}
          <div className="col-span-1 space-y-3">
            {categories.map((cat) => (
              <div key={cat.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-700">{cat.title}</p>
                </div>
                <div className="p-1">
                  {cat.items
                    .filter((item) => !search || item.toLowerCase().includes(search.toLowerCase()))
                    .map((item) => (
                      <button
                        key={item}
                        onClick={() => setSelected(item)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          selected === item ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {item}
                        <ChevronRight size={11} className="text-gray-300" />
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          <div className="col-span-2">
            {selected ? (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-3">{selected}</h2>
                {conditionDescriptions[selected] ? (
                  <p className="text-sm text-gray-600 leading-relaxed">{conditionDescriptions[selected]}</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      This UAD field relates to <strong>{selected}</strong>. Appraisers must use standardized UAD abbreviations and ratings when completing form reports for Fannie Mae and Freddie Mac.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-blue-800 mb-1">UAD Requirement</p>
                      <p className="text-xs text-blue-700">This field requires standardized data entry per UAD 3.6 specifications effective for appraisals with effective dates on or after June 1, 2026.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center h-64 text-center">
                <div>
                  <BookOpen size={32} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-sm text-gray-400">Select a field from the left to view its definition</p>
                </div>
              </div>
            )}

            {/* Quick Reference Card */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Condition Ratings Summary</p>
                <div className="space-y-1">
                  {["C1", "C2", "C3", "C4", "C5", "C6"].map((c, i) => (
                    <div key={c} className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded text-white ${
                        i < 2 ? "bg-green-500" : i < 4 ? "bg-yellow-500" : "bg-red-500"
                      }`}>{c}</span>
                      <span className="text-xs text-gray-500">
                        {["New construction", "Excellent condition", "Well maintained", "Adequate condition", "Deferred maintenance", "Major damage"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Quality Ratings Summary</p>
                <div className="space-y-1">
                  {["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"].map((q, i) => (
                    <div key={q} className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded text-white ${
                        i < 2 ? "bg-blue-500" : i < 4 ? "bg-indigo-500" : "bg-gray-500"
                      }`}>{q}</span>
                      <span className="text-xs text-gray-500">
                        {["Unique/exceptional", "Excellent quality", "Above average", "Average quality", "Below average", "Lowest quality"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
