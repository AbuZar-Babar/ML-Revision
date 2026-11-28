'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Map,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sigma,
  Sun,
} from 'lucide-react';
import { TOTAL_CHAPTERS, useApp } from '@/context/AppContext';
import { COURSE_UNITS, CURRICULUM_STAGES } from '@/data/curriculum';

export default function StageSidebar() {
  const {
    activeStageId,
    completedChapters,
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

  // Keep all 5 units expanded by default so students see the full flow effortlessly
  const [collapsedUnits, setCollapsedUnits] = useState<number[]>([]);

  const toggleUnit = (unitId: number) => {
    setCollapsedUnits((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  const padNum = (n: number) => String(n).padStart(2, '0');

  return (
    <aside
      aria-label="Course units and chapters navigation"
      className={`hidden lg:flex flex-col shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1426] transition-[width] duration-200 ease-out sticky top-16 h-[calc(100vh-4rem)] ${
        sidebarCollapsed ? 'w-[64px]' : 'w-[280px]'
      }`}
    >
      {/* Top Collapse Toggle & Roadmap Return */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 px-3 py-3">
        {!sidebarCollapsed && (
          <button
            type="button"
            onClick={() => setView('overview')}
            className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Map className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
            <span>Course Roadmap</span>
          </button>
        )}

        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={
            sidebarCollapsed ? 'Expand course sidebar' : 'Collapse course sidebar'
          }
          title={
            sidebarCollapsed
              ? 'Expand sidebar'
              : 'Collapse sidebar for wide projection'
          }
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

      {/* Quiet Progress Bar */}
      {!sidebarCollapsed && (
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-medium">Course Progress</span>
            <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
              {completedChapters.length} / {TOTAL_CHAPTERS}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-700 dark:bg-blue-500 transition-[width] duration-300"
              style={{
                width: `${(completedChapters.length / TOTAL_CHAPTERS) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Unit-Grouped 14 Chapters List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3">
        {sidebarCollapsed ? (
          <div className="space-y-1">
            {CURRICULUM_STAGES.map((stage) => {
              const active = stage.id === activeStageId;
              const done = completedChapters.includes(stage.id);
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => openStage(stage.id)}
                  title={`${stage.numberLabel}: ${stage.title}`}
                  className={`relative w-full flex items-center justify-center rounded-lg py-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] tabular-nums flex h-6 w-6 items-center justify-center rounded-md ${
                      active
                        ? 'bg-blue-700 dark:bg-blue-500 text-white dark:text-slate-950 font-bold'
                        : done
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {padNum(stage.id)}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          COURSE_UNITS.map((unit) => {
            const isCollapsed = collapsedUnits.includes(unit.id);
            const unitChapters = unit.chapterIds
              .map((id) => CURRICULUM_STAGES.find((s) => s.id === id))
              .filter((s): s is NonNullable<typeof s> => Boolean(s));

            return (
              <div key={unit.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleUnit(unit.id)}
                  className="w-full flex items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <span className="truncate">
                    <span className="font-mono text-blue-700 dark:text-blue-400 mr-1.5">
                      {unit.numberLabel}
                    </span>
                    {unit.shortTitle}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  )}
                </button>

                {!isCollapsed && (
                  <div className="space-y-0.5 pl-1">
                    {unitChapters.map((stage) => {
                      const active = stage.id === activeStageId;
                      const done = completedChapters.includes(stage.id);
                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => openStage(stage.id)}
                          title={`${stage.numberLabel}: ${stage.title}`}
                          className={`w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                            active
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-semibold'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                        >
                          <span
                            className={`font-mono text-[11px] tabular-nums flex h-5 w-6 shrink-0 items-center justify-center rounded ${
                              active
                                ? 'bg-blue-700 dark:bg-blue-500 text-white dark:text-slate-950 font-bold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {padNum(stage.id)}
                          </span>
                          <span className="truncate text-xs leading-snug flex-1">
                            {stage.shortTitle}
                          </span>
                          {done && (
                            <CheckCircle2
                              className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                              aria-label="Completed"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Quiet Utilities Stack */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 p-2 space-y-1">
        <button
          type="button"
          onClick={toggleTeacherDrawer}
          title="Toggle Instructor Mode (Discussion Prompts & Live Proofs)"
          className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
            teacherDrawerOpen
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-semibold'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
        >
          <GraduationCap className="h-4 w-4 shrink-0 text-blue-700 dark:text-blue-400" />
          {!sidebarCollapsed && (
            <span className="truncate">
              {teacherDrawerOpen ? 'Instructor Mode: On' : 'Instructor Mode'}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={toggleCheatSheet}
          title="Quick Formula Sheet"
          className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
            sidebarCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <Sigma className="h-4 w-4 shrink-0 text-blue-700 dark:text-blue-400" />
          {!sidebarCollapsed && (
            <span className="truncate">Quick Formula Sheet</span>
          )}
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          title="Toggle Light / Dark Theme"
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
              {!sidebarCollapsed && <span className="truncate">Light Mode</span>}
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
