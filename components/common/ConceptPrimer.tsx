'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Lightbulb,
  Sigma,
} from 'lucide-react';
import { STAGE_PRIMERS } from '@/data/primers';
import { useApp } from '@/context/AppContext';

interface ConceptPrimerProps {
  stageId: number;
}

export default function ConceptPrimer({ stageId }: ConceptPrimerProps) {
  const { setActiveSection, setCheatSheetOpen } = useApp();
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);

  const primer = STAGE_PRIMERS[stageId] ?? STAGE_PRIMERS[1];

  const handleToggleSymbol = (key: string) => {
    setActiveSymbol((prev) => (prev === key ? null : key));
  };

  return (
    <div className="space-y-6">
      {/* Main 2-Column Concept & Formula Spread */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Plain-English Intuition, Analogy & Step-by-Step Worked Example */}
        <div className="lg:col-span-6 space-y-5">
          {/* Plain-English Intuition + Everyday Analogy */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-400">
              <Lightbulb className="h-4 w-4" />
              <span>01. Plain-English Intuition</span>
            </div>

            <p className="text-base leading-relaxed text-slate-800 dark:text-slate-100">
              {primer.intuition}
            </p>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-1.5">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {primer.analogyTitle}
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {primer.analogyText}
              </p>
            </div>
          </div>

          {/* Worked Numeric Mini-Example */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <Calculator className="h-4 w-4" />
                <span>03. Worked Numeric Mini-Example</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                By-hand walkthrough
              </span>
            </div>

            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {primer.workedExample.scenario}
            </p>

            <ol className="space-y-3">
              {primer.workedExample.steps.map((step, idx) => (
                <li
                  key={idx}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-3.5 space-y-1.5"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
                      Step {idx + 1}.
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {step.label}
                    </span>
                  </div>
                  <div className="font-mono text-xs sm:text-sm font-medium tabular-nums text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 rounded-md px-3 py-2 border border-slate-200 dark:border-slate-800 overflow-x-auto">
                    {step.math}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {step.note}
                  </p>
                </li>
              ))}
            </ol>

            <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 text-xs leading-relaxed text-emerald-900 dark:text-emerald-200">
              <strong>Takeaway:</strong> {primer.workedExample.conclusion}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Formula Breakdown & Symbol-by-Symbol Glossary */}
        <div className="lg:col-span-6 space-y-5">
          {/* Canonical Formula Card(s) */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-400">
                <Sigma className="h-4 w-4" />
                <span>02. Core Formulas &amp; Symbol Breakdown</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Hover or click any highlighted symbol
              </span>
            </div>

            <div className="space-y-3">
              {primer.formulas.map((f, fIdx) => (
                <div
                  key={fIdx}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-4 space-y-2"
                >
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {f.label}
                  </div>
                  <div className="flex flex-wrap items-center gap-1 font-mono text-base sm:text-lg font-medium tabular-nums leading-relaxed text-slate-900 dark:text-slate-100">
                    {f.parts.map((part, pIdx) => {
                      if (!part.symbolKey) {
                        return (
                          <span key={pIdx} className="whitespace-pre-wrap">
                            {part.text}
                          </span>
                        );
                      }
                      const isSelected = activeSymbol === part.symbolKey;
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onMouseEnter={() => setActiveSymbol(part.symbolKey ?? null)}
                          onMouseLeave={() => setActiveSymbol(null)}
                          onClick={() => handleToggleSymbol(part.symbolKey!)}
                          className={`rounded-md px-1.5 py-0.5 font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                            isSelected
                              ? 'bg-amber-200 dark:bg-amber-800 text-slate-950 dark:text-white ring-2 ring-amber-500'
                              : 'bg-sky-100/90 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200 hover:bg-sky-200 dark:hover:bg-sky-800/80'
                          }`}
                        >
                          {part.text}
                        </button>
                      );
                    })}
                  </div>
                  {f.caption && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {f.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Interactive Symbol-by-Symbol Glossary Table */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2.5">
                Symbol-by-Symbol Glossary
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                {primer.glossary.map((item) => {
                  const isHighlighted = activeSymbol === item.key;
                  return (
                    <div
                      key={item.key}
                      onMouseEnter={() => setActiveSymbol(item.key)}
                      onMouseLeave={() => setActiveSymbol(null)}
                      onClick={() => handleToggleSymbol(item.key)}
                      className={`grid grid-cols-12 gap-3 p-3.5 transition-colors cursor-pointer ${
                        isHighlighted
                          ? 'bg-amber-50 dark:bg-amber-950/35'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="col-span-3 sm:col-span-3 flex items-start">
                        <span
                          className={`font-mono text-sm font-bold tabular-nums px-2 py-0.5 rounded-md ${
                            isHighlighted
                              ? 'bg-amber-200 dark:bg-amber-800 text-slate-950 dark:text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-sky-800 dark:text-sky-300'
                          }`}
                        >
                          {item.symbol}
                        </span>
                      </div>
                      <div className="col-span-9 sm:col-span-9 space-y-1">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {item.name}
                        </div>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                          {item.meaning}
                        </p>
                        <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          Example: {item.example}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Primary Transition Action Card into Step 2: Visual Lab */}
          <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/90 p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5 max-w-sm">
              <div className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
                Ready to see the math move live?
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Open the interactive simulation to test these exact equations on live data.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setCheatSheetOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Formula Cheat Sheet
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('lab')}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-700 dark:bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-950 hover:bg-sky-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
              >
                Launch Interactive Visual
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
