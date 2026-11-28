'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  FolderOpen,
} from 'lucide-react';
import { TOTAL_CHAPTERS, useApp } from '@/context/AppContext';
import { CHAPTER_CODE } from '@/data/chapterCode';
import { getStageById, getUnitById } from '@/data/curriculum';
import InfoPopover from '@/components/common/InfoPopover';

interface PythonCodeSectionProps {
  stageId: number;
}

function downloadPy(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/x-python;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function renderPythonLines(code: string) {
  return code.split('\n').map((line, i) => {
    const trimmed = line.trim();
    let cls = 'text-slate-200';
    if (trimmed.startsWith('#')) {
      cls = 'text-slate-400';
    } else if (
      trimmed.startsWith('import ') ||
      trimmed.startsWith('from ') ||
      trimmed.startsWith('def ') ||
      trimmed.startsWith('for ') ||
      trimmed.startsWith('while ') ||
      trimmed.startsWith('if ') ||
      trimmed.startsWith('return ')
    ) {
      cls = 'text-blue-300';
    }
    return (
      <div key={i} className="table-row">
        <span className="table-cell select-none pr-4 text-right text-slate-600 font-mono text-[11px] tabular-nums">
          {i + 1}
        </span>
        <span className={`table-cell whitespace-pre ${cls}`}>{line}</span>
      </div>
    );
  });
}

export default function PythonCodeSection({ stageId }: PythonCodeSectionProps) {
  const {
    completedChapters,
    markChapterCompleted,
    setActiveSection,
    nextStage,
    setView,
  } = useApp();

  const [copied, setCopied] = useState(false);

  const spec = CHAPTER_CODE[stageId] ?? CHAPTER_CODE[1];
  const currentStage = getStageById(stageId);
  const nextChapter =
    stageId < TOTAL_CHAPTERS ? getStageById(stageId + 1) : null;
  const isNextNewUnit =
    nextChapter !== null && nextChapter.unitId !== currentStage.unitId;
  const nextUnit = nextChapter ? getUnitById(nextChapter.unitId) : null;
  const isCompleted = completedChapters.includes(stageId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(spec.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = spec.code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleCompleteAndContinue = () => {
    markChapterCompleted(stageId);
    if (stageId < TOTAL_CHAPTERS) {
      nextStage();
    } else {
      setView('labs');
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact 1-Line Summary + Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4">
        <div className="space-y-0.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Code2 className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {spec.filename}
            </span>
            <span aria-hidden="true">·</span>
            <span>{spec.framework}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {spec.summary}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Code
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => downloadPy(spec.filename, spec.code)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
            Download .py
          </button>

          {spec.labDatasetId && (
            <button
              type="button"
              onClick={() => setView('labs')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Dataset CSV
            </button>
          )}
        </div>
      </div>

      {/* Code Viewport + Compact (?) Line Explanations */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 overflow-x-auto font-mono text-xs sm:text-[13px] leading-6">
        <div className="table w-full">{renderPythonLines(spec.code)}</div>
      </div>

      {spec.annotations.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            Code Breakdown:
          </span>
          {spec.annotations.map((ann) => (
            <span
              key={ann.id}
              className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300"
            >
              <span className="font-mono text-[11px] text-blue-700 dark:text-blue-400">
                {ann.lineHint}
              </span>
              <span>{ann.label}</span>
              <InfoPopover
                title={`${ann.label} (${ann.lineHint})`}
                content={ann.explanation}
                align="left"
              />
            </span>
          ))}
        </div>
      )}

      {/* Clean Progression Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveSection('lab')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to 02. Visual Lab
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {!isCompleted && (
            <button
              type="button"
              onClick={() => markChapterCompleted(stageId)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Mark Complete
            </button>
          )}

          <button
            type="button"
            onClick={handleCompleteAndContinue}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 dark:bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-950 hover:bg-blue-800 dark:hover:bg-blue-400 transition-colors cursor-pointer"
          >
            {nextChapter ? (
              isNextNewUnit && nextUnit ? (
                <>
                  Start {nextUnit.numberLabel}: {nextUnit.shortTitle}
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue to Ch. {String(nextChapter.id).padStart(2, '0')}:{' '}
                  {nextChapter.shortTitle}
                  <ArrowRight className="h-4 w-4" />
                </>
              )
            ) : (
              <>
                Open Full Python Datasets
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
