'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CURRICULUM_STAGES } from '@/data/curriculum';

export default function GuidePage() {
  const { openStage, setView } = useApp();

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-10 space-y-10">
      <div className="space-y-2 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Instructor Playbook <span aria-hidden="true">·</span> Classroom Projection &amp; Socratic Method
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Teaching Guide for ML Studio Lab
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          A practical lecture choreography designed to resolve the conceptual gaps commonly seen in undergraduate machine learning lab midterms.
        </p>
      </div>

      {/* 3 Core Classroom Mechanics */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
            01. Hybrid Navigation
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Use the bottom <strong>Next / Prev</strong> stepper during structured lectures to build a linear narrative from if/else rules to Naive Bayes, or click any numbered stage in the top toolbar during Q&amp;A.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
            02. Socratic Visual Proofs
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Open <strong>Teacher Mode</strong> inside any simulation to display a discussion prompt for the room, then click <strong>Show Visual Proof</strong> to animate the mathematical breakdown live on screen.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
            03. Projector Contrast Mode
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Default <strong>Projector Light Mode</strong> uses crisp off-white canvases and dual-coded shapes (circles vs. diamonds) for washed-out classroom projectors; students can toggle <strong>Dark Mode</strong> for evening review.
          </p>
        </div>
      </section>

      {/* Stage-by-Stage Socratic Index */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
          Stage-by-Stage Socratic Prompts &amp; Proofs
        </h2>

        <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {CURRICULUM_STAGES.map((stage) => (
            <div
              key={stage.id}
              className="flex flex-wrap items-start justify-between gap-4 p-5"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                  {stage.numberLabel} · {stage.title}
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  &ldquo;{stage.socraticQuestion}&rdquo;
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Visual Proof: {stage.proofDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openStage(stage.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
              >
                Launch Stage 0{stage.id}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setView('labs')}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 dark:bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-950 hover:bg-sky-800 dark:hover:bg-sky-400 transition-colors cursor-pointer"
        >
          Inspect All 5 Lab Assignments
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </main>
  );
}
