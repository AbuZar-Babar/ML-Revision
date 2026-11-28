'use client';

import React, { useMemo, useState } from 'react';
import { ArrowRight, BookMarked, Search, Sigma, X } from 'lucide-react';
import { GLOSSARY_ENTRIES, GlossaryCategory } from '@/data/referenceData';
import { ALL_STAGE_FORMULAS, MATH_NOTATION_BASICS } from '@/data/primers';
import { useApp } from '@/context/AppContext';
import InfoPopover from '@/components/common/InfoPopover';

type GlossaryViewTab = 'terms' | 'formulas' | 'symbols';

const CATEGORIES: GlossaryCategory[] = [
  'all',
  'Foundations',
  'Regression',
  'Classification & SVM',
  'Ensembles & Unsupervised',
  'Deep Learning',
];

export default function GlossaryPage() {
  const { openStage } = useApp();

  const [activeTab, setActiveTab] = useState<GlossaryViewTab>('terms');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] =
    useState<GlossaryCategory>('all');

  const padChapter = (id: number) => String(id).padStart(2, '0');

  const filteredTerms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return GLOSSARY_ENTRIES.filter((entry) => {
      const catMatch =
        selectedCategory === 'all' || entry.category === selectedCategory;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        entry.term.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q) ||
        entry.example.toLowerCase().includes(q) ||
        (entry.symbol && entry.symbol.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  const filteredFormulas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ALL_STAGE_FORMULAS;
    return ALL_STAGE_FORMULAS.filter(
      (f) =>
        f.topic.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.stageLabel.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <main className="mx-auto max-w-[1240px] px-6 sm:px-8 py-10 space-y-8">
      <header className="space-y-1.5 pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          ML Glossary &amp; Formula Reference
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Quick lookup for terms, symbols, and all 17 chapter equations.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Glossary sections"
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'terms'}
            onClick={() => setActiveTab('terms')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <BookMarked className="h-3.5 w-3.5" />
            ML Terms
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'formulas'}
            onClick={() => setActiveTab('formulas')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'formulas'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sigma className="h-3.5 w-3.5" />
            17-Chapter Formulas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'symbols'}
            onClick={() => setActiveTab('symbols')}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'symbols'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Math Symbols
          </button>
        </div>

        {activeTab !== 'symbols' && (
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search terms or formulas (e.g., Q-Learning, CNN, SVM)..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {activeTab === 'terms' && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'border-blue-700 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTerms.map((entry) => (
              <article
                key={entry.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {entry.term}
                    </h2>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {entry.symbol && (
                        <span className="font-mono text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                          {entry.symbol}
                        </span>
                      )}
                      <InfoPopover
                        title={`Example — ${entry.term}`}
                        content={entry.example}
                        align="right"
                      />
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {entry.definition}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <span className="text-slate-400">{entry.category}</span>
                  <button
                    type="button"
                    onClick={() => openStage(entry.chapterId, 'concept')}
                    className="inline-flex items-center gap-1 font-mono font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Ch. {padChapter(entry.chapterId)}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'formulas' && (
        <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          {filteredFormulas.map((row) => (
            <div
              key={row.stageId}
              className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
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
                  <InfoPopover
                    title={row.topic}
                    content={row.objective}
                    align="left"
                  />
                </div>
                <div className="font-mono text-xs sm:text-sm font-medium tabular-nums text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-800 inline-block">
                  {row.formula}
                </div>
              </div>

              <button
                type="button"
                onClick={() => openStage(row.stageId, 'lab')}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:border-blue-500 transition-colors cursor-pointer"
              >
                Open Visual
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'symbols' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MATH_NOTATION_BASICS.map((item) => (
            <div
              key={item.symbol}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-base font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md">
                  {item.symbol}
                </span>
                <InfoPopover
                  title={item.name}
                  content={item.meaning}
                  example={item.example}
                  align="right"
                />
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {item.name}
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {item.meaning}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
