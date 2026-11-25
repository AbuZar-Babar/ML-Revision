'use client';

import React from 'react';
import { motion } from 'motion/react';
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

const COURSE_UNITS = [
  {
    unitNumber: 'Unit 01',
    title: 'Foundations of Learning',
    description:
      'Build intuition for how data-driven models replace rigid code, minimize loss step by step, and organize problems into three ML paradigms.',
    stageIds: [1, 2, 3],
  },
  {
    unitNumber: 'Unit 02',
    title: 'Linear & Logistic Models',
    description:
      'Explore convex MSE loss bowls, gradient descent step sizes, extreme outlier breakdowns, and Sigmoid probability thresholds.',
    stageIds: [4, 5],
  },
  {
    unitNumber: 'Unit 03',
    title: 'Non-Linear & Probabilistic Reasoning',
    description:
      'Solve curved boundaries with KNN voting and orthogonal Decision Trees, then weigh word probabilities with Naive Bayes and Laplace smoothing.',
    stageIds: [6, 7],
  },
];

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
    openStage(stageId, 'idea');
  };

  return (
    <main className="mx-auto max-w-[1200px] px-6 sm:px-8 py-12 sm:py-16 space-y-16">
      {/* Spacious Academic Hero Section */}
      <section className="space-y-6 pb-12 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-4 max-w-3xl">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Undergraduate Machine Learning Curriculum <span aria-hidden="true">·</span> 4 Guided Sections per Topic <span aria-hidden="true">·</span> 5 Classic Lab Datasets
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.12] [text-wrap:balance]">
            Master Machine Learning Visually Before Writing Code
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">
            Every topic unfolds calmly across four dedicated sections—<strong>01. Idea</strong>, <strong>02. Formula</strong>, <strong>03. Interactive Example</strong>, and <strong>04. Visual Lab</strong>—so students master intuition and math without feeling overwhelmed.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => openStage(1, 'idea')}
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
            Lab Assignments
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
      </section>

      {/* Spacious Grouped Course Units */}
      <div className="space-y-14">
        {COURSE_UNITS.map((unit, uIdx) => {
          const unitStages = unit.stageIds
            .map((id) => CURRICULUM_STAGES.find((s) => s.id === id))
            .filter((s): s is NonNullable<typeof s> => Boolean(s));

          return (
            <motion.section
              key={unit.unitNumber}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: uIdx * 0.08 }}
              className="space-y-5"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="font-mono text-xs font-semibold text-sky-700 dark:text-sky-400">
                  {unit.unitNumber}
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {unit.title}
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {unit.description}
                </p>
              </div>

              <div
                className={`grid gap-6 ${
                  unitStages.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
                }`}
              >
                {unitStages.map((stage) => (
                  <div
                    key={stage.id}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:border-sky-500 dark:hover:border-sky-400 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                          Stage 0{stage.id}
                        </span>
                        <span>{stage.category}</span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                        {stage.title}
                      </h3>

                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {stage.subtitle}
                      </p>
                    </div>

                    <div className="mt-6 space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                        01. Idea · 02. Formula · 03. Example · 04. Lab
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => openStage(stage.id, 'idea')}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Start Stage 0{stage.id}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openStage(stage.id, 'lab')}
                            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                          >
                            Jump to Lab
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
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* Dedicated Lab Transition Callout */}
      <section className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-7 sm:p-8 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Hands-On Coding Transition
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
            Lab Assignments &amp; Classic University Datasets
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Ready to code in Python? Inspect in-browser CSV tables for Hours vs. Marks, Exam Pass/Fail, Iris, Play Tennis, and SMS Spam, and download ready-to-run NumPy &amp; Scikit-learn starter scripts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setView('labs')}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 dark:bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-950 hover:bg-emerald-800 dark:hover:bg-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Open Lab Hub
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </main>
  );
}
