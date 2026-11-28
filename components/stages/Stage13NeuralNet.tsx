'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, Sliders } from 'lucide-react';
import {
  ActivationKind,
  XOR_POINTS,
  evaluateXORNetwork,
} from '@/lib/ml-advanced-math';
import { useApp } from '@/context/AppContext';
import LiveEquation from '@/components/common/LiveEquation';

export default function Stage13NeuralNet() {
  const { registerProofHandler } = useApp();
  const [useHidden, setUseHidden] = useState<boolean>(false);
  const [activation, setActivation] = useState<ActivationKind>('relu');
  const [hiddenStrength, setHiddenStrength] = useState<number>(1.0);
  const [selectedCorner, setSelectedCorner] = useState<number>(3); // (1,1)
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearT = () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
    const runProof = () => {
      clearT();
      setUseHidden(false);
      timerRef.current = window.setTimeout(() => {
        setUseHidden(true);
        setActivation('linear');
        setHiddenStrength(1.0);
        timerRef.current = window.setTimeout(() => {
          setActivation('relu');
        }, 1600);
      }, 1500);
    };
    const unregister = registerProofHandler(14, runProof);
    return () => {
      unregister();
      clearT();
    };
  }, [registerProofHandler]);

  const cornerEvals = useMemo(
    () =>
      XOR_POINTS.map((pt) => {
        const res = evaluateXORNetwork(
          pt.x1,
          pt.x2,
          useHidden,
          activation,
          hiddenStrength
        );
        const pred = res.prob >= 0.5 ? 1 : 0;
        return { ...pt, ...res, pred, correct: pred === pt.y };
      }),
    [useHidden, activation, hiddenStrength]
  );

  const accuracy =
    cornerEvals.filter((c) => c.correct).length / cornerEvals.length;
  const activeEval = cornerEvals[selectedCorner] ?? cornerEvals[0];

  const W = 500;
  const H = 350;
  const pad = 44;
  const toX = (x: number) => pad + ((x + 0.25) / 1.5) * (W - 2 * pad);
  const toY = (y: number) => H - pad - ((y + 0.25) / 1.5) * (H - 2 * pad);

  const fieldCells = useMemo(() => {
    const cols = 26;
    const rows = 20;
    const cw = (W - 2 * pad) / cols;
    const ch = (H - 2 * pad) / rows;
    const cells: { x: number; y: number; w: number; h: number; prob: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const gx = -0.25 + ((c + 0.5) / cols) * 1.5;
        const gy = -0.25 + ((rows - 1 - r + 0.5) / rows) * 1.5;
        const { prob } = evaluateXORNetwork(
          gx,
          gy,
          useHidden,
          activation,
          hiddenStrength
        );
        cells.push({
          x: pad + c * cw,
          y: pad + r * ch,
          w: cw + 0.6,
          h: ch + 0.6,
          prob,
        });
      }
    }
    return cells;
  }, [useHidden, activation, hiddenStrength]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left 65%: XOR Decision Boundary + Mini Network Wiring Readout */}
        <div className="lg:col-span-8 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                  {!useHidden
                    ? 'Single Perceptron (Linear Limit on XOR)'
                    : activation === 'linear'
                      ? '2-Layer Network with Linear Activation (Still Stuck!)'
                      : `2-2-1 Multi-Layer Neural Network (${activation.toUpperCase()})`}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click any of the 4 XOR corners to inspect its live hidden activations h₁, h₂ and output probability ŷ.
                </p>
              </div>
              <span
                className={`font-mono text-xs font-bold tabular-nums ${
                  accuracy === 1
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                XOR Accuracy: {(accuracy * 100).toFixed(0)}%
              </span>
            </div>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              role="img"
              aria-label="XOR classification boundary for single perceptron versus multi-layer neural network"
            >
              {fieldCells.map((cell, idx) => {
                const nearBoundary = Math.abs(cell.prob - 0.5) < 0.08;
                const fill = nearBoundary
                  ? '#94a3b8'
                  : cell.prob >= 0.5
                    ? '#dc2626'
                    : '#1d4ed8';
                return (
                  <rect
                    key={idx}
                    x={cell.x}
                    y={cell.y}
                    width={cell.w}
                    height={cell.h}
                    fill={fill}
                    fillOpacity={nearBoundary ? 0.35 : 0.08 + Math.abs(cell.prob - 0.5) * 0.4}
                  />
                );
              })}

              <rect
                x={pad}
                y={pad}
                width={W - 2 * pad}
                height={H - 2 * pad}
                fill="none"
                className="stroke-slate-200 dark:stroke-slate-800"
              />

              {/* 4 XOR Corner Dots */}
              {cornerEvals.map((c, idx) => {
                const cx = toX(c.x1);
                const cy = toY(c.x2);
                const isSel = idx === selectedCorner;
                return (
                  <g
                    key={c.label}
                    onClick={() => setSelectedCorner(idx)}
                    className="cursor-pointer"
                  >
                    {isSel && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={19}
                        fill="none"
                        className="stroke-slate-900 dark:stroke-amber-300"
                        strokeWidth={2}
                        strokeDasharray="4 3"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={13}
                      fill={c.y === 1 ? '#dc2626' : '#1d4ed8'}
                      className="stroke-white dark:stroke-slate-950"
                      strokeWidth={2.5}
                    />
                    <text
                      x={cx}
                      y={cy + 4}
                      textAnchor="middle"
                      className="fill-white text-[11px] font-mono font-bold"
                    >
                      {c.y}
                    </text>
                    <text
                      x={cx}
                      y={cy + 27}
                      textAnchor="middle"
                      className="fill-slate-700 dark:fill-slate-300 text-[10px] font-mono font-semibold"
                    >
                      ({c.x1},{c.x2}) → {(c.prob * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}

              <text x={W / 2} y={H - 10} textAnchor="middle" className="fill-slate-500 text-[11px] font-mono">
                Input x₁ vs. x₂  (Blue = Class 0 · Red = Class 1)
              </text>
            </svg>
          </div>

          {/* Live Forward Pass Activation Inspector */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Live Forward Propagation for Selected Input ({activeEval.x1}, {activeEval.x2})
              </span>
              <span
                className={`font-mono font-semibold ${
                  activeEval.correct
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                True y = {activeEval.y} · Pred = {activeEval.pred} ({activeEval.correct ? 'Correct' : 'Wrong'})
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 font-mono text-xs tabular-nums">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                <div className="text-[11px] text-slate-500">Input Layer</div>
                <div className="mt-1 font-bold text-slate-900 dark:text-slate-100">
                  x₁ = {activeEval.x1}, x₂ = {activeEval.x2}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                <div className="text-[11px] text-slate-500">
                  {useHidden ? `Hidden Layer (${activation.toUpperCase()})` : 'No Hidden Layer'}
                </div>
                <div className="mt-1 font-bold text-blue-700 dark:text-blue-400">
                  {useHidden
                    ? `h₁ = ${activeEval.h1.toFixed(2)}, h₂ = ${activeEval.h2.toFixed(2)}`
                    : 'Direct linear sum'}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                <div className="text-[11px] text-slate-500">Output Probability ŷ</div>
                <div className="mt-1 font-bold text-emerald-700 dark:text-emerald-400">
                  {(activeEval.prob * 100).toFixed(1)}% → Class {activeEval.pred}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 35%: Architecture & Activation Controls */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Sliders className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                <span>Network Architecture</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUseHidden(false);
                  setActivation('relu');
                  setHiddenStrength(1.0);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => setUseHidden(false)}
                className={`rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  !useHidden
                    ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                1 Perceptron
              </button>
              <button
                type="button"
                onClick={() => setUseHidden(true)}
                className={`rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  useHidden
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                + Hidden Layer
              </button>
            </div>

            {useHidden && (
              <>
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Hidden Activation Function φ(z)
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        { id: 'relu', label: 'ReLU (max(0,z))' },
                        { id: 'sigmoid', label: 'Sigmoid σ(z)' },
                        { id: 'tanh', label: 'Tanh(z)' },
                        { id: 'linear', label: 'Linear (No Bend!)' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setActivation(opt.id)}
                        className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                          activation === opt.id
                            ? opt.id === 'linear'
                              ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                              : 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activation !== 'linear' && (
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <label htmlFor="nn-fold" className="font-medium text-slate-700 dark:text-slate-300">
                        Hidden Feature Folding
                      </label>
                      <span className="font-mono font-bold tabular-nums text-blue-700 dark:text-blue-400">
                        {(hiddenStrength * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      id="nn-fold"
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={hiddenStrength}
                      onChange={(e) => setHiddenStrength(Number(e.target.value))}
                      className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
                    />
                  </div>
                )}
              </>
            )}

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Truth Table Check
              </div>
              <div className="space-y-1.5 font-mono text-xs tabular-nums">
                {cornerEvals.map((c, idx) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => setSelectedCorner(idx)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5 transition-colors cursor-pointer ${
                      idx === selectedCorner
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>({c.x1}, {c.x2}) → True {c.y}</span>
                    <span
                      className={
                        c.correct
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }
                    >
                      {(c.prob * 100).toFixed(0)}% {c.correct ? '✓' : '✗'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <LiveEquation
            label="Why Non-Linearity Matters"
            formula={
              !useHidden
                ? 'ŷ = σ(w₁x₁ + w₂x₂ + b)  → 1 straight line max'
                : activation === 'linear'
                  ? 'W₂(W₁x) = (W₂W₁)x  → collapses back to 1 line!'
                  : `h = ${activation}(W₁x + b₁)  →  ŷ = σ(W₂h + b₂)`
            }
            footnote="Toggle 'Linear (No Bend!)' with the hidden layer ON to see why stacked linear layers still fail XOR."
          />
        </div>
      </div>
    </div>
  );
}
