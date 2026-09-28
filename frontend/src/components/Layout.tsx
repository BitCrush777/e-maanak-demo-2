import React from 'react';
import { GovernmentHeader } from './common/GovernmentHeader';
import { GovernmentFooter } from './common/GovernmentFooter';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 font-sans">
      <GovernmentHeader />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {children}
      </main>

      <GovernmentFooter />
    </div>
  );
};
