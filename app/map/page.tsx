"use client";

import PageHeader from "@/components/PageHeader";
import { MapPin, List, Filter } from "lucide-react";

const mapOrders = [
  { id: "268426-HQ58", address: "6745 Corie Ln", city: "West Hills, CA", type: "GPAR", status: "In Progress", due: "May 4, 2026", lat: 34.17, lng: -118.64 },
  { id: "268426-HDCT", address: "29867 Sea Breeze Way", city: "Menifee, CA", type: "GPAR", status: "In Progress", due: "May 3, 2026", lat: 33.68, lng: -117.18 },
  { id: "268426-ABCD", address: "1234 Sunset Blvd", city: "Los Angeles, CA", type: "GPAR", status: "At Risk", due: "Apr 28, 2026", lat: 34.09, lng: -118.33 },
  { id: "268426-EFGH", address: "5678 Oak Ave", city: "Pasadena, CA", type: "GPAR", status: "In Progress", due: "Jun 10, 2026", lat: 34.14, lng: -118.14 },
  { id: "268426-IJKL", address: "910 Pine St", city: "Glendale, CA", type: "GPAR", status: "Pending", due: "Jun 30, 2026", lat: 34.14, lng: -118.26 },
];

const statusColors: Record<string, string> = {
  "In Progress": "bg-blue-500",
  "At Risk": "bg-red-500",
  "Pending": "bg-yellow-500",
  "Completed": "bg-green-500",
};

export default function MapPage() {
  return (
    <div className="flex flex-col flex-1">
      <PageHeader breadcrumb="Map" />

      <div className="p-6 flex gap-4 flex-1">
        {/* Map placeholder */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden relative min-h-[500px]">
          {/* Map background simulation */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MapPin size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium">Interactive Map</p>
              <p className="text-xs">Orders are plotted by property address</p>
            </div>
          </div>

          {/* Simulated map pins */}
          {mapOrders.map((o, i) => (
            <div
              key={o.id}
              className="absolute group cursor-pointer"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
            >
              <div className={`w-4 h-4 rounded-full ${statusColors[o.status] ?? "bg-gray-500"} border-2 border-white shadow-md`} />
              <div className="hidden group-hover:block absolute bottom-5 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-44 z-10">
                <p className="text-xs font-semibold text-gray-800">{o.address}</p>
                <p className="text-xs text-gray-500">{o.city}</p>
                <p className="text-xs text-gray-400 mt-1">Due: {o.due}</p>
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
            <p className="text-xs font-medium text-gray-700 mb-1.5">Legend</p>
            {Object.entries(statusColors).map(([s, c]) => (
              <div key={s} className="flex items-center gap-1.5 mb-1">
                <span className={`w-2.5 h-2.5 rounded-full ${c}`} />
                <span className="text-xs text-gray-600">{s}</span>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-1">
            <button className="w-8 h-8 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center text-lg text-gray-600 hover:bg-gray-50">+</button>
            <button className="w-8 h-8 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center text-lg text-gray-600 hover:bg-gray-50">−</button>
          </div>
        </div>

        {/* Order List */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Orders on Map</p>
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-gray-100 rounded"><List size={14} className="text-gray-500" /></button>
                <button className="p-1.5 hover:bg-gray-100 rounded"><Filter size={14} className="text-gray-500" /></button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[500px]">
              {mapOrders.map((o) => (
                <div key={o.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start gap-2">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${statusColors[o.status] ?? "bg-gray-400"}`} />
                    <div>
                      <p className="text-xs font-medium text-gray-800">{o.address}</p>
                      <p className="text-xs text-gray-500">{o.city}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{o.type}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">Due {o.due}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
