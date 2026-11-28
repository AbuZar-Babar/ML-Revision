'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, Sliders, StepForward } from 'lucide-react';
import {
  BackpropState,
  evaluateBackpropGraph,
  stepBackpropGraph,
} from '@/lib/ml-advanced-math';
import { useApp } from '@/context/AppContext';
import LiveEquation from '@/components/common/LiveEquation';

const INITIAL_BP_STATE: BackpropState = {
  w1: 0.45,
  b1: 0.1,
  w2: 0.65,
  b2: 0.05,
  epoch: 0,
};

export default function Stage14Backprop() {
  const { registerProofHandler } = useApp();
  const [bpState, setBpState] = useState<BackpropState>(INITIAL_BP_STATE);
  const [activation, setActivation] = useState<'relu' | 'sigmoid'>('relu');
  const [lr, setLr] = useState<number>(0.12);
  const [phase, setPhase] = useState<'forward' | 'backward'>('forward');
  const [lossHistory, setLossHistory] = useState<number[]>(() => [
    evaluateBackpropGraph(INITIAL_BP_STATE, 2.0, 1.5, 'relu').loss,
  ]);
  const [isAutoTraining, setIsAutoTraining] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const stateRef = useRef<BackpropState>(bpState);

  useEffect(() => {
    stateRef.current = bpState;
  }, [bpState]);

  const xInput = 2.0;
  const targetY = 1.5;

  const snap = useMemo(
    () => evaluateBackpropGraph(bpState, xInput, targetY, activation),
    [bpState, activation]
  );

  // Compare 8-layer deep chain derivative attenuation: Sigmoid vs ReLU
  const deepSignalRetention =
    activation === 'relu'
      ? Math.pow(snap.dh_dz1, 8) * 100
      : Math.pow(Math.min(0.25, snap.dh_dz1), 8) * 100;

  const stopAuto = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsAutoTraining(false);
  };

  useEffect(() => {
    return () => stopAuto();
  }, []);

  const handleOneStep = () => {
    stopAuto();
    setPhase('backward');
    const next = stepBackpropGraph(
      stateRef.current,
      xInput,
      targetY,
      lr,
      activation
    );
    const nextSnap = evaluateBackpropGraph(next, xInput, targetY, activation);
    setBpState(next);
    setLossHistory((prev) => [...prev.slice(-24), nextSnap.loss]);
  };

  const handleReset = (nextAct?: 'relu' | 'sigmoid') => {
    stopAuto();
    const act = nextAct ?? activation;
    if (nextAct) setActivation(nextAct);
    setBpState(INITIAL_BP_STATE);
    setPhase('forward');
    setLossHistory([
      evaluateBackpropGraph(INITIAL_BP_STATE, xInput, targetY, act).loss,
    ]);
  };

  const handleAutoTrain = () => {
    stopAuto();
    setIsAutoTraining(true);
    let steps = 0;
    timerRef.current = window.setInterval(() => {
      steps++;
      setPhase(steps % 2 === 1 ? 'backward' : 'forward');
      const next = stepBackpropGraph(
        stateRef.current,
        xInput,
        targetY,
        lr,
        activation
      );
      const nextSnap = evaluateBackpropGraph(next, xInput, targetY, activation);
      setBpState(next);
      setLossHistory((prev) => [...prev.slice(-24), nextSnap.loss]);
      if (steps >= 16 || nextSnap.loss < 0.0005) {
        stopAuto();
      }
    }, 240);
  };

  useEffect(() => {
    const runProof = () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsAutoTraining(false);
      setActivation('relu');
      setBpState(INITIAL_BP_STATE);
      stateRef.current = INITIAL_BP_STATE;
      setPhase('forward');
      setLossHistory([
        evaluateBackpropGraph(INITIAL_BP_STATE, xInput, targetY, 'relu').loss,
      ]);

      window.setTimeout(() => {
        setPhase('backward');
        let steps = 0;
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsAutoTraining(true);
        timerRef.current = window.setInterval(() => {
          steps++;
          const next = stepBackpropGraph(
            stateRef.current,
            xInput,
            targetY,
            0.14,
            'relu'
          );
          const nextSnap = evaluateBackpropGraph(next, xInput, targetY, 'relu');
          setBpState(next);
          setLossHistory((prev) => [...prev.slice(-24), nextSnap.loss]);
          if (steps >= 14 || nextSnap.loss < 0.0005) {
            if (timerRef.current) {
              window.clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setIsAutoTraining(false);
          }
        }, 220);
      }, 650);
    };
    const unregister = registerProofHandler(15, runProof);
    return () => {
      unregister();
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [registerProofHandler]);

  // Mini Loss Curve SVG points
  const maxLoss = Math.max(...lossHistory, 0.5);
  const lossPolyline = lossHistory
    .map((l, idx) => {
      const px = 20 + (idx / Math.max(1, lossHistory.length - 1)) * 460;
      const py = 86 - (l / maxLoss) * 66;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left 65%: Live Computational Graph + Loss History Curve */}
        <div className="lg:col-span-8 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                  Interactive Computational Graph (Forward → &amp; ← Backprop)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Blue top labels show Forward activations · Rose bottom labels show Backward Chain-Rule gradients
                </p>
              </div>
              <span className="font-mono text-xs font-semibold tabular-nums text-blue-700 dark:text-blue-400">
                Epoch {bpState.epoch} · Loss = {snap.loss.toFixed(4)}
              </span>
            </div>

            <svg
              viewBox="0 0 560 250"
              className="w-full h-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              role="img"
              aria-label="Interactive backpropagation computational graph with live forward values and backward chain-rule gradients"
            >
              {/* Forward Edges (top arcs) */}
              {[
                { x1: 86, x2: 190, wLabel: `w₁=${bpState.w1.toFixed(2)}`, gradLabel: `∂L/∂w₁=${snap.dL_dw1.toFixed(3)}` },
                { x1: 246, x2: 344, wLabel: activation.toUpperCase(), gradLabel: `φ′=${snap.dh_dz1.toFixed(2)}` },
                { x1: 400, x2: 478, wLabel: `w₂=${bpState.w2.toFixed(2)}`, gradLabel: `∂L/∂w₂=${snap.dL_dw2.toFixed(3)}` },
              ].map((edge, i) => {
                const mx = (edge.x1 + edge.x2) / 2;
                return (
                  <g key={i}>
                    {/* Forward line */}
                    <line
                      x1={edge.x1}
                      y1={108}
                      x2={edge.x2}
                      y2={108}
                      stroke={phase === 'forward' ? '#1d4ed8' : '#64748b'}
                      strokeWidth={phase === 'forward' ? 3 : 2}
                    />
                    <text
                      x={mx}
                      y={96}
                      textAnchor="middle"
                      className="fill-blue-700 dark:fill-blue-400 text-[10px] font-mono font-semibold"
                    >
                      {edge.wLabel}
                    </text>

                    {/* Backward gradient flow */}
                    <line
                      x1={edge.x2}
                      y1={142}
                      x2={edge.x1}
                      y2={142}
                      stroke={phase === 'backward' ? '#dc2626' : '#f43f5e'}
                      strokeOpacity={phase === 'backward' ? 0.95 : 0.45}
                      strokeWidth={phase === 'backward' ? 2.6 : 1.6}
                      strokeDasharray="5 3"
                    />
                    <text
                      x={mx}
                      y={162}
                      textAnchor="middle"
                      className="fill-rose-600 dark:fill-rose-400 text-[10px] font-mono font-semibold"
                    >
                      {edge.gradLabel}
                    </text>
                  </g>
                );
              })}

              {/* Graph Nodes */}
              {[
                { cx: 58, title: 'Input x', val: xInput.toFixed(1), sub: 'Fixed', fill: '#1e293b' },
                { cx: 218, title: 'Pre-Act z₁', val: snap.z1.toFixed(2), sub: `b₁=${bpState.b1.toFixed(2)}`, fill: '#1d4ed8' },
                { cx: 372, title: 'Hidden h', val: snap.h.toFixed(2), sub: `∂L/∂h=${snap.dL_dh.toFixed(2)}`, fill: '#2563eb' },
                { cx: 506, title: 'Output ŷ', val: snap.yHat.toFixed(2), sub: `Target ${targetY.toFixed(1)}`, fill: '#059669' },
              ].map((node) => (
                <g key={node.title}>
                  <circle
                    cx={node.cx}
                    cy={125}
                    r={28}
                    fill={node.fill}
                    className="stroke-white dark:stroke-slate-950"
                    strokeWidth={2.5}
                  />
                  <text
                    x={node.cx}
                    y={129}
                    textAnchor="middle"
                    className="fill-white text-[12px] font-mono font-bold tabular-nums"
                  >
                    {node.val}
                  </text>
                  <text
                    x={node.cx}
                    y={56}
                    textAnchor="middle"
                    className="fill-slate-800 dark:fill-slate-200 text-[11px] font-semibold"
                  >
                    {node.title}
                  </text>
                  <text
                    x={node.cx}
                    y={202}
                    textAnchor="middle"
                    className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono"
                  >
                    {node.sub}
                  </text>
                </g>
              ))}

              <text x={280} y={236} textAnchor="middle" className="fill-slate-500 text-[10px] font-mono">
                Error ∂L/∂ŷ = (ŷ − y) = {snap.dL_dyHat.toFixed(3)} · Loss L = ½(ŷ − y)² = {snap.loss.toFixed(4)}
              </text>
            </svg>
          </div>

          {/* Loss Curve + Vanishing Gradient Diagnostic */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Training Loss Descent
                </span>
                <span className="font-mono text-slate-500 tabular-nums">
                  {lossHistory.length - 1} updates
                </span>
              </div>
              <svg viewBox="0 0 500 100" className="w-full h-24 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                {lossHistory.length > 1 ? (
                  <polyline
                    points={lossPolyline}
                    fill="none"
                    stroke="#1d4ed8"
                    strokeWidth={3}
                    strokeLinejoin="round"
                  />
                ) : (
                  <circle cx={20} cy={20} r={5} fill="#1d4ed8" />
                )}
              </svg>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between space-y-2">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                8-Layer Deep Gradient Retention
              </div>
              <div className="font-mono text-2xl font-bold tabular-nums text-blue-700 dark:text-blue-400">
                {deepSignalRetention < 0.01
                  ? `${deepSignalRetention.toExponential(1)}%`
                  : `${deepSignalRetention.toFixed(1)}%`}
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {activation === 'sigmoid'
                  ? 'Sigmoid derivative ≤ 0.25 shrinks exponentially across 8 layers (Vanishing Gradient!).'
                  : 'Positive ReLU keeps φ′(z) = 1.0, allowing gradients to travel cleanly through deep layers.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right 35%: Controls */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Sliders className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                <span>Backprop Controls</span>
              </div>
              <button
                type="button"
                onClick={() => handleReset()}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Hidden Activation
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => handleReset('relu')}
                  className={`rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    activation === 'relu'
                      ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  ReLU (Healthy)
                </button>
                <button
                  type="button"
                  onClick={() => handleReset('sigmoid')}
                  className={`rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    activation === 'sigmoid'
                      ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Sigmoid (Vanishing)
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <label htmlFor="bp-lr" className="font-medium text-slate-700 dark:text-slate-300">
                  Learning Rate (α)
                </label>
                <span className="font-mono text-sm font-bold tabular-nums text-blue-700 dark:text-blue-400">
                  {lr.toFixed(2)}
                </span>
              </div>
              <input
                id="bp-lr"
                type="range"
                min={0.02}
                max={0.3}
                step={0.02}
                value={lr}
                onChange={(e) => setLr(Number(e.target.value))}
                className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleOneStep}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <StepForward className="h-3.5 w-3.5" />
                1 Backprop Step
              </button>
              <button
                type="button"
                onClick={isAutoTraining ? stopAuto : handleAutoTrain}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-700 dark:bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-800 dark:hover:bg-blue-500 transition-colors cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {isAutoTraining ? 'Stop' : 'Auto-Train'}
              </button>
            </div>
          </div>

          <LiveEquation
            label="Live Chain Rule to Layer 1"
            formula={`∂L/∂w₁ = (${snap.dL_dyHat.toFixed(2)})·(${bpState.w2.toFixed(2)})·(${snap.dh_dz1.toFixed(2)})·(${xInput.toFixed(1)}) = ${snap.dL_dw1.toFixed(3)}`}
            footnote="Switch between ReLU and Sigmoid and click Auto-Train to watch how much faster ReLU drives Loss to 0.000."
          />
        </div>
      </div>
    </div>
  );
}
