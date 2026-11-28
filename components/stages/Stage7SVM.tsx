'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, Sliders } from 'lucide-react';
import {
  SVM_LINEAR_POINTS,
  SVM_OUTLIER_POINT,
  SVMKernelType,
  fitKernelSVM,
  fitLinearSVM,
  generateConcentricSVMData,
} from '@/lib/ml-advanced-math';
import { useApp } from '@/context/AppContext';
import LiveEquation from '@/components/common/LiveEquation';

type SVMDatasetMode = 'linear' | 'rings';

export default function Stage7SVM() {
  const { registerProofHandler } = useApp();
  const [datasetMode, setDatasetMode] = useState<SVMDatasetMode>('linear');
  const [includeOutlier, setIncludeOutlier] = useState<boolean>(false);
  const [cParam, setCParam] = useState<number>(2.0);
  const [kernel, setKernel] = useState<SVMKernelType>('rbf');
  const [gamma, setGamma] = useState<number>(1.8);
  const timerRef = useRef<number | null>(null);

  const linearPoints = useMemo(
    () => (includeOutlier ? [...SVM_LINEAR_POINTS, SVM_OUTLIER_POINT] : SVM_LINEAR_POINTS),
    [includeOutlier]
  );
  const ringPoints = useMemo(() => generateConcentricSVMData(), []);

  const linearSvm = useMemo(
    () => fitLinearSVM(linearPoints, cParam),
    [linearPoints, cParam]
  );

  const kernelSvm = useMemo(
    () => fitKernelSVM(ringPoints, kernel, gamma, Math.max(1, cParam)),
    [ringPoints, kernel, gamma, cParam]
  );

  useEffect(() => {
    const clearT = () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
    const runProof = () => {
      clearT();
      setDatasetMode('linear');
      setIncludeOutlier(true);
      setCParam(15);
      timerRef.current = window.setTimeout(() => {
        setCParam(0.35);
        timerRef.current = window.setTimeout(() => {
          setDatasetMode('rings');
          setKernel('linear');
          timerRef.current = window.setTimeout(() => {
            setKernel('rbf');
            setGamma(2.0);
          }, 1500);
        }, 1600);
      }, 1500);
    };
    const unregister = registerProofHandler(8, runProof);
    return () => {
      unregister();
      clearT();
    };
  }, [registerProofHandler]);

  // SVG 520x380 mapping [0, 10] x [0, 10]
  const W = 520;
  const H = 380;
  const pad = 34;
  const toX = (x: number) => pad + (x / 10) * (W - 2 * pad);
  const toY = (y: number) => H - pad - (y / 10) * (H - 2 * pad);

  // Compute segment endpoints inside [0, 10]x[0, 10] for w1*x + w2*y + b = rhs
  const getLineSegment = (rhs: number) => {
    const { w1, w2, b } = linearSvm;
    const pts: { x: number; y: number }[] = [];
    if (Math.abs(w2) > 1e-4) {
      for (const x of [0, 10]) {
        const y = (rhs - b - w1 * x) / w2;
        if (y >= 0 && y <= 10) pts.push({ x, y });
      }
    }
    if (Math.abs(w1) > 1e-4) {
      for (const y of [0, 10]) {
        const x = (rhs - b - w2 * y) / w1;
        if (x > 0 && x < 10) pts.push({ x, y });
      }
    }
    if (pts.length < 2) return null;
    return { x1: pts[0].x, y1: pts[0].y, x2: pts[1].x, y2: pts[1].y };
  };

  const centerLine = getLineSegment(0);
  const upperGutter = getLineSegment(1);
  const lowerGutter = getLineSegment(-1);

  // Kernel decision field grid (26 x 20 cells) for Rings mode
  const kernelCells = useMemo(() => {
    if (datasetMode !== 'rings') return [];
    const cols = 28;
    const rows = 20;
    const cells: { x: number; y: number; w: number; h: number; score: number }[] = [];
    const cw = (W - 2 * pad) / cols;
    const ch = (H - 2 * pad) / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const gx = ((c + 0.5) / cols) * 10;
        const gy = ((rows - 1 - r + 0.5) / rows) * 10;
        const score = kernelSvm.decisionValue(gx, gy);
        cells.push({
          x: pad + c * cw,
          y: pad + r * ch,
          w: cw + 0.6,
          h: ch + 0.6,
          score,
        });
      }
    }
    return cells;
  }, [datasetMode, kernelSvm]);

  const activePoints = datasetMode === 'linear' ? linearPoints : ringPoints;
  const activeSvIds =
    datasetMode === 'linear'
      ? linearSvm.supportVectorIds
      : kernelSvm.supportVectorIds;
  const activeAcc =
    datasetMode === 'linear' ? linearSvm.accuracy : kernelSvm.accuracy;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left 65%: Interactive SVM Street / Kernel Canvas */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                {datasetMode === 'linear'
                  ? 'Maximum-Margin Street & Support Vectors'
                  : `Kernel Trick on Concentric Rings (${kernel.toUpperCase()} Kernel)`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {datasetMode === 'linear'
                  ? 'Double-ringed dots are Support Vectors anchoring the +1 / −1 gutters. Adjust C or toggle an outlier.'
                  : 'Switch between Linear (fails) and RBF / Polynomial kernels to wrap cleanly around the inner ring.'}
              </p>
            </div>
            <div className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
              Support Vectors:{' '}
              <strong className="text-blue-700 dark:text-blue-400">
                {activeSvIds.length}
              </strong>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            role="img"
            aria-label="Support Vector Machine decision boundary and margin visualization"
          >
            {/* Kernel decision shading in Rings mode */}
            {datasetMode === 'rings' &&
              kernelCells.map((cell, idx) => {
                const isMarginBand = Math.abs(cell.score) < 0.25;
                const fill = isMarginBand
                  ? '#94a3b8'
                  : cell.score >= 0
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
                    fillOpacity={isMarginBand ? 0.24 : 0.16}
                  />
                );
              })}

            {/* Subtle coordinate frame */}
            <rect
              x={pad}
              y={pad}
              width={W - 2 * pad}
              height={H - 2 * pad}
              fill="none"
              className="stroke-slate-200 dark:stroke-slate-800"
            />

            {/* Linear SVM Margin Gutters & Center Hyperplane */}
            {datasetMode === 'linear' && (
              <>
                {upperGutter && lowerGutter && (
                  <polygon
                    points={`${toX(upperGutter.x1)},${toY(upperGutter.y1)} ${toX(
                      upperGutter.x2
                    )},${toY(upperGutter.y2)} ${toX(lowerGutter.x2)},${toY(
                      lowerGutter.y2
                    )} ${toX(lowerGutter.x1)},${toY(lowerGutter.y1)}`}
                    fill="#2563eb"
                    fillOpacity={0.09}
                    className="transition-all duration-200"
                  />
                )}
                {upperGutter && (
                  <line
                    x1={toX(upperGutter.x1)}
                    y1={toY(upperGutter.y1)}
                    x2={toX(upperGutter.x2)}
                    y2={toY(upperGutter.y2)}
                    stroke="#dc2626"
                    strokeWidth={1.6}
                    strokeDasharray="6 4"
                    className="transition-all duration-200"
                  />
                )}
                {lowerGutter && (
                  <line
                    x1={toX(lowerGutter.x1)}
                    y1={toY(lowerGutter.y1)}
                    x2={toX(lowerGutter.x2)}
                    y2={toY(lowerGutter.y2)}
                    stroke="#1d4ed8"
                    strokeWidth={1.6}
                    strokeDasharray="6 4"
                    className="transition-all duration-200"
                  />
                )}
                {centerLine && (
                  <line
                    x1={toX(centerLine.x1)}
                    y1={toY(centerLine.y1)}
                    x2={toX(centerLine.x2)}
                    y2={toY(centerLine.y2)}
                    className="stroke-slate-900 dark:stroke-slate-100 transition-all duration-200"
                    strokeWidth={2.8}
                  />
                )}
              </>
            )}

            {/* Data Points + Support Vector Halo Rings */}
            {activePoints.map((p) => {
              const isSV = activeSvIds.includes(p.id);
              const isViolation =
                datasetMode === 'linear' && linearSvm.violationIds.includes(p.id);
              const cx = toX(p.x);
              const cy = toY(p.y);
              return (
                <g key={p.id}>
                  {isSV && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={10.5}
                      fill="none"
                      stroke={isViolation ? '#d97706' : '#0f172a'}
                      className={
                        isViolation
                          ? 'stroke-amber-500'
                          : 'stroke-slate-900 dark:stroke-amber-300'
                      }
                      strokeWidth={2}
                      strokeDasharray={isViolation ? '3 2' : undefined}
                    />
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5.8}
                    fill={p.label === 1 ? '#dc2626' : '#1d4ed8'}
                    className="stroke-white dark:stroke-slate-950"
                    strokeWidth={1.5}
                  />
                  {p.isOutlier && (
                    <text
                      x={cx + 12}
                      y={cy + 4}
                      className="fill-amber-700 dark:fill-amber-400 text-[10px] font-mono font-semibold"
                    >
                      Outlier
                    </text>
                  )}
                </g>
              );
            })}

            <text x={W / 2} y={H - 10} textAnchor="middle" className="fill-slate-500 text-[11px] font-mono">
              Feature x₁  (Blue = Class −1 · Red = Class +1 · Outer Ring = Support Vector)
            </text>
          </svg>
        </div>

        {/* Right 35%: SVM Controls & Live Readouts */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Sliders className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                <span>SVM Controls</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDatasetMode('linear');
                  setIncludeOutlier(false);
                  setCParam(2.0);
                  setKernel('rbf');
                  setGamma(1.8);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            {/* Dataset Switcher */}
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Dataset Geometry
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setDatasetMode('linear')}
                  className={`rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    datasetMode === 'linear'
                      ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Linear Street
                </button>
                <button
                  type="button"
                  onClick={() => setDatasetMode('rings')}
                  className={`rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    datasetMode === 'rings'
                      ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Concentric Rings
                </button>
              </div>
            </div>

            {datasetMode === 'linear' ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <label htmlFor="svm-c" className="font-medium text-slate-700 dark:text-slate-300">
                      Soft-Margin Penalty (C)
                    </label>
                    <span className="font-mono text-sm font-bold tabular-nums text-blue-700 dark:text-blue-400">
                      {cParam.toFixed(2)}
                    </span>
                  </div>
                  <input
                    id="svm-c"
                    type="range"
                    min={0.15}
                    max={15}
                    step={0.15}
                    value={cParam}
                    onChange={(e) => setCParam(Number(e.target.value))}
                    className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
                  />
                  <div className="flex justify-between font-mono text-[11px] text-slate-400">
                    <span>0.15 (Wide Soft)</span>
                    <span>15.0 (Strict)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIncludeOutlier((v) => !v)}
                  className={`w-full rounded-lg border py-2.5 px-3 text-xs font-semibold transition-colors cursor-pointer ${
                    includeOutlier
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {includeOutlier ? 'Remove Noisy Crossover Outlier' : 'Inject Noisy Crossover Outlier'}
                </button>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Kernel Function K(x, x′)
                  </div>
                  <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                    {(['linear', 'poly', 'rbf'] as const).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setKernel(k)}
                        className={`rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer ${
                          kernel === k
                            ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {k === 'linear' ? 'Linear' : k === 'poly' ? 'Poly (d=2)' : 'RBF'}
                      </button>
                    ))}
                  </div>
                </div>

                {kernel === 'rbf' && (
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <label htmlFor="svm-gamma" className="font-medium text-slate-700 dark:text-slate-300">
                        RBF Bandwidth (γ)
                      </label>
                      <span className="font-mono text-sm font-bold tabular-nums text-blue-700 dark:text-blue-400">
                        {gamma.toFixed(1)}
                      </span>
                    </div>
                    <input
                      id="svm-gamma"
                      type="range"
                      min={0.3}
                      max={6.0}
                      step={0.1}
                      value={gamma}
                      onChange={(e) => setGamma(Number(e.target.value))}
                      className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
                    />
                  </div>
                )}
              </>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500">
                  {datasetMode === 'linear' ? 'Margin Width (2/‖w‖)' : 'Kernel Mode'}
                </div>
                <div className="mt-1 font-mono text-base font-bold tabular-nums text-blue-700 dark:text-blue-400">
                  {datasetMode === 'linear'
                    ? `${linearSvm.marginWidth.toFixed(2)} u`
                    : kernel.toUpperCase()}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500">Accuracy</div>
                <div
                  className={`mt-1 font-mono text-base font-bold tabular-nums ${
                    activeAcc >= 0.9
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {(activeAcc * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <LiveEquation
            label={datasetMode === 'linear' ? 'Learned Hyperplane' : 'Active Kernel Similarity'}
            formula={
              datasetMode === 'linear'
                ? `${linearSvm.w1.toFixed(2)}·x₁ + ${linearSvm.w2.toFixed(2)}·x₂ + (${linearSvm.b.toFixed(2)}) = 0`
                : kernel === 'rbf'
                  ? `K(x, x′) = exp(−${gamma.toFixed(1)} · ‖x − x′‖²)`
                  : kernel === 'poly'
                    ? 'K(x, x′) = (x · x′ + 1)²'
                    : 'K(x, x′) = x · x′  (Linear fails on rings)'
            }
            footnote={
              datasetMode === 'linear'
                ? `‖w‖ = ${linearSvm.normW.toFixed(2)} · Margin violations: ${linearSvm.violationIds.length}`
                : 'RBF maps radial distance to a higher-dimensional cone where a flat plane cleanly slices the inner ring.'
            }
          />
        </div>
      </div>
    </div>
  );
}
