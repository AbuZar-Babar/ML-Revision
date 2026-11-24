'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Moon,
  Sun,
  LayoutGrid,
  Sigma,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CURRICULUM_STAGES } from '@/data/curriculum';

export default function WorkspaceToolbar() {
  const {
    activeStageId,
    openStage,
    prevStage,
    nextStage,
    setView,
    theme,
    toggleTheme,
    teacherDrawerOpen,
    toggleTeacherDrawer,
    toggleCheatSheet,
  } = useApp();

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/70">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 py-2.5">
        {/* Hybrid Direct Sandbox Stage Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => setView('overview')}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Return to Course Overview Grid"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            All Stages
          </button>

          <span
            aria-hidden="true"
            className="h-4 w-px bg-slate-300 dark:bg-slate-700 shrink-0"
          />

          <div
            role="tablist"
            aria-label="Curriculum stages"
            className="flex items-center gap-1"
          >
            {CURRICULUM_STAGES.map((stage) => {
              const active = stage.id === activeStageId;
              return (
                <button
                  key={stage.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => openStage(stage.id)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                    active
                      ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="font-mono tabular-nums mr-1">0{stage.id}</span>
                  <span className="hidden xl:inline">{stage.shortTitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sequential Stepper + Formula Cheat Sheet + Theme + Teacher Mode */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5">
            <button
              type="button"
              onClick={prevStage}
              disabled={activeStageId <= 1}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <span className="px-2 font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
              {activeStageId}/7
            </span>
            <button
              type="button"
              onClick={nextStage}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {activeStageId === 7 ? 'Labs' : 'Next'}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={toggleCheatSheet}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Open ML & Math Formula Cheat Sheet"
          >
            <Sigma className="h-3.5 w-3.5 text-sky-700 dark:text-sky-400" />
            <span>Cheat Sheet</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Switch between High-Contrast Projector Light Mode and Dark Mode"
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-3.5 w-3.5 text-slate-600" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Projector Light</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={toggleTeacherDrawer}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              teacherDrawerOpen
                ? 'border-sky-700 dark:border-sky-400 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Socratic Prompts</span>
          </button>
        </div>
      </div>
    </div>
  );
}
