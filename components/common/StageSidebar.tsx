'use client';

import React from 'react';
import {
  BookOpen,
  GraduationCap,
  LayoutGrid,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sigma,
  Sun,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CURRICULUM_STAGES } from '@/data/curriculum';

export default function StageSidebar() {
  const {
    activeStageId,
    openStage,
    setView,
    sidebarCollapsed,
    toggleSidebar,
    theme,
    toggleTheme,
    teacherDrawerOpen,
    toggleTeacherDrawer,
    toggleCheatSheet,
  } = useApp();

  return (
    <aside
      aria-label="Course stages navigation"
      className={`hidden lg:flex flex-col shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1426] transition-[width] duration-200 ease-out sticky top-16 h-[calc(100vh-4rem)] ${
        sidebarCollapsed ? 'w-[68px]' : 'w-[264px]'
      }`}
    >
      {/* Top Collapse Toggle & Overview Return */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 px-3 py-3">
        {!sidebarCollapsed && (
          <button
            type="button"
            onClick={() => setView('overview')}
            className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap cursor-pointer"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Course Overview</span>
          </button>
        )}

        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand stage sidebar' : 'Collapse stage sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar for wide projection'}
          className={`inline-flex items-center justify-center rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer ${
            sidebarCollapsed ? 'mx-auto' : ''
          }`}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* 7 Stages Vertical List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        {!sidebarCollapsed && (
          <div className="px-2.5 pb-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            Curriculum Stages
          </div>
        )}

        {CURRICULUM_STAGES.map((stage) => {
          const active = stage.id === activeStageId;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => openStage(stage.id)}
              title={`Stage 0${stage.id}: ${stage.title}`}
              className={`w-full flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                active
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <span
                className={`font-mono text-xs tabular-nums flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                  active
                    ? 'bg-sky-700 dark:bg-sky-500 text-white dark:text-slate-950 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                0{stage.id}
              </span>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs leading-snug">
                    {stage.shortTitle}
                  </div>
                  <div className="truncate text-[11px] font-normal text-slate-400 dark:text-slate-500">
                    {stage.category}
                  </div>
                </div>
              )}
            </button>
          );
        })}

        {/* Direct jump to Lab Hub */}
        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => setView('labs')}
            title="Lab Assignments & Datasets"
            className={`w-full flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer ${
              sidebarCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span className="truncate">Lab Assignments</span>}
          </button>
        </div>
      </div>

      {/* Bottom Clean Utilities Stack */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 p-2.5 space-y-1">
        <button
          type="button"
          onClick={toggleCheatSheet}
          title="Formula Cheat Sheet"
          className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
            sidebarCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <Sigma className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-400" />
          {!sidebarCollapsed && <span className="truncate">Formula Cheat Sheet</span>}
        </button>

        <button
          type="button"
          onClick={toggleTeacherDrawer}
          title="Socratic Teacher Mode"
          className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
            teacherDrawerOpen
              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
        >
          <GraduationCap className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span className="truncate">Teacher Mode</span>}
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          title="Toggle Projector Light / Dark Mode"
          className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
            sidebarCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          {theme === 'light' ? (
            <>
              <Moon className="h-4 w-4 shrink-0 text-slate-600" />
              {!sidebarCollapsed && <span className="truncate">Dark Mode</span>}
            </>
          ) : (
            <>
              <Sun className="h-4 w-4 shrink-0 text-amber-400" />
              {!sidebarCollapsed && <span className="truncate">Projector Light</span>}
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
