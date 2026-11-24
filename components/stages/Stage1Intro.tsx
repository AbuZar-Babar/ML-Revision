'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, PlusCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { sigmoid } from '@/lib/ml-math';

interface FruitPoint {
  id: string;
  name: string;
  weight: number; // grams: 40..260
  redness: number; // 0..100
  actual: 'Apple' | 'Citrus';
  isEdgeCase?: boolean;
}

const INITIAL_FRUITS: FruitPoint[] = [
  { id: 'f1', name: 'Red Fuji', weight: 185, redness: 86, actual: 'Apple' },
  { id: 'f2', name: 'Honeycrisp', weight: 205, redness: 78, actual: 'Apple' },
  { id: 'f3', name: 'Gala Apple', weight: 165, redness: 72, actual: 'Apple' },
  { id: 'f4', name: 'Red Delicious', weight: 220, redness: 91, actual: 'Apple' },
  { id: 'f5', name: 'Pink Lady', weight: 175, redness: 68, actual: 'Apple' },
  { id: 'f6', name: 'Lemon', weight: 95, redness: 18, actual: 'Citrus' },
  { id: 'f7', name: 'Key Lime', weight: 70, redness: 12, actual: 'Citrus' },
  { id: 'f8', name: 'Tangerine', weight: 110, redness: 38, actual: 'Citrus' },
  { id: 'f9', name: 'Clementine', weight: 88, redness: 32, actual: 'Citrus' },
  { id: 'f10', name: 'Sour Lime', weight: 82, redness: 15, actual: 'Citrus' },
];

const EDGE_CASE_QUEUE: FruitPoint[] = [
  {
    id: 'edge-1',
    name: 'Yellow Golden Apple',
    weight: 210,
    redness: 24,
    actual: 'Apple',
    isEdgeCase: true,
  },
  {
    id: 'edge-2',
    name: 'Blood Orange (Red Citrus)',
    weight: 105,
    redness: 76,
    actual: 'Citrus',
    isEdgeCase: true,
  },
  {
    id: 'edge-3',
    name: 'Crisp Green Apple',
    weight: 192,
    redness: 14,
    actual: 'Apple',
    isEdgeCase: true,
  },
];

// Hardcoded rule: breaks on yellow/green apples (redness < 55) and blood oranges (redness >= 55)
function classifyTraditional(f: FruitPoint): {
  prediction: 'Apple' | 'Citrus';
  branch: 1 | 2;
} {
  if (f.redness >= 55) {
    return { prediction: 'Apple', branch: 1 };
  }
  return { prediction: 'Citrus', branch: 2 };
}

// Simple 2D logistic fit so the ML boundary genuinely adapts as edge cases are added
function fit2DLinearBoundary(points: FruitPoint[]): {
  wWeight: number;
  wRed: number;
  b: number;
} {
  let w1 = 0.8;
  let w2 = 0.8;
  let b = 0;
  const lr = 0.18;
  const n = points.length || 1;

  for (let iter = 0; iter < 500; iter++) {
    let dw1 = 0;
    let dw2 = 0;
    let db = 0;
    for (const p of points) {
      const x1 = (p.weight - 145) / 60;
      const x2 = (p.redness - 50) / 35;
      const y = p.actual === 'Apple' ? 1 : 0;
      const pred = sigmoid(w1 * x1 + w2 * x2 + b);
      const diff = pred - y;
      dw1 += diff * x1;
      dw2 += diff * x2;
      db += diff;
    }
    w1 -= lr * (dw1 / n + 0.01 * w1);
    w2 -= lr * (dw2 / n + 0.01 * w2);
    b -= lr * (db / n);
  }
  return { wWeight: w1, wRed: w2, b };
}

export default function Stage1Intro() {
  const { registerProofHandler } = useApp();
  const [fruits, setFruits] = useState<FruitPoint[]>(INITIAL_FRUITS);
  const [edgeIndex, setEdgeIndex] = useState(0);
  const [clickClass, setClickClass] = useState<'Apple' | 'Citrus'>('Apple');
  const [lastAdded, setLastAdded] = useState<FruitPoint | null>(null);
  const proofTimers = useRef<number[]>([]);

  const clearProofTimers = () => {
    proofTimers.current.forEach((t) => window.clearTimeout(t));
    proofTimers.current = [];
  };

  useEffect(() => {
    return () => clearProofTimers();
  }, []);

  // Visual Proof automation from Teacher Drawer
  useEffect(() => {
    return registerProofHandler(1, () => {
      clearProofTimers();
      setFruits(INITIAL_FRUITS);
      setEdgeIndex(0);
      setLastAdded(null);

      EDGE_CASE_QUEUE.forEach((edge, idx) => {
        const timer = window.setTimeout(() => {
          setFruits((prev) =>
            prev.some((f) => f.id === edge.id) ? prev : [...prev, edge]
          );
          setEdgeIndex(idx + 1);
          setLastAdded(edge);
        }, 450 + idx * 900);
        proofTimers.current.push(timer);
      });
    });
  }, [registerProofHandler]);

  const mlModel = useMemo(() => fit2DLinearBoundary(fruits), [fruits]);

  const evalStats = useMemo(() => {
    let tradCorrect = 0;
    let mlCorrect = 0;
    const failedTrad: FruitPoint[] = [];

    for (const f of fruits) {
      const trad = classifyTraditional(f);
      if (trad.prediction === f.actual) {
        tradCorrect++;
      } else {
        failedTrad.push(f);
      }

      const x1 = (f.weight - 145) / 60;
      const x2 = (f.redness - 50) / 35;
      const mlPred =
        sigmoid(mlModel.wWeight * x1 + mlModel.wRed * x2 + mlModel.b) >= 0.5
          ? 'Apple'
          : 'Citrus';
      if (mlPred === f.actual) mlCorrect++;
    }

    return {
      tradAccuracy: (tradCorrect / fruits.length) * 100,
      mlAccuracy: (mlCorrect / fruits.length) * 100,
      failedTrad,
    };
  }, [fruits, mlModel]);

  const handleAddEdgeCase = () => {
    if (edgeIndex >= EDGE_CASE_QUEUE.length) return;
    const nextEdge = EDGE_CASE_QUEUE[edgeIndex];
    setFruits((prev) =>
      prev.some((f) => f.id === nextEdge.id) ? prev : [...prev, nextEdge]
    );
    setEdgeIndex((i) => i + 1);
    setLastAdded(nextEdge);
  };

  const handleReset = () => {
    clearProofTimers();
    setFruits(INITIAL_FRUITS);
    setEdgeIndex(0);
    setLastAdded(null);
  };

  // Plot coordinates helper: weight [40, 260] -> X [48, 430], redness [0, 100] -> Y [270, 28]
  const toSvgX = (w: number) => 48 + ((w - 40) / 220) * 382;
  const toSvgY = (r: number) => 270 - (r / 100) * 242;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * 460;
    const sy = ((e.clientY - rect.top) / rect.height) * 310;
    if (sx < 48 || sx > 430 || sy < 28 || sy > 270) return;

    const weight = Math.round(40 + ((sx - 48) / 382) * 220);
    const redness = Math.round(((270 - sy) / 242) * 100);
    const newPt: FruitPoint = {
      id: `custom-${Date.now()}`,
      name: `Custom ${clickClass}`,
      weight,
      redness,
      actual: clickClass,
      isEdgeCase: true,
    };
    setFruits((prev) => [...prev, newPt]);
    setLastAdded(newPt);
  };

  // Compute ML decision line endpoints in feature space: w1*x1 + w2*x2 + b = 0
  const boundaryLine = useMemo(() => {
    const { wWeight, wRed, b } = mlModel;
    const pts: { x: number; y: number }[] = [];
    // Intersect with redness = 0 and redness = 100
    if (Math.abs(wWeight) > 1e-4) {
      for (const rVal of [0, 100]) {
        const x2 = (rVal - 50) / 35;
        const x1 = -(wRed * x2 + b) / wWeight;
        const weight = 145 + x1 * 60;
        if (weight >= 40 && weight <= 260) {
          pts.push({ x: toSvgX(weight), y: toSvgY(rVal) });
        }
      }
    }
    // Intersect with weight = 40 and weight = 260
    if (Math.abs(wRed) > 1e-4) {
      for (const wVal of [40, 260]) {
        const x1 = (wVal - 145) / 60;
        const x2 = -(wWeight * x1 + b) / wRed;
        const redness = 50 + x2 * 35;
        if (redness >= 0 && redness <= 100) {
          pts.push({ x: toSvgX(wVal), y: toSvgY(redness) });
        }
      }
    }
    if (pts.length < 2) {
      return { x1: toSvgX(145), y1: toSvgY(0), x2: toSvgX(145), y2: toSvgY(100) };
    }
    return { x1: pts[0].x, y1: pts[0].y, x2: pts[1].x, y2: pts[1].y };
  }, [mlModel]);

  const hasFailures = evalStats.failedTrad.length > 0;

  return (
    <div className="space-y-6">
      {/* Control strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleAddEdgeCase}
            disabled={edgeIndex >= EDGE_CASE_QUEUE.length}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-700 dark:bg-sky-500 px-4 py-2 text-sm font-medium text-white dark:text-slate-950 hover:bg-sky-800 dark:hover:bg-sky-400 disabled:opacity-45 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            Add Edge Case ({edgeIndex}/{EDGE_CASE_QUEUE.length})
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Fruits
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span>Click plot to add:</span>
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
            {(['Apple', 'Citrus'] as const).map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setClickClass(cls)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  clickClass === cls
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Screen: Traditional Code vs. Machine Learning */}
      <div className="grid gap-6 lg:grid-cols-2 items-stretch">
        {/* Left Panel: Traditional Hardcoded If/Else */}
        <div
          className={`flex flex-col rounded-xl border bg-white dark:bg-slate-900 p-5 transition-colors ${
            hasFailures
              ? 'border-rose-400 dark:border-rose-500/70'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                1. Traditional Programming (Hardcoded Rules)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Human writes fixed thresholds: redness &ge; 55% means Apple.
              </p>
            </div>
            <div className="text-right font-mono tabular-nums">
              <div
                className={`text-lg font-bold ${
                  hasFailures
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {evalStats.tradAccuracy.toFixed(0)}%
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Accuracy
              </div>
            </div>
          </div>

          {/* Code Block */}
          <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-200 overflow-x-auto">
            <div className="text-slate-400">def sort_fruit(weight, redness):</div>
            <div
              className={`mt-1 rounded px-2 py-0.5 transition-colors ${
                hasFailures
                  ? 'bg-rose-500/20 text-rose-200 ring-1 ring-rose-500/60'
                  : 'text-sky-300'
              }`}
            >
              &nbsp;&nbsp;if redness &gt;= 55:
            </div>
            <div className="px-2 text-emerald-300">
              &nbsp;&nbsp;&nbsp;&nbsp;return &quot;Apple&quot;
            </div>
            <div
              className={`rounded px-2 py-0.5 transition-colors ${
                hasFailures
                  ? 'bg-rose-500/20 text-rose-200 ring-1 ring-rose-500/60'
                  : 'text-sky-300'
              }`}
            >
              &nbsp;&nbsp;else:
            </div>
            <div className="px-2 text-amber-300">
              &nbsp;&nbsp;&nbsp;&nbsp;return &quot;Citrus&quot;
            </div>
          </div>

          {/* Diagnostic Status */}
          <div className="mt-4 flex-1 space-y-2.5">
            {hasFailures ? (
              <div className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    RULE FAILURE — {evalStats.failedTrad.length} fruit
                    {evalStats.failedTrad.length > 1 ? 's' : ''} misclassified
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-rose-800 dark:text-rose-200 font-mono">
                  {evalStats.failedTrad.map((f) => {
                    const pred = classifyTraditional(f).prediction;
                    return (
                      <li key={f.id}>
                        {f.name} ({f.weight}g, {f.redness}% red) → Predicted{' '}
                        <strong>{pred}</strong> (Actual: {f.actual})
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 p-3.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>PASSING ON BASIC SAMPLES</span>
                </div>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-200 leading-relaxed">
                  The simple redness rule works when every apple is bright red.
                  Click <strong>Add Edge Case</strong> to introduce a Yellow
                  Golden Apple or Blood Orange.
                </p>
              </div>
            )}

            {lastAdded && (
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Latest sample:{' '}
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {lastAdded.name}
                </span>{' '}
                ({lastAdded.weight}g · {lastAdded.redness}% redness · Actual:{' '}
                {lastAdded.actual})
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Data-Driven ML Feature Space */}
        <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                2. Machine Learning (Data-Driven Boundary)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Learns jointly from Weight + Redness and shifts automatically.
              </p>
            </div>
            <div className="text-right font-mono tabular-nums">
              <div className="text-lg font-bold text-sky-700 dark:text-sky-400">
                {evalStats.mlAccuracy.toFixed(0)}%
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Accuracy
              </div>
            </div>
          </div>

          <div className="mt-3 relative flex-1">
            <svg
              viewBox="0 0 460 310"
              onClick={handleSvgClick}
              className="w-full h-auto cursor-crosshair select-none rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"
            >
              {/* Grid lines */}
              {[60, 100, 140, 180, 220, 260].map((w) => (
                <g key={w}>
                  <line
                    x1={toSvgX(w)}
                    y1={28}
                    x2={toSvgX(w)}
                    y2={270}
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="1"
                  />
                  <text
                    x={toSvgX(w)}
                    y={286}
                    textAnchor="middle"
                    className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono"
                  >
                    {w}g
                  </text>
                </g>
              ))}
              {[0, 25, 50, 75, 100].map((r) => (
                <g key={r}>
                  <line
                    x1={48}
                    y1={toSvgY(r)}
                    x2={430}
                    y2={toSvgY(r)}
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="1"
                  />
                  <text
                    x={40}
                    y={toSvgY(r) + 3}
                    textAnchor="end"
                    className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono"
                  >
                    {r}%
                  </text>
                </g>
              ))}

              {/* Axis labels */}
              <text
                x={239}
                y={303}
                textAnchor="middle"
                className="fill-slate-600 dark:fill-slate-300 text-[11px] font-medium"
              >
                Fruit Weight (grams)
              </text>
              <text
                x={14}
                y={150}
                textAnchor="middle"
                transform="rotate(-90 14 150)"
                className="fill-slate-600 dark:fill-slate-300 text-[11px] font-medium"
              >
                Redness Index (%)
              </text>

              {/* Traditional brittle horizontal threshold line (dashed rose) */}
              <line
                x1={48}
                y1={toSvgY(55)}
                x2={430}
                y2={toSvgY(55)}
                stroke="#DC2626"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                opacity={0.65}
              />
              <text
                x={426}
                y={toSvgY(55) - 6}
                textAnchor="end"
                className="fill-rose-600 dark:fill-rose-400 text-[10px] font-mono"
              >
                if/else cutoff (redness = 55%)
              </text>

              {/* Learned ML decision boundary (solid azure) */}
              <line
                x1={boundaryLine.x1}
                y1={boundaryLine.y1}
                x2={boundaryLine.x2}
                y2={boundaryLine.y2}
                stroke="#0284C7"
                strokeWidth="3"
                className="transition-all duration-300"
              />

              {/* Data points: Apple = Azure Circle, Citrus = Amber Diamond */}
              {fruits.map((f) => {
                const cx = toSvgX(f.weight);
                const cy = toSvgY(f.redness);
                const tradFailed =
                  classifyTraditional(f).prediction !== f.actual;
                return (
                  <g key={f.id}>
                    {tradFailed && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={12}
                        fill="none"
                        stroke="#DC2626"
                        strokeWidth="1.75"
                        strokeDasharray="3 2"
                      />
                    )}
                    {f.actual === 'Apple' ? (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={f.isEdgeCase ? 7 : 5.5}
                        fill="#0284C7"
                        stroke="#ffffff"
                        strokeWidth="1.8"
                      />
                    ) : (
                      <polygon
                        points={`${cx},${cy - 7} ${cx + 7},${cy} ${cx},${
                          cy + 7
                        } ${cx - 7},${cy}`}
                        fill="#D97706"
                        stroke="#ffffff"
                        strokeWidth="1.6"
                      />
                    )}
                    {f.isEdgeCase && (
                      <text
                        x={cx}
                        y={cy - 14}
                        textAnchor="middle"
                        className="fill-slate-800 dark:fill-slate-100 text-[10px] font-medium"
                      >
                        {f.name}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Clean unboxed legend */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-600" />
                Apple (Circle)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rotate-45 bg-amber-600" />
                Citrus (Diamond)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-4 bg-sky-600" />
                Learned ML Boundary
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-4 border-t-2 border-dashed border-rose-600" />
                Hardcoded Rule
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
