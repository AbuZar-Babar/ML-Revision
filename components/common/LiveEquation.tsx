'use client';

import React from 'react';

export interface EquationToken {
  id?: string;
  text: string;
  highlightKey?: string;
  tone?: 'neutral' | 'primary' | 'danger' | 'success' | 'amber';
  tooltip?: string;
}

interface LiveEquationProps {
  title: string;
  subtitle?: string;
  tokens: EquationToken[];
  activeHighlight?: string | null;
  onHighlightChange?: (key: string | null) => void;
}

const TONE_CLASSES: Record<NonNullable<EquationToken['tone']>, string> = {
  neutral: 'text-slate-700 dark:text-slate-300',
  primary:
    'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800',
  danger:
    'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800',
  success:
    'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800',
  amber:
    'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800',
};

export default function LiveEquation({
  title,
  subtitle,
  tokens,
  activeHighlight,
  onHighlightChange,
}: LiveEquationProps) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {title}
        </span>
        {subtitle && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 font-mono text-sm tabular-nums leading-relaxed">
        {tokens.map((tok, idx) => {
          const isInteractive = Boolean(tok.highlightKey);
          const isHighlighted =
            isInteractive && activeHighlight === tok.highlightKey;
          const toneClass = TONE_CLASSES[tok.tone ?? 'neutral'];

          if (!isInteractive) {
            return (
              <span key={tok.id ?? idx} className={`${toneClass} px-0.5`}>
                {tok.text}
              </span>
            );
          }

          return (
            <button
              key={tok.id ?? idx}
              type="button"
              title={tok.tooltip}
              onMouseEnter={() => onHighlightChange?.(tok.highlightKey ?? null)}
              onMouseLeave={() => onHighlightChange?.(null)}
              onFocus={() => onHighlightChange?.(tok.highlightKey ?? null)}
              onBlur={() => onHighlightChange?.(null)}
              className={`rounded-md px-2 py-0.5 font-medium transition-all cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${toneClass} ${
                isHighlighted
                  ? 'ring-2 ring-sky-600 dark:ring-sky-400 scale-[1.03]'
                  : ''
              }`}
            >
              {tok.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
