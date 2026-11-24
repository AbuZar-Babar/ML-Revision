'use client';

import React from 'react';
import {
  ArrowRight,
  Code2,
  GraduationCap,
  Moon,
  Sigma,
  Sun,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CURRICULUM_STAGES } from '@/data/curriculum';

export default function OverviewPage() {
  const {
    openStage,
    setView,
    theme,
    toggleTheme,
    setTeacherDrawerOpen,
    toggleCheatSheet,
  } = useApp();

  const handleLaunchWithTeacher = (stageId: number) => {
    setTeacherDrawerOpen(true);
    openStage(stageId);
  };

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-10 space-y-12">
      {/* Crisp Academic Hero Section */}
      <section className="grid gap-8 lg:grid-cols-12 items-end pb-10 border-b border-slate-200 dark:border-slate-800">
        <div className="lg:col-span-8 space-y-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Undergraduate Machine Learning Curriculum <span aria-hidden="true">·</span> Concept &amp; Formulas First <span aria-hidden="true">·</span> 7 Interactive Labs
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.1] [text-wrap:balance]">
            Master Machine Learning Visually Before Writing Code
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Every stage begins with plain-English intuition, symbol-by-symbol formulas, and a hand-worked numeric example—then launches straight into an interactive visual simulation.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openStage(1)}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-700 dark:bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-950 hover:bg-sky-800 dark:hover:bg-sky-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
            >
              Start Lecture: Stage 01
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={toggleCheatSheet}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Sigma className="h-4 w-4 text-sky-700 dark:text-sky-400" />
              Formula Cheat Sheet
            </button>

            <button
              type="button"
              onClick={() => setView('labs')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Code2 className="h-4 w-4 text-sky-700 dark:text-sky-400" />
              Open Lab Hub
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4" />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  Projector Light
                </>
              )}
            </button>
          </div>
        </div>

        {/* Concise Teaching Highlights Column */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Built for Lecture Halls &amp; Exam Prep
          </div>
          <ul className="space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            <li>
              <strong className="text-slate-900 dark:text-slate-100">Concept &amp; Formulas First:</strong>{' '}
              Every stage teaches intuition, symbol glossaries, and worked numbers before opening the visual lab.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-100">Train/Test Overfitting:</strong>{' '}
              Toggle holdout test sets in Linear Regression, KNN, and Decision Trees.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-100">Socratic Visual Proofs:</strong>{' '}
              One click in Teacher Mode switches to the visual lab and animates edge cases or divergence live.
            </li>
          </ul>
        </div>
      </section>

      {/* 7-Stage Curriculum Grid */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              The 7-Stage Curriculum
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Click any module to launch its interactive simulation directly, or start with Teacher Mode open.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Hybrid Navigation · Sequential + Direct Sandbox
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CURRICULUM_STAGES.map((stage) => (
            <div
              key={stage.id}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-sky-500 dark:hover:border-sky-400 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                    0{stage.id}. {stage.category}
                  </span>
                  <span>{stage.datasetTag.split('·')[0].trim()}</span>
                </div>

                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                  {stage.title}
                </h3>

                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {stage.subtitle}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-3.5">
                <button
                  type="button"
                  onClick={() => openStage(stage.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Open Simulation
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLaunchWithTeacher(stage.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                  title="Launch with Instructor Socratic Drawer open"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  Teach
                </button>
              </div>
            </div>
          ))}

          {/* 8th Grid Tile: Dedicated Lab Assignments Hub */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-5 hover:border-sky-600 dark:hover:border-sky-400 transition-colors">
            <div className="space-y-2.5">
              <div className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                08. Lab Transition
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                Lab Assignments &amp; Python Starter Code
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Preview and download all 5 classic CSV datasets (Hours vs. Marks, Exam Pass/Fail, Iris, Play Tennis, SMS Spam) with Scikit-learn &amp; NumPy starter templates.
              </p>
            </div>

            <div className="mt-5 border-t border-slate-200 dark:border-slate-700 pt-3.5">
              <button
                type="button"
                onClick={() => setView('labs')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Open Lab Hub
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
