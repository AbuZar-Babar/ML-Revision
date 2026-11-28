'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Moon, Sun } from 'lucide-react';
import { TOTAL_CHAPTERS, useApp } from '@/context/AppContext';
import { COURSE_UNITS, CURRICULUM_STAGES } from '@/data/curriculum';
import InfoPopover from '@/components/common/InfoPopover';

export default function OverviewPage() {
  const {
    activeStageId,
    completedChapters,
    openStage,
    theme,
    toggleTheme,
  } = useApp();

  const [selectedUnitId, setSelectedUnitId] = useState<number | 'all'>('all');

  const padNum = (n: number) => String(n).padStart(2, '0');
  const hasStarted = activeStageId > 1 || completedChapters.length > 0;
  const visibleUnits =
    selectedUnitId === 'all'
      ? COURSE_UNITS
      : COURSE_UNITS.filter((u) => u.id === selectedUnitId);

  return (
    <main className="mx-auto max-w-[1200px] px-6 sm:px-8 py-12 sm:py-14 space-y-12">
      {/* Clean, Uncluttered Academic Hero */}
      <section className="flex flex-wrap items-end justify-between gap-6 pb-9 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-3 max-w-2xl">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            5 Units <span aria-hidden="true">·</span> {TOTAL_CHAPTERS} Interactive Chapters <span aria-hidden="true">·</span> Visuals &amp; Python Code
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.12] [text-wrap:balance]">
            Learn Machine Learning Visually, Then Code It
          </h1>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            From Supervised, Unsupervised, and Reinforcement Learning basics all the way through SVM, CNNs, and Transformers—each chapter follows one clean flow: Concept, Visual Lab, and Python Code.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => openStage(hasStarted ? activeStageId : 1, 'concept')}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 dark:bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-950 hover:bg-blue-800 dark:hover:bg-blue-400 transition-colors cursor-pointer"
          >
            {hasStarted
              ? `Resume Chapter ${padNum(activeStageId)}`
              : 'Start Chapter 01'}
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Light or Dark theme"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </button>
        </div>
      </section>

      {/* Compact Unit Filter Strip + Progress */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Filter roadmap by unit"
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900 p-1 overflow-x-auto max-w-full"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedUnitId === 'all'}
            onClick={() => setSelectedUnitId('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedUnitId === 'all'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            All 5 Units
          </button>
          {COURSE_UNITS.map((unit) => {
            const active = selectedUnitId === unit.id;
            return (
              <button
                key={unit.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedUnitId(unit.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {unit.numberLabel}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
            {completedChapters.length} / {TOTAL_CHAPTERS} completed
          </span>
          <div className="h-1.5 w-24 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-700 dark:bg-blue-500 transition-[width] duration-300"
              style={{
                width: `${(completedChapters.length / TOTAL_CHAPTERS) * 100}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Clean Sequential 5-Unit, 17-Chapter Grid */}
      <div className="space-y-12">
        {visibleUnits.map((unit, uIdx) => {
          const unitStages = unit.chapterIds
            .map((id) => CURRICULUM_STAGES.find((s) => s.id === id))
            .filter((s): s is NonNullable<typeof s> => Boolean(s));

          return (
            <motion.section
              key={unit.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: uIdx * 0.04 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-400">
                  {unit.numberLabel}
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                  ·
                </span>
                <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {unit.title}
                </h2>
                <InfoPopover
                  title={`${unit.numberLabel}: ${unit.title}`}
                  content={unit.description}
                  align="left"
                />
              </div>

              <div
                className={`grid gap-4 ${
                  unitStages.length === 2
                    ? 'md:grid-cols-2'
                    : unitStages.length === 4
                    ? 'md:grid-cols-2'
                    : 'md:grid-cols-3'
                }`}
              >
                {unitStages.map((stage) => {
                  const isDone = completedChapters.includes(stage.id);
                  const isCurrent = stage.id === activeStageId;

                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => openStage(stage.id, 'concept')}
                      className={`group text-left flex flex-col justify-between rounded-2xl border bg-white dark:bg-slate-900 p-5 transition-colors cursor-pointer ${
                        isCurrent
                          ? 'border-blue-600/80 dark:border-blue-400/80'
                          : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-mono font-semibold text-blue-700 dark:text-blue-400">
                            Ch. {padNum(stage.id)}
                          </span>
                          {isDone ? (
                            <CheckCircle2
                              className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                              aria-label="Completed"
                            />
                          ) : (
                            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors" />
                          )}
                        </div>

                        <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-snug">
                          {stage.title}
                        </h3>

                        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                          {stage.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </div>
    </main>
  );
}
