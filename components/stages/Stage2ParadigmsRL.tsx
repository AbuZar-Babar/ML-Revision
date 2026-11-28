'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  FastForward,
  Flag,
  Flame,
  Play,
  RotateCcw,
  StepForward,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import InfoPopover from '@/components/common/InfoPopover';
import LiveEquation from '@/components/common/LiveEquation';
import {
  createInitialRLState,
  getBestActionForCell,
  GRIDWORLD_PRESETS,
  RLAction,
  RLState,
  stepGridworld,
  trainGridworldEpisodes,
} from '@/lib/ml-modern-math';

type ParadigmTab = 'supervised' | 'unsupervised' | 'reinforcement';

const ACTION_ARROWS: Record<RLAction, string> = {
  0: '↑',
  1: '→',
  2: '↓',
  3: '←',
};

const SUPERVISED_POINTS = [
  { x: 1.5, y: 24, cls: 0 },
  { x: 2.3, y: 31, cls: 0 },
  { x: 3.1, y: 39, cls: 0 },
  { x: 5.4, y: 66, cls: 1 },
  { x: 6.5, y: 74, cls: 1 },
  { x: 7.8, y: 86, cls: 1 },
];

export default function Stage2ParadigmsRL() {
  const { registerProofHandler } = useApp();

  const [paradigm, setParadigm] = useState<ParadigmTab>('reinforcement');
  const [presetIdx, setPresetIdx] = useState<number>(0);
  const [alpha, setAlpha] = useState<number>(0.3);
  const [gamma, setGamma] = useState<number>(0.9);
  const [epsilon, setEpsilon] = useState<number>(0.25);
  const [rlState, setRlState] = useState<RLState>(() =>
    createInitialRLState(GRIDWORLD_PRESETS[0])
  );
  const [isAuto, setIsAuto] = useState<boolean>(false);

  // Interactive test inputs for Supervised & Unsupervised comparison tabs
  const [queryHours, setQueryHours] = useState<number>(4.8);
  const [clusterCount, setClusterCount] = useState<2 | 3>(2);

  const tickRef = useRef(1);
  const timerRef = useRef<number | null>(null);
  const rlRef = useRef(rlState);

  useEffect(() => {
    rlRef.current = rlState;
  }, [rlState]);

  const config = GRIDWORLD_PRESETS[presetIdx];

  const stopAuto = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsAuto(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const handleSelectPreset = (idx: number) => {
    stopAuto();
    setPresetIdx(idx);
    setParadigm('reinforcement');
    setRlState(createInitialRLState(GRIDWORLD_PRESETS[idx]));
  };

  const handleReset = () => {
    stopAuto();
    setRlState(createInitialRLState(config));
  };

  const handleStep = () => {
    stopAuto();
    tickRef.current += 1;
    setRlState((prev) =>
      stepGridworld(prev, config, alpha, gamma, epsilon, tickRef.current)
    );
  };

  const handleTrain20 = () => {
    stopAuto();
    setRlState((prev) =>
      trainGridworldEpisodes(prev, config, 20, alpha, gamma, epsilon)
    );
  };

  const handleToggleAuto = () => {
    if (isAuto) {
      stopAuto();
      return;
    }
    setIsAuto(true);
    timerRef.current = window.setInterval(() => {
      tickRef.current += 1;
      setRlState((prev) =>
        stepGridworld(prev, config, alpha, gamma, epsilon, tickRef.current)
      );
    }, 170);
  };

  useEffect(() => {
    const runProof = () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsAuto(false);
      setParadigm('reinforcement');
      setPresetIdx(0);
      const fresh = createInitialRLState(GRIDWORLD_PRESETS[0]);
      setRlState(fresh);
      window.setTimeout(() => {
        setRlState(
          trainGridworldEpisodes(fresh, GRIDWORLD_PRESETS[0], 25, 0.3, 0.9, 0.25)
        );
      }, 450);
    };
    const unregister = registerProofHandler(2, runProof);
    return () => unregister();
  }, [registerProofHandler]);

  const predictedMark = Math.min(99, Math.max(10, 9.6 * queryHours + 10.5));
  const predictedPass = queryHours >= 4.2;

  return (
    <div className="space-y-5">
      {/* Top Bar: 3 Paradigm Switcher + Built-In Visual Example Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'supervised', label: '1. Supervised (x → y)' },
              { id: 'unsupervised', label: '2. Unsupervised (x only)' },
              { id: 'reinforcement', label: '3. Reinforcement (Gridworld)' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                stopAuto();
                setParadigm(tab.id);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                paradigm === tab.id
                  ? 'bg-blue-700 dark:bg-blue-500 text-white dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {paradigm === 'reinforcement' && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1">Example:</span>
            {GRIDWORLD_PRESETS.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(idx)}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  presetIdx === idx
                    ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main 65/35 Sandbox Split */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left 8 Cols: Interactive Canvas */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
          {paradigm === 'reinforcement' && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                    4×4 Q-Learning Gridworld
                  </h2>
                  <InfoPopover
                    title="How the RL Agent Learns"
                    content="The agent starts with zero knowledge (all Q = 0). Each move earns −0.2 step cost, +10 at the Goal flag, or −10 at a Hazard flame. Watch green policy arrows form as Q-values propagate backward from the Goal."
                    align="left"
                  />
                </div>
                <div className="flex items-center gap-3 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300">
                  <span>Episodes: {rlState.episodes}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    Goals: {rlState.totalWins}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-rose-700 dark:text-rose-400">
                    Hazards: {rlState.totalHazardHits}
                  </span>
                </div>
              </div>

              {/* 4x4 Interactive Grid */}
              <div className="mx-auto max-w-[440px] grid grid-cols-4 gap-2.5">
                {Array.from({ length: 16 }, (_, cell) => {
                  const isWall = config.walls.includes(cell);
                  const isGoal = cell === config.goal;
                  const isHazard = config.hazards.includes(cell);
                  const isAgent = cell === rlState.agentCell;
                  const isStart = cell === config.start;
                  const bestAction = getBestActionForCell(rlState.qTable[cell]);
                  const maxQ = Math.max(...rlState.qTable[cell]);
                  const intensity = Math.max(0, Math.min(1, maxQ / 10));

                  return (
                    <div
                      key={cell}
                      className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center p-2 transition-colors ${
                        isWall
                          ? 'border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800'
                          : isGoal
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50'
                          : isHazard
                          ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/50'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60'
                      }`}
                      style={
                        !isWall && !isGoal && !isHazard && intensity > 0.02
                          ? {
                              backgroundColor: `rgba(37, 99, 235, ${
                                0.06 + intensity * 0.22
                              })`,
                            }
                          : undefined
                      }
                    >
                      <span className="absolute top-1.5 left-2 font-mono text-[10px] text-slate-400">
                        s{cell}
                      </span>

                      {isWall && (
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          Wall
                        </span>
                      )}

                      {isGoal && (
                        <div className="flex flex-col items-center text-emerald-700 dark:text-emerald-400">
                          <Flag className="h-5 w-5" />
                          <span className="font-mono text-[11px] font-bold mt-0.5">
                            +10
                          </span>
                        </div>
                      )}

                      {isHazard && (
                        <div className="flex flex-col items-center text-rose-700 dark:text-rose-400">
                          <Flame className="h-5 w-5" />
                          <span className="font-mono text-[11px] font-bold mt-0.5">
                            −10
                          </span>
                        </div>
                      )}

                      {!isWall && !isGoal && !isHazard && (
                        <>
                          <span className="font-mono text-xl font-bold text-blue-700 dark:text-blue-300 leading-none">
                            {bestAction !== null ? ACTION_ARROWS[bestAction] : '·'}
                          </span>
                          <span className="mt-1 font-mono text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                            {maxQ !== 0 ? maxQ.toFixed(1) : '0.0'}
                          </span>
                        </>
                      )}

                      {isStart && !isAgent && (
                        <span className="absolute bottom-1 text-[9px] font-mono text-slate-400">
                          Start
                        </span>
                      )}

                      {isAgent && (
                        <motion.div
                          layoutId="rl-agent-token"
                          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                          className="absolute inset-2 rounded-lg border-2 border-blue-700 dark:border-blue-400 bg-blue-600/15 pointer-events-none flex items-end justify-end p-1"
                        >
                          <span className="h-3 w-3 rounded-full bg-blue-700 dark:bg-blue-400" />
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>Blue Ring = Agent</span>
                <span aria-hidden="true">·</span>
                <span>Arrows = Learned Best Policy</span>
                <span aria-hidden="true">·</span>
                <span>Cell Number = max Q(s, a)</span>
              </div>
            </>
          )}

          {paradigm === 'supervised' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                    Supervised Learning: Labeled Training Data (x → y)
                  </h2>
                  <InfoPopover
                    title="Supervised Feedback"
                    content="Every training dot comes with a known answer key y (exam mark or Pass/Fail). Drag the Query Student slider to predict an unseen student's score and pass status."
                    align="left"
                  />
                </div>
                <span className="font-mono text-xs tabular-nums text-blue-700 dark:text-blue-400 font-semibold">
                  ŷ = {predictedMark.toFixed(1)}% · {predictedPass ? 'Pass' : 'Fail'}
                </span>
              </div>

              <svg
                viewBox="0 0 520 260"
                className="w-full h-auto rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"
              >
                {/* Axes */}
                <line x1={52} y1={220} x2={490} y2={220} className="stroke-slate-300 dark:stroke-slate-700" />
                <line x1={52} y1={24} x2={52} y2={220} className="stroke-slate-300 dark:stroke-slate-700" />
                <text x={270} y={248} textAnchor="middle" className="fill-slate-500 text-[11px] font-mono">
                  Study Hours (Input Feature x)
                </text>
                <text x={18} y={125} textAnchor="middle" transform="rotate(-90 18 125)" className="fill-slate-500 text-[11px] font-mono">
                  Exam Score (Label y)
                </text>

                {/* Learned regression line */}
                <line
                  x1={70}
                  y1={202}
                  x2={470}
                  y2={36}
                  stroke="#1D4ED8"
                  strokeWidth="2.5"
                />

                {/* Labeled points */}
                {SUPERVISED_POINTS.map((pt, idx) => {
                  const cx = 52 + (pt.x / 9) * 430;
                  const cy = 220 - (pt.y / 100) * 190;
                  return (
                    <g key={idx}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={7}
                        fill={pt.cls === 1 ? '#1D4ED8' : '#EA580C'}
                      />
                      <text
                        x={cx}
                        y={cy - 11}
                        textAnchor="middle"
                        className="fill-slate-500 text-[10px] font-mono"
                      >
                        y={pt.y}
                      </text>
                    </g>
                  );
                })}

                {/* Live Query Marker */}
                {(() => {
                  const qx = 52 + (queryHours / 9) * 430;
                  const qy = 220 - (predictedMark / 100) * 190;
                  return (
                    <g>
                      <line
                        x1={qx}
                        y1={220}
                        x2={qx}
                        y2={qy}
                        stroke="#059669"
                        strokeDasharray="4 3"
                        strokeWidth="1.5"
                      />
                      <circle cx={qx} cy={qy} r={8.5} fill="#059669" stroke="#ffffff" strokeWidth="2.5" />
                      <text
                        x={qx}
                        y={qy - 14}
                        textAnchor="middle"
                        className="fill-emerald-700 dark:fill-emerald-400 text-[11px] font-mono font-bold"
                      >
                        ŷ={predictedMark.toFixed(0)}
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>
          )}

          {paradigm === 'unsupervised' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                    Unsupervised Learning: Unlabeled Pattern Discovery (x only)
                  </h2>
                  <InfoPopover
                    title="No Answer Key"
                    content="Notice there are no target labels y. Toggle K = 2 or K = 3 to watch the model group identical unlabeled dots purely by geometric proximity."
                    align="left"
                  />
                </div>
                <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  K = {clusterCount} Clusters Discovered
                </span>
              </div>

              <svg
                viewBox="0 0 520 260"
                className="w-full h-auto rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"
              >
                {/* Cluster Hulls */}
                <circle
                  cx={145}
                  cy={175}
                  r={58}
                  fill="#2563EB"
                  fillOpacity="0.10"
                  stroke="#2563EB"
                  strokeDasharray="5 4"
                />
                {clusterCount === 2 ? (
                  <ellipse
                    cx={355}
                    cy={102}
                    rx={105}
                    ry={62}
                    fill="#059669"
                    fillOpacity="0.10"
                    stroke="#059669"
                    strokeDasharray="5 4"
                  />
                ) : (
                  <>
                    <circle
                      cx={295}
                      cy={125}
                      r={48}
                      fill="#059669"
                      fillOpacity="0.10"
                      stroke="#059669"
                      strokeDasharray="5 4"
                    />
                    <circle
                      cx={415}
                      cy={78}
                      r={48}
                      fill="#D97706"
                      fillOpacity="0.10"
                      stroke="#D97706"
                      strokeDasharray="5 4"
                    />
                  </>
                )}

                {[
                  { x: 122, y: 185, g2: 0, g3: 0 },
                  { x: 146, y: 162, g2: 0, g3: 0 },
                  { x: 168, y: 188, g2: 0, g3: 0 },
                  { x: 278, y: 132, g2: 1, g3: 1 },
                  { x: 306, y: 118, g2: 1, g3: 1 },
                  { x: 312, y: 140, g2: 1, g3: 1 },
                  { x: 398, y: 82, g2: 1, g3: 2 },
                  { x: 424, y: 66, g2: 1, g3: 2 },
                  { x: 432, y: 92, g2: 1, g3: 2 },
                ].map((pt, idx) => {
                  const g = clusterCount === 2 ? pt.g2 : pt.g3;
                  const color =
                    g === 0 ? '#2563EB' : g === 1 ? '#059669' : '#D97706';
                  return (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r={6.5}
                      fill={color}
                    />
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Clean Control Deck */}
        <div className="lg:col-span-4 space-y-4">
          {paradigm === 'reinforcement' ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleStep}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <StepForward className="h-3.5 w-3.5" />
                  1 Step
                </button>
                <button
                  type="button"
                  onClick={handleToggleAuto}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    isAuto
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'bg-blue-700 dark:bg-blue-500 text-white dark:text-slate-950 hover:bg-blue-800'
                  }`}
                >
                  <Play className="h-3.5 w-3.5" />
                  {isAuto ? 'Pause' : 'Play Live'}
                </button>
                <button
                  type="button"
                  onClick={handleTrain20}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 dark:bg-emerald-500 px-3 py-2 text-xs font-semibold text-white dark:text-slate-950 hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  <FastForward className="h-3.5 w-3.5" />
                  +20 Episodes
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Q
                </button>
              </div>

              {/* Clean Sliders with (?) Popovers */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      Exploration (ε)
                      <InfoPopover
                        title="Exploration Rate (ε)"
                        content="Probability of taking a random move instead of the best known arrow. Higher ε discovers shortcuts; lower ε exploits what is already learned."
                        align="right"
                      />
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-blue-700 dark:text-blue-400">
                      {(epsilon * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.8}
                    step={0.05}
                    value={epsilon}
                    onChange={(e) => setEpsilon(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      Discount Factor (γ)
                      <InfoPopover
                        title="Future Discount (γ)"
                        content="Controls how far ahead the agent plans. γ near 0 cares only about immediate step rewards; γ = 0.9 propagates the +10 Goal back across the entire maze."
                        align="right"
                      />
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-blue-700 dark:text-blue-400">
                      {gamma.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={0.98}
                    step={0.02}
                    value={gamma}
                    onChange={(e) => setGamma(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      Learning Rate (α)
                      <InfoPopover
                        title="Q-Update Rate (α)"
                        content="How aggressively new reward feedback overwrites old Q(s, a) estimates."
                        align="right"
                      />
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-blue-700 dark:text-blue-400">
                      {alpha.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={0.8}
                    step={0.05}
                    value={alpha}
                    onChange={(e) => setAlpha(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          ) : paradigm === 'supervised' ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Test Student Study Hours (x)
                  </span>
                  <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {queryHours.toFixed(1)} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8.5}
                  step={0.1}
                  value={queryHours}
                  onChange={(e) => setQueryHours(Number(e.target.value))}
                />
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3.5 text-xs space-y-1 border border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Input → Model → Prediction
                </div>
                <div className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                  x = {queryHours.toFixed(1)} → ŷ = {predictedMark.toFixed(1)}% ({predictedPass ? 'Pass' : 'Fail'})
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Choose Number of Unlabeled Groups (K)
              </div>
              <div className="grid grid-cols-2 gap-2">
                {([2, 3] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setClusterCount(k)}
                    className={`rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      clusterCount === k
                        ? 'bg-blue-700 dark:bg-blue-500 text-white dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    K = {k} Clusters
                  </button>
                ))}
              </div>
            </div>
          )}

          <LiveEquation
            label={
              paradigm === 'reinforcement'
                ? 'Last Bellman Q-Update'
                : paradigm === 'supervised'
                ? 'Supervised Mapping'
                : 'Unsupervised Objective'
            }
            formula={
              paradigm === 'reinforcement'
                ? `r = ${rlState.lastReward >= 0 ? '+' : ''}${rlState.lastReward.toFixed(1)}  |  ΔQ = ${rlState.lastDeltaQ >= 0 ? '+' : ''}${rlState.lastDeltaQ.toFixed(2)}`
                : paradigm === 'supervised'
                ? `ŷ = 9.6 · (${queryHours.toFixed(1)}) + 10.5 = ${predictedMark.toFixed(1)}`
                : `Group unlabeled x into K = ${clusterCount} proximity clusters`
            }
          />
        </div>
      </div>
    </div>
  );
}
