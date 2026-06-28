"use client";

import Link from "next/link";
import { Bell, Sparkles } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
  breadcrumb: string;
  actions?: ReactNode;
}

export default function PageHeader({ breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-gray-700">Portal</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{breadcrumb}</span>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <button className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors">
          <Sparkles size={12} />
          Ask AI
        </button>
        <button className="relative p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
          <Bell size={18} />
        </button>
      </div>
    </div>
  );
}
