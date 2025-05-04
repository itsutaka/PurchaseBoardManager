import React from "react";
import { RequestBoardProvider } from "@/hooks/use-request-board";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">採購需求告示牌</h1>
          </div>
        </div>
      </header>
      
      <RequestBoardProvider>
        {children}
      </RequestBoardProvider>
      
      {/* This is a replit script which adds a banner on the top of the page when opened in development mode outside the replit environment */}
      <script type="text/javascript" src="https://replit.com/public/js/replit-dev-banner.js"></script>
    </div>
  );
}
