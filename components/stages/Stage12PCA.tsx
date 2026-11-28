'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Compass, RotateCcw, Sliders } from 'lucide-react';
import {
  computePCA2D,
  evaluateProjectionAxis,
  generateCorrelatedPCA,
} from '@/lib/ml-advanced-math';
import { useApp } from '@/context/AppContext';
import LiveEquation from '@/components/common/LiveEquation';

export default function Stage12PCA() {
  const { registerProofHandler } = useApp();
  const [spread, setSpread] = useState<number>(0.55);
  const [angleDeg, setAngleDeg] = useState<number>(115);
  const [showErrorBars, setShowErrorBars] = useState<boolean>(true);
  const timerRef = useRef<number | null>(null);

  const points = useMemo(() => generateCorrelatedPCA(spread), [spread]);
  const pca = useMemo(() => computePCA2D(points), [points]);
  const proj = useMemo(
    () => evaluateProjectionAxis(points, angleDeg, pca.meanX, pca.meanY),
    [points, angleDeg, pca.meanX, pca.meanY]
  );

  useEffect(() => {
    const clearT = () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
    const runProof = () => {
      clearT();
      setSpread(0.45);
      setShowErrorBars(true);
      setAngleDeg(Math.round((pca.pc1AngleDeg + 90) % 180));
      timerRef.current = window.setTimeout(() => {
        setAngleDeg(Math.round(pca.pc1AngleDeg));
      }, 1500);
    };
    const unregister = registerProofHandler(13, runProof);
    return () => {
      unregister();
      clearT();
    };
  }, [registerProofHandler, pca.pc1AngleDeg]);

  const W = 520;
  const H = 370;
  const toX = (x: number) => W / 2 + x * 52;
  const toY = (y: number) => H / 2 - y * 40;

  const rad = (angleDeg * Math.PI) / 180;
  const ux = Math.cos(rad);
  const uy = Math.sin(rad);
  const lineLen = 4.2;

  const pcRad = (pca.pc1AngleDeg * Math.PI) / 180;
  const pcLen = Math.min(3.8, Math.sqrt(pca.pc1Var) * 1.65);
  const pc2Len = Math.min(2.6, Math.sqrt(pca.pc2Var) * 1.65);

  const angleDiff = Math.min(
    Math.abs(angleDeg - pca.pc1AngleDeg),
    180 - Math.abs(angleDeg - pca.pc1AngleDeg)
  );
  const isAligned = angleDiff <= 4;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left 65%: Interactive Projection & Reconstruction Error SVG */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                2D → 1D Projection Axis &amp; Reconstruction Loss
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rotate the blue candidate line until perpendicular red error bars shrink to their minimum (PC1).
              </p>
            </div>
            <span
              className={`font-mono text-xs font-semibold tabular-nums ${
                isAligned
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isAligned
                ? 'Aligned with Optimal PC1'
                : `Optimal PC1 = ${pca.pc1AngleDeg.toFixed(1)}°`}
            </span>
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            role="img"
            aria-label="PCA 2D projection visualization showing variance retention and reconstruction error"
          >
            {/* Axes */}
            <line x1={28} y1={H / 2} x2={W - 28} y2={H / 2} className="stroke-slate-200 dark:stroke-slate-800" strokeDasharray="4 4" />
            <line x1={W / 2} y1={24} x2={W / 2} y2={H - 24} className="stroke-slate-200 dark:stroke-slate-800" strokeDasharray="4 4" />

            {/* True Optimal PC1 & PC2 Eigenvectors (subtle emerald reference) */}
            <line
              x1={toX(pca.meanX)}
              y1={toY(pca.meanY)}
              x2={toX(pca.meanX + Math.cos(pcRad) * pcLen)}
              y2={toY(pca.meanY + Math.sin(pcRad) * pcLen)}
              stroke="#059669"
              strokeWidth={2}
              strokeDasharray="5 4"
            />
            <line
              x1={toX(pca.meanX)}
              y1={toY(pca.meanY)}
              x2={toX(pca.meanX - Math.sin(pcRad) * pc2Len)}
              y2={toY(pca.meanY + Math.cos(pcRad) * pc2Len)}
              stroke="#64748b"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />

            {/* User Candidate Projection Line */}
            <line
              x1={toX(pca.meanX - ux * lineLen)}
              y1={toY(pca.meanY - uy * lineLen)}
              x2={toX(pca.meanX + ux * lineLen)}
              y2={toY(pca.meanY + uy * lineLen)}
              stroke={isAligned ? '#059669' : '#1d4ed8'}
              strokeWidth={2.8}
              className="transition-all duration-150"
            />

            {/* Perpendicular Reconstruction Error Drop Lines */}
            {showErrorBars &&
              proj.projections.map((pt, idx) => (
                <line
                  key={`err-${idx}`}
                  x1={toX(pt.x)}
                  y1={toY(pt.y)}
                  x2={toX(pt.px)}
                  y2={toY(pt.py)}
                  stroke="#dc2626"
                  strokeOpacity={0.5}
                  strokeWidth={1.3}
                />
              ))}

            {/* Projected 1D Shadow Dots on Line */}
            {proj.projections.map((pt, idx) => (
              <circle
                key={`proj-${idx}`}
                cx={toX(pt.px)}
                cy={toY(pt.py)}
                r={3.2}
                fill={isAligned ? '#059669' : '#1d4ed8'}
              />
            ))}

            {/* Original 2D Data Points */}
            {points.map((p) => (
              <circle
                key={p.id}
                cx={toX(p.x)}
                cy={toY(p.y)}
                r={4.6}
                className="fill-slate-800 dark:fill-slate-200 stroke-white dark:stroke-slate-950"
                strokeWidth={1.2}
              />
            ))}

            {/* Mean Center */}
            <circle cx={toX(pca.meanX)} cy={toY(pca.meanY)} r={5} className="fill-amber-500" />
            <text x={W / 2} y={H - 10} textAnchor="middle" className="fill-slate-500 text-[11px] font-mono">
              Standardized Feature x₁ vs. x₂  (Red Lines = Reconstruction Error Lost When Dropping 2nd Axis)
            </text>
          </svg>
        </div>

        {/* Right 35%: Angle & Spread Controls */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Sliders className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                <span>Projection Controls</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSpread(0.55);
                  setAngleDeg(115);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <label htmlFor="pca-angle" className="font-medium text-slate-700 dark:text-slate-300">
                  Projection Axis Angle (θ)
                </label>
                <span className="font-mono text-sm font-bold tabular-nums text-blue-700 dark:text-blue-400">
                  {angleDeg}°
                </span>
              </div>
              <input
                id="pca-angle"
                type="range"
                min={0}
                max={179}
                step={1}
                value={angleDeg}
                onChange={(e) => setAngleDeg(Number(e.target.value))}
                className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
              />
            </div>

            <button
              type="button"
              onClick={() => setAngleDeg(Math.round(pca.pc1AngleDeg))}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 dark:bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-800 dark:hover:bg-blue-500 transition-colors cursor-pointer"
            >
              <Compass className="h-3.5 w-3.5" />
              Snap to Optimal PC1 ({pca.pc1AngleDeg.toFixed(1)}°)
            </button>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-baseline justify-between text-xs">
                <label htmlFor="pca-spread" className="font-medium text-slate-700 dark:text-slate-300">
                  Noise Spread (PC2 Width)
                </label>
                <span className="font-mono text-sm font-bold tabular-nums text-slate-700 dark:text-slate-300">
                  {spread.toFixed(2)}
                </span>
              </div>
              <input
                id="pca-spread"
                type="range"
                min={0.18}
                max={1.65}
                step={0.05}
                value={spread}
                onChange={(e) => setSpread(Number(e.target.value))}
                className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
              />
            </div>

            {/* Variance + Reconstruction Error Conservation Meter */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-mono tabular-nums">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  Retained: {proj.retainedPct.toFixed(1)}%
                </span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  Lost: {(100 - proj.retainedPct).toFixed(1)}%
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-rose-200 dark:bg-rose-950 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-150"
                  style={{ width: `${Math.min(100, Math.max(0, proj.retainedPct))}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500">Projected Var</div>
                  <div className="mt-1 font-mono text-base font-bold tabular-nums text-blue-700 dark:text-blue-400">
                    {proj.projectedVariance.toFixed(2)}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500">Recon. MSE</div>
                  <div className="mt-1 font-mono text-base font-bold tabular-nums text-rose-600 dark:text-rose-400">
                    {proj.reconstructionError.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowErrorBars((v) => !v)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {showErrorBars ? 'Hide Error Drop Lines' : 'Show Error Drop Lines'}
            </button>
          </div>

          <LiveEquation
            label="Pythagorean Variance Conservation"
            formula={`Var(${proj.projectedVariance.toFixed(2)}) + Err(${proj.reconstructionError.toFixed(2)}) = Total(${(proj.projectedVariance + proj.reconstructionError).toFixed(2)})`}
            footnote={`Optimal Eigenvalues: λ₁ = ${pca.pc1Var.toFixed(2)} (${(pca.explainedRatio1 * 100).toFixed(1)}%), λ₂ = ${pca.pc2Var.toFixed(2)}.`}
          />
        </div>
      </div>
    </div>
  );
}
