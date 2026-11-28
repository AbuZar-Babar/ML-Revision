'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import RotaryKnob from '@/components/common/RotaryKnob';
import LiveEquation from '@/components/common/LiveEquation';
import {
  Point2D,
  computeLinearGradients,
  computeMSE,
  computeOLS,
} from '@/lib/ml-math';

const CALIBRATION_POINTS: Point2D[] = [
  { id: 'p1', x: 1, y: 2.4 },
  { id: 'p2', x: 2.5, y: 3.9 },
  { id: 'p3', x: 4, y: 5.5 },
  { id: 'p4', x: 5.5, y: 6.4 },
  { id: 'p5', x: 7, y: 8.3 },
];

export default function Stage2TrainingLoop() {
  const { registerProofHandler } = useApp();
  const [w, setW] = useState<number>(0.25);
  const [b, setB] = useState<number>(6.2);
  const [isAutoTraining, setIsAutoTraining] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const proofTimerRef = useRef<number | null>(null);
  const wRef = useRef(w);
  const bRef = useRef(b);

  useEffect(() => {
    wRef.current = w;
    bRef.current = b;
  }, [w, b]);

  const optimal = useMemo(() => computeOLS(CALIBRATION_POINTS), []);
  const minMse = useMemo(
    () => computeMSE(CALIBRATION_POINTS, optimal.w, optimal.b),
    [optimal]
  );
  const currentMse = useMemo(
    () => computeMSE(CALIBRATION_POINTS, w, b),
    [w, b]
  );
  const grads = useMemo(
    () => computeLinearGradients(CALIBRATION_POINTS, w, b),
    [w, b]
  );

  const stopAutoTrain = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAutoTraining(false);
  };

  useEffect(() => {
    return () => {
      stopAutoTrain();
      if (proofTimerRef.current !== null) {
        window.clearTimeout(proofTimerRef.current);
      }
    };
  }, []);

  const startAutoTrain = () => {
    stopAutoTrain();
    setIsAutoTraining(true);
    let steps = 0;

    intervalRef.current = window.setInterval(() => {
      const { dw, db } = computeLinearGradients(
        CALIBRATION_POINTS,
        wRef.current,
        bRef.current
      );
      const lr = 0.032;
      const nextW = wRef.current - lr * dw;
      const nextB = bRef.current - lr * db;
      setW(Number(nextW.toFixed(3)));
      setB(Number(nextB.toFixed(3)));
      steps++;
      setStepCount((c) => c + 1);

      if (Math.hypot(dw, db) < 0.015 || steps > 180) {
        stopAutoTrain();
      }
    }, 35);
  };

  // Visual Proof from Teacher Drawer: scramble dials, then run gradient descent live
  useEffect(() => {
    return registerProofHandler(3, () => {
      stopAutoTrain();
      if (proofTimerRef.current !== null) {
        window.clearTimeout(proofTimerRef.current);
      }
      setW(-0.2);
      setB(7.5);
      setStepCount(0);
      proofTimerRef.current = window.setTimeout(() => {
        startAutoTrain();
      }, 500);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerProofHandler]);

  const handleReset = () => {
    stopAutoTrain();
    setW(0.25);
    setB(6.2);
    setStepCount(0);
  };

  // Coordinate mapping: x in [0, 8], y in [0, 10]
  const toX = (x: number) => 54 + (x / 8) * 430;
  const toY = (y: number) => 286 - (y / 10) * 246;

  // Normalized Loss Meter percentage (capped at MSE = 18 for dramatic visual gauge)
  const lossPct = Math.min(100, (currentMse / 16) * 100);
  const isNearOptimal = currentMse <= minMse + 0.08;

  return (
    <div className="space-y-5">
      {/* Live-Linked Equation */}
      <LiveEquation
        title="Live Model & Squared Error Formula (Hover any term to highlight on graph)"
        subtitle={
          isNearOptimal
            ? 'Global Minimum Reached'
            : `Gradient: ∂L/∂w = ${grads.dw.toFixed(2)}, ∂L/∂b = ${grads.db.toFixed(2)}`
        }
        activeHighlight={highlightKey}
        onHighlightChange={setHighlightKey}
        tokens={[
          { text: 'ŷ = ' },
          {
            text: `${w.toFixed(2)}`,
            highlightKey: 'slope',
            tone: 'primary',
            tooltip: 'Slope (w) — controls line tilt',
          },
          { text: '· x + ' },
          {
            text: `${b.toFixed(2)}`,
            highlightKey: 'intercept',
            tone: 'amber',
            tooltip: 'Intercept (b) — vertical crossing at x = 0',
          },
          { text: '   |   MSE = (1/5) Σ(ŷᵢ − yᵢ)² = ' },
          {
            text: `${currentMse.toFixed(3)}`,
            highlightKey: 'residuals',
            tone: isNearOptimal ? 'success' : 'danger',
            tooltip: 'Mean Squared Error — sum of squared vertical error bars',
          },
        ]}
      />

      {/* Two-Zone Sandbox Layout */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Zone (65%): Scatter Plot + Vertical Residuals + Error Meter */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                Interactive Fit &amp; Residual Error Bars
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Turn the knobs to shrink the red vertical residual bars, or click Auto-Train.
              </p>
            </div>
            <div className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
              GD Steps: <strong className="text-slate-900 dark:text-slate-100">{stepCount}</strong>
              <span className="mx-2" aria-hidden="true">·</span>
              Optimal MSE: <strong className="text-emerald-700 dark:text-emerald-400">{minMse.toFixed(3)}</strong>
            </div>
          </div>

          <div className="mt-4 grid gap-5 sm:grid-cols-12 items-stretch">
            {/* 2D Plot */}
            <div className="sm:col-span-9">
              <svg
                viewBox="0 0 520 326"
                className="w-full h-auto rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"
              >
                {/* Gridlines */}
                {[0, 2, 4, 6, 8].map((xv) => (
                  <g key={xv}>
                    <line
                      x1={toX(xv)}
                      y1={40}
                      x2={toX(xv)}
                      y2={286}
                      className="stroke-slate-200 dark:stroke-slate-800"
                    />
                    <text
                      x={toX(xv)}
                      y={304}
                      textAnchor="middle"
                      className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono"
                    >
                      {xv}
                    </text>
                  </g>
                ))}
                {[0, 2, 4, 6, 8, 10].map((yv) => (
                  <g key={yv}>
                    <line
                      x1={54}
                      y1={toY(yv)}
                      x2={484}
                      y2={toY(yv)}
                      className="stroke-slate-200 dark:stroke-slate-800"
                    />
                    <text
                      x={44}
                      y={toY(yv) + 3}
                      textAnchor="end"
                      className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono"
                    >
                      {yv}
                    </text>
                  </g>
                ))}

                {/* Optimal reference ghost line */}
                <line
                  x1={toX(0)}
                  y1={toY(optimal.b)}
                  x2={toX(8)}
                  y2={toY(optimal.w * 8 + optimal.b)}
                  stroke="#059669"
                  strokeWidth="1.5"
                  strokeDasharray="5 5"
                  opacity={0.45}
                />

                {/* Vertical Residual Error Bars */}
                {CALIBRATION_POINTS.map((p) => {
                  const predY = w * p.x + b;
                  const err = predY - p.y;
                  return (
                    <g key={`res-${p.id}`}>
                      <line
                        x1={toX(p.x)}
                        y1={toY(p.y)}
                        x2={toX(p.x)}
                        y2={toY(predY)}
                        stroke="#DC2626"
                        strokeWidth={highlightKey === 'residuals' ? 3.5 : 2.2}
                        opacity={highlightKey === 'residuals' ? 1 : 0.85}
                        className="transition-all duration-100 ease-out"
                      />
                      <text
                        x={toX(p.x) + 6}
                        y={(toY(p.y) + toY(predY)) / 2 + 3}
                        className="fill-rose-600 dark:fill-rose-400 text-[9px] font-mono"
                      >
                        {err >= 0 ? `+${err.toFixed(1)}` : err.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Slope rise/run visual helper when hovering w */}
                {highlightKey === 'slope' && (
                  <g>
                    <line
                      x1={toX(2)}
                      y1={toY(w * 2 + b)}
                      x2={toX(4)}
                      y2={toY(w * 2 + b)}
                      stroke="#0284C7"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1={toX(4)}
                      y1={toY(w * 2 + b)}
                      x2={toX(4)}
                      y2={toY(w * 4 + b)}
                      stroke="#0284C7"
                      strokeWidth="2.5"
                    />
                    <text
                      x={toX(4) + 6}
                      y={(toY(w * 2 + b) + toY(w * 4 + b)) / 2}
                      className="fill-sky-700 dark:fill-sky-300 text-[10px] font-mono font-semibold"
                    >
                      Δy/Δx = {w.toFixed(2)}
                    </text>
                  </g>
                )}

                {/* Active Model Line */}
                <line
                  x1={toX(0)}
                  y1={toY(b)}
                  x2={toX(8)}
                  y2={toY(w * 8 + b)}
                  stroke="#0284C7"
                  strokeWidth={highlightKey === 'slope' ? 4 : 3}
                  className="transition-all duration-100 ease-out"
                />

                {/* Y-Intercept Highlight Marker */}
                <circle
                  cx={toX(0)}
                  cy={Math.max(24, Math.min(296, toY(b)))}
                  r={highlightKey === 'intercept' ? 8 : 5}
                  fill="#D97706"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-100 ease-out"
                />

                {/* 5 Scatter Data Points */}
                {CALIBRATION_POINTS.map((p) => (
                  <circle
                    key={p.id}
                    cx={toX(p.x)}
                    cy={toY(p.y)}
                    r={6.5}
                    className="fill-slate-900 dark:fill-slate-100 stroke-white dark:stroke-slate-900"
                    strokeWidth="2"
                  />
                ))}

                {/* Axes Titles */}
                <text
                  x={269}
                  y={320}
                  textAnchor="middle"
                  className="fill-slate-600 dark:fill-slate-300 text-[11px] font-medium"
                >
                  Input Feature (x)
                </text>
                <text
                  x={16}
                  y={163}
                  textAnchor="middle"
                  transform="rotate(-90 16 163)"
                  className="fill-slate-600 dark:fill-slate-300 text-[11px] font-medium"
                >
                  Target Value (y)
                </text>
              </svg>
            </div>

            {/* Vertical Error Gauge (Loss Meter) */}
            <div className="sm:col-span-3 flex flex-col items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
              <div className="text-center">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Error Meter
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  MSE Loss
                </div>
              </div>

              <div className="relative my-3 h-44 w-10 overflow-hidden rounded-full border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">
                <div
                  className={`absolute inset-x-0 bottom-0 transition-all duration-150 ${
                    isNearOptimal
                      ? 'bg-emerald-500'
                      : lossPct > 45
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ height: `${Math.max(6, lossPct)}%` }}
                />
              </div>

              <div className="text-center font-mono tabular-nums">
                <div
                  className={`text-lg font-bold ${
                    isNearOptimal
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {currentMse.toFixed(2)}
                </div>
                <div className="text-[11px] font-sans font-medium text-slate-600 dark:text-slate-400">
                  {isNearOptimal ? 'Optimal Fit' : 'Drain Error'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Zone (35%): Manual Knobs vs Auto-Train Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                Parameter Dials
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Drag dials up/down manually or let Gradient Descent turn them.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <RotaryKnob
                label="Slope"
                symbol="w"
                value={w}
                min={-1}
                max={2.5}
                step={0.02}
                accentColor="#0284C7"
                highlighted={highlightKey === 'slope'}
                onChange={(val) => {
                  stopAutoTrain();
                  setW(val);
                }}
                onHover={(h) => setHighlightKey(h ? 'slope' : null)}
              />
              <RotaryKnob
                label="Intercept"
                symbol="b"
                value={b}
                min={-1}
                max={8}
                step={0.05}
                accentColor="#D97706"
                highlighted={highlightKey === 'intercept'}
                onChange={(val) => {
                  stopAutoTrain();
                  setB(val);
                }}
                onHover={(h) => setHighlightKey(h ? 'intercept' : null)}
              />
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={isAutoTraining ? stopAutoTrain : startAutoTrain}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-700 dark:bg-sky-500 px-4 py-2.5 text-sm font-medium text-white dark:text-slate-950 hover:bg-sky-800 dark:hover:bg-sky-400 transition-colors cursor-pointer"
              >
                {isAutoTraining ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause Auto-Train
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    Auto-Train (Run Gradient Descent)
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Guess
              </button>
            </div>
          </div>

          {/* 4-Step Loop Summary */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              The Universal 4-Step Loop
            </div>
            <ol className="mt-2.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 list-decimal list-inside">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Guess:</strong>{' '}
                Predict ŷ = wx + b for every input point.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Measure:</strong>{' '}
                Square the red vertical residuals to compute MSE Loss.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Gradient:</strong>{' '}
                Check which way downhill is (∂L/∂w, ∂L/∂b).
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Nudge:</strong>{' '}
                Turn w and b opposite the gradient and repeat.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
