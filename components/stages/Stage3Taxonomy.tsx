'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StepForward, RotateCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  Centroid,
  Point2D,
  assignKMeansClusters,
  computeOLS,
  updateKMeansCentroids,
} from '@/lib/ml-math';

type TaxonomyMode = 'regression' | 'classification' | 'unsupervised';

// Same 24 coordinates used across all 3 modes to prove X stays consistent
const UNIFIED_POINTS: Point2D[] = [
  // Lower-left cluster (Fail / low hours)
  { id: 'u1', x: 1.2, y: 26, label: 0 },
  { id: 'u2', x: 1.6, y: 31, label: 0 },
  { id: 'u3', x: 1.9, y: 24, label: 0 },
  { id: 'u4', x: 2.2, y: 35, label: 0 },
  { id: 'u5', x: 2.5, y: 29, label: 0 },
  { id: 'u6', x: 2.8, y: 38, label: 0 },
  { id: 'u7', x: 3.1, y: 33, label: 0 },
  { id: 'u8', x: 1.5, y: 21, label: 0 },
  // Middle cluster (Borderline / moderate study)
  { id: 'u9', x: 4.5, y: 54, label: 0 },
  { id: 'u10', x: 4.9, y: 58, label: 1 },
  { id: 'u11', x: 5.2, y: 52, label: 0 },
  { id: 'u12', x: 5.5, y: 62, label: 1 },
  { id: 'u13', x: 5.8, y: 59, label: 1 },
  { id: 'u14', x: 5.1, y: 65, label: 1 },
  { id: 'u15', x: 4.7, y: 49, label: 0 },
  { id: 'u16', x: 6.0, y: 63, label: 1 },
  // Upper-right cluster (High Pass / dedicated study)
  { id: 'u17', x: 7.4, y: 81, label: 1 },
  { id: 'u18', x: 7.8, y: 85, label: 1 },
  { id: 'u19', x: 8.1, y: 79, label: 1 },
  { id: 'u20', x: 8.4, y: 89, label: 1 },
  { id: 'u21', x: 8.7, y: 84, label: 1 },
  { id: 'u22', x: 9.0, y: 92, label: 1 },
  { id: 'u23', x: 8.3, y: 94, label: 1 },
  { id: 'u24', x: 7.6, y: 88, label: 1 },
];

const INITIAL_CENTROIDS: Centroid[] = [
  { x: 2.5, y: 78, cluster: 0 },
  { x: 5.0, y: 25, cluster: 1 },
  { x: 8.2, y: 48, cluster: 2 },
];

const CLUSTER_COLORS = ['#0284C7', '#059669', '#D97706'];

export default function Stage3Taxonomy() {
  const { registerProofHandler } = useApp();
  const [mode, setMode] = useState<TaxonomyMode>('regression');
  const [centroids, setCentroids] = useState<Centroid[]>(INITIAL_CENTROIDS);
  const [kmeansStep, setKmeansStep] = useState(0);
  const [hasAssigned, setHasAssigned] = useState(false);
  const proofTimers = useRef<number[]>([]);

  const clearTimers = () => {
    proofTimers.current.forEach((t) => window.clearTimeout(t));
    proofTimers.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const ols = useMemo(() => computeOLS(UNIFIED_POINTS), []);

  // Normalize coordinates for clean Euclidean K-Means (x: 0..10, y: 0..100 -> scale y/10)
  const scaledPoints = useMemo(
    () => UNIFIED_POINTS.map((p) => ({ ...p, y: p.y / 10 })),
    []
  );
  const scaledCentroids = useMemo(
    () => centroids.map((c) => ({ ...c, y: c.y / 10 })),
    [centroids]
  );

  const assignments = useMemo(
    () => assignKMeansClusters(scaledPoints, scaledCentroids),
    [scaledPoints, scaledCentroids]
  );

  const handleKMeansStep = () => {
    if (!hasAssigned) {
      setHasAssigned(true);
      setKmeansStep(1);
      return;
    }
    const nextScaled = updateKMeansCentroids(
      scaledPoints,
      assignments,
      scaledCentroids
    );
    setCentroids(nextScaled.map((c) => ({ ...c, y: c.y * 10 })));
    setKmeansStep((s) => s + 1);
  };

  const handleResetKMeans = () => {
    setCentroids(INITIAL_CENTROIDS);
    setKmeansStep(0);
    setHasAssigned(false);
  };

  // Visual Proof automation: walk through all 3 modes & run K-Means steps
  useEffect(() => {
    return registerProofHandler(3, () => {
      clearTimers();
      setMode('regression');
      handleResetKMeans();

      const t1 = window.setTimeout(() => setMode('classification'), 1100);
      const t2 = window.setTimeout(() => setMode('unsupervised'), 2300);
      const t3 = window.setTimeout(() => {
        setHasAssigned(true);
        setKmeansStep(1);
      }, 3100);

      let runningCentroids = INITIAL_CENTROIDS.map((c) => ({
        ...c,
        y: c.y / 10,
      }));
      for (let step = 1; step <= 3; step++) {
        const ts = window.setTimeout(() => {
          const asgn = assignKMeansClusters(scaledPoints, runningCentroids);
          runningCentroids = updateKMeansCentroids(
            scaledPoints,
            asgn,
            runningCentroids
          );
          setCentroids(runningCentroids.map((c) => ({ ...c, y: c.y * 10 })));
          setKmeansStep(step + 1);
        }, 3100 + step * 750);
        proofTimers.current.push(ts);
      }

      proofTimers.current.push(t1, t2, t3);
    });
  }, [registerProofHandler, scaledPoints]);

  // SVG plot helpers: x in [0, 10], y in [0, 100]
  const toX = (x: number) => 58 + (x / 10) * 510;
  const toY = (y: number) => 316 - (y / 100) * 276;

  // Regression confidence band polygon (+/- 7 marks around OLS line)
  const confidenceBandPoints = [
    `${toX(0)},${toY(Math.min(100, ols.b + 7))}`,
    `${toX(10)},${toY(Math.min(100, ols.w * 10 + ols.b + 7))}`,
    `${toX(10)},${toY(Math.max(0, ols.w * 10 + ols.b - 7))}`,
    `${toX(0)},${toY(Math.max(0, ols.b - 7))}`,
  ].join(' ');

  return (
    <div className="space-y-5">
      {/* Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5">
        <div
          role="tablist"
          aria-label="ML Taxonomy Modes"
          className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 gap-1"
        >
          {(
            [
              { id: 'regression', label: '1. Regression (Continuous)' },
              { id: 'classification', label: '2. Classification (Discrete)' },
              { id: 'unsupervised', label: '3. Unsupervised (Clustering)' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={mode === tab.id}
              onClick={() => setMode(tab.id)}
              className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === tab.id
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {mode === 'unsupervised' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleKMeansStep}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 dark:bg-sky-500 px-3.5 py-2 text-xs font-medium text-white dark:text-slate-950 hover:bg-sky-800 dark:hover:bg-sky-400 transition-colors cursor-pointer"
            >
              <StepForward className="h-3.5 w-3.5" />
              K-Means Step ({kmeansStep})
            </button>
            <button
              type="button"
              onClick={handleResetKMeans}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Centroids
            </button>
          </div>
        )}
      </div>

      {/* Two-Zone Layout */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left: Persistent 2D Coordinate Plane */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Persistent 2D Feature Space (Same 24 Coordinates)
            </h3>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              {mode === 'regression'
                ? 'Output: Continuous Mark (0–100)'
                : mode === 'classification'
                ? 'Output: Pass vs. Fail Boundary'
                : 'Output: 3 Unlabeled Clusters'}
            </span>
          </div>

          <div className="mt-4">
            <svg
              viewBox="0 0 600 356"
              className="w-full h-auto rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"
            >
              {/* Grid */}
              {[0, 2, 4, 6, 8, 10].map((xv) => (
                <g key={xv}>
                  <line
                    x1={toX(xv)}
                    y1={40}
                    x2={toX(xv)}
                    y2={316}
                    className="stroke-slate-200 dark:stroke-slate-800"
                  />
                  <text
                    x={toX(xv)}
                    y={334}
                    textAnchor="middle"
                    className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono"
                  >
                    {xv}h
                  </text>
                </g>
              ))}
              {[0, 20, 40, 60, 80, 100].map((yv) => (
                <g key={yv}>
                  <line
                    x1={58}
                    y1={toY(yv)}
                    x2={568}
                    y2={toY(yv)}
                    className="stroke-slate-200 dark:stroke-slate-800"
                  />
                  <text
                    x={48}
                    y={toY(yv) + 3}
                    textAnchor="end"
                    className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono"
                  >
                    {yv}
                  </text>
                </g>
              ))}

              {/* Mode 1: Regression Line + Confidence Band */}
              {mode === 'regression' && (
                <g>
                  <polygon
                    points={confidenceBandPoints}
                    fill="#0284C7"
                    opacity={0.14}
                  />
                  <line
                    x1={toX(0)}
                    y1={toY(ols.b)}
                    x2={toX(10)}
                    y2={toY(ols.w * 10 + ols.b)}
                    stroke="#0284C7"
                    strokeWidth="3"
                  />
                </g>
              )}

              {/* Mode 2: Classification Shaded Halves + Linear Dividing Boundary */}
              {mode === 'classification' && (
                <g>
                  <line
                    x1={toX(2.0)}
                    y1={toY(90)}
                    x2={toX(7.4)}
                    y2={toY(24)}
                    stroke="#0F172A"
                    className="stroke-slate-900 dark:stroke-slate-100"
                    strokeWidth="2.5"
                    strokeDasharray="7 5"
                  />
                  <text
                    x={toX(7.8)}
                    y={toY(68)}
                    className="fill-sky-700 dark:fill-sky-300 text-xs font-semibold"
                  >
                    PASS Region
                  </text>
                  <text
                    x={toX(1.2)}
                    y={toY(46)}
                    className="fill-rose-700 dark:fill-rose-400 text-xs font-semibold"
                  >
                    FAIL Region
                  </text>
                </g>
              )}

              {/* Mode 3: Unsupervised K-Means Lines & Centroids */}
              {mode === 'unsupervised' && hasAssigned && (
                <g>
                  {UNIFIED_POINTS.map((p, idx) => {
                    const c = centroids[assignments[idx]];
                    return (
                      <line
                        key={`link-${p.id}`}
                        x1={toX(p.x)}
                        y1={toY(p.y)}
                        x2={toX(c.x)}
                        y2={toY(c.y)}
                        stroke={CLUSTER_COLORS[c.cluster]}
                        strokeWidth="1"
                        opacity={0.32}
                      />
                    );
                  })}
                </g>
              )}

              {/* Data Points (Persistent coordinates across all 3 modes!) */}
              {UNIFIED_POINTS.map((p, idx) => {
                const cx = toX(p.x);
                const cy = toY(p.y);

                if (mode === 'regression') {
                  return (
                    <circle
                      key={p.id}
                      cx={cx}
                      cy={cy}
                      r={5.5}
                      fill="#0284C7"
                      stroke="#ffffff"
                      strokeWidth="1.6"
                    />
                  );
                }

                if (mode === 'classification') {
                  return p.label === 1 ? (
                    <circle
                      key={p.id}
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill="#0284C7"
                      stroke="#ffffff"
                      strokeWidth="1.6"
                    />
                  ) : (
                    <polygon
                      key={p.id}
                      points={`${cx},${cy - 6.5} ${cx + 6.5},${cy} ${cx},${
                        cy + 6.5
                      } ${cx - 6.5},${cy}`}
                      fill="#DC2626"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  );
                }

                // Unsupervised mode: neutral gray initially, cluster-tinted once K-Means steps
                const fill = hasAssigned
                  ? CLUSTER_COLORS[assignments[idx]]
                  : '#64748B';
                return (
                  <circle
                    key={p.id}
                    cx={cx}
                    cy={cy}
                    r={5.5}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-colors duration-300"
                  />
                );
              })}

              {/* Centroid Crosshairs in Unsupervised Mode */}
              {mode === 'unsupervised' &&
                centroids.map((c) => {
                  const cx = toX(c.x);
                  const cy = toY(c.y);
                  return (
                    <g
                      key={`cent-${c.cluster}`}
                      className="transition-all duration-500"
                    >
                      <circle
                        cx={cx}
                        cy={cy}
                        r={11}
                        fill={CLUSTER_COLORS[c.cluster]}
                        fillOpacity={0.2}
                        stroke={CLUSTER_COLORS[c.cluster]}
                        strokeWidth="2.5"
                      />
                      <line
                        x1={cx - 5}
                        y1={cy}
                        x2={cx + 5}
                        y2={cy}
                        stroke={CLUSTER_COLORS[c.cluster]}
                        strokeWidth="2.5"
                      />
                      <line
                        x1={cx}
                        y1={cy - 5}
                        x2={cx}
                        y2={cy + 5}
                        stroke={CLUSTER_COLORS[c.cluster]}
                        strokeWidth="2.5"
                      />
                    </g>
                  );
                })}

              {/* Axis Labels */}
              <text
                x={313}
                y={350}
                textAnchor="middle"
                className="fill-slate-600 dark:fill-slate-300 text-[11px] font-medium"
              >
                Feature X₁: Weekly Study Hours
              </text>
              <text
                x={16}
                y={178}
                textAnchor="middle"
                transform="rotate(-90 16 178)"
                className="fill-slate-600 dark:fill-slate-300 text-[11px] font-medium"
              >
                {mode === 'regression'
                  ? 'Target Y: Exam Score (%)'
                  : 'Feature X₂: Lab Practice Score (%)'}
              </text>
            </svg>
          </div>
        </div>

        {/* Right: Conceptual Comparison Deck */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
              Active Paradigm Breakdown
            </div>

            {mode === 'regression' && (
              <div className="space-y-3">
                <h4 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Supervised Regression
                </h4>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Predicts a <strong>continuous numerical output</strong> (exam
                  score from 0 to 100) with a shaded confidence band around the
                  best-fit trend.
                </p>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/70 p-3 font-mono text-xs tabular-nums text-slate-800 dark:text-slate-200">
                  ŷ = {ols.w.toFixed(2)} · (Hours) + {ols.b.toFixed(1)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Exam examples: House price prediction, temperature forecasting,
                  student marks estimation.
                </div>
              </div>
            )}

            {mode === 'classification' && (
              <div className="space-y-3">
                <h4 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Supervised Classification
                </h4>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Assigns each point to a <strong>discrete category</strong>{' '}
                  (Pass circle vs. Fail diamond) by learning a decision boundary
                  that separates the classes.
                </p>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/70 p-3 font-mono text-xs text-slate-800 dark:text-slate-200">
                  y ∈ &#123; 0 (Fail), 1 (Pass) &#125;
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Exam examples: Spam vs. Ham, Disease diagnosis, Pass vs. Fail
                  admission screening.
                </div>
              </div>
            )}

            {mode === 'unsupervised' && (
              <div className="space-y-3">
                <h4 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Unsupervised Clustering
                </h4>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  All class labels are removed (neutral gray). Click{' '}
                  <strong>K-Means Step</strong> to watch the three crosshair
                  centroids assign nearest points and gravitate to natural
                  student study groups.
                </p>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/70 p-3 font-mono text-xs tabular-nums text-slate-800 dark:text-slate-200">
                  Iteration: {kmeansStep} · Centroids (K) = 3 · Labels = None
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Exam examples: Customer segmentation, anomaly detection,
                  document topic grouping.
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            <strong className="text-slate-900 dark:text-slate-100">
              Key Insight:
            </strong>{' '}
            Notice that not a single dot moved when switching tabs. The data
            matrix <em>X</em> is identical—only our learning objective changes.
          </div>
        </div>
      </div>
    </div>
  );
}
