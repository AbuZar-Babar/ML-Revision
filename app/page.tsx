'use client';

import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import Navbar from '@/components/common/Navbar';
import OverviewPage from '@/components/OverviewPage';
import SimulationWorkspace from '@/components/SimulationWorkspace';
import ComparePage from '@/components/ComparePage';
import GlossaryPage from '@/components/GlossaryPage';
import LabHub from '@/components/lab/LabHub';
import FormulaCheatSheetModal from '@/components/common/FormulaCheatSheetModal';

function AppShell() {
  const { view } = useApp();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        {view === 'overview' && <OverviewPage />}
        {view === 'stage' && <SimulationWorkspace />}
        {view === 'compare' && <ComparePage />}
        {view === 'glossary' && <GlossaryPage />}
        {view === 'labs' && <LabHub />}
      </div>
      <FormulaCheatSheetModal />
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] py-5">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 text-xs text-slate-500 dark:text-slate-400">
          <span>ML Studio Lab — Interactive Machine Learning Course</span>
          <span>
            5 Units · 17 Interactive Chapters · Visual Labs &amp; Python Code
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
