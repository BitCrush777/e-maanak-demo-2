import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sovereign-navy">e-MAANAK Platform</span>
              <span>•</span>
              <span>Legal Metrology Division, Ministry of Consumer Affairs, Food & Public Distribution</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[11px]">
                SIH Problem ID: SIH26036
              </span>
              <span>Sovereign Metrology Verification Prototype</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
