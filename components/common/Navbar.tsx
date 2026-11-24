'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function Navbar() {
  const {
    view,
    setView,
    activeStageId,
    openStage,
    teacherDrawerOpen,
    toggleTeacherDrawer,
  } = useApp();

  const navItems: { id: 'overview' | 'stage' | 'labs' | 'guide'; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'stage', label: 'Simulations' },
    { id: 'labs', label: 'Lab Hub' },
    { id: 'guide', label: 'Teaching Guide' },
  ];

  const handleNavClick = (id: 'overview' | 'stage' | 'labs' | 'guide') => {
    if (id === 'stage') {
      openStage(activeStageId);
    } else {
      setView(id);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-8 px-6">
        {/* Zone 1: Single text element Brand Wordmark */}
        <button
          type="button"
          onClick={() => setView('overview')}
          className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded"
        >
          ML Studio Lab
        </button>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded ${
                  isActive
                    ? 'text-sky-700 dark:text-sky-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-[19px] h-0.5 bg-sky-700 dark:bg-sky-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary contextual CTA */}
        <div className="flex items-center shrink-0">
          {view === 'stage' ? (
            <button
              type="button"
              onClick={toggleTeacherDrawer}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                teacherDrawerOpen
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'bg-sky-700 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-sky-800 dark:hover:bg-sky-400'
              }`}
            >
              {teacherDrawerOpen ? 'Close Teacher Mode' : 'Teacher Mode'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openStage(1)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-sky-700 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-sky-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
            >
              Start Stage 1
            </button>
          )}
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <div className="flex md:hidden items-center justify-around border-t border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-medium">
        {navItems.map((item) => {
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`px-2 py-1 whitespace-nowrap shrink-0 rounded ${
                isActive
                  ? 'text-sky-700 dark:text-sky-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
