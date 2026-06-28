"use client";

import PageHeader from "@/components/PageHeader";
import { useState } from "react";
import { User, Shield, Bell, Sliders, CreditCard, Building2, Target, Users, DollarSign, BarChart2, MapPin, UserCheck, FileImage, Workflow } from "lucide-react";

const settingsSections = [
  {
    label: "ACCOUNT",
    items: [
      { id: "profile", label: "Profile", icon: User },
      { id: "security", label: "Security", icon: Shield },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "preferences", label: "Preferences", icon: Sliders },
      { id: "billing", label: "Billing", icon: CreditCard },
    ],
  },
  {
    label: "COMPANY",
    items: [
      { id: "company", label: "Company", icon: Building2 },
      { id: "goals", label: "Goals", icon: Target },
      { id: "roles", label: "Roles", icon: Users },
      { id: "fee-schedule", label: "Fee Schedule", icon: DollarSign },
      { id: "fee-audit", label: "Fee Setup Audit", icon: BarChart2 },
      { id: "coverage", label: "Coverage Areas", icon: MapPin },
      { id: "partners", label: "Default Partners", icon: UserCheck },
      { id: "branding", label: "Invoice Branding", icon: FileImage },
    ],
  },
  {
    label: "WORKFLOW & COMMUNICATIONS",
    items: [
      { id: "workflow", label: "Workflow", icon: Workflow },
    ],
  },
];

function ProfileSettings() {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-1">Profile Settings</h2>
      <p className="text-xs text-gray-500 mb-5">Update your personal information</p>

      <div className="border border-gray-200 rounded-xl p-5 mb-4">
        <p className="text-xs font-medium text-gray-500 uppercase mb-4">PERSONAL INFORMATION</p>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white cursor-pointer hover:opacity-90">
            RH
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Profile Photo</p>
            <p className="text-xs text-gray-400">Click to upload a new photo</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
            <input defaultValue="Robert" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
            <input defaultValue="Howlett" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
            <input defaultValue="rhowlett00@gmail.com" disabled className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
            <p className="text-xs text-gray-400 mt-1">Email is managed through your account provider</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
            <input defaultValue="(626) 625-7230" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
            <input defaultValue="Certified Real Estate Appraiser" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
        </div>
        <div className="flex items-start gap-2 mb-4">
          <input type="checkbox" defaultChecked className="rounded mt-0.5" />
          <p className="text-xs text-gray-500">I agree to receive automated text messages from The Appraisal Station (e.g., route directions, order updates). Message frequency varies. Msg & data rates may apply. Reply STOP to opt out.</p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 mb-4">
        <p className="text-xs font-medium text-gray-500 uppercase mb-4">HOME ADDRESS</p>
        <p className="text-xs text-gray-400 mb-3">Your home address is used as the default starting point for mileage calculations</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Street Address</label>
            <input defaultValue="449 West Foothill Boulevard" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Street Address Line 2</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
              <input defaultValue="Upland" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
              <input defaultValue="CA" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ZIP</label>
              <input defaultValue="91786" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-5 py-2 transition-colors">
        Save Changes
      </button>
    </div>
  );
}

function NotificationsSettings() {
  const [settings, setSettings] = useState({
    newOrder: true, orderUpdate: true, invoicePaid: true, appointmentReminder: true,
    quoteSubmission: true, weeklyDigest: false, marketingEmails: false,
  });

  const toggle = (key: keyof typeof settings) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  const items = [
    { key: "newOrder", label: "New Order", desc: "When a new order is assigned to you" },
    { key: "orderUpdate", label: "Order Status Updates", desc: "When an order status changes" },
    { key: "invoicePaid", label: "Invoice Paid", desc: "When a client pays an invoice" },
    { key: "appointmentReminder", label: "Appointment Reminders", desc: "24 hours before scheduled inspections" },
    { key: "quoteSubmission", label: "Quote Form Submissions", desc: "When a client submits a quote request" },
    { key: "weeklyDigest", label: "Weekly Digest", desc: "Weekly summary of your business metrics" },
    { key: "marketingEmails", label: "Marketing Emails", desc: "Product updates and tips from The Appraisal Station" },
  ];

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-1">Notification Settings</h2>
      <p className="text-xs text-gray-500 mb-5">Choose what notifications you receive</p>
      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="text-sm text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
            <button
              onClick={() => toggle(item.key as keyof typeof settings)}
              className={`w-10 h-5 rounded-full transition-colors relative ${settings[item.key as keyof typeof settings] ? "bg-blue-600" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings[item.key as keyof typeof settings] ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalsSettings() {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-1">Business Goals</h2>
      <p className="text-xs text-gray-500 mb-5">Set your monthly and yearly revenue and order targets</p>
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Revenue Goal</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input defaultValue="20000" className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Order Goal</label>
            <input defaultValue="40" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Yearly Revenue Goal</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input defaultValue="200000" className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Yearly Order Goal</label>
            <input defaultValue="480" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-5 py-2 transition-colors">
          Save Goals
        </button>
      </div>
    </div>
  );
}

function FeeScheduleSettings() {
  const fees = [
    { type: "GPAR (1004) - Single Family", fee: "$400" },
    { type: "1073 - Condo", fee: "$450" },
    { type: "1025 - Multi-Family (2-4 units)", fee: "$500" },
    { type: "Desktop Appraisal", fee: "$250" },
    { type: "Drive-by (2055)", fee: "$200" },
    { type: "REO / Foreclosure", fee: "$475" },
    { type: "1007 - Rent Schedule", fee: "$50" },
  ];

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-1">Fee Schedule</h2>
      <p className="text-xs text-gray-500 mb-5">Set your base fees by report type</p>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">REPORT TYPE</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">BASE FEE</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee) => (
              <tr key={fee.type} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 text-sm text-gray-700">{fee.type}</td>
                <td className="px-5 py-3">
                  <input defaultValue={fee.fee} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400 w-24" />
                </td>
                <td className="px-5 py-3">
                  <button className="text-xs text-blue-600 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-gray-100">
          <button className="text-xs text-blue-600 hover:underline">+ Add report type</button>
        </div>
      </div>
    </div>
  );
}

const settingPanels: Record<string, React.ReactNode> = {
  profile: <ProfileSettings />,
  notifications: <NotificationsSettings />,
  goals: <GoalsSettings />,
  "fee-schedule": <FeeScheduleSettings />,
};

function DefaultPanel({ id }: { id: string }) {
  const label = id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
      <p className="text-sm font-medium text-gray-700 mb-1">{label} Settings</p>
      <p className="text-xs text-gray-400">Configure your {label.toLowerCase()} settings here</p>
    </div>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState("profile");

  return (
    <div className="flex flex-col flex-1">
      <PageHeader breadcrumb="Settings" />

      <div className="p-6 flex gap-5">
        {/* Sidebar Nav */}
        <div className="w-52 flex-shrink-0 space-y-4">
          {settingsSections.map((section) => (
            <div key={section.label}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 px-2">{section.label}</p>
              {section.items.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors mb-0.5 ${
                    active === id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={14} className="flex-shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {settingPanels[active] ?? <DefaultPanel id={active} />}
        </div>
      </div>
    </div>
  );
}
