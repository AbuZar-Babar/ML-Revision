'use client';

import React, { useMemo, useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Search,
  Table2,
} from 'lucide-react';
import { LAB_DATASETS, serializeDatasetToCSV } from '@/data/datasets';
import { useApp } from '@/context/AppContext';
import InfoPopover from '@/components/common/InfoPopover';

function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Lightweight client-side Python syntax tokenizer for crisp code readability
function renderHighlightedPython(code: string) {
  const lines = code.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    let cls = 'text-slate-200';
    if (trimmed.startsWith('# TODO')) {
      cls = 'text-amber-300 font-semibold';
    } else if (trimmed.startsWith('#') || trimmed.startsWith('"""')) {
      cls = 'text-slate-400';
    } else if (
      trimmed.startsWith('import ') ||
      trimmed.startsWith('from ') ||
      trimmed.startsWith('def ') ||
      trimmed.startsWith('for ') ||
      trimmed.startsWith('if ') ||
      trimmed.startsWith('else:') ||
      trimmed.startsWith('return ')
    ) {
      cls = 'text-blue-300';
    }
    return (
      <div key={i} className="table-row">
        <span className="table-cell select-none pr-4 text-right text-slate-600 font-mono text-[11px]">
          {i + 1}
        </span>
        <span className={`table-cell whitespace-pre ${cls}`}>{line}</span>
      </div>
    );
  });
}

export default function LabHub() {
  const { openStage } = useApp();
  const [selectedLabId, setSelectedLabId] = useState<string>(LAB_DATASETS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeLab = useMemo(
    () => LAB_DATASETS.find((l) => l.id === selectedLabId) ?? LAB_DATASETS[0],
    [selectedLabId]
  );

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeLab.rows;
    return activeLab.rows.filter((row) =>
      row.some((cell) => String(cell).toLowerCase().includes(q))
    );
  }, [activeLab, searchQuery]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeLab.starterCode);
      setCopiedId(activeLab.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = activeLab.starterCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(activeLab.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const handleDownloadCSV = () => {
    const csv = serializeDatasetToCSV(activeLab);
    downloadTextFile(activeLab.csvFilename, csv, 'text/csv;charset=utf-8;');
  };

  const handleDownloadPY = () => {
    downloadTextFile(
      activeLab.pyFilename,
      activeLab.starterCode,
      'text/x-python;charset=utf-8;'
    );
  };

  return (
    <main className="mx-auto max-w-[1360px] px-6 sm:px-8 py-10 space-y-6">
      {/* Header Row */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800 space-y-1.5 max-w-3xl">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Hands-On Coding Labs <span aria-hidden="true">·</span> {LAB_DATASETS.length} Classic Datasets <span aria-hidden="true">·</span> NumPy &amp; Scikit-Learn
        </div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Python Lab Assignments &amp; Datasets
          </h1>
          <InfoPopover
            title="How to use these CSV labs"
            align="left"
            content="Each lab pairs a clean classroom CSV dataset with a structured NumPy/Scikit-Learn starter script. Every course chapter also has its own focused Python walkthrough inside Step 03 (Python Code)."
          />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Inspect datasets live in-browser and download paired Python starter scripts or open them directly in Colab.
        </p>
      </div>

      {/* Lab Module Selector Tabs */}
      <div
        role="tablist"
        aria-label="Lab Assignment Modules"
        className="flex items-center gap-2 overflow-x-auto pb-1"
      >
        {LAB_DATASETS.map((lab, idx) => {
          const active = lab.id === activeLab.id;
          return (
            <button
              key={lab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setSelectedLabId(lab.id);
                setSearchQuery('');
              }}
              className={`rounded-xl border px-4 py-2.5 text-left transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'border-blue-700 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                Lab 0{idx + 1} · {lab.csvFilename}
              </div>
              <div className="text-sm font-semibold mt-0.5">{lab.algorithm}</div>
            </button>
          );
        })}
      </div>

      {/* Active Lab Briefing + Action Buttons */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Paired with {activeLab.stageRef}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{activeLab.csvFilename}</span>
              <span aria-hidden="true">·</span>
              <span>{activeLab.recordCountLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
                {activeLab.title}
              </h2>
              <InfoPopover
                title="Lab Objectives"
                align="left"
                content={activeLab.learningObjectives
                  .map((obj, i) => `${i + 1}. ${obj}`)
                  .join('  ')}
              />
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {activeLab.taskSummary}
            </p>
          </div>

          {/* Primary Download & Launch Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPY}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 dark:bg-blue-500 px-4 py-2 text-xs font-semibold text-white dark:text-slate-950 hover:bg-blue-800 dark:hover:bg-blue-400 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Download Starter (.py)
            </button>
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Download Dataset (.csv)
            </button>
            <a
              href={activeLab.colabUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in Google Colab
            </a>
            <button
              type="button"
              onClick={() => openStage(activeLab.chapterId, 'lab')}
              className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline px-2 py-1 cursor-pointer"
            >
              Open {activeLab.stageRef} Visual →
            </button>
          </div>
        </div>
      </div>

      {/* Dual Pane: Dataset CSV Viewer (Left) + Starter Python Template (Right) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left: In-Browser CSV Preview Table */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Table2 className="h-4 w-4 text-blue-700 dark:text-blue-400" />
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                CSV Preview:{' '}
                <span className="font-mono">{activeLab.csvFilename}</span>
              </h3>
            </div>
            <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
              {filteredRows.length} / {activeLab.rows.length} rows
            </span>
          </div>

          {/* Filter Input */}
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter rows by value or label..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="mt-3 max-h-[440px] overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs font-mono tabular-nums">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <tr>
                  <th className="px-3 py-2 font-semibold text-slate-400 w-9">
                    #
                  </th>
                  {activeLab.columns.map((col) => (
                    <th key={col} className="px-3 py-2 font-semibold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-3 py-1.5 text-slate-400">{rIdx + 1}</td>
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-3 py-1.5 text-slate-800 dark:text-slate-200"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={activeLab.columns.length + 1}
                      className="px-3 py-6 text-center font-sans text-slate-500"
                    >
                      No records match &ldquo;{searchQuery}&rdquo;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Syntax-Highlighted Python Starter Template */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-blue-700 dark:text-blue-400" />
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Starter Code:{' '}
                <span className="font-mono">{activeLab.pyFilename}</span>
              </h3>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copiedId === activeLab.id ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Python Code
                </>
              )}
            </button>
          </div>

          <div className="mt-3 max-h-[488px] overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-6">
            <div className="table w-full">
              {renderHighlightedPython(activeLab.starterCode)}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
