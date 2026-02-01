
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-zinc-800 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight">V-Extend</span>
      </div>
      
      <nav className="hidden md:flex items-center space-x-6">
        <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Documentation</a>
        <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Examples</a>
        <button className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors">
          View Projects
        </button>
      </nav>
    </header>
  );
};
