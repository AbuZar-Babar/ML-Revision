'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  GraduationCap,
  Moon,
  Sigma,
  SlidersHorizontal,
  Sun,
} from 'lucide-react';
import {
  STAGE_SECTIONS,
  StageSection,
  TOTAL_CHAPTERS,
  useApp,
} from '@/context/AppContext';
import {
  CURRICULUM_STAGES,
  getStageById,
  getUnitById,
} from '@/data/curriculum';
import StageSidebar from '@/components/common/StageSidebar';
import TeacherDrawer from '@/components/common/TeacherDrawer';
import InfoPopover from '@/components/common/InfoPopover';
import VisualLabExamplesBar from '@/components/common/VisualLabExamplesBar';
import ConceptFormulaSection from '@/components/sections/ConceptFormulaSection';
import PythonCodeSection from '@/components/sections/PythonCodeSection';
import Stage1Intro from '@/components/stages/Stage1Intro';
import Stage2ParadigmsRL from '@/components/stages/Stage2ParadigmsRL';
import Stage2TrainingLoop from '@/components/stages/Stage2TrainingLoop';
import Stage3Preprocessing from '@/components/stages/Stage3Preprocessing';
import Stage4LinearReg from '@/components/stages/Stage4LinearReg';
import Stage5BiasVariance from '@/components/stages/Stage5BiasVariance';
import Stage5LogisticReg from '@/components/stages/Stage5LogisticReg';
import Stage7SVM from '@/components/stages/Stage7SVM';
import Stage6NonLinear from '@/components/stages/Stage6NonLinear';
import Stage7NaiveBayes from '@/components/stages/Stage7NaiveBayes';
import Stage10Ensembles from '@/components/stages/Stage10Ensembles';
import Stage3Taxonomy from '@/components/stages/Stage3Taxonomy';
import Stage12PCA from '@/components/stages/Stage12PCA';
import Stage13NeuralNet from '@/components/stages/Stage13NeuralNet';
import Stage14Backprop from '@/components/stages/Stage14Backprop';
import Stage16CNN from '@/components/stages/Stage16CNN';
import Stage17Transformers from '@/components/stages/Stage17Transformers';

const SECTION_ICONS: Record<StageSection, React.ReactNode> = {
  concept: <BookOpen className="h-3.5 w-3.5" />,
  lab: <SlidersHorizontal className="h-3.5 w-3.5" />,
  code: <Code2 className="h-3.5 w-3.5" />,
};

export default function SimulationWorkspace() {
  const {
    activeStageId,
    activeSection,
    setActiveSection,
    completedChapters,
    openStage,
    prevStage,
    theme,
    toggleTheme,
    teacherDrawerOpen,
    toggleTeacherDrawer,
    toggleCheatSheet,
  } = useApp();

  const stage = getStageById(activeStageId);
  const unit = getUnitById(stage.unitId);
  const isChapterDone = completedChapters.includes(activeStageId);
  const padNum = (n: number) => String(n).padStart(2, '0');

  const renderActiveLab = () => {
    switch (activeStageId) {
      case 1:
        return <Stage1Intro />;
      case 2:
        return <Stage2ParadigmsRL />;
      case 3:
        return <Stage2TrainingLoop />;
      case 4:
        return <Stage3Preprocessing />;
      case 5:
        return <Stage4LinearReg />;
      case 6:
        return <Stage5BiasVariance />;
      case 7:
        return <Stage5LogisticReg />;
      case 8:
        return <Stage7SVM />;
      case 9:
        return <Stage6NonLinear />;
      case 10:
        return <Stage7NaiveBayes />;
      case 11:
        return <Stage10Ensembles />;
      case 12:
        return <Stage3Taxonomy />;
      case 13:
        return <Stage12PCA />;
      case 14:
        return <Stage13NeuralNet />;
      case 15:
        return <Stage14Backprop />;
      case 16:
        return <Stage16CNN />;
      case 17:
        return <Stage17Transformers />;
      default:
        return <Stage1Intro />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* Collapsible Unit-Grouped Left Sidebar */}
      <StageSidebar />

      {/* Main Learning Viewport */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Compact Mobile Chapter Switcher */}
        <div className="flex lg:hidden items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5">
          <div className="flex items-center gap-1 overflow-x-auto pr-2">
            {CURRICULUM_STAGES.map((s) => {
              const isCurr = s.id === activeStageId;
              const isDone = completedChapters.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => openStage(s.id)}
                  className={`rounded-md px-2 py-1.5 font-mono text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isCurr
                      ? 'bg-blue-700 dark:bg-blue-500 text-white dark:text-slate-950'
                      : isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {padNum(s.id)}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleTeacherDrawer}
              className={`rounded-md border p-1.5 cursor-pointer ${
                teacherDrawerOpen
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              aria-label="Toggle Instructor Mode"
            >
              <GraduationCap className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleCheatSheet}
              className="rounded-md border border-slate-200 dark:border-slate-700 p-1.5 text-blue-700 dark:text-blue-400 cursor-pointer"
              aria-label="Formula Sheet"
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

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 sm:px-10 py-8">
          {/* Consistent Minimal Chapter Header + 3-Step Rail */}
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-1 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold text-blue-700 dark:text-blue-400">
                  {unit.numberLabel}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  Ch. {padNum(stage.id)} / {TOTAL_CHAPTERS}
                </span>
                {isChapterDone && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Done
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 [text-wrap:balance]">
                  {stage.title}
                </h1>
                <InfoPopover
                  title={stage.title}
                  content={stage.subtitle}
                  align="left"
                  size="md"
                />
              </div>
            </div>

            {/* Clean 3-Step Progression Rail */}
            <div
              role="tablist"
              aria-label="Chapter learning steps"
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
                    className={`relative inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
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

          {/* Optional Instructor Mode Drawer */}
          <TeacherDrawer />

          {/* Active Step Viewport */}
          <AnimatePresence mode="wait">
            <motion.section
              key={`${activeStageId}-${activeSection}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeSection === 'concept' && (
                <ConceptFormulaSection stageId={activeStageId} />
              )}

              {activeSection === 'lab' && (
                <div>
                  <VisualLabExamplesBar
                    key={`presets-${activeStageId}`}
                    stageId={activeStageId}
                  />
                  {renderActiveLab()}
                </div>
              )}

              {activeSection === 'code' && (
                <PythonCodeSection stageId={activeStageId} />
              )}
            </motion.section>
          </AnimatePresence>

          {/* Clean Visual Lab Footer advancing to 03. Python Code */}
          {activeSection === 'lab' && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 pt-5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('concept')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  01. Concept
                </button>
                <button
                  type="button"
                  onClick={prevStage}
                  disabled={activeStageId <= 1}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Prev Ch.
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveSection('code')}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 dark:bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-950 hover:bg-blue-800 dark:hover:bg-blue-400 transition-colors cursor-pointer"
              >
                <Code2 className="h-4 w-4" />
                Continue to 03. Python Code
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
