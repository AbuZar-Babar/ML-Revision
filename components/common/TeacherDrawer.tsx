'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CURRICULUM_STAGES } from '@/data/curriculum';

export default function TeacherDrawer() {
  const {
    activeStageId,
    teacherDrawerOpen,
    setTeacherDrawerOpen,
    triggerVisualProof,
  } = useApp();

  const [revealedStageId, setRevealedStageId] = useState<number | null>(null);
  const showAnswer = revealedStageId === activeStageId;

  const stage = CURRICULUM_STAGES.find((s) => s.id === activeStageId);
  if (!stage) return null;

  return (
    <AnimatePresence>
      {teacherDrawerOpen && (
        <motion.aside
          key="teacher-drawer"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Teacher Socratic Mode"
          className="mb-6 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-sky-700 dark:text-sky-400">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Teacher Socratic Mode</span>
                <span aria-hidden="true">·</span>
                <span>{stage.numberLabel}</span>
              </div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                Classroom Discussion Prompt
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => triggerVisualProof(stage.id)}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-700 dark:bg-sky-500 px-4 py-2 text-sm font-medium text-white dark:text-slate-950 hover:bg-sky-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Show Visual Proof: {stage.proofLabel}
              </button>
              <button
                type="button"
                onClick={() => setTeacherDrawerOpen(false)}
                aria-label="Close Teacher Mode"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              <p className="text-base font-medium leading-relaxed text-slate-900 dark:text-slate-100">
                &ldquo;{stage.socraticQuestion}&rdquo;
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Follow-up: {stage.followUpQuestion}
              </p>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setRevealedStageId(showAnswer ? null : activeStageId)
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  {showAnswer ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" />
                      Hide Instructor Key
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      Reveal Instructor Key
                    </>
                  )}
                </button>
                {showAnswer && (
                  <p className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-800/70 p-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    {stage.instructorAnswer}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                What Visual Proof Automates
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {stage.proofDescription}
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
