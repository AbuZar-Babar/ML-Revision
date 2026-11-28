'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, Sliders } from 'lucide-react';
import {
  fitAdaBoostStumps,
  fitBaggedForest,
  generateEnsembleData,
} from '@/lib/ml-advanced-math';
import { useApp } from '@/context/AppContext';
import LiveEquation from '@/components/common/LiveEquation';

type EnsembleMode = 'forest' | 'boost';

export default function Stage10Ensembles() {
  const { registerProofHandler } = useApp();
  const { train, test } = useMemo(() => generateEnsembleData(), []);

  const [mode, setMode] = useState<EnsembleMode>('forest');
  const [numLearners, setNumLearners] = useState<number>(1);
  const [treeDepth, setTreeDepth] = useState<number>(4);
  const [showTest, setShowTest] = useState<boolean>(true);
  const timerRef = useRef<number | null>(null);

  const forest = useMemo(
    () => fitBaggedForest(train, numLearners, treeDepth),
    [train, numLearners, treeDepth]
  );
  const boost = useMemo(
    () => fitAdaBoostStumps(train, numLearners),
    [train, numLearners]
  );

  const trainAcc = mode === 'forest' ? forest.trainAcc : boost.trainAcc;
  const testAcc =
    mode === 'forest' ? forest.testAcc(test) : boost.testAcc(test);

  useEffect(() => {
    const clearT = () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
    const runProof = () => {
      clearT();
      setMode('forest');
      setShowTest(true);
      setTreeDepth(4);
      setNumLearners(1);
      timerRef.current = window.setTimeout(() => {
        setNumLearners(15);
        timerRef.current = window.setTimeout(() => {
          setMode('boost');
          setNumLearners(8);
        }, 1700);
      }, 1500);
    };
    const unregister = registerProofHandler(11, runProof);
    return () => {
      unregister();
      clearT();
    };
  }, [registerProofHandler]);

  const W = 520;
  const H = 370;
  const pad = 32;
  const toX = (x: number) => pad + (x / 10) * (W - 2 * pad);
  const toY = (y: number) => H - pad - (y / 10) * (H - 2 * pad);

  const gridCells = useMemo(() => {
    const cols = 26;
    const rows = 20;
    const cw = (W - 2 * pad) / cols;
    const ch = (H - 2 * pad) / rows;
    const cells: { x: number; y: number; w: number; h: number; p1: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const gx = ((c + 0.5) / cols) * 10;
        const gy = ((rows - 1 - r + 0.5) / rows) * 10;
        const p1 =
          mode === 'forest'
            ? forest.predictProb(gx, gy)
            : 1 / (1 + Math.exp(-boost.predictScore(gx, gy) * 1.4));
        cells.push({
          x: pad + c * cw,
          y: pad + r * ch,
          w: cw + 0.5,
          h: ch + 0.5,
          p1,
        });
      }
    }
    return cells;
  }, [mode, forest, boost]);

  const maxWeight = useMemo(
    () => Math.max(...boost.sampleWeights, 0.01),
    [boost.sampleWeights]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left 65%: Decision Surface & Sample Weight Scaling */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                {mode === 'forest'
                  ? `Random Forest Bagging (${numLearners} ${numLearners === 1 ? 'Single Tree' : 'Averaged Trees'})`
                  : `AdaBoost Sequential Stumps (${numLearners} Boosting Rounds)`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'forest'
                  ? 'Slide from M = 1 tree up to M = 15 trees to watch jagged single-tree noise smooth out via voting.'
                  : 'Dot size reflects Boosting sample weight—hard misclassified points grow larger so the next stump targets them.'}
              </p>
            </div>
            <div className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
              Learners:{' '}
              <strong className="text-blue-700 dark:text-blue-400">
                M = {numLearners}
              </strong>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            role="img"
            aria-label="Ensemble decision boundary comparing Random Forest bagging and AdaBoost"
          >
            {gridCells.map((cell, i) => {
              const conf = Math.abs(cell.p1 - 0.5) * 2;
              const fill = cell.p1 >= 0.5 ? '#dc2626' : '#1d4ed8';
              return (
                <rect
                  key={i}
                  x={cell.x}
                  y={cell.y}
                  width={cell.w}
                  height={cell.h}
                  fill={fill}
                  fillOpacity={0.07 + conf * 0.2}
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

            {/* Training Points */}
            {train.map((p, idx) => {
              const wScale =
                mode === 'boost'
                  ? 4.2 + (boost.sampleWeights[idx] / maxWeight) * 6.5
                  : 5;
              return (
                <circle
                  key={p.id}
                  cx={toX(p.x)}
                  cy={toY(p.y)}
                  r={wScale}
                  fill={p.label === 1 ? '#dc2626' : '#1d4ed8'}
                  className="stroke-white dark:stroke-slate-950 transition-all duration-200"
                  strokeWidth={1.4}
                />
              );
            })}

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
                  fill={p.label === 1 ? '#dc2626' : '#1d4ed8'}
                  className="stroke-amber-300 dark:stroke-amber-300"
                  strokeWidth={1.8}
                />
              ))}

            <text x={W / 2} y={H - 10} textAnchor="middle" className="fill-slate-500 text-[11px] font-mono">
              Feature x₁  (Circles = Train · Gold-Bordered Squares = Holdout Test)
            </text>
          </svg>
        </div>

        {/* Right 35%: Controls */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Sliders className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                <span>Ensemble Strategy</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode('forest');
                  setNumLearners(1);
                  setTreeDepth(4);
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
                onClick={() => setMode('forest')}
                className={`rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  mode === 'forest'
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Bagging (Forest)
              </button>
              <button
                type="button"
                onClick={() => setMode('boost')}
                className={`rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  mode === 'boost'
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Boosting (Stumps)
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <label htmlFor="ens-m" className="font-medium text-slate-700 dark:text-slate-300">
                  {mode === 'forest' ? 'Trees in Forest (M)' : 'Boosting Rounds (M)'}
                </label>
                <span className="font-mono text-sm font-bold tabular-nums text-blue-700 dark:text-blue-400">
                  {numLearners}
                </span>
              </div>
              <input
                id="ens-m"
                type="range"
                min={1}
                max={15}
                step={1}
                value={numLearners}
                onChange={(e) => setNumLearners(Number(e.target.value))}
                className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
              />
              <div className="flex justify-between font-mono text-[11px] text-slate-400">
                <span>1 (Single)</span>
                <span>7</span>
                <span>15 (Full Ensemble)</span>
              </div>
            </div>

            {mode === 'forest' && (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between text-xs">
                  <label htmlFor="ens-depth" className="font-medium text-slate-700 dark:text-slate-300">
                    Max Depth per Tree
                  </label>
                  <span className="font-mono text-sm font-bold tabular-nums text-blue-700 dark:text-blue-400">
                    {treeDepth}
                  </span>
                </div>
                <input
                  id="ens-depth"
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={treeDepth}
                  onChange={(e) => setTreeDepth(Number(e.target.value))}
                  className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500">Train Accuracy</div>
                <div className="mt-1 font-mono text-base font-bold tabular-nums text-blue-700 dark:text-blue-400">
                  {(trainAcc * 100).toFixed(1)}%
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500">Test Accuracy</div>
                <div
                  className={`mt-1 font-mono text-base font-bold tabular-nums ${
                    testAcc >= 0.85
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {(testAcc * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTest((v) => !v)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {showTest ? 'Hide Holdout Test Dots' : 'Show Holdout Test Dots'}
            </button>
          </div>

          <LiveEquation
            label={mode === 'forest' ? 'Bagged Consensus Vote' : 'AdaBoost Additive Score'}
            formula={
              mode === 'forest'
                ? `ŷ(x) = (1 / ${numLearners}) Σ_{m=1..${numLearners}} Tree_m(x)`
                : `F(x) = sign( Σ_{m=1..${numLearners}} α_m · Stump_m(x) )`
            }
            footnote={
              mode === 'forest'
                ? 'Parallel averaging suppresses individual tree variance caused by noisy training dots.'
                : `Latest stump weight α_${numLearners} = ${(boost.stumps[boost.stumps.length - 1]?.alpha ?? 0).toFixed(2)}.`
            }
          />
        </div>
      </div>
    </div>
  );
}
