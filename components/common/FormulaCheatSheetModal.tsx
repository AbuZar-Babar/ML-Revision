'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, BookOpen, Sigma, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ALL_STAGE_FORMULAS, MATH_NOTATION_BASICS } from '@/data/primers';

export default function FormulaCheatSheetModal() {
  const { cheatSheetOpen, setCheatSheetOpen, openStage } = useApp();
  const [activeTab, setActiveTab] = useState<'notation' | 'formulas'>(
    'notation'
  );

  useEffect(() => {
    if (!cheatSheetOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCheatSheetOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cheatSheetOpen, setCheatSheetOpen]);

  const handleJumpStage = (stageId: number) => {
    setCheatSheetOpen(false);
    openStage(stageId, 'concept');
  };

  return (
    <AnimatePresence>
      {cheatSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cheat-sheet-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => setCheatSheetOpen(false)}
            className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs"
          />

          {/* Modal Surface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex max-h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl"
          >
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Quick Reference · All 17 Chapters</span>
                </div>
                <h2
                  id="cheat-sheet-title"
                  className="font-display text-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  ML &amp; Math Formula Cheat Sheet
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div
                  role="tablist"
                  aria-label="Cheat sheet sections"
                  className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'notation'}
                    onClick={() => setActiveTab('notation')}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'notation'
                        ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    Math Notation Basics
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'formulas'}
                    onClick={() => setActiveTab('formulas')}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'formulas'
                        ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    All 17 Chapter Formulas
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setCheatSheetOpen(false)}
                  aria-label="Close Formula Cheat Sheet"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'notation' ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Every equation across our 5-unit course builds on these core mathematical symbols.
                  </p>

                  <div className="grid gap-3.5 sm:grid-cols-2">
                    {MATH_NOTATION_BASICS.map((item) => (
                      <div
                        key={item.symbol}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-mono text-base font-bold text-blue-800 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-900/50 px-2.5 py-0.5 rounded-md">
                            {item.symbol}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-right">
                            {item.name}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                          {item.meaning}
                        </p>
                        <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/80 dark:border-slate-800">
                          e.g. {item.example}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Exam-ready equation summary across all 17 chapters. Click any row to jump directly to its Concept &amp; Formula view.
                  </p>

                  <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {ALL_STAGE_FORMULAS.map((row) => (
                      <div
                        key={row.stageId}
                        className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="space-y-1.5 flex-1 min-w-[260px]">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-mono font-semibold text-blue-700 dark:text-blue-400">
                              {row.stageLabel}
                            </span>
                            <span aria-hidden="true" className="text-slate-400">
                              ·
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {row.topic}
                            </span>
                          </div>
                          <div className="font-mono text-xs sm:text-sm font-medium tabular-nums text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 rounded-md px-3 py-1.5 border border-slate-200 dark:border-slate-800 inline-block">
                            {row.formula}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {row.objective}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleJumpStage(row.stageId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Sigma className="h-3.5 w-3.5" />
                          Open {row.stageLabel}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-6 py-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Press Esc anytime to close</span>
              <button
                type="button"
                onClick={() => setCheatSheetOpen(false)}
                className="rounded-lg bg-slate-900 dark:bg-slate-100 px-4 py-1.5 text-xs font-semibold text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
