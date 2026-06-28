"use client";

import PageHeader from "@/components/PageHeader";
import { useState } from "react";
import { Search, MapPin, Users, Download, Star, Phone, Mail, Building2 } from "lucide-react";

const savedProspects = [
  { name: "Beverly Hills Realty Group", type: "Real Estate Agency", address: "9876 Wilshire Blvd, Beverly Hills, CA", phone: "(310) 555-0123", email: "info@bhrg.com", saved: true },
  { name: "Pacific Coast Lending", type: "Mortgage Lender", address: "234 Ocean Ave, Santa Monica, CA", phone: "(310) 555-0456", email: "loans@pcl.com", saved: true },
  { name: "Valley Home Buyers", type: "Real Estate Agency", address: "5678 Ventura Blvd, Sherman Oaks, CA", phone: "(818) 555-0789", email: "contact@vhb.com", saved: true },
];

const searchHistory = [
  { query: "real estate agent", location: "West Hills, CA 91307", radius: "5 miles", date: "Jun 20, 2026", results: 14 },
  { query: "mortgage broker", location: "Pasadena, CA", radius: "10 miles", date: "Jun 15, 2026", results: 8 },
  { query: "lender", location: "Los Angeles, CA", radius: "15 miles", date: "Jun 10, 2026", results: 31 },
];

export default function ProspectingPage() {
  const [tab, setTab] = useState("Search");
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState("5");
  const [searched, setSearched] = useState(false);

  const tabs = ["Search", "Saved Prospects", "Search History"];

  const mockResults = [
    { name: "Westside Premier Realty", type: "Real Estate Agency", address: "1234 Maple Ave, West Hills, CA", phone: "(818) 555-1234", email: "info@wpr.com", decision_maker: "Jane Smith, Broker" },
    { name: "SoCal Home Loans", type: "Mortgage Lender", address: "5678 Oak St, Canoga Park, CA", phone: "(818) 555-5678", email: "loans@shl.com", decision_maker: "Mike Johnson, VP" },
    { name: "Valley Estates", type: "Real Estate Agency", address: "9012 Pine Rd, Woodland Hills, CA", phone: "(818) 555-9012", email: "sales@ve.com", decision_maker: "Sarah Lee, Owner" },
  ];

  return (
    <div className="flex flex-col flex-1">
      <PageHeader breadcrumb="Prospecting" />

      <div className="p-6">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-gray-900">Prospecting</h1>
          <p className="text-sm text-gray-500">Find potential clients in your area and get their contact information</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5 border-b border-gray-200">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Search" && (
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">FIND YOUR NEXT CLIENT</h2>
              <p className="text-xs text-gray-500 mb-4">Search for businesses in your area, discover decision-makers, and export or save their contact info.</p>

              <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                {["Search", "Get Contacts", "Save & Export"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    {i > 0 && <span className="text-gray-300">→</span>}
                    <div className="flex items-center gap-1.5">
                      {i === 0 && <Search size={12} />}
                      {i === 1 && <Users size={12} />}
                      {i === 2 && <Download size={12} />}
                      <span>{step}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 text-xs text-amber-700">
                No contact enrichments remaining this month. <button className="text-blue-600 hover:underline">Get more leads</button>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Search Keyword / Business Name</label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g., dentist, lawyer, plumber"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <MapPin size={11} className="inline mr-1" />Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Houston, TX 77002"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Radius</label>
                  <select
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white"
                  >
                    <option>5 miles</option>
                    <option>10 miles</option>
                    <option>15 miles</option>
                    <option>25 miles</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setSearched(true)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
                  >
                    <Search size={14} /> Search
                  </button>
                </div>
              </div>
            </div>

            {!searched ? (
              <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
                <div className="flex items-center justify-center gap-12 mb-6">
                  {[
                    { icon: Search, title: "Search Nearby", desc: "Find businesses by type and location within your service area" },
                    { icon: Users, title: "Get Contact Info", desc: "Discover emails and phone numbers for decision-makers" },
                    { icon: Download, title: "Save & Export", desc: "Save leads or export to CSV to build your pipeline" },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="max-w-xs text-center">
                      <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Icon size={18} className="text-green-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">{title}</p>
                      <p className="text-xs text-gray-400 mt-1">{desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400">Enter a search above to get started</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-700">{mockResults.length} results found near {location || "your area"}</p>
                  <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                    <Download size={12} /> Export All
                  </button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">BUSINESS</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">CONTACT</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">DECISION MAKER</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockResults.map((r) => (
                      <tr key={r.name} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Building2 size={12} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-800">{r.name}</p>
                              <p className="text-xs text-gray-400">{r.type}</p>
                              <p className="text-xs text-gray-400">{r.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="text-xs text-gray-600 flex items-center gap-1"><Phone size={10} /> {r.phone}</p>
                            <p className="text-xs text-blue-600 flex items-center gap-1"><Mail size={10} /> {r.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{r.decision_maker}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-yellow-500"><Star size={13} /></button>
                            <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-2 py-1 transition-colors">Save Lead</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "Saved Prospects" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700">{savedProspects.length} saved prospects</p>
              <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                <Download size={12} /> Export
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">BUSINESS</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">CONTACT</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {savedProspects.map((p) => (
                  <tr key={p.name} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.type} · {p.address}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-600">{p.phone}</p>
                      <p className="text-xs text-blue-600">{p.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-2 py-1">Create Order</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "Search History" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">SEARCH</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">LOCATION</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">DATE</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">RESULTS</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {searchHistory.map((h, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-medium text-gray-800">{h.query}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{h.location} · {h.radius}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{h.date}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{h.results} found</td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-blue-600 hover:underline">Run again</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
