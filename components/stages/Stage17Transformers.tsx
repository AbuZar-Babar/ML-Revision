'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '@/context/AppContext';
import InfoPopover from '@/components/common/InfoPopover';
import LiveEquation from '@/components/common/LiveEquation';
import {
  AttentionHeadMode,
  computeSelfAttentionForQuery,
  TRANSFORMER_PRESETS,
} from '@/lib/ml-modern-math';

export default function Stage17Transformers() {
  const { registerProofHandler } = useApp();

  const [presetIdx, setPresetIdx] = useState<number>(0);
  const [headMode, setHeadMode] = useState<AttentionHeadMode>('semantic');
  const [queryIdx, setQueryIdx] = useState<number>(
    TRANSFORMER_PRESETS[0].defaultQueryIndex
  );
  const [temperature, setTemperature] = useState<number>(1.0);

  const preset = TRANSFORMER_PRESETS[presetIdx];
  const activeHead = preset.heads[headMode];

  const attn = useMemo(
    () =>
      computeSelfAttentionForQuery(preset, headMode, queryIdx, temperature),
    [preset, headMode, queryIdx, temperature]
  );

  const handleSelectPreset = (idx: number) => {
    setPresetIdx(idx);
    setQueryIdx(TRANSFORMER_PRESETS[idx].defaultQueryIndex);
  };

  useEffect(() => {
    const runProof = () => {
      setHeadMode('semantic');
      setTemperature(1.0);
      setPresetIdx(0);
      setQueryIdx(7); // "it" on "tired"
      window.setTimeout(() => {
        setPresetIdx(1);
        setQueryIdx(7); // "it" on "wide" -> arc jumps to "street"!
      }, 1400);
    };
    const unregister = registerProofHandler(17, runProof);
    return () => unregister();
  }, [registerProofHandler]);

  const tokenCount = preset.tokens.length;
  const svgWidth = 760;
  const tokenSpacing = (svgWidth - 80) / Math.max(1, tokenCount - 1);
  const getTokenX = (i: number) => 40 + i * tokenSpacing;

  const queryWord = preset.tokens[queryIdx];
  const topTargetWord = preset.tokens[attn.topTargetIndex];
  const topTargetWeight = attn.weights[attn.topTargetIndex] ?? 0;

  return (
    <div className="space-y-5">
      {/* Integrated Example Presets & Head Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-medium text-slate-400 mr-1">Example:</span>
          {TRANSFORMER_PRESETS.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(idx)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                presetIdx === idx
                  ? 'bg-blue-700 dark:bg-blue-500 text-white dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {(
            [
              { id: 'semantic', label: 'Head 1: Meaning' },
              { id: 'syntax', label: 'Head 2: Grammar' },
            ] as const
          ).map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setHeadMode(h.id)}
              className={`rounded-md border px-2.5 py-1 font-medium transition-colors whitespace-nowrap cursor-pointer ${
                headMode === h.id
                  ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 65/35 Sandbox */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left 8 Cols: Interactive Token Attention Arc Visualizer */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                Click Any Word to Inspect Its Attention Arcs
              </h2>
              <InfoPopover
                title={activeHead.name}
                content={activeHead.hint}
                align="left"
              />
            </div>
            <span className="font-mono text-xs tabular-nums font-semibold text-blue-700 dark:text-blue-400">
              &ldquo;{queryWord}&rdquo; → &ldquo;{topTargetWord}&rdquo; (
              {(topTargetWeight * 100).toFixed(1)}%)
            </span>
          </div>

          {/* Animated Attention Arcs SVG */}
          <svg
            viewBox={`0 0 ${svgWidth} 215`}
            className="w-full h-auto rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"
          >
            {preset.tokens.map((tok, i) => {
              if (i === queryIdx) return null;
              const w = attn.weights[i];
              const x1 = getTokenX(queryIdx);
              const x2 = getTokenX(i);
              const midX = (x1 + x2) / 2;
              const dist = Math.abs(x2 - x1);
              const arcY = Math.max(18, 152 - dist * 0.32);
              const isTop = i === attn.topTargetIndex;

              return (
                <motion.path
                  key={`arc-${preset.id}-${headMode}-${queryIdx}-${i}`}
                  d={`M ${x1} 152 Q ${midX} ${arcY} ${x2} 152`}
                  fill="none"
                  stroke={isTop ? '#1D4ED8' : '#3B82F6'}
                  strokeWidth={Math.max(0.8, w * 13)}
                  strokeOpacity={Math.max(0.08, Math.min(0.95, w * 2.2))}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.35 }}
                />
              );
            })}

            {/* Clickable Token Chips inside SVG */}
            {preset.tokens.map((tok, i) => {
              const cx = getTokenX(i);
              const w = attn.weights[i];
              const isQuery = i === queryIdx;
              const isTop = i === attn.topTargetIndex;

              return (
                <g
                  key={`tok-${i}`}
                  onClick={() => setQueryIdx(i)}
                  className="cursor-pointer"
                >
                  <rect
                    x={cx - 32}
                    y={156}
                    width={64}
                    height={26}
                    rx={6}
                    className={
                      isQuery
                        ? 'fill-blue-700 dark:fill-blue-500'
                        : isTop
                        ? 'fill-blue-100 dark:fill-blue-950/80 stroke-blue-600 dark:stroke-blue-400'
                        : 'fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-700'
                    }
                    strokeWidth={isTop ? 1.8 : 1}
                  />
                  <text
                    x={cx}
                    y={173}
                    textAnchor="middle"
                    className={`text-[11px] font-mono font-semibold select-none ${
                      isQuery
                        ? 'fill-white dark:fill-slate-950'
                        : isTop
                        ? 'fill-blue-800 dark:fill-blue-200'
                        : 'fill-slate-700 dark:fill-slate-300'
                    }`}
                  >
                    {tok}
                  </text>
                  <text
                    x={cx}
                    y={199}
                    textAnchor="middle"
                    className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono tabular-nums"
                  >
                    {(w * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right 4 Cols: Softmax Distribution Bars & Temperature Control */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                Attention Weights for &ldquo;{queryWord}&rdquo;
                <InfoPopover
                  title="Softmax Distribution"
                  content="Every row sums to 100%. The Transformer uses these percentages to blend each word's Value vector into a context-rich representation."
                  align="right"
                />
              </span>
            </div>

            <div className="space-y-2">
              {preset.tokens.map((tok, i) => {
                const w = attn.weights[i];
                const isTop = i === attn.topTargetIndex;
                return (
                  <button
                    key={`${tok}-${i}`}
                    type="button"
                    onClick={() => setQueryIdx(i)}
                    className="w-full flex items-center gap-2 text-xs text-left group cursor-pointer"
                  >
                    <span
                      className={`w-16 truncate font-mono ${
                        i === queryIdx
                          ? 'font-bold text-blue-700 dark:text-blue-400'
                          : isTop
                          ? 'font-semibold text-slate-900 dark:text-slate-100'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                      }`}
                    >
                      {tok}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-200 ${
                          isTop
                            ? 'bg-blue-700 dark:bg-blue-400'
                            : 'bg-blue-400/70 dark:bg-blue-500/50'
                        }`}
                        style={{ width: `${Math.max(2, w * 100)}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono tabular-nums text-[11px] text-slate-600 dark:text-slate-300">
                      {(w * 100).toFixed(0)}%
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  Scaling Temperature
                  <InfoPopover
                    title="Why Divide by √d_k?"
                    content="Lower temperature sharpens softmax onto one single word (risking vanishing gradients); scaling by √d_k keeps attention smooth and balanced."
                    align="right"
                  />
                </span>
                <span className="font-mono tabular-nums font-semibold text-blue-700 dark:text-blue-400">
                  {temperature.toFixed(2)}×
                </span>
              </div>
              <input
                type="range"
                min={0.4}
                max={2.2}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
              />
            </div>
          </div>

          <LiveEquation
            label="Top Scaled Dot-Product"
            formula={`Q("${queryWord}") · K("${topTargetWord}") / (√4·${temperature.toFixed(1)}) = ${attn.scaledScores[attn.topTargetIndex].toFixed(2)} → ${(topTargetWeight * 100).toFixed(1)}%`}
          />
        </div>
      </div>
    </div>
  );
}
