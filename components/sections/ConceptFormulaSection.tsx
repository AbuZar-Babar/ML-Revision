'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getStageById } from '@/data/curriculum';
import { STAGE_PRIMERS } from '@/data/primers';
import IntuitionDiagram from '@/components/sections/IntuitionDiagram';
import InfoPopover from '@/components/common/InfoPopover';

interface ConceptFormulaSectionProps {
  stageId: number;
}

export default function ConceptFormulaSection({
  stageId,
}: ConceptFormulaSectionProps) {
  const { setActiveSection } = useApp();
  const [activeSymbolKey, setActiveSymbolKey] = useState<string | null>(null);

  const stage = getStageById(stageId);
  const primer = STAGE_PRIMERS[stageId] ?? STAGE_PRIMERS[1];

  return (
    <div className="space-y-8">
      {/* Crisp 1-Line Summary + (?) Deep Intuition & Analogy Popovers */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4">
        <p className="text-sm sm:text-base font-medium leading-relaxed text-slate-800 dark:text-slate-200 max-w-3xl">
          {stage.keyTakeaway}
        </p>

        <div className="flex items-center gap-3 shrink-0 text-xs font-medium text-slate-600 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            Intuition
            <InfoPopover
              title="Plain-English Intuition"
              content={primer.intuition}
              align="right"
            />
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
            ·
          </span>
          <span className="inline-flex items-center gap-1.5">
            Analogy
            <InfoPopover
              title={primer.analogyTitle}
              content={primer.analogyText}
              align="right"
            />
          </span>
        </div>
      </div>

      {/* Balanced 2-Column Layout: Animated Visual Intuition (Left) + Core Formula & Symbols (Right) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-6">
          <IntuitionDiagram stageId={stageId} />
        </div>

        <div className="lg:col-span-6 space-y-4">
          {/* Core Equations */}
          {primer.formulas.map((formula, idx) => (
            <motion.div
              key={formula.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.06 }}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {formula.label}
                </span>
                {formula.caption && (
                  <InfoPopover
                    title="How to Read This Formula"
                    content={formula.caption}
                    align="right"
                  />
                )}
              </div>

              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3.5 font-mono text-base sm:text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100 leading-relaxed overflow-x-auto">
                {formula.parts.map((part, pIdx) => {
                  if (!part.symbolKey) {
                    return <span key={pIdx}>{part.text}</span>;
                  }
                  const isHighlighted = activeSymbolKey === part.symbolKey;
                  return (
                    <button
                      key={pIdx}
                      type="button"
                      onMouseEnter={() =>
                        setActiveSymbolKey(part.symbolKey ?? null)
                      }
                      onMouseLeave={() => setActiveSymbolKey(null)}
                      onClick={() =>
                        setActiveSymbolKey((prev) =>
                          prev === part.symbolKey
                            ? null
                            : part.symbolKey ?? null
                        )
                      }
                      className={`inline-block rounded px-1.5 py-0.5 mx-0.5 transition-colors cursor-pointer ${
                        isHighlighted
                          ? 'bg-blue-700 dark:bg-blue-500 text-white dark:text-slate-950'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                      }`}
                    >
                      {part.text}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Compact Symbol Strip with Circular (?) Explanations */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Key Symbols (hover or click <span className="font-mono">?</span>)
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {primer.glossary.map((item) => {
                const isActive = activeSymbolKey === item.key;
                return (
                  <div
                    key={item.key}
                    onMouseEnter={() => setActiveSymbolKey(item.key)}
                    onMouseLeave={() => setActiveSymbolKey(null)}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 transition-colors ${
                      isActive
                        ? 'border-blue-600 dark:border-blue-400 bg-blue-50/70 dark:bg-blue-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300 shrink-0">
                        {item.symbol}
                      </span>
                      <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                        {item.name}
                      </span>
                    </div>
                    <InfoPopover
                      title={`${item.symbol} — ${item.name}`}
                      content={item.meaning}
                      example={item.example}
                      align="right"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Single Clear Next-Step Action -> Visual Lab */}
      <div className="flex items-center justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveSection('lab')}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 dark:bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-950 hover:bg-blue-800 dark:hover:bg-blue-400 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Open 02. Visual Lab
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
