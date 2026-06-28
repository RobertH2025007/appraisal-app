"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Sun,
  LayoutDashboard,
  ClipboardList,
  Receipt,
  Calendar,
  Map,
  Navigation,
  Users,
  BarChart2,
  FileText,
  Search,
  BookOpen,
  HelpCircle,
  Settings,
  Plus,
  ChevronDown,
  FileEdit,
} from "lucide-react";

const navGroups = [
  {
    label: "MAIN",
    items: [
      { href: "/today", label: "Today", icon: Sun },
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/orders", label: "Orders", icon: ClipboardList },
      { href: "/invoices", label: "Invoices", icon: Receipt },
      { href: "/calendar", label: "Calendar", icon: Calendar },
      { href: "/map", label: "Map", icon: Map },
      { href: "/route-optimizer", label: "Route Optimizer", icon: Navigation },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { href: "/clients", label: "Clients", icon: Users },
    ],
  },
  {
    label: "INSIGHTS",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart2 },
    ],
  },
  {
    label: "MARKETING",
    items: [
      { href: "/quote-forms", label: "Quote Forms", icon: FileText },
      { href: "/prospecting", label: "Prospecting", icon: Search },
    ],
  },
  {
    label: "RESOURCES",
    items: [
      { href: "/reference/uad-36", label: "UAD 3.6 Reference", icon: BookOpen },
      { href: "/help", label: "Help & Support", icon: HelpCircle },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/") return true;
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-52 min-h-screen bg-[#16181d] flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-700/50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-[10px] leading-tight text-center">
            TAS
          </div>
          <span className="text-white text-xs font-semibold leading-tight">The Appraisal<br/>Station</span>
        </Link>
      </div>

      {/* New Order Button with dropdown */}
      <div className="px-3 pt-4 pb-2 relative" ref={dropdownRef}>
        <div className="flex rounded-lg overflow-hidden">
          {/* Main button — goes directly to New Order */}
          <button
            onClick={() => { setDropdownOpen(false); router.push("/orders/new"); }}
            className="flex items-center gap-2 flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 transition-colors"
          >
            <Plus size={15} />
            <span>New Order</span>
          </button>
          {/* Chevron toggle */}
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="bg-blue-700 hover:bg-blue-800 text-white px-2 py-2 transition-colors border-l border-blue-500"
            aria-label="More create options"
          >
            <ChevronDown size={14} className={`text-blue-200 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="absolute left-3 right-3 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
            <button
              onClick={() => { setDropdownOpen(false); router.push("/orders/new"); }}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ClipboardList size={14} className="text-blue-500 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium">New Order</p>
                <p className="text-xs text-gray-400">Create a new appraisal order</p>
              </div>
            </button>
            <div className="h-px bg-gray-100" />
            <button
              onClick={() => { setDropdownOpen(false); router.push("/orders/new?type=quote"); }}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileEdit size={14} className="text-purple-500 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium">New Quote</p>
                <p className="text-xs text-gray-400">Send a quote to a client</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 bg-[#1e2028] rounded-lg px-3 py-2 border border-gray-700/40">
          <Search size={13} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search orders, clients..."
            className="bg-transparent text-xs text-gray-400 placeholder-gray-600 outline-none w-full"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-4 pb-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {group.label}
            </p>
            {group.items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors mb-0.5 ${
                  isActive(href)
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <Icon size={15} className="flex-shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="px-3 py-3 border-t border-gray-700/50 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
          RH
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-200 truncate">Robert Howlett</p>
          <p className="text-[10px] text-gray-500 truncate">ACCOUNT</p>
        </div>
        <Settings size={13} className="text-gray-500 flex-shrink-0 cursor-pointer hover:text-gray-300" />
      </div>
    </div>
  );
}
