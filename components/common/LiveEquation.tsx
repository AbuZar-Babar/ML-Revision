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
  title?: string;
  label?: string;
  subtitle?: string;
  formula?: string;
  footnote?: string;
  tokens?: EquationToken[];
  activeHighlight?: string | null;
  onHighlightChange?: (key: string | null) => void;
}

const TONE_CLASSES: Record<NonNullable<EquationToken['tone']>, string> = {
  neutral: 'text-slate-700 dark:text-slate-300',
  primary:
    'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800',
  danger:
    'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800',
  success:
    'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800',
  amber:
    'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800',
};

export default function LiveEquation({
  title,
  label,
  subtitle,
  formula,
  footnote,
  tokens,
  activeHighlight,
  onHighlightChange,
}: LiveEquationProps) {
  const heading = title ?? label ?? 'Live Equation';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {heading}
        </span>
        {subtitle && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </span>
        )}
      </div>

      {tokens && tokens.length > 0 ? (
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
                onMouseEnter={() =>
                  onHighlightChange?.(tok.highlightKey ?? null)
                }
                onMouseLeave={() => onHighlightChange?.(null)}
                onFocus={() => onHighlightChange?.(tok.highlightKey ?? null)}
                onBlur={() => onHighlightChange?.(null)}
                className={`rounded-md px-2 py-0.5 font-medium transition-all cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${toneClass} ${
                  isHighlighted
                    ? 'ring-2 ring-blue-600 dark:ring-blue-400 scale-[1.03]'
                    : ''
                }`}
              >
                {tok.text}
              </button>
            );
          })}
        </div>
      ) : (
        formula && (
          <div className="mt-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 font-mono text-xs sm:text-sm font-semibold tabular-nums text-blue-800 dark:text-blue-300 overflow-x-auto">
            {formula}
          </div>
        )
      )}

      {footnote && (
        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {footnote}
        </p>
      )}
    </div>
  );
}
