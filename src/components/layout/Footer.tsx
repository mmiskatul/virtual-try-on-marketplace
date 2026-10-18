import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-10 px-6 mt-16 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© 2026 V-TRY Central Fashion Marketplace. Multi-Tenant Virtual Try-On Infrastructure.</p>
        <div className="flex gap-6 text-slate-400">
          <span className="hover:text-purple-400 cursor-pointer transition-colors">Privacy & Fitting Data Retention Policy</span>
          <span className="hover:text-purple-400 cursor-pointer transition-colors">Brand Merchant Directory</span>
          <span className="hover:text-purple-400 cursor-pointer transition-colors">API Documentation</span>
        </div>
      </div>
    </footer>
  );
}
