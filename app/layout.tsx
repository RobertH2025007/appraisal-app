import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "The Appraisal Station",
  description: "Modern Appraisal Management Software",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-auto bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
