'use client';

import React from 'react';
import { AppView, useApp } from '@/context/AppContext';

const NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: 'overview', label: 'Roadmap' },
  { id: 'stage', label: 'Chapters' },
  { id: 'compare', label: 'Compare' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'labs', label: 'Labs' },
];

export default function Navbar() {
  const {
    view,
    setView,
    activeStageId,
    completedChapters,
    openStage,
  } = useApp();

  const handleNavClick = (id: AppView) => {
    if (id === 'stage') {
      openStage(activeStageId);
    } else {
      setView(id);
    }
  };

  const hasStarted = activeStageId > 1 || completedChapters.length > 0;
  const ctaChapterNum = String(activeStageId).padStart(2, '0');

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => setView('overview')}
          className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          ML Studio Lab
        </button>

        {/* Zone 2: 5 clean single-word navigation links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded ${
                  isActive
                    ? 'text-blue-700 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-[19px] h-0.5 bg-blue-700 dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary cobalt CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => openStage(hasStarted ? activeStageId : 1)}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-700 dark:bg-blue-500 text-white dark:text-slate-950 hover:bg-blue-800 dark:hover:bg-blue-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {hasStarted ? `Resume Ch. ${ctaChapterNum}` : 'Start Ch. 01'}
          </button>
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <div className="flex md:hidden items-center justify-around border-t border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-medium overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`px-2 py-1 whitespace-nowrap shrink-0 rounded ${
                isActive
                  ? 'text-blue-700 dark:text-blue-400 font-semibold'
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
