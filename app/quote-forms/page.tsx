"use client";

import PageHeader from "@/components/PageHeader";
import { Plus, MoreHorizontal, ExternalLink, Copy } from "lucide-react";
import { useState } from "react";

const forms = [
  {
    id: "f1",
    name: "New Quote Form",
    url: "/f/3ma0c13b",
    type: "Standard",
    status: "Active",
    views: 0,
    submissions: 0,
    conversion: null,
  },
];

export default function QuoteFormsPage() {
  const [tab, setTab] = useState("All Forms");
  const tabs = ["All Forms", "Standard", "Instant Quote"];

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        breadcrumb="Quote Forms"
        actions={
          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg px-3 py-1.5">
            <Plus size={13} /> New Quote Form
          </button>
        }
      />

      <div className="p-6">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-gray-900">Quote Forms</h1>
          <p className="text-sm text-gray-500">Manage your embeddable quote forms and instant quote forms.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {[
            { label: "TOTAL FORMS", value: "1" },
            { label: "TOTAL VIEWS", value: "0" },
            { label: "TOTAL SUBMISSIONS", value: "0" },
            { label: "AVG. CONVERSION", value: "—" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-400 uppercase font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                tab === t ? "bg-white border border-gray-200 text-gray-900 shadow-sm font-medium" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "Instant Quote" && <span className="mr-1">⚡</span>}
              {t}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">FORM</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">TYPE</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">STATUS</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">VIEWS</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">SUBMISSIONS</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">CONVERSION</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => (
                <tr key={form.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-800 cursor-pointer hover:text-blue-600">{form.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-xs text-gray-400">{form.url}</p>
                      <button className="p-0.5 hover:bg-gray-100 rounded text-gray-300 hover:text-gray-500">
                        <Copy size={10} />
                      </button>
                      <button className="p-0.5 hover:bg-gray-100 rounded text-gray-300 hover:text-gray-500">
                        <ExternalLink size={10} />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">
                      ☐ {form.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                      ● {form.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{form.views}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{form.submissions}</td>
                  <td className="px-5 py-4 text-sm text-gray-400">{form.conversion ?? "—"}</td>
                  <td className="px-5 py-4">
                    <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Standard Quote Form</h3>
            <p className="text-xs text-blue-700 mb-3">Embed a fully customizable form on your website. Clients submit their property details and you respond with a quote.</p>
            <button className="text-xs text-blue-600 font-medium hover:text-blue-800">Get embed code →</button>
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-purple-900 mb-1 flex items-center gap-1"><span>⚡</span> Instant Quote Form</h3>
            <p className="text-xs text-purple-700 mb-3">Let clients get an instant price estimate based on your fee schedule. Great for converting website visitors.</p>
            <button className="text-xs text-purple-600 font-medium hover:text-purple-800">Create instant quote →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
