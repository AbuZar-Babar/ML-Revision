'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calculator,
  Lightbulb,
  Moon,
  Sigma,
  SlidersHorizontal,
  Sun,
} from 'lucide-react';
import {
  STAGE_SECTIONS,
  StageSection,
  useApp,
} from '@/context/AppContext';
import { CURRICULUM_STAGES } from '@/data/curriculum';
import StageSidebar from '@/components/common/StageSidebar';
import TeacherDrawer from '@/components/common/TeacherDrawer';
import IdeaSection from '@/components/sections/IdeaSection';
import FormulaSection from '@/components/sections/FormulaSection';
import InteractiveExampleSection from '@/components/sections/InteractiveExampleSection';
import Stage1Intro from '@/components/stages/Stage1Intro';
import Stage2TrainingLoop from '@/components/stages/Stage2TrainingLoop';
import Stage3Taxonomy from '@/components/stages/Stage3Taxonomy';
import Stage4LinearReg from '@/components/stages/Stage4LinearReg';
import Stage5LogisticReg from '@/components/stages/Stage5LogisticReg';
import Stage6NonLinear from '@/components/stages/Stage6NonLinear';
import Stage7NaiveBayes from '@/components/stages/Stage7NaiveBayes';

const SECTION_ICONS: Record<StageSection, React.ReactNode> = {
  idea: <Lightbulb className="h-3.5 w-3.5" />,
  formula: <Sigma className="h-3.5 w-3.5" />,
  example: <Calculator className="h-3.5 w-3.5" />,
  lab: <SlidersHorizontal className="h-3.5 w-3.5" />,
};

export default function SimulationWorkspace() {
  const {
    activeStageId,
    activeSection,
    setActiveSection,
    openStage,
    prevStage,
    nextStage,
    setView,
    theme,
    toggleTheme,
    toggleCheatSheet,
  } = useApp();

  const stage =
    CURRICULUM_STAGES.find((s) => s.id === activeStageId) ??
    CURRICULUM_STAGES[0];

  const renderActiveLab = () => {
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* Clean Collapsible Left Stage Sidebar (Desktop) */}
      <StageSidebar />

      {/* Main Spacious Learning Canvas */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Compact Mobile/Tablet Stage Switcher Bar (hidden on lg+ where left sidebar lives) */}
        <div className="flex lg:hidden items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 overflow-x-auto">
          <div className="flex items-center gap-1">
            {CURRICULUM_STAGES.map((s) => {
              const isCurr = s.id === activeStageId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => openStage(s.id)}
                  className={`rounded-md px-2.5 py-1.5 font-mono text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isCurr
                      ? 'bg-sky-700 dark:bg-sky-500 text-white dark:text-slate-950'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  0{s.id}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleCheatSheet}
              className="rounded-md border border-slate-200 dark:border-slate-700 p-1.5 text-sky-700 dark:text-sky-400 cursor-pointer"
              aria-label="Formula Cheat Sheet"
            >
              <Sigma className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md border border-slate-200 dark:border-slate-700 p-1.5 text-slate-600 dark:text-slate-300 cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="h-3.5 w-3.5" />
              ) : (
                <Sun className="h-3.5 w-3.5 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        <main className="mx-auto w-full max-w-[1220px] flex-1 px-6 sm:px-10 py-8 sm:py-10">
          {/* Calm Stage Header + 4-Section Progression Rail */}
          <div className="mb-8 space-y-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
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
              </div>

              {/* Clean 4-Section Progression Rail: 01. Idea · 02. Formula · 03. Example · 04. Lab */}
              <div
                role="tablist"
                aria-label="Stage learning sections"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900 p-1 shrink-0 overflow-x-auto max-w-full"
              >
                {STAGE_SECTIONS.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveSection(sec.id)}
                      className={`relative inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                        isActive
                          ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      {SECTION_ICONS[sec.id]}
                      <span className="font-mono text-[11px] opacity-75">
                        {sec.num}.
                      </span>
                      <span>{sec.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Collapsible Instructor Socratic Drawer */}
          <TeacherDrawer />

          {/* Spacious Single-Focus Section Viewport */}
          <AnimatePresence mode="wait">
            <motion.section
              key={`${activeStageId}-${activeSection}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeSection === 'idea' && (
                <IdeaSection stageId={activeStageId} />
              )}
              {activeSection === 'formula' && (
                <FormulaSection stageId={activeStageId} />
              )}
              {activeSection === 'example' && (
                <InteractiveExampleSection
                  key={`example-${activeStageId}`}
                  stageId={activeStageId}
                />
              )}
              {activeSection === 'lab' && renderActiveLab()}
            </motion.section>
          </AnimatePresence>

          {/* Bottom Stage Progression Footer (shown cleanly on Visual Lab so earlier sections aren't crowded by double footers) */}
          {activeSection === 'lab' && (
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
              <div className="max-w-xl text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-slate-100">
                  Stage Takeaway:
                </strong>{' '}
                {stage.keyTakeaway}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSection('example')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Calculator className="h-3.5 w-3.5" />
                  Back to 03. Example
                </button>

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
          )}
        </main>
      </div>
    </div>
  );
}
