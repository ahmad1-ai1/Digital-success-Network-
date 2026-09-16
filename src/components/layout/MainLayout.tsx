import React from 'react';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
