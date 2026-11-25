'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { STAGE_PRIMERS } from '@/data/primers';
import { CURRICULUM_STAGES } from '@/data/curriculum';
import { useApp } from '@/context/AppContext';
import IntuitionDiagram from '@/components/sections/IntuitionDiagram';

interface IdeaSectionProps {
  stageId: number;
}

export default function IdeaSection({ stageId }: IdeaSectionProps) {
  const { setActiveSection } = useApp();
  const primer = STAGE_PRIMERS[stageId] ?? STAGE_PRIMERS[1];
  const stage =
    CURRICULUM_STAGES.find((s) => s.id === stageId) ?? CURRICULUM_STAGES[0];

  return (
    <div className="mx-auto max-w-[1000px] space-y-8">
      {/* Main Spacious Split: Plain-English Intuition + Animated Diagram */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 space-y-6"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-400">
              <Lightbulb className="h-4 w-4" />
              <span>Core Intuition</span>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 [text-wrap:balance]">
              The Big Idea Behind {stage.shortTitle}
            </h2>
            <p className="text-base leading-[1.75] text-slate-700 dark:text-slate-200 max-w-[60ch]">
              {primer.intuition}
            </p>
          </div>

          {/* Everyday Analogy Block */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2.5">
            <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
              {primer.analogyTitle}
            </div>
            <p className="text-sm sm:text-[15px] leading-[1.7] text-slate-600 dark:text-slate-300">
              {primer.analogyText}
            </p>
          </div>
        </motion.div>

        {/* Right: Custom Animated Intuition Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 space-y-4"
        >
          <IntuitionDiagram stageId={stageId} />

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Remember This:
            </span>{' '}
            {stage.keyTakeaway}
          </div>
        </motion.div>
      </div>

      {/* Focused Next Section CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-5">
        <div className="space-y-0.5">
          <div className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
            Got the big picture? Let&apos;s decode the math next.
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Step 02 breaks down every single symbol in the formula with interactive highlights.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveSection('formula')}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 dark:bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-950 hover:bg-sky-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          Continue to 02. Formula
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
