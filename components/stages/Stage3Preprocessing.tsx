'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, Sliders } from 'lucide-react';
import {
  RAW_HOUSE_SAMPLES,
  ScalingMethod,
  scaleHouseDataset,
  simulateContourGD,
} from '@/lib/ml-advanced-math';
import { useApp } from '@/context/AppContext';
import LiveEquation from '@/components/common/LiveEquation';

export default function Stage3Preprocessing() {
  const { registerProofHandler } = useApp();
  const [method, setMethod] = useState<ScalingMethod>('none');
  const [lr, setLr] = useState<number>(1.0);
  const [visibleSteps, setVisibleSteps] = useState<number>(22);
  const timerRef = useRef<number | null>(null);

  const scaled = useMemo(() => scaleHouseDataset(method), [method]);
  const gd = useMemo(() => simulateContourGD(method, lr, 26), [method, lr]);

  useEffect(() => {
    const clearTimers = () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };

    const runProof = () => {
      clearTimers();
      setMethod('none');
      setLr(1.0);
      setVisibleSteps(26);
      timerRef.current = window.setTimeout(() => {
        setMethod('zscore');
        setVisibleSteps(26);
      }, 1600);
    };

    const unregister = registerProofHandler(4, runProof);
    return () => {
      unregister();
      clearTimers();
    };
  }, [registerProofHandler]);

  // Contour coordinate helpers (SVG 520x340)
  const W = 520;
  const H = 340;
  const toX = (w1: number) => 260 + w1 * 52;
  const toY = (w2: number) => 170 - w2 * 56;

  const shownPath = gd.path.slice(0, Math.max(2, visibleSteps));
  const lastPt = shownPath[shownPath.length - 1];
  const polylinePoints = shownPath
    .map((p) => `${toX(p.w1).toFixed(1)},${toY(p.w2).toFixed(1)}`)
    .join(' ');

  const contourLevels = [1.0, 3.2, 7.5, 14.0, 24.0];

  const handleReset = () => {
    setMethod('none');
    setLr(1.0);
    setVisibleSteps(22);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left 65%: Loss Contour Surface & Feature Scale Table */}
        <div className="lg:col-span-8 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                  Loss Surface Contours &amp; Gradient Descent Path
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {method === 'none'
                    ? 'Unscaled features stretch the loss surface into a steep narrow canyon, causing wild zig-zagging.'
                    : method === 'minmax'
                      ? 'Min-Max [0, 1] balances both axes so steps march steadily toward the global minimum.'
                      : 'Z-Score Standardization produces near-circular contours so Gradient Descent glides straight home.'}
                </p>
              </div>
              <div className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
                Scale Ratio:{' '}
                <strong
                  className={
                    method === 'none'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }
                >
                  {scaled.conditionRatio}:1
                </strong>
              </div>
            </div>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              role="img"
              aria-label="Gradient descent contour plot comparing unscaled vs standardized features"
            >
              {/* Coordinate crosshairs */}
              <line x1={30} y1={170} x2={W - 30} y2={170} className="stroke-slate-200 dark:stroke-slate-800" strokeDasharray="4 4" />
              <line x1={260} y1={24} x2={260} y2={H - 24} className="stroke-slate-200 dark:stroke-slate-800" strokeDasharray="4 4" />

              {/* Elliptical Loss Contours */}
              {contourLevels.map((lvl, i) => {
                const rx = Math.sqrt(lvl / gd.curvatureX) * 52;
                const ry = Math.sqrt(lvl / gd.curvatureY) * 56;
                return (
                  <ellipse
                    key={lvl}
                    cx={260}
                    cy={170}
                    rx={Math.min(230, rx)}
                    ry={Math.min(150, ry)}
                    fill="none"
                    stroke={method === 'none' ? '#dc2626' : '#2563eb'}
                    strokeOpacity={0.18 + i * 0.05}
                    strokeWidth={1.5}
                    className="transition-all duration-300 ease-out"
                  />
                );
              })}

              {/* Global Minimum Target */}
              <circle cx={260} cy={170} r={5} className="fill-emerald-600 dark:fill-emerald-400" />
              <text x={270} y={165} className="fill-emerald-700 dark:fill-emerald-400 text-[11px] font-mono font-semibold">
                Global Min w*
              </text>

              {/* GD Trajectory */}
              <polyline
                points={polylinePoints}
                fill="none"
                stroke={method === 'none' ? '#dc2626' : '#1d4ed8'}
                strokeWidth={2.5}
                strokeLinejoin="round"
                className="transition-all duration-200"
              />
              {shownPath.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={toX(pt.w1)}
                  cy={toY(pt.w2)}
                  r={idx === 0 || idx === shownPath.length - 1 ? 5 : 2.8}
                  fill={
                    idx === 0
                      ? '#d97706'
                      : idx === shownPath.length - 1
                        ? method === 'none'
                          ? '#dc2626'
                          : '#1d4ed8'
                        : '#64748b'
                  }
                  className="transition-all duration-200"
                />
              ))}

              {/* Axis Labels */}
              <text x={W / 2} y={H - 8} textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[11px] font-mono">
                Weight w₁ (Bedrooms Scale)
              </text>
              <text
                x={16}
                y={H / 2}
                textAnchor="middle"
                transform={`rotate(-90 16 ${H / 2})`}
                className="fill-slate-500 dark:fill-slate-400 text-[11px] font-mono"
              >
                Weight w₂ (Area Scale)
              </text>
            </svg>
          </div>

          {/* Live Transformed Feature Sample Preview */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Sample Feature Values ({method === 'none' ? 'Raw Unscaled' : method === 'minmax' ? 'Min-Max [0, 1]' : 'Z-Score Standardized'})
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-400">
                Showing 5 of {RAW_HOUSE_SAMPLES.length} houses
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono tabular-nums">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2 pr-4 font-medium">House</th>
                    <th className="py-2 pr-4 font-medium">Raw Area (ft²)</th>
                    <th className="py-2 pr-4 font-medium">Raw Beds</th>
                    <th className="py-2 pr-4 font-medium text-blue-700 dark:text-blue-400">Scaled x₁</th>
                    <th className="py-2 font-medium text-blue-700 dark:text-blue-400">Scaled x₂</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {scaled.points.slice(0, 5).map((pt, idx) => (
                    <tr key={pt.id}>
                      <td className="py-2 pr-4 text-slate-500">#{idx + 1}</td>
                      <td className="py-2 pr-4">{pt.raw1.toLocaleString()}</td>
                      <td className="py-2 pr-4">{pt.raw2}</td>
                      <td className="py-2 pr-4 font-semibold text-blue-700 dark:text-blue-400">
                        {method === 'none' ? pt.x1.toFixed(0) : pt.x1.toFixed(3)}
                      </td>
                      <td className="py-2 font-semibold text-blue-700 dark:text-blue-400">
                        {method === 'none' ? pt.x2.toFixed(0) : pt.x2.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 35%: Controls & Readout */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Sliders className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                <span>Preprocessing Scaler</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
              {(
                [
                  { id: 'none', label: 'Raw' },
                  { id: 'minmax', label: 'Min-Max' },
                  { id: 'zscore', label: 'Z-Score' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMethod(opt.id)}
                  className={`rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    method === opt.id
                      ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <label htmlFor="prep-steps" className="font-medium text-slate-700 dark:text-slate-300">
                  GD Steps Shown
                </label>
                <span className="font-mono font-bold tabular-nums text-blue-700 dark:text-blue-400">
                  {visibleSteps} steps
                </span>
              </div>
              <input
                id="prep-steps"
                type="range"
                min={2}
                max={26}
                step={1}
                value={visibleSteps}
                onChange={(e) => setVisibleSteps(Number(e.target.value))}
                className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <label htmlFor="prep-lr" className="font-medium text-slate-700 dark:text-slate-300">
                  Step Aggressiveness (α)
                </label>
                <span className="font-mono font-bold tabular-nums text-blue-700 dark:text-blue-400">
                  {lr.toFixed(2)}×
                </span>
              </div>
              <input
                id="prep-lr"
                type="range"
                min={0.4}
                max={1.3}
                step={0.05}
                value={lr}
                onChange={(e) => setLr(Number(e.target.value))}
                className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Current Loss</div>
                <div className="mt-1 font-mono text-base font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {lastPt.loss.toFixed(3)}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Converged In</div>
                <div
                  className={`mt-1 font-mono text-base font-bold tabular-nums ${
                    gd.convergedStep
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {gd.convergedStep ? `${gd.convergedStep} steps` : 'Slow / Zig-Zag'}
                </div>
              </div>
            </div>
          </div>

          <LiveEquation
            label="Active Scaling Transformation"
            formula={
              method === 'none'
                ? 'x_raw = [Area ∈ [750, 2950], Beds ∈ [1, 5]]'
                : method === 'minmax'
                  ? 'x_norm = (x − min_train) / (max_train − min_train)'
                  : 'x_std = (x − μ_train) / σ_train'
            }
            footnote="Golden Rule: Always compute μ, σ, min, and max strictly on X_train before transforming X_test to prevent data leakage."
          />
        </div>
      </div>
    </div>
  );
}
