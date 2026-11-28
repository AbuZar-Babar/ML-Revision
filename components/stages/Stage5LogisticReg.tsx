'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import LiveEquation from '@/components/common/LiveEquation';
import {
  computeBinaryCrossEntropy,
  computeConfusionMatrix,
  computeOLS,
  fitLogistic1D,
  sigmoid,
} from '@/lib/ml-math';

const BASE_EXAM_POINTS = [
  { id: 'e1', x: 1.0, y: 0 },
  { id: 'e2', x: 2.0, y: 0 },
  { id: 'e3', x: 2.8, y: 0 },
  { id: 'e4', x: 3.6, y: 0 },
  { id: 'e5', x: 4.5, y: 0 },
  { id: 'e6', x: 5.2, y: 0 },
  { id: 'e7', x: 5.8, y: 1 },
  { id: 'e8', x: 6.4, y: 0 }, // borderline fail
  { id: 'e9', x: 6.9, y: 1 },
  { id: 'e10', x: 7.6, y: 1 },
  { id: 'e11', x: 8.5, y: 1 },
  { id: 'e12', x: 9.6, y: 1 },
  { id: 'e13', x: 10.8, y: 1 },
];

export default function Stage5LogisticReg() {
  const { registerProofHandler } = useApp();
  const [modelType, setModelType] = useState<'linear' | 'sigmoid'>('sigmoid');
  const [showBothOverlay, setShowBothOverlay] = useState<boolean>(true);
  const [outlierX, setOutlierX] = useState<number>(12.5);
  const [threshold, setThreshold] = useState<number>(0.5);
  const [draggingOutlier, setDraggingOutlier] = useState<boolean>(false);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const proofTimers = useRef<number[]>([]);

  const clearTimers = () => {
    proofTimers.current.forEach((t) => window.clearTimeout(t));
    proofTimers.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const allPoints = useMemo(
    () => [
      ...BASE_EXAM_POINTS,
      { id: 'outlier', x: outlierX, y: 1, isOutlier: true },
    ],
    [outlierX]
  );

  // OLS Linear fit on (x, y in {0,1})
  const linearFit = useMemo(() => computeOLS(allPoints), [allPoints]);

  // Logistic Regression fit (Sigmoid)
  const logisticFit = useMemo(() => fitLogistic1D(allPoints, 750, 0.1), [allPoints]);

  const bceLoss = useMemo(
    () => computeBinaryCrossEntropy(allPoints, logisticFit.w, logisticFit.b),
    [allPoints, logisticFit]
  );

  const predictActive = useMemo(() => {
    if (modelType === 'linear') {
      return (x: number) => linearFit.w * x + linearFit.b;
    }
    return (x: number) => sigmoid(logisticFit.w * x + logisticFit.b);
  }, [modelType, linearFit, logisticFit]);

  const cm = useMemo(
    () => computeConfusionMatrix(allPoints, predictActive, threshold),
    [allPoints, predictActive, threshold]
  );

  // Decision boundary X where predicted score == threshold
  const linearBoundaryX = useMemo(() => {
    if (Math.abs(linearFit.w) < 1e-5) return 6;
    return (threshold - linearFit.b) / linearFit.w;
  }, [linearFit, threshold]);

  const sigmoidBoundaryX = useMemo(() => {
    if (Math.abs(logisticFit.w) < 1e-5) return 6;
    const logit = Math.log(threshold / (1 - threshold));
    return (logit - logisticFit.b) / logisticFit.w;
  }, [logisticFit, threshold]);

  const activeBoundaryX =
    modelType === 'linear' ? linearBoundaryX : sigmoidBoundaryX;

  // Check if Linear model outputs invalid probabilities (< 0 or > 1)
  const linearMinPred = linearFit.b;
  const linearMaxPred = linearFit.w * 50 + linearFit.b;
  const hasInvalidLinearProbs = linearMinPred < -0.01 || linearMaxPred > 1.01;

  // Visual Proof from Teacher Drawer: Switch to Linear, slide outlier to X=50, then activate Sigmoid
  useEffect(() => {
    return registerProofHandler(7, () => {
      clearTimers();
      setModelType('linear');
      setShowBothOverlay(true);
      setThreshold(0.5);
      setOutlierX(12.5);

      const steps = [18, 25, 33, 42, 50];
      steps.forEach((xVal, idx) => {
        const t = window.setTimeout(() => setOutlierX(xVal), 450 + idx * 280);
        proofTimers.current.push(t);
      });

      const tSigmoid = window.setTimeout(() => {
        setModelType('sigmoid');
      }, 2600);
      proofTimers.current.push(tSigmoid);
    });
  }, [registerProofHandler]);

  const handleReset = () => {
    clearTimers();
    setModelType('sigmoid');
    setShowBothOverlay(true);
    setOutlierX(12.5);
    setThreshold(0.5);
  };

  // Plot coordinates: X in [0, 52], Y in [-0.35, 1.35] so invalid linear outputs are visible!
  const toX = (x: number) => 56 + (x / 52) * 490;
  const toY = (y: number) => 270 - ((y + 0.35) / 1.7) * 236;

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingOutlier || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * 576;
    const newX = Math.max(11, Math.min(50, ((sx - 56) / 490) * 52));
    setOutlierX(Number(newX.toFixed(1)));
  };

  // Sigmoid SVG path
  const sigmoidPath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 104; i++) {
      const xv = (i / 104) * 52;
      const yv = sigmoid(logisticFit.w * xv + logisticFit.b);
      pts.push(
        `${i === 0 ? 'M' : 'L'} ${toX(xv).toFixed(1)} ${toY(yv).toFixed(1)}`
      );
    }
    return pts.join(' ');
  }, [logisticFit]);

  return (
    <div className="space-y-5">
      {/* Live-Linked Sigmoid Formula */}
      <LiveEquation
        title="Live Probability Equation (Hover terms to inspect geometry)"
        subtitle={
          modelType === 'linear'
            ? `Linear range on [0, 50]: [${linearMinPred.toFixed(2)}, ${linearMaxPred.toFixed(2)}] (Invalid!)`
            : `Binary Cross-Entropy Loss = ${bceLoss.toFixed(3)}`
        }
        activeHighlight={highlightKey}
        onHighlightChange={setHighlightKey}
        tokens={
          modelType === 'sigmoid'
            ? [
                { text: 'S(z) = 1 / (1 + e⁻ᶻ)   where   z = ' },
                {
                  text: `${logisticFit.w.toFixed(2)}·x`,
                  highlightKey: 'curve',
                  tone: 'primary',
                  tooltip: 'Log-odds steepness w (stable even at X=50)',
                },
                { text: ' + ' },
                {
                  text: `(${logisticFit.b.toFixed(2)})`,
                  highlightKey: 'curve',
                  tone: 'neutral',
                  tooltip: 'Intercept bias b',
                },
                { text: '   |   Predict Pass if S(z) ≥ ' },
                {
                  text: `${threshold.toFixed(2)}`,
                  highlightKey: 'threshold',
                  tone: 'amber',
                  tooltip: 'Decision threshold line on probability axis',
                },
                { text: '   →   Cutoff X = ' },
                {
                  text: `${activeBoundaryX.toFixed(1)}h`,
                  highlightKey: 'boundary',
                  tone: 'success',
                  tooltip: 'Hours threshold separating Fail from Pass',
                },
              ]
            : [
                { text: 'Linear ŷ = ' },
                {
                  text: `${linearFit.w.toFixed(3)}·x`,
                  highlightKey: 'linear',
                  tone: 'danger',
                  tooltip: 'Linear slope collapses flat as outlier moves right',
                },
                { text: ' + ' },
                {
                  text: `${linearFit.b.toFixed(2)}`,
                  highlightKey: 'linear',
                  tone: 'neutral',
                },
                { text: '   |   Threshold = ' },
                {
                  text: `${threshold.toFixed(2)}`,
                  highlightKey: 'threshold',
                  tone: 'amber',
                },
                { text: '   →   Cutoff X = ' },
                {
                  text: `${activeBoundaryX.toFixed(1)}h`,
                  highlightKey: 'boundary',
                  tone: 'danger',
                  tooltip: 'Notice cutoff shifts drastically right due to outlier!',
                },
              ]
        }
      />

      {/* Mode & Outlier Controls */}
      <div className="grid gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 lg:grid-cols-12 items-center">
        <div className="lg:col-span-4 flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setModelType('linear')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                modelType === 'linear'
                  ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Straight Line
            </button>
            <button
              type="button"
              onClick={() => setModelType('sigmoid')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                modelType === 'sigmoid'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Activate Sigmoid
            </button>
          </div>

          <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer ml-1">
            <input
              type="checkbox"
              checked={showBothOverlay}
              onChange={(e) => setShowBothOverlay(e.target.checked)}
              className="rounded border-slate-300 text-sky-600"
            />
            Compare both
          </label>
        </div>

        <div className="lg:col-span-4 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Extreme Outlier Position (X)
            </span>
            <span className="font-mono font-semibold tabular-nums text-amber-700 dark:text-amber-400">
              X = {outlierX.toFixed(1)} hrs
            </span>
          </div>
          <input
            type="range"
            min={11}
            max={50}
            step={0.5}
            value={outlierX}
            onChange={(e) => setOutlierX(parseFloat(e.target.value))}
            className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
          />
        </div>

        <div className="lg:col-span-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Decision Threshold
            </span>
            <span className="font-mono font-semibold tabular-nums text-sky-700 dark:text-sky-400">
              {threshold.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.05}
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
          />
        </div>

        <div className="lg:col-span-1 flex justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Main Two-Zone Canvas + Live Confusion Matrix */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Zone (65%): 1D Pass/Fail Plot with Sigmoid & Outlier Breakdown */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                Outlier Breakdown &amp; Sigmoid Probability Squash
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drag the amber outlier dot right toward X = 50 to watch Linear Regression break while Sigmoid holds firm.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <svg
              ref={svgRef}
              viewBox="0 0 576 312"
              onPointerMove={handlePointerMove}
              onPointerUp={() => setDraggingOutlier(false)}
              onPointerLeave={() => setDraggingOutlier(false)}
              className="w-full h-auto touch-none select-none rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"
            >
              {/* Shaded invalid probability zones (y > 1 and y < 0) */}
              <rect
                x={56}
                y={toY(1.35)}
                width={490}
                height={toY(1.0) - toY(1.35)}
                fill="#DC2626"
                opacity={0.07}
              />
              <rect
                x={56}
                y={toY(0)}
                width={490}
                height={toY(-0.35) - toY(0)}
                fill="#DC2626"
                opacity={0.07}
              />
              <text
                x={540}
                y={toY(1.18)}
                textAnchor="end"
                className="fill-rose-600/80 dark:fill-rose-400/80 text-[9px] font-mono"
              >
                Invalid Probability (&gt; 1.0)
              </text>
              <text
                x={540}
                y={toY(-0.2)}
                textAnchor="end"
                className="fill-rose-600/80 dark:fill-rose-400/80 text-[9px] font-mono"
              >
                Invalid Probability (&lt; 0.0)
              </text>

              {/* Gridlines */}
              {[0, 10, 20, 30, 40, 50].map((xv) => (
                <g key={xv}>
                  <line
                    x1={toX(xv)}
                    y1={toY(1.35)}
                    x2={toX(xv)}
                    y2={toY(-0.35)}
                    className="stroke-slate-200 dark:stroke-slate-800"
                  />
                  <text
                    x={toX(xv)}
                    y={288}
                    textAnchor="middle"
                    className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono"
                  >
                    {xv}h
                  </text>
                </g>
              ))}
              {[0, 0.5, 1.0].map((yv) => (
                <g key={yv}>
                  <line
                    x1={56}
                    y1={toY(yv)}
                    x2={546}
                    y2={toY(yv)}
                    className="stroke-slate-300 dark:stroke-slate-700"
                    strokeDasharray={yv === 0.5 ? '3 3' : undefined}
                  />
                  <text
                    x={48}
                    y={toY(yv) + 3}
                    textAnchor="end"
                    className="fill-slate-600 dark:fill-slate-400 text-[10px] font-mono"
                  >
                    {yv.toFixed(1)}
                  </text>
                </g>
              ))}

              {/* Active Decision Threshold Horizontal Line */}
              <line
                x1={56}
                y1={toY(threshold)}
                x2={546}
                y2={toY(threshold)}
                stroke="#D97706"
                strokeWidth={highlightKey === 'threshold' ? 3 : 1.75}
                strokeDasharray="6 4"
              />

              {/* Active Decision Boundary Vertical Drop */}
              {activeBoundaryX >= 0 && activeBoundaryX <= 52 && (
                <g className="transition-all duration-200 ease-out">
                  <line
                    x1={toX(activeBoundaryX)}
                    y1={toY(1.1)}
                    x2={toX(activeBoundaryX)}
                    y2={toY(-0.1)}
                    stroke={modelType === 'linear' ? '#DC2626' : '#059669'}
                    strokeWidth={highlightKey === 'boundary' ? 3 : 2}
                    strokeDasharray="4 3"
                    className="transition-all duration-200 ease-out"
                  />
                  <text
                    x={toX(activeBoundaryX) + 6}
                    y={toY(1.06)}
                    className={`text-[10px] font-mono font-semibold ${
                      modelType === 'linear'
                        ? 'fill-rose-600 dark:fill-rose-400'
                        : 'fill-emerald-700 dark:fill-emerald-400'
                    }`}
                  >
                    Cutoff: {activeBoundaryX.toFixed(1)}h
                  </text>
                </g>
              )}

              {/* Straight Line Fit (OLS) */}
              {(modelType === 'linear' || showBothOverlay) && (
                <line
                  x1={toX(0)}
                  y1={toY(linearFit.b)}
                  x2={toX(52)}
                  y2={toY(linearFit.w * 52 + linearFit.b)}
                  stroke="#DC2626"
                  strokeWidth={
                    modelType === 'linear' || highlightKey === 'linear'
                      ? 3
                      : 1.75
                  }
                  strokeDasharray={modelType === 'linear' ? undefined : '6 4'}
                  opacity={modelType === 'linear' ? 1 : 0.6}
                  className="transition-all duration-150 ease-out"
                />
              )}

              {/* Sigmoid Curve */}
              {(modelType === 'sigmoid' || showBothOverlay) && (
                <path
                  d={sigmoidPath}
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth={
                    modelType === 'sigmoid' || highlightKey === 'curve'
                      ? 3.2
                      : 1.75
                  }
                  opacity={modelType === 'sigmoid' ? 1 : 0.55}
                  className="transition-all duration-200 ease-out"
                />
              )}

              {/* Base Pass/Fail Data Dots */}
              {BASE_EXAM_POINTS.map((p) => {
                const cx = toX(p.x);
                const cy = toY(p.y);
                const pred = predictActive(p.x) >= threshold ? 1 : 0;
                const wrong = pred !== p.y;
                return (
                  <g key={p.id}>
                    {wrong && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={10}
                        fill="none"
                        stroke="#DC2626"
                        strokeWidth="1.75"
                      />
                    )}
                    {p.y === 1 ? (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={5.5}
                        fill="#0284C7"
                        stroke="#ffffff"
                        strokeWidth="1.6"
                      />
                    ) : (
                      <polygon
                        points={`${cx},${cy - 6} ${cx + 6},${cy} ${cx},${
                          cy + 6
                        } ${cx - 6},${cy}`}
                        fill="#DC2626"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    )}
                  </g>
                );
              })}

              {/* Draggable Extreme Outlier Dot at Y = 1 */}
              <g
                className="cursor-ew-resize"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  (e.target as Element).setPointerCapture(e.pointerId);
                  setDraggingOutlier(true);
                }}
              >
                <circle
                  cx={toX(outlierX)}
                  cy={toY(1)}
                  r={13}
                  fill="#D97706"
                  opacity={0.2}
                />
                <circle
                  cx={toX(outlierX)}
                  cy={toY(1)}
                  r={7.5}
                  fill="#D97706"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={toX(outlierX)}
                  y={toY(1) - 16}
                  textAnchor="middle"
                  className="fill-amber-700 dark:fill-amber-300 text-[10px] font-mono font-semibold"
                >
                  Outlier (X={outlierX.toFixed(0)})
                </text>
              </g>

              <text
                x={301}
                y={305}
                textAnchor="middle"
                className="fill-slate-600 dark:fill-slate-300 text-[11px] font-medium"
              >
                Study Hours (x)
              </text>
              <text
                x={16}
                y={152}
                textAnchor="middle"
                transform="rotate(-90 16 152)"
                className="fill-slate-600 dark:fill-slate-300 text-[11px] font-medium"
              >
                Probability P(Pass)
              </text>
            </svg>

            {modelType === 'linear' && hasInvalidLinearProbs && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2.5 text-xs text-rose-800 dark:text-rose-200">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>
                  <strong>Linear Breakdown:</strong> Straight-line predictions
                  exceed [0, 1] and pulling the outlier right tilts the cutoff
                  to <strong>{linearBoundaryX.toFixed(1)}h</strong>, causing
                  passing students to be marked Fail!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Zone (35%): Live 2x2 Confusion Matrix & Metrics */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                Live 2×2 Confusion Matrix
              </h3>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {modelType === 'sigmoid' ? 'Sigmoid' : 'Linear'} · t={threshold.toFixed(2)}
              </span>
            </div>

            <div className="mt-4">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div />
                <div className="font-semibold text-slate-600 dark:text-slate-400 pb-1">
                  Pred Pass
                </div>
                <div className="font-semibold text-slate-600 dark:text-slate-400 pb-1">
                  Pred Fail
                </div>

                <div className="flex items-center justify-end pr-2 font-semibold text-slate-600 dark:text-slate-400">
                  Actual Pass
                </div>
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-3">
                  <div className="font-mono text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                    {cm.tp}
                  </div>
                  <div className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400">
                    TP
                  </div>
                </div>
                <div className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3">
                  <div className="font-mono text-xl font-bold tabular-nums text-rose-700 dark:text-rose-300">
                    {cm.fn}
                  </div>
                  <div className="text-[11px] font-medium text-rose-800 dark:text-rose-400">
                    FN (Missed)
                  </div>
                </div>

                <div className="flex items-center justify-end pr-2 font-semibold text-slate-600 dark:text-slate-400">
                  Actual Fail
                </div>
                <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-3">
                  <div className="font-mono text-xl font-bold tabular-nums text-amber-800 dark:text-amber-300">
                    {cm.fp}
                  </div>
                  <div className="text-[11px] font-medium text-amber-800 dark:text-amber-400">
                    FP (False Alarm)
                  </div>
                </div>
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-3">
                  <div className="font-mono text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                    {cm.tn}
                  </div>
                  <div className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400">
                    TN
                  </div>
                </div>
              </div>
            </div>

            {/* Precision / Recall / Accuracy Strip */}
            <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-center font-mono tabular-nums">
              <div>
                <div className="font-sans text-[11px] text-slate-500 dark:text-slate-400">
                  Accuracy
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {(cm.accuracy * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="font-sans text-[11px] text-slate-500 dark:text-slate-400">
                  Precision
                </div>
                <div className="text-base font-bold text-sky-700 dark:text-sky-400">
                  {(cm.precision * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="font-sans text-[11px] text-slate-500 dark:text-slate-400">
                  Recall
                </div>
                <div className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                  {(cm.recall * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            <strong className="text-slate-900 dark:text-slate-100">
              Try This:
            </strong>{' '}
            Slide <strong>Decision Threshold</strong> down to 0.20 to eliminate
            False Negatives (100% Recall), then watch False Positives climb.
          </div>
        </div>
      </div>
    </div>
  );
}
