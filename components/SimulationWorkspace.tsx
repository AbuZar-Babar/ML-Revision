'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CURRICULUM_STAGES } from '@/data/curriculum';
import WorkspaceToolbar from '@/components/common/WorkspaceToolbar';
import TeacherDrawer from '@/components/common/TeacherDrawer';
import ConceptPrimer from '@/components/common/ConceptPrimer';
import Stage1Intro from '@/components/stages/Stage1Intro';
import Stage2TrainingLoop from '@/components/stages/Stage2TrainingLoop';
import Stage3Taxonomy from '@/components/stages/Stage3Taxonomy';
import Stage4LinearReg from '@/components/stages/Stage4LinearReg';
import Stage5LogisticReg from '@/components/stages/Stage5LogisticReg';
import Stage6NonLinear from '@/components/stages/Stage6NonLinear';
import Stage7NaiveBayes from '@/components/stages/Stage7NaiveBayes';

export default function SimulationWorkspace() {
  const {
    activeStageId,
    stageStep,
    setStageStep,
    prevStage,
    nextStage,
    setView,
  } = useApp();
  const stage =
    CURRICULUM_STAGES.find((s) => s.id === activeStageId) ??
    CURRICULUM_STAGES[0];

  const renderActiveStage = () => {
    switch (activeStageId) {
      case 1:
        return <Stage1Intro />;
      case 2:
        return <Stage2TrainingLoop />;
      case 3:
        return <Stage3Taxonomy />;
      case 4:
        return <Stage4LinearReg />;
      case 5:
        return <Stage5LogisticReg />;
      case 6:
        return <Stage6NonLinear />;
      case 7:
        return <Stage7NaiveBayes />;
      default:
        return <Stage1Intro />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <WorkspaceToolbar />

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-6">
        {/* Stage Header + Two-Step Flow Switcher */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                {stage.numberLabel} of 07
              </span>
              <span aria-hidden="true">·</span>
              <span>{stage.category}</span>
              <span aria-hidden="true">·</span>
              <span>{stage.datasetTag}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 [text-wrap:balance]">
              {stage.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {stage.subtitle}
            </p>
          </div>

          {/* Two-Step Segmented Flow: 1. Concept & Formulas -> 2. Visual Lab */}
          <div
            role="tablist"
            aria-label="Stage learning step"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1 shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={stageStep === 'concept'}
              onClick={() => setStageStep('concept')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                stageStep === 'concept'
                  ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>1. Concept &amp; Formulas</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={stageStep === 'visual'}
              onClick={() => setStageStep('visual')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                stageStep === 'visual'
                  ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>2. Visual Lab</span>
            </button>
          </div>
        </div>

        {/* Collapsible Instructor Socratic Drawer */}
        <TeacherDrawer />

        {/* Stage Content: Step 1 (Concept & Formulas) or Step 2 (Interactive Visual Lab) */}
        <AnimatePresence mode="wait">
          <motion.section
            key={`${activeStageId}-${stageStep}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {stageStep === 'concept' ? (
              <ConceptPrimer stageId={activeStageId} />
            ) : (
              renderActiveStage()
            )}
          </motion.section>
        </AnimatePresence>

        {/* Bottom Sequential Lecture Stepper & Key Takeaway */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 pt-5">
          <div className="max-w-xl text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            <strong className="text-slate-900 dark:text-slate-100">
              Stage Takeaway:
            </strong>{' '}
            {stage.keyTakeaway}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {stageStep === 'visual' && (
              <button
                type="button"
                onClick={() => setStageStep('concept')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Review Formulas
              </button>
            )}

            <button
              type="button"
              onClick={prevStage}
              disabled={activeStageId <= 1}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous Stage
            </button>

            {activeStageId < 7 ? (
              <button
                type="button"
                onClick={nextStage}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 dark:bg-sky-500 px-4 py-2 text-xs font-semibold text-white dark:text-slate-950 hover:bg-sky-800 dark:hover:bg-sky-400 transition-colors cursor-pointer"
              >
                Next: Stage 0{activeStageId + 1}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setView('labs')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 dark:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white dark:text-slate-950 hover:bg-emerald-800 dark:hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Proceed to Lab Assignments
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
