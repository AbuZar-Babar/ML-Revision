'use client';

import React, { useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { STAGE_INTERACTIVE_EXAMPLES } from '@/data/interactiveExamples';
import InfoPopover from '@/components/common/InfoPopover';

// Map new 17-chapter IDs to existing preset example definitions (for chapters
// whose Visual Lab canvas does not already have its own built-in preset strip).
const EXAMPLE_ID_MAP: Record<number, number> = {
  1: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  7: 6,
  8: 7,
  9: 8,
  10: 9,
  11: 10,
  12: 11,
  13: 12,
  14: 13,
  15: 14,
};

interface VisualLabExamplesBarProps {
  stageId: number;
}

export default function VisualLabExamplesBar({
  stageId,
}: VisualLabExamplesBarProps) {
  const { triggerVisualProof } = useApp();
  const mappedId = EXAMPLE_ID_MAP[stageId];
  const spec = mappedId ? STAGE_INTERACTIVE_EXAMPLES[mappedId] : undefined;

  const [selection, setSelection] = useState<{ stageId: number; idx: number }>({
    stageId,
    idx: 0,
  });

  const selectedPresetIdx =
    selection.stageId === stageId ? selection.idx : 0;

  const activePreset = spec?.presets[selectedPresetIdx] ?? spec?.presets[0];

  const evaluation = useMemo(() => {
    if (!spec || !activePreset) return null;
    return spec.evaluate(activePreset.values);
  }, [spec, activePreset]);

  if (!spec || !activePreset || !evaluation) return null;

  return (
    <div className="mb-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="font-medium text-slate-400 mr-1">Example Case:</span>
        {spec.presets.map((preset, idx) => {
          const active = idx === selectedPresetIdx;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelection({ stageId, idx })}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition-colors whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-600/60 dark:border-blue-400/60 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-transparent hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {preset.title}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
          {evaluation.resultBadge} · {evaluation.resultMetric}
        </span>

        <InfoPopover
          title={`Example: ${activePreset.title}`}
          content={`${activePreset.subtitle} — ${evaluation.conclusion}`}
          example={evaluation.steps.map((s) => `${s.label}: ${s.math}`).join('  |  ')}
          align="right"
        />

        <button
          type="button"
          onClick={() => triggerVisualProof(stageId)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 dark:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-950 hover:bg-blue-800 dark:hover:bg-blue-400 transition-colors whitespace-nowrap cursor-pointer"
        >
          <Play className="h-3 w-3 fill-current" />
          Animate Demo
        </button>
      </div>
    </div>
  );
}
