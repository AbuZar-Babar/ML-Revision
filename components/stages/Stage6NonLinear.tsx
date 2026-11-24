'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, RotateCcw, Split } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import LiveEquation from '@/components/common/LiveEquation';
import {
  DecisionTreeNode,
  buildDecisionTree,
  collectTreeLeaves,
  collectTreeNodes,
  evaluateKNNAccuracy,
  evaluateTreeAccuracy,
  generateTwoMoonsData,
  knnPredict,
} from '@/lib/ml-math';

type SubAlgorithm = 'knn' | 'tree';

export default function Stage6NonLinear() {
  const { registerProofHandler } = useApp();
  const { train, test } = useMemo(() => generateTwoMoonsData(), []);

  const [subAlgo, setSubAlgo] = useState<SubAlgorithm>('knn');
  const [tryLinear, setTryLinear] = useState<boolean>(false);
  const [showTestSplit, setShowTestSplit] = useState<boolean>(true);

  // KNN state
  const [k, setK] = useState<number>(5);
  const [queryPt, setQueryPt] = useState<{ x: number; y: number }>({
    x: 5.1,
    y: 4.5,
  });
  const [draggingQuery, setDraggingQuery] = useState<boolean>(false);

  // Decision Tree state
  const [maxDepth, setMaxDepth] = useState<number>(3);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('root');

  const knnSvgRef = useRef<SVGSVGElement | null>(null);
  const proofTimers = useRef<number[]>([]);

  const clearTimers = () => {
    proofTimers.current.forEach((t) => window.clearTimeout(t));
    proofTimers.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  // Visual Proof from Teacher Drawer: Show Linear failure on Two Moons, then k=1 overfit vs k=9 generalization
  useEffect(() => {
    return registerProofHandler(6, () => {
      clearTimers();
      setSubAlgo('knn');
      setShowTestSplit(true);
      setTryLinear(true);

      const t1 = window.setTimeout(() => {
        setTryLinear(false);
        setK(1);
      }, 1400);
      const t2 = window.setTimeout(() => {
        setK(9);
      }, 3100);

      proofTimers.current.push(t1, t2);
    });
  }, [registerProofHandler]);

  // Linear baseline accuracy on two moons (best horizontal/diagonal cut y = 0.25x + 3.4)
  const linearStats = useMemo(() => {
    let correct = 0;
    for (const p of train) {
      const pred = p.y < 0.22 * p.x + 3.8 ? 1 : 0;
      if (pred === p.label) correct++;
    }
    return (correct / train.length) * 100;
  }, [train]);

  // KNN query evaluation & 30x30 decision boundary heatmap
  const knnEval = useMemo(
    () => knnPredict(train, queryPt.x, queryPt.y, k),
    [train, queryPt, k]
  );

  const knnAcc = useMemo(() => {
    const trainAcc = evaluateKNNAccuracy(train, train, k, false) * 100;
    const testAcc = evaluateKNNAccuracy(train, test, k, false) * 100;
    return { trainAcc, testAcc };
  }, [train, test, k]);

  const knnGridCells = useMemo(() => {
    if (subAlgo !== 'knn') return [];
    const res = 28;
    const step = 10 / res;
    const cells: { x: number; y: number; pred: number }[] = [];
    for (let gx = 0; gx < res; gx++) {
      for (let gy = 0; gy < res; gy++) {
        const cx = (gx + 0.5) * step;
        const cy = (gy + 0.5) * step;
        const { prediction } = knnPredict(train, cx, cy, k);
        cells.push({ x: gx * step, y: gy * step, pred: prediction });
      }
    }
    return cells;
  }, [subAlgo, train, k]);

  // Decision Tree computation
  const treeRoot = useMemo(
    () => buildDecisionTree(train, maxDepth),
    [train, maxDepth]
  );
  const treeLeaves = useMemo(() => collectTreeLeaves(treeRoot), [treeRoot]);
  const allTreeNodes = useMemo(() => collectTreeNodes(treeRoot), [treeRoot]);

  const selectedNode = useMemo(() => {
    return (
      allTreeNodes.find((n) => n.id === selectedNodeId) ?? treeRoot
    );
  }, [allTreeNodes, selectedNodeId, treeRoot]);

  const treeAcc = useMemo(() => {
    const trainAcc = evaluateTreeAccuracy(treeRoot, train) * 100;
    const testAcc = evaluateTreeAccuracy(treeRoot, test) * 100;
    return { trainAcc, testAcc };
  }, [treeRoot, train, test]);

  // Plot transform: data [0, 10] -> SVG [32, 392] (width 360, height 360)
  const toX = (x: number) => 32 + (x / 10) * 360;
  const toY = (y: number) => 392 - (y / 10) * 360;
  const scaleLen = (d: number) => (d / 10) * 360;

  const handleKnnPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingQuery || !knnSvgRef.current) return;
    const rect = knnSvgRef.current.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * 424;
    const sy = ((e.clientY - rect.top) / rect.height) * 424;
    const nx = Math.max(0.3, Math.min(9.7, ((sx - 32) / 360) * 10));
    const ny = Math.max(0.3, Math.min(9.7, ((392 - sy) / 360) * 10));
    setQueryPt({ x: Number(nx.toFixed(2)), y: Number(ny.toFixed(2)) });
  };

  // Layout tree SVG nodes recursively using horizontal bounds [xMin, xMax]
  const treeLayout = useMemo(() => {
    const positions: {
      node: DecisionTreeNode;
      x: number;
      y: number;
      parentX?: number;
      parentY?: number;
      edgeLabel?: string;
    }[] = [];

    const visit = (
      node: DecisionTreeNode,
      leftPx: number,
      rightPx: number,
      parentX?: number,
      parentY?: number,
      edgeLabel?: string
    ) => {
      const cx = (leftPx + rightPx) / 2;
      const cy = 38 + node.depth * 84;
      positions.push({ node, x: cx, y: cy, parentX, parentY, edgeLabel });
      if (!node.isLeaf && node.left && node.right) {
        visit(node.left, leftPx, cx, cx, cy, '≤');
        visit(node.right, cx, rightPx, cx, cy, '>');
      }
    };
    visit(treeRoot, 16, 444);
    return positions;
  }, [treeRoot]);

  const handleReset = () => {
    clearTimers();
    setTryLinear(false);
    setK(5);
    setMaxDepth(3);
    setQueryPt({ x: 5.1, y: 4.5 });
    setSelectedNodeId('root');
  };

  const isOverfittingKnn = k === 1;
  const isOverfittingTree = maxDepth >= 4;

  return (
    <div className="space-y-5">
      {/* Top Algorithm & Challenge Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setSubAlgo('knn')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                subAlgo === 'knn'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              K-Nearest Neighbors (KNN)
            </button>
            <button
              type="button"
              onClick={() => setSubAlgo('tree')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                subAlgo === 'tree'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Decision Tree (Orthogonal Cuts)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setTryLinear((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              tryLinear
                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {tryLinear ? 'Hide Linear Baseline' : 'Try Linear Classifier'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTestSplit((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              showTestSplit
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Split className="h-3.5 w-3.5" />
            Holdout Test Set
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {tryLinear && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>
            <strong>Linear Classifier Failure ({linearStats.toFixed(0)}% Train Accuracy):</strong>{' '}
            No single straight line can separate interlocking moons. Non-linear models like KNN and Decision Trees solve this locally.
          </span>
        </div>
      )}

      {/* Live Equation */}
      {subAlgo === 'knn' ? (
        <LiveEquation
          title="Live KNN Distance & Majority Vote"
          subtitle={
            isOverfittingKnn
              ? 'Warning: k = 1 memorizes noisy training dots (Overfitting!)'
              : `Search Radius r_${k} = ${knnEval.radius.toFixed(2)} units`
          }
          tokens={[
            { text: 'd(q, xᵢ) = √((x_q − xᵢ)² + (y_q − yᵢ)²)' },
            { text: '   |   k = ' },
            {
              text: `${k}`,
              highlightKey: 'k',
              tone: isOverfittingKnn ? 'danger' : 'primary',
            },
            { text: '   |   Ballot: ' },
            {
              text: `Class A (${knnEval.votes0})`,
              highlightKey: 'v0',
              tone: 'primary',
            },
            { text: ' vs ' },
            {
              text: `Class B (${knnEval.votes1})`,
              highlightKey: 'v1',
              tone: 'danger',
            },
            { text: '   →   Predict: ' },
            {
              text: knnEval.prediction === 0 ? 'Class A' : 'Class B',
              highlightKey: 'pred',
              tone: knnEval.prediction === 0 ? 'primary' : 'danger',
            },
          ]}
        />
      ) : (
        <LiveEquation
          title={`Selected Tree Node (${selectedNode.id}) — Shannon Entropy & Information Gain`}
          subtitle={
            selectedNode.isLeaf
              ? `Leaf Node · Predicts ${selectedNode.prediction === 0 ? 'Class A' : 'Class B'}`
              : `Best Split: ${selectedNode.splitAxis?.toUpperCase()} ≤ ${selectedNode.splitValue?.toFixed(2)}`
          }
          tokens={[
            { text: 'H(S) = −p₀ log₂(p₀) − p₁ log₂(p₁) = ' },
            {
              text: `${selectedNode.entropy.toFixed(3)} bits`,
              highlightKey: 'entropy',
              tone: selectedNode.entropy < 0.2 ? 'success' : 'amber',
            },
            ...(selectedNode.infoGain !== undefined
              ? [
                  { text: '   |   Information Gain (IG) = ' },
                  {
                    text: `+${selectedNode.infoGain.toFixed(3)}`,
                    highlightKey: 'ig',
                    tone: 'primary' as const,
                  },
                ]
              : []),
            { text: '   |   Samples: ' },
            {
              text: `A:${selectedNode.count0} / B:${selectedNode.count1}`,
              highlightKey: 'counts',
              tone: 'neutral',
            },
          ]}
        />
      )}

      {/* ==================== KNN MODULE ==================== */}
      {subAlgo === 'knn' && (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left: Interactive 2D KNN Heatmap + Draggable Query Marker */}
          <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-baseline justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                  KNN Boundary Mesh &amp; Neighborhood Voting
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Drag the dark query marker (X_query) anywhere to inspect its {k} nearest voters.
                </p>
              </div>
              <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                q = ({queryPt.x.toFixed(1)}, {queryPt.y.toFixed(1)})
              </span>
            </div>

            <div className="mt-3">
              <svg
                ref={knnSvgRef}
                viewBox="0 0 424 424"
                onPointerMove={handleKnnPointerMove}
                onPointerUp={() => setDraggingQuery(false)}
                onPointerLeave={() => setDraggingQuery(false)}
                className="w-full max-w-[520px] mx-auto h-auto touch-none select-none rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              >
                {/* Real-time 28x28 Decision Boundary Heatmap */}
                {knnGridCells.map((cell, idx) => {
                  const stepPx = 360 / 28;
                  return (
                    <rect
                      key={idx}
                      x={toX(cell.x)}
                      y={toY(cell.y + 10 / 28)}
                      width={stepPx + 0.5}
                      height={stepPx + 0.5}
                      fill={cell.pred === 0 ? '#0284C7' : '#DC2626'}
                      opacity={0.14}
                    />
                  );
                })}

                {/* Failed Linear Baseline Line if enabled */}
                {tryLinear && (
                  <line
                    x1={toX(0)}
                    y1={toY(3.8)}
                    x2={toX(10)}
                    y2={toY(6.0)}
                    stroke="#0F172A"
                    className="stroke-slate-900 dark:stroke-white"
                    strokeWidth="2.5"
                    strokeDasharray="7 5"
                  />
                )}

                {/* Expanding Search Circle encompassing K nearest neighbors */}
                <circle
                  cx={toX(queryPt.x)}
                  cy={toY(queryPt.y)}
                  r={scaleLen(knnEval.radius)}
                  fill={knnEval.prediction === 0 ? '#0284C7' : '#DC2626'}
                  fillOpacity={0.12}
                  stroke={knnEval.prediction === 0 ? '#0284C7' : '#DC2626'}
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  className="transition-all duration-150"
                />

                {/* Spokes connecting X_query to K nearest neighbors */}
                {knnEval.neighbors.map((n) => (
                  <line
                    key={`spoke-${n.id}`}
                    x1={toX(queryPt.x)}
                    y1={toY(queryPt.y)}
                    x2={toX(n.x)}
                    y2={toY(n.y)}
                    stroke={n.label === 0 ? '#0284C7' : '#DC2626'}
                    strokeWidth="1.5"
                    opacity={0.75}
                  />
                ))}

                {/* Holdout Test Points (Hollow Diamonds) */}
                {showTestSplit &&
                  test.map((p) => {
                    const cx = toX(p.x);
                    const cy = toY(p.y);
                    return (
                      <polygon
                        key={p.id}
                        points={`${cx},${cy - 6} ${cx + 6},${cy} ${cx},${
                          cy + 6
                        } ${cx - 6},${cy}`}
                        fill="#FFFFFF"
                        stroke={p.label === 0 ? '#0284C7' : '#DC2626'}
                        strokeWidth="2.2"
                      />
                    );
                  })}

                {/* Training Points */}
                {train.map((p) => {
                  const isNeighbor = knnEval.neighbors.some((n) => n.id === p.id);
                  return (
                    <circle
                      key={p.id}
                      cx={toX(p.x)}
                      cy={toY(p.y)}
                      r={isNeighbor ? 6.5 : 4.8}
                      fill={p.label === 0 ? '#0284C7' : '#DC2626'}
                      stroke={isNeighbor ? '#FBBF24' : '#ffffff'}
                      strokeWidth={isNeighbor ? 2.5 : 1.3}
                    />
                  );
                })}

                {/* Draggable Query Point X_query */}
                <g
                  className="cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    (e.target as Element).setPointerCapture(e.pointerId);
                    setDraggingQuery(true);
                  }}
                >
                  <circle
                    cx={toX(queryPt.x)}
                    cy={toY(queryPt.y)}
                    r={10}
                    className="fill-slate-900 dark:fill-white stroke-amber-400"
                    strokeWidth="2.5"
                  />
                  <text
                    x={toX(queryPt.x)}
                    y={toY(queryPt.y) + 3.5}
                    textAnchor="middle"
                    className="fill-white dark:fill-slate-900 text-[9px] font-mono font-bold pointer-events-none"
                  >
                    ?
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* Right: K Slider, Ballot Box & Train vs Test Overfitting Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Neighbors (k)
                  </span>
                  <span className="font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
                    k = {k} {k === 1 ? '(Jagged / Overfit)' : k >= 9 ? '(Smooth)' : '(Balanced)'}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  step={1}
                  value={k}
                  onChange={(e) => setK(parseInt(e.target.value, 10))}
                  className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>1 (High Variance)</span>
                  <span>7</span>
                  <span>15 (High Bias)</span>
                </div>
              </div>

              {/* Ballot Vote Counter */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Neighbor Ballot Box for X_query
                </div>
                <div className="mt-3 space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-mono tabular-nums mb-1">
                      <span className="text-sky-700 dark:text-sky-400 font-semibold">
                        Class A (Upper Moon)
                      </span>
                      <span>
                        {knnEval.votes0} / {k} votes
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-sky-600 transition-all duration-150"
                        style={{ width: `${(knnEval.votes0 / k) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-mono tabular-nums mb-1">
                      <span className="text-rose-700 dark:text-rose-400 font-semibold">
                        Class B (Lower Moon)
                      </span>
                      <span>
                        {knnEval.votes1} / {k} votes
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-rose-600 transition-all duration-150"
                        style={{ width: `${(knnEval.votes1 / k) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Train vs Test Generalization Scoreboard */}
              <div className="grid grid-cols-2 gap-3 font-mono tabular-nums">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                  <div className="font-sans text-[11px] text-slate-500 dark:text-slate-400">
                    Train Accuracy ({train.length})
                  </div>
                  <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                    {knnAcc.trainAcc.toFixed(1)}%
                  </div>
                </div>
                <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                  <div className="font-sans text-[11px] text-amber-800 dark:text-amber-300">
                    Test Accuracy ({test.length})
                  </div>
                  <div className="mt-1 text-xl font-bold text-amber-800 dark:text-amber-300">
                    {showTestSplit ? `${knnAcc.testAcc.toFixed(1)}%` : 'Hidden'}
                  </div>
                </div>
              </div>

              {isOverfittingKnn && showTestSplit && (
                <p className="text-xs leading-relaxed text-rose-700 dark:text-rose-300">
                  Notice the isolated colored &ldquo;islands&rdquo; around the
                  two noisy training points at k = 1! Training accuracy hits
                  100%, yet unseen test generalization suffers. Slide k up to 7–11
                  to smooth out noise.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== DECISION TREE MODULE ==================== */}
      {subAlgo === 'tree' && (
        <div className="space-y-4">
          {/* Depth Slider + Train/Test Readout Bar */}
          <div className="grid gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:grid-cols-12 items-center">
            <div className="md:col-span-6 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Tree Depth (max_depth)
                </span>
                <span className="font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
                  max_depth = {maxDepth} ({treeLeaves.length} leaf boxes)
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={4}
                step={1}
                value={maxDepth}
                onChange={(e) => {
                  setMaxDepth(parseInt(e.target.value, 10));
                  setSelectedNodeId('root');
                }}
                className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
              />
            </div>

            <div className="md:col-span-6 flex items-center justify-end gap-5 font-mono text-xs tabular-nums">
              <div>
                <span className="font-sans text-slate-500 dark:text-slate-400 mr-1.5">
                  Train Acc:
                </span>
                <strong className="text-base text-slate-900 dark:text-slate-100">
                  {treeAcc.trainAcc.toFixed(1)}%
                </strong>
              </div>
              <div>
                <span className="font-sans text-amber-800 dark:text-amber-300 mr-1.5">
                  Test Acc:
                </span>
                <strong className="text-base text-amber-800 dark:text-amber-300">
                  {showTestSplit ? `${treeAcc.testAcc.toFixed(1)}%` : 'Hidden'}
                </strong>
              </div>
              {isOverfittingTree && (
                <span className="text-[11px] font-sans font-semibold text-rose-600 dark:text-rose-400">
                  Deep splits chasing noise
                </span>
              )}
            </div>
          </div>

          {/* Synchronized Dual View: 2D Rectangular Plane (Left) + SVG Tree Graph (Right) */}
          <div className="grid gap-6 lg:grid-cols-12 items-stretch">
            {/* Left: 2D Orthogonal Rectangular Partitions */}
            <div className="lg:col-span-6 flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                  2D Orthogonal Space Slicing
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Every leaf box maps 1-to-1 with a leaf node on the right. Click any node to highlight its region.
                </p>
              </div>

              <div className="mt-3 flex-1">
                <svg
                  viewBox="0 0 424 424"
                  className="w-full max-w-[460px] mx-auto h-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                >
                  {/* Leaf Rectangular Partitions */}
                  {treeLeaves.map((leaf) => {
                    const rx = toX(leaf.bounds.xMin);
                    const ry = toY(leaf.bounds.yMax);
                    const rw = toX(leaf.bounds.xMax) - rx;
                    const rh = toY(leaf.bounds.yMin) - ry;
                    const isSelected = leaf.id === selectedNode.id;
                    return (
                      <rect
                        key={leaf.id}
                        x={rx}
                        y={ry}
                        width={rw}
                        height={rh}
                        fill={leaf.prediction === 0 ? '#0284C7' : '#DC2626'}
                        fillOpacity={isSelected ? 0.34 : 0.14}
                        stroke={isSelected ? '#D97706' : '#64748B'}
                        strokeWidth={isSelected ? 3 : 1}
                        className="cursor-pointer transition-all duration-150"
                        onClick={() => setSelectedNodeId(leaf.id)}
                      />
                    );
                  })}

                  {/* Highlight Selected Internal Node Bounding Box */}
                  {!selectedNode.isLeaf && (
                    <rect
                      x={toX(selectedNode.bounds.xMin)}
                      y={toY(selectedNode.bounds.yMax)}
                      width={
                        toX(selectedNode.bounds.xMax) -
                        toX(selectedNode.bounds.xMin)
                      }
                      height={
                        toY(selectedNode.bounds.yMin) -
                        toY(selectedNode.bounds.yMax)
                      }
                      fill="none"
                      stroke="#D97706"
                      strokeWidth="3"
                      strokeDasharray="6 3"
                    />
                  )}

                  {/* Failed Linear Line if enabled */}
                  {tryLinear && (
                    <line
                      x1={toX(0)}
                      y1={toY(3.8)}
                      x2={toX(10)}
                      y2={toY(6.0)}
                      stroke="#0F172A"
                      className="stroke-slate-900 dark:stroke-white"
                      strokeWidth="2.5"
                      strokeDasharray="7 5"
                    />
                  )}

                  {/* Holdout Test Diamonds */}
                  {showTestSplit &&
                    test.map((p) => {
                      const cx = toX(p.x);
                      const cy = toY(p.y);
                      return (
                        <polygon
                          key={p.id}
                          points={`${cx},${cy - 5.5} ${cx + 5.5},${cy} ${cx},${
                            cy + 5.5
                          } ${cx - 5.5},${cy}`}
                          fill="#FFFFFF"
                          stroke={p.label === 0 ? '#0284C7' : '#DC2626'}
                          strokeWidth="2"
                        />
                      );
                    })}

                  {/* Training Points */}
                  {train.map((p) => (
                    <circle
                      key={p.id}
                      cx={toX(p.x)}
                      cy={toY(p.y)}
                      r={4.5}
                      fill={p.label === 0 ? '#0284C7' : '#DC2626'}
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      className="pointer-events-none"
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* Right: Synchronized Interactive SVG Branching Tree */}
            <div className="lg:col-span-6 flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                  Interactive Decision Tree Graph (Click Any Node)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Internal nodes show orthogonal split rules; leaves show majority class predictions.
                </p>
              </div>

              <div className="mt-3 flex-1 flex items-center">
                <svg
                  viewBox="0 0 460 390"
                  className="w-full h-auto rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"
                >
                  {/* Edges */}
                  {treeLayout.map((item) => {
                    if (
                      item.parentX === undefined ||
                      item.parentY === undefined
                    )
                      return null;
                    return (
                      <g key={`edge-${item.node.id}`}>
                        <line
                          x1={item.parentX}
                          y1={item.parentY + 18}
                          x2={item.x}
                          y2={item.y - 18}
                          className="stroke-slate-300 dark:stroke-slate-700"
                          strokeWidth="1.75"
                        />
                        <text
                          x={(item.parentX + item.x) / 2}
                          y={(item.parentY + item.y) / 2}
                          textAnchor="middle"
                          className="fill-slate-500 dark:fill-slate-400 text-[9px] font-mono"
                        >
                          {item.edgeLabel}
                        </text>
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {treeLayout.map(({ node, x, y }) => {
                    const isSelected = node.id === selectedNode.id;
                    const boxW = node.depth >= 3 ? 52 : 76;
                    const fillColor = node.isLeaf
                      ? node.prediction === 0
                        ? '#E0F2FE'
                        : '#FFE4E6'
                      : '#FFFFFF';
                    const strokeColor = isSelected
                      ? '#D97706'
                      : node.isLeaf
                      ? node.prediction === 0
                        ? '#0284C7'
                        : '#DC2626'
                      : '#94A3B8';

                    return (
                      <g
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className="cursor-pointer"
                      >
                        <rect
                          x={x - boxW / 2}
                          y={y - 18}
                          width={boxW}
                          height={36}
                          rx={7}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth={isSelected ? 2.6 : 1.5}
                        />
                        {node.isLeaf ? (
                          <>
                            <text
                              x={x}
                              y={y - 3}
                              textAnchor="middle"
                              className="fill-slate-900 text-[9px] font-mono font-bold"
                            >
                              {node.prediction === 0 ? 'Class A' : 'Class B'}
                            </text>
                            <text
                              x={x}
                              y={y + 10}
                              textAnchor="middle"
                              className="fill-slate-600 text-[8px] font-mono"
                            >
                              {node.count0}/{node.count1}
                            </text>
                          </>
                        ) : (
                          <>
                            <text
                              x={x}
                              y={y - 3}
                              textAnchor="middle"
                              className="fill-slate-900 text-[9px] font-mono font-semibold"
                            >
                              {node.splitAxis?.toUpperCase()} ≤{' '}
                              {node.splitValue?.toFixed(1)}
                            </text>
                            <text
                              x={x}
                              y={y + 10}
                              textAnchor="middle"
                              className="fill-slate-500 text-[8px] font-mono"
                            >
                              H={node.entropy.toFixed(2)}
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
