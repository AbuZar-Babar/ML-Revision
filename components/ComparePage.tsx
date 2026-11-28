'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Compass } from 'lucide-react';
import {
  ALGORITHM_COMPARISONS,
  AlgorithmComparisonRow,
  TaskCategory,
} from '@/data/referenceData';
import { useApp } from '@/context/AppContext';
import InfoPopover from '@/components/common/InfoPopover';

type ProblemChoice = 'continuous' | 'categories' | 'unlabeled' | 'rewards';
type PatternChoice = 'linear' | 'curved' | 'text' | 'images';
type PriorityChoice = 'explainable' | 'accuracy';

const TASK_FILTERS: { id: TaskCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'regression', label: 'Regression' },
  { id: 'classification', label: 'Classification' },
  { id: 'unsupervised', label: 'Unsupervised' },
  { id: 'reinforcement', label: 'Reinforcement' },
  { id: 'deep', label: 'Deep Learning' },
];

function scoreAlgorithm(
  algo: AlgorithmComparisonRow,
  problem: ProblemChoice,
  pattern: PatternChoice,
  priority: PriorityChoice
): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  if (problem === 'rewards') {
    if (algo.taskType === 'reinforcement') {
      score += 80;
      reasons.push('learns sequential action policies from delayed rewards');
    } else {
      score -= 50;
    }
  } else if (problem === 'continuous') {
    if (algo.taskType === 'regression') {
      score += 50;
      reasons.push('predicts continuous numeric values');
    } else if (algo.id === 'mlp' || algo.id === 'random-forest') {
      score += 22;
      reasons.push('adapts cleanly to non-linear regression');
    } else {
      score -= 40;
    }
  } else if (problem === 'categories') {
    if (algo.taskType === 'classification') {
      score += 50;
      reasons.push('built for class prediction');
    } else if (algo.taskType === 'deep') {
      score += 46;
      reasons.push('handles high-dimensional non-linear patterns');
    } else {
      score -= 40;
    }
  } else {
    if (algo.taskType === 'unsupervised') {
      score += 65;
      reasons.push('discovers structure without labels');
    } else {
      score -= 50;
    }
  }

  if (pattern === 'linear' && algo.tags.linearData) {
    score += 22;
    reasons.push('fast and stable on linear boundaries');
  }
  if (pattern === 'curved' && algo.tags.curvedData) {
    score += 24;
    reasons.push('captures curved non-linear structure');
  }
  if (pattern === 'text' && algo.tags.textData) {
    score += 36;
    reasons.push('built for text and language sequences');
  }
  if (pattern === 'images' && algo.tags.imageData) {
    score += 45;
    reasons.push('shares spatial filters across image grids');
  }

  if (priority === 'explainable') {
    if (algo.interpretability === 'High') {
      score += 18;
      reasons.push('transparent weights or rules');
    } else if (algo.interpretability === 'Low') {
      score -= 10;
    }
  } else if (
    ['random-forest', 'svm-rbf', 'mlp', 'cnn', 'transformer'].includes(algo.id)
  ) {
    score += 16;
    reasons.push('high predictive capacity');
  }

  const reason =
    reasons.length > 0
      ? reasons.slice(0, 2).join(' and ') + '.'
      : algo.bestFor;

  return {
    score,
    reason: reason.charAt(0).toUpperCase() + reason.slice(1),
  };
}

export default function ComparePage() {
  const { openStage } = useApp();

  const [problem, setProblem] = useState<ProblemChoice>('categories');
  const [pattern, setPattern] = useState<PatternChoice>('curved');
  const [priority, setPriority] = useState<PriorityChoice>('accuracy');
  const [taskFilter, setTaskFilter] = useState<TaskCategory>('all');

  const recommendations = useMemo(() => {
    return ALGORITHM_COMPARISONS.map((algo) => ({
      algo,
      ...scoreAlgorithm(algo, problem, pattern, priority),
    }))
      .filter((item) => item.score > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [problem, pattern, priority]);

  const filteredTable = useMemo(() => {
    if (taskFilter === 'all') return ALGORITHM_COMPARISONS;
    return ALGORITHM_COMPARISONS.filter((row) => row.taskType === taskFilter);
  }, [taskFilter]);

  const padChapter = (id: number) => String(id).padStart(2, '0');

  return (
    <main className="mx-auto max-w-[1240px] px-6 sm:px-8 py-10 space-y-10">
      <header className="space-y-1.5 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Algorithm Comparison Guide
          </h1>
          <InfoPopover
            title="How to Use This Guide"
            content="Pick your task, data shape, and priority below to get instant model recommendations, or scan the full 15-algorithm table."
            align="left"
            size="md"
          />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Know when to choose Regression, SVM, Trees, K-Means, Q-Learning, CNNs, or Transformers.
        </p>
      </header>

      {/* Interactive Model Selector */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Compass className="h-4 w-4 text-blue-700 dark:text-blue-400" />
          <span>Model Selector</span>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              1. Task
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {(
                [
                  { id: 'continuous', label: 'Continuous Number (Regression)' },
                  { id: 'categories', label: 'Class Labels (Classification)' },
                  { id: 'unlabeled', label: 'No Labels (Cluster / PCA)' },
                  { id: 'rewards', label: 'Action Rewards (RL)' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setProblem(opt.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                    problem === opt.id
                      ? 'border-blue-700 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              2. Data Shape
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {(
                [
                  { id: 'linear', label: 'Linear / Straight Cuts' },
                  { id: 'curved', label: 'Curved / Tabular' },
                  { id: 'text', label: 'Text / Language' },
                  { id: 'images', label: 'Images / Pixel Grids' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPattern(opt.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                    pattern === opt.id
                      ? 'border-blue-700 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              3. Priority
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {(
                [
                  { id: 'explainable', label: 'Easy to Explain' },
                  { id: 'accuracy', label: 'Maximum Accuracy' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPriority(opt.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                    priority === opt.id
                      ? 'border-blue-700 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid gap-4 md:grid-cols-3">
          {recommendations.map((rec, idx) => (
            <motion.button
              key={rec.algo.id}
              type="button"
              onClick={() => openStage(rec.algo.chapterId, 'lab')}
              layout
              className="group text-left flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-4 hover:border-blue-500 transition-colors cursor-pointer space-y-2"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-blue-700 dark:text-blue-400 font-semibold">
                  <span>
                    #{idx + 1} · {rec.algo.unitLabel}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400" />
                </div>
                <div className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
                  {rec.algo.name}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {rec.reason}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Comparison Matrix */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
            All 15 Core Algorithms
          </h2>

          <div
            role="tablist"
            aria-label="Filter algorithms"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900 p-1 overflow-x-auto max-w-full"
          >
            {TASK_FILTERS.map((tab) => {
              const active = taskFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTaskFilter(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Algorithm</th>
                <th className="px-3 py-3.5 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    Scaling
                    <InfoPopover
                      title="Feature Scaling Requirement"
                      content="Distance and gradient-based models (SVM, KNN, PCA, Neural Nets) require standardized features; Trees and Naive Bayes do not."
                    />
                  </span>
                </th>
                <th className="px-3 py-3.5 font-semibold">Explainable</th>
                <th className="px-3 py-3.5 font-semibold">Boundary</th>
                <th className="px-4 py-3.5 font-semibold">Best For</th>
                <th className="px-4 py-3.5 font-semibold text-right">Visual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTable.map((row) => (
                <tr
                  key={row.id}
                  className="align-middle hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                      <span>{row.name}</span>
                      <InfoPopover
                        title={`Watch Out — ${row.name}`}
                        content={row.watchOut}
                        align="left"
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {row.taskLabel} · {row.unitLabel}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium whitespace-nowrap">
                    <span
                      className={
                        row.needsScaling === 'Yes'
                          ? 'text-blue-700 dark:text-blue-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-400'
                      }
                    >
                      {row.needsScaling}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {row.interpretability}
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {row.nonLinear}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[300px]">
                    {row.bestFor}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openStage(row.chapterId, 'lab')}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:border-blue-500 transition-colors cursor-pointer"
                    >
                      Ch. {padChapter(row.chapterId)}
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
