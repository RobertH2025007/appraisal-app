"use client";

import PageHeader from "@/components/PageHeader";
import { Navigation, MapPin, Plus, Trash2, GripVertical } from "lucide-react";
import { useState } from "react";

const defaultStops = [
  { id: 1, label: "Start", address: "449 West Foothill Blvd, Upland, CA", type: "home" },
  { id: 2, label: "Stop 1", address: "6745 Corie Ln, West Hills, CA", type: "order" },
  { id: 3, label: "Stop 2", address: "29867 Sea Breeze Way, Menifee, CA", type: "order" },
  { id: 4, label: "Stop 3", address: "1234 Sunset Blvd, Los Angeles, CA", type: "order" },
];

export default function RouteOptimizerPage() {
  const [stops, setStops] = useState(defaultStops);
  const [optimized, setOptimized] = useState(false);

  const removeStop = (id: number) => setStops(stops.filter((s) => s.id !== id));

  return (
    <div className="flex flex-col flex-1">
      <PageHeader breadcrumb="Route Optimizer" />

      <div className="p-6 flex gap-4 flex-1">
        {/* Left Panel */}
        <div className="w-80 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Route Stops</h2>
            <div className="space-y-2 mb-3">
              {stops.map((stop) => (
                <div key={stop.id} className="flex items-center gap-2 p-2 border border-gray-100 rounded-lg hover:border-gray-200">
                  <GripVertical size={14} className="text-gray-300 cursor-grab flex-shrink-0" />
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white ${stop.type === "home" ? "bg-green-500" : "bg-blue-500"}`}>
                    {stop.type === "home" ? "H" : stop.id - 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700">{stop.label}</p>
                    <p className="text-xs text-gray-400 truncate">{stop.address}</p>
                  </div>
                  {stop.type !== "home" && (
                    <button onClick={() => removeStop(stop.id)} className="p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button className="w-full flex items-center justify-center gap-1.5 border border-dashed border-gray-200 rounded-lg py-2 text-xs text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors">
              <Plus size={13} /> Add Stop
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Options</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Starting Point</label>
                <input type="text" defaultValue="449 West Foothill Blvd" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Return to start?</label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-xs text-gray-600">Yes, optimize round-trip</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Optimize for</label>
                <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-400 bg-white">
                  <option>Shortest distance</option>
                  <option>Fastest time</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setOptimized(true)}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg py-2 flex items-center justify-center gap-2 transition-colors"
            >
              <Navigation size={14} /> Optimize Route
            </button>
          </div>

          {optimized && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-800 mb-2">✅ Route Optimized!</p>
              <div className="space-y-1 text-xs text-green-700">
                <p>Total Distance: 89.4 miles</p>
                <p>Estimated Time: 2h 14min</p>
                <p>Stops: {stops.length - 1} inspections</p>
              </div>
              <button className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg py-1.5 transition-colors">
                Export to Navigation
              </button>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden relative min-h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Navigation size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium">Route Map</p>
              <p className="text-xs">Optimized route will appear here</p>
            </div>
          </div>

          {/* Simulated route pins */}
          {stops.map((stop, i) => (
            <div
              key={stop.id}
              className="absolute"
              style={{
                left: `${25 + i * 15}%`,
                top: `${20 + (i % 2) * 30}%`,
              }}
            >
              <div className={`w-6 h-6 rounded-full ${stop.type === "home" ? "bg-green-500" : "bg-blue-500"} border-2 border-white shadow-md flex items-center justify-center`}>
                <span className="text-[9px] font-bold text-white">{stop.type === "home" ? "H" : i}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
