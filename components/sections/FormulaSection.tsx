'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, RotateCcw, Sigma } from 'lucide-react';
import { STAGE_PRIMERS } from '@/data/primers';
import { useApp } from '@/context/AppContext';

interface FormulaSectionProps {
  stageId: number;
}

export default function FormulaSection({ stageId }: FormulaSectionProps) {
  const { setActiveSection, setCheatSheetOpen } = useApp();
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);
  const [revealKey, setRevealKey] = useState<number>(0);

  const primer = STAGE_PRIMERS[stageId] ?? STAGE_PRIMERS[1];

  const handleToggleSymbol = (key: string) => {
    setActiveSymbol((prev) => (prev === key ? null : key));
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-8">
      {/* Header Row */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-400">
            <Sigma className="h-4 w-4" />
            <span>Mathematical Blueprint</span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Core Equations &amp; Symbol Glossary
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Hover or click any highlighted symbol below to link the math directly to its plain-English meaning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRevealKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Replay Reveal
          </button>
          <button
            type="button"
            onClick={() => setCheatSheetOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Sigma className="h-3.5 w-3.5 text-sky-700 dark:text-sky-400" />
            All Notation Basics
          </button>
        </div>
      </div>

      {/* Animated Canonical Equation Cards */}
      <div key={revealKey} className="space-y-4">
        {primer.formulas.map((f, fIdx) => (
          <motion.div
            key={fIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: fIdx * 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-3"
          >
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {f.label}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 font-mono text-lg sm:text-xl font-medium tabular-nums leading-relaxed text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-5 py-4">
              {f.parts.map((part, pIdx) => {
                const delay = fIdx * 0.14 + pIdx * 0.045;
                if (!part.symbolKey) {
                  return (
                    <motion.span
                      key={pIdx}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay }}
                      className="whitespace-pre-wrap"
                    >
                      {part.text}
                    </motion.span>
                  );
                }
                const isSelected = activeSymbol === part.symbolKey;
                return (
                  <motion.button
                    key={pIdx}
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.24, delay }}
                    onMouseEnter={() => setActiveSymbol(part.symbolKey ?? null)}
                    onMouseLeave={() => setActiveSymbol(null)}
                    onClick={() => handleToggleSymbol(part.symbolKey!)}
                    className={`rounded-lg px-2 py-0.5 font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                      isSelected
                        ? 'bg-amber-200 dark:bg-amber-800 text-slate-950 dark:text-white ring-2 ring-amber-500 scale-105'
                        : 'bg-sky-100/90 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200 hover:bg-sky-200 dark:hover:bg-sky-800/80'
                    }`}
                  >
                    {part.text}
                  </motion.button>
                );
              })}
            </div>

            {f.caption && (
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {f.caption}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Spacious 2-Column Symbol-by-Symbol Glossary */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          Symbol-by-Symbol Breakdown ({primer.glossary.length} terms)
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {primer.glossary.map((item, idx) => {
            const isHighlighted = activeSymbol === item.key;
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: 0.1 + idx * 0.05 }}
                onMouseEnter={() => setActiveSymbol(item.key)}
                onMouseLeave={() => setActiveSymbol(null)}
                onClick={() => handleToggleSymbol(item.key)}
                className={`rounded-xl border p-5 space-y-2 transition-all cursor-pointer ${
                  isHighlighted
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/35 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-mono text-base font-bold tabular-nums px-2.5 py-0.5 rounded-md ${
                      isHighlighted
                        ? 'bg-amber-200 dark:bg-amber-800 text-slate-950 dark:text-white'
                        : 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
                    }`}
                  >
                    {item.symbol}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 text-right">
                    {item.name}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {item.meaning}
                </p>
                <div className="font-mono text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  e.g. {item.example}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Section Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-5">
        <button
          type="button"
          onClick={() => setActiveSection('idea')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to 01. Idea
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('example')}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 dark:bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-950 hover:bg-sky-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          Continue to 03. Interactive Example
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
