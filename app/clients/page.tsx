"use client";

import PageHeader from "@/components/PageHeader";
import { Plus, Filter, Download, Copy, Mail, Phone, MoreHorizontal } from "lucide-react";
import { useState } from "react";

const clients = [
  { name: "Abraham Saucedo", type: "individual", contact: true, email: true, location: ".", orders: 1, active: 0, terms: "Net 30", lastOrder: "Apr 22, 2026" },
  { name: "Amelia Ward", type: "individual", contact: true, email: true, location: ".", orders: 1, active: 0, terms: "Net 30", lastOrder: "Apr 11, 2026" },
  { name: "Ana McGee", type: "individual", contact: true, email: true, location: ".", orders: 1, active: 0, terms: "Net 30", lastOrder: "Apr 13, 2026" },
  { name: "Andrea Jackson", type: "individual", contact: true, email: true, location: ".", orders: 1, active: 0, terms: "Net 30", lastOrder: "Apr 13, 2026" },
  { name: "Anne Shim", type: "individual", contact: true, email: true, location: ".", orders: 2, active: 0, terms: "Net 30", lastOrder: "Apr 11, 2026" },
  { name: "April Norton", type: "individual", contact: true, email: true, location: ".", orders: 1, active: 0, terms: "Net 30", lastOrder: "Apr 11, 2026" },
  { name: "Bernice Chu", type: "individual", contact: true, email: true, location: ".", orders: 1, active: 0, terms: "Net 30", lastOrder: "Apr 11, 2026" },
  { name: "Betsy Colleen Tuggle", type: "individual", contact: true, email: true, location: ".", orders: 1, active: 0, terms: "Net 30", lastOrder: "Apr 11, 2026" },
  { name: "Bonnie Denehy", type: "individual", contact: true, email: true, location: ".", orders: 1, active: 0, terms: "Net 30", lastOrder: "Apr 11, 2026" },
  { name: "Chad & Lucy Washam", type: "individual", contact: true, email: true, location: ".", orders: 1, active: 0, terms: "Net 30", lastOrder: "Apr 13, 2026" },
  { name: "Claire Thomas", type: "individual", contact: true, email: true, location: ".", orders: 1, active: 0, terms: "Net 30", lastOrder: "Apr 11, 2026" },
  { name: "Colvent Group", type: "other", contact: true, email: true, location: ".", orders: 1, active: 0, terms: "Net 30", lastOrder: "Apr 13, 2026" },
];

export default function ClientsPage() {
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        breadcrumb="Clients"
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 bg-white">
              <Copy size={12} /> Check for duplicates
            </button>
            <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 bg-white">
              <Download size={12} /> Export
            </button>
            <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg px-3 py-1.5">
              <Plus size={13} /> New Client
            </button>
          </div>
        }
      />

      <div className="p-6">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500">Manage your clients and track their order history</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {[
            { label: "TOTAL CLIENTS", value: "74" },
            { label: "ACTIVE CLIENTS", value: "74" },
            { label: "PENDING", value: "0" },
            { label: "INACTIVE", value: "0" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-400 uppercase font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients by name, contact, email..."
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 outline-none focus:border-blue-400 w-64"
            />
            <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
              <Filter size={12} /> Filters
            </button>
            <div className="ml-auto text-xs text-gray-500">{filtered.length} clients found</div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
            <input type="checkbox" className="rounded" />
            <span className="text-xs text-blue-600 hover:underline cursor-pointer">Select clients to merge duplicates</span>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-2.5 w-8"><input type="checkbox" className="rounded" /></th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">STATUS</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">CLIENT NAME ↕</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">CONTACT ↕</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">EMAIL</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">LOCATION</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">TOTAL ORDERS ↕</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">ACTIVE ↕</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">PAYMENT TERMS</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">LAST ORDER ↕</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-xs text-gray-600">Active</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800 cursor-pointer hover:text-blue-600">{client.name}</p>
                        <p className="text-[10px] text-gray-400">{client.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {client.contact && <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"><Phone size={12} /></button>}
                  </td>
                  <td className="px-4 py-3">
                    {client.email && <button className="p-1 hover:bg-gray-100 rounded text-blue-400 hover:text-blue-600"><Mail size={12} /></button>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{client.location}</td>
                  <td className="px-4 py-3 text-xs text-gray-700">{client.orders}</td>
                  <td className="px-4 py-3 text-xs text-blue-600 cursor-pointer hover:underline">{client.active}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{client.terms}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{client.lastOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
