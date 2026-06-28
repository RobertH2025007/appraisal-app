"use client";

import PageHeader from "@/components/PageHeader";
import { Search, MessageCircle, BookOpen, Video, ChevronRight, ExternalLink } from "lucide-react";
import { useState } from "react";

const articles = [
  { title: "Getting Started with The Appraisal Station", category: "Getting Started", time: "5 min read" },
  { title: "How to Create Your First Order", category: "Orders", time: "3 min read" },
  { title: "Setting Up Your Fee Schedule", category: "Settings", time: "4 min read" },
  { title: "Understanding Invoice Statuses", category: "Invoices", time: "2 min read" },
  { title: "Using the Route Optimizer", category: "Route Optimizer", time: "3 min read" },
  { title: "Embedding Quote Forms on Your Website", category: "Quote Forms", time: "6 min read" },
  { title: "UAD 3.6 Compliance Overview", category: "Compliance", time: "8 min read" },
  { title: "Connecting Your Calendar", category: "Calendar", time: "3 min read" },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");

  const filtered = articles.filter((a) =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1">
      <PageHeader breadcrumb="Help & Support" />

      <div className="p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">How can we help?</h1>
          <p className="text-gray-500 mb-5">Search our knowledge base or browse articles below</p>
          <div className="relative max-w-lg mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help articles..."
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-400 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          {[
            { icon: MessageCircle, label: "Live Chat", desc: "Chat with support", color: "text-blue-600 bg-blue-50" },
            { icon: Video, label: "Video Tutorials", desc: "Watch walkthroughs", color: "text-purple-600 bg-purple-50" },
            { icon: BookOpen, label: "Documentation", desc: "Browse all articles", color: "text-green-600 bg-green-50" },
          ].map(({ icon: Icon, label, desc, color }) => (
            <button key={label} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </button>
          ))}
        </div>

        {/* Articles */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Popular Articles</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {filtered.map((article, i) => (
              <button
                key={i}
                className="w-full flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors text-left"
              >
                <div>
                  <p className="text-sm text-gray-800 font-medium">{article.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{article.category}</span>
                    <span className="text-xs text-gray-400">{article.time}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                No articles found for "{search}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
