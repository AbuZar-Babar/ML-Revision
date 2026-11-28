'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, Sliders } from 'lucide-react';
import {
  computePolyMSE,
  fitPolynomialRegularized,
  generateWaveSplit,
  predictPolynomial,
} from '@/lib/ml-advanced-math';
import { useApp } from '@/context/AppContext';
import LiveEquation from '@/components/common/LiveEquation';

export default function Stage5BiasVariance() {
  const { registerProofHandler } = useApp();
  const { train, test } = useMemo(() => generateWaveSplit(), []);

  const [degree, setDegree] = useState<number>(3);
  const [lambda, setLambda] = useState<number>(0.02);
  const [penaltyType, setPenaltyType] = useState<'l2' | 'l1'>('l2');
  const [showTest, setShowTest] = useState<boolean>(true);
  const timerRef = useRef<number | null>(null);

  const weights = useMemo(
    () => fitPolynomialRegularized(train, degree, lambda, penaltyType),
    [train, degree, lambda, penaltyType]
  );

  const trainMse = useMemo(() => computePolyMSE(train, weights), [train, weights]);
  const testMse = useMemo(() => computePolyMSE(test, weights), [test, weights]);
  const zeroedCount = useMemo(
    () => weights.slice(1).filter((w) => Math.abs(w) < 0.02).length,
    [weights]
  );
  const weightNorm = useMemo(
    () => Math.sqrt(weights.slice(1).reduce((s, w) => s + w * w, 0)),
    [weights]
  );

  useEffect(() => {
    const clearT = () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
    const runProof = () => {
      clearT();
      setShowTest(true);
      setPenaltyType('l2');
      setDegree(9);
      setLambda(0);
      timerRef.current = window.setTimeout(() => {
        setLambda(0.18);
      }, 1700);
    };
    const unregister = registerProofHandler(6, runProof);
    return () => {
      unregister();
      clearT();
    };
  }, [registerProofHandler]);

  // SVG 540x330
  const W = 540;
  const H = 330;
  const padL = 44;
  const padR = 20;
  const padT = 20;
  const padB = 34;

  const toX = (x: number) => padL + ((x + 1.15) / 2.3) * (W - padL - padR);
  const toY = (y: number) => {
    const clamped = Math.max(-2.1, Math.min(2.1, y));
    return padT + ((2.1 - clamped) / 4.2) * (H - padT - padB);
  };

  const trueWavePath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 80; i++) {
      const x = -1.05 + (2.1 * i) / 80;
      const y = Math.sin(Math.PI * x);
      pts.push(`${i === 0 ? 'M' : 'L'} ${toX(x).toFixed(1)} ${toY(y).toFixed(1)}`);
    }
    return pts.join(' ');
  }, []);

  const modelCurvePath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 90; i++) {
      const x = -1.05 + (2.1 * i) / 90;
      const y = predictPolynomial(weights, x);
      pts.push(`${i === 0 ? 'M' : 'L'} ${toX(x).toFixed(1)} ${toY(y).toFixed(1)}`);
    }
    return pts.join(' ');
  }, [weights]);

  const regime =
    degree <= 1 || (lambda >= 0.8 && trainMse > 0.35)
      ? { label: 'High Bias (Underfitting)', tone: 'text-amber-700 dark:text-amber-400' }
      : testMse > trainMse * 2.4 && testMse > 0.28
        ? { label: 'High Variance (Overfitting)', tone: 'text-rose-600 dark:text-rose-400' }
        : { label: 'Well-Balanced Generalization', tone: 'text-emerald-700 dark:text-emerald-400' };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left 65%: Curve Fit & Weight Bar Chart */}
        <div className="lg:col-span-8 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                  Polynomial Fit on Noisy Wave (Degree {degree})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dashed gray = true hidden signal · Blue curve = fitted polynomial · Holdout test dots expose overfitting
                </p>
              </div>
              <span className={`text-xs font-semibold ${regime.tone}`}>
                {regime.label}
              </span>
            </div>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              role="img"
              aria-label="Polynomial regression bias-variance and regularization chart"
            >
              {/* Grid lines */}
              {[-1, 0, 1].map((gy) => (
                <g key={gy}>
                  <line
                    x1={padL}
                    y1={toY(gy)}
                    x2={W - padR}
                    y2={toY(gy)}
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeDasharray={gy === 0 ? undefined : '4 4'}
                  />
                  <text
                    x={padL - 8}
                    y={toY(gy) + 4}
                    textAnchor="end"
                    className="fill-slate-400 text-[10px] font-mono"
                  >
                    {gy}
                  </text>
                </g>
              ))}

              {/* True Underlying Sine Curve */}
              <path
                d={trueWavePath}
                fill="none"
                className="stroke-slate-400 dark:stroke-slate-600"
                strokeWidth={1.75}
                strokeDasharray="5 5"
              />

              {/* Fitted Polynomial Curve */}
              <path
                d={modelCurvePath}
                fill="none"
                stroke="#1d4ed8"
                strokeWidth={3}
                className="transition-all duration-200 ease-out"
              />

              {/* Training Points */}
              {train.map((p) => (
                <circle
                  key={p.id}
                  cx={toX(p.x)}
                  cy={toY(p.y)}
                  r={5}
                  className="fill-blue-600 dark:fill-blue-400 stroke-white dark:stroke-slate-950"
                  strokeWidth={1.5}
                />
              ))}

              {/* Holdout Test Points */}
              {showTest &&
                test.map((p) => (
                  <rect
                    key={p.id}
                    x={toX(p.x) - 4.5}
                    y={toY(p.y) - 4.5}
                    width={9}
                    height={9}
                    rx={2}
                    className="fill-rose-600 dark:fill-rose-400 stroke-white dark:stroke-slate-950"
                    strokeWidth={1.5}
                  />
                ))}

              <text x={W / 2} y={H - 8} textAnchor="middle" className="fill-slate-500 text-[11px] font-mono">
                Input Feature x  (Blue Circles = Train · Red Squares = Unseen Test)
              </text>
            </svg>
          </div>

          {/* Learned Coefficient Magnitudes Bar Strip */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Learned Weight Magnitudes ({penaltyType === 'l2' ? 'L2 Ridge Shrinkage' : 'L1 Lasso Sparsity'})
              </span>
              <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                ‖w‖₂ = {weightNorm.toFixed(2)} · Zeroed terms: {zeroedCount}/{degree}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {weights.slice(1).map((w, idx) => {
                const isZero = Math.abs(w) < 0.02;
                const magPct = Math.min(100, (Math.abs(w) / 12) * 100);
                return (
                  <div
                    key={idx}
                    className={`rounded-lg border p-2.5 font-mono text-xs tabular-nums ${
                      isZero
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>w{idx + 1} (x^{idx + 1})</span>
                      {isZero && <span className="text-emerald-700 dark:text-emerald-400">0</span>}
                    </div>
                    <div className="mt-1 font-bold text-slate-900 dark:text-slate-100">
                      {w >= 0 ? '+' : ''}
                      {w.toFixed(2)}
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-200 ${
                          Math.abs(w) > 8 ? 'bg-rose-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${magPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 35%: Controls & Train vs Test Readout */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Sliders className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                <span>Complexity &amp; Regularization</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDegree(3);
                  setLambda(0.02);
                  setPenaltyType('l2');
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <label htmlFor="bv-degree" className="font-medium text-slate-700 dark:text-slate-300">
                  Polynomial Degree (d)
                </label>
                <span className="font-mono text-sm font-bold tabular-nums text-blue-700 dark:text-blue-400">
                  {degree}
                </span>
              </div>
              <input
                id="bv-degree"
                type="range"
                min={1}
                max={9}
                step={1}
                value={degree}
                onChange={(e) => setDegree(Number(e.target.value))}
                className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
              />
              <div className="flex justify-between font-mono text-[11px] text-slate-400">
                <span>1 (Underfit)</span>
                <span>3–4 (Sweet Spot)</span>
                <span>9 (Overfit)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Regularization Norm
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setPenaltyType('l2')}
                  className={`rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    penaltyType === 'l2'
                      ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  L2 Ridge (Σw²)
                </button>
                <button
                  type="button"
                  onClick={() => setPenaltyType('l1')}
                  className={`rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    penaltyType === 'l1'
                      ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  L1 Lasso (Σ|w|)
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <label htmlFor="bv-lambda" className="font-medium text-slate-700 dark:text-slate-300">
                  Penalty Strength (λ)
                </label>
                <span className="font-mono text-sm font-bold tabular-nums text-blue-700 dark:text-blue-400">
                  {lambda.toFixed(2)}
                </span>
              </div>
              <input
                id="bv-lambda"
                type="range"
                min={0}
                max={1.2}
                step={0.02}
                value={lambda}
                onChange={(e) => setLambda(Number(e.target.value))}
                className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500">Train MSE</div>
                <div className="mt-1 font-mono text-base font-bold tabular-nums text-blue-700 dark:text-blue-400">
                  {trainMse.toFixed(3)}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500">Holdout Test MSE</div>
                <div
                  className={`mt-1 font-mono text-base font-bold tabular-nums ${
                    testMse > 0.35
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {testMse.toFixed(3)}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTest((s) => !s)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {showTest ? 'Hide Holdout Test Points' : 'Reveal Holdout Test Points'}
            </button>
          </div>

          <LiveEquation
            label="Regularized Loss Objective"
            formula={
              penaltyType === 'l2'
                ? `L = ${trainMse.toFixed(3)} + ${lambda.toFixed(2)} · Σwⱼ²`
                : `L = ${trainMse.toFixed(3)} + ${lambda.toFixed(2)} · Σ|wⱼ|`
            }
            footnote="Try setting Degree = 9 with λ = 0.00 to watch Test MSE spike, then slowly raise λ to 0.15 to calm the weights."
          />
        </div>
      </div>
    </div>
  );
}
