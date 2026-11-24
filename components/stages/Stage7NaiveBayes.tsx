'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import LiveEquation, { EquationToken } from '@/components/common/LiveEquation';
import {
  NB_CORPUS_VOCAB,
  NB_PRIOR_HAM,
  NB_PRIOR_SPAM,
  NB_TOTAL_HAM_WORDS,
  NB_TOTAL_SPAM_WORDS,
  NB_VOCAB_SIZE,
  computeNaiveBayes,
} from '@/lib/ml-math';

export default function Stage7NaiveBayes() {
  const { registerProofHandler } = useApp();
  const [selectedWords, setSelectedWords] = useState<string[]>([
    'WINNER',
    'FREE',
  ]);
  const [laplaceSmoothing, setLaplaceSmoothing] = useState<boolean>(false);
  const [showNaiveDiagram, setShowNaiveDiagram] = useState<boolean>(false);
  const [highlightWord, setHighlightWord] = useState<string | null>(null);
  const proofTimers = useRef<number[]>([]);

  const clearTimers = () => {
    proofTimers.current.forEach((t) => window.clearTimeout(t));
    proofTimers.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const result = useMemo(
    () => computeNaiveBayes(selectedWords, laplaceSmoothing),
    [selectedWords, laplaceSmoothing]
  );

  // Visual Proof from Teacher Drawer: Compose spam -> inject unseen word CRYPTO -> show 0% collapse -> toggle Laplace (+1)
  useEffect(() => {
    return registerProofHandler(7, () => {
      clearTimers();
      setLaplaceSmoothing(false);
      setSelectedWords(['WINNER', 'FREE']);

      const t1 = window.setTimeout(() => {
        setSelectedWords(['WINNER', 'FREE', 'CRYPTO']);
      }, 1000);
      const t2 = window.setTimeout(() => {
        setLaplaceSmoothing(true);
      }, 2700);
      proofTimers.current.push(t1, t2);
    });
  }, [registerProofHandler]);

  const toggleWord = (word: string) => {
    setSelectedWords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  };

  const handleReset = () => {
    clearTimers();
    setSelectedWords(['WINNER', 'FREE']);
    setLaplaceSmoothing(false);
    setShowNaiveDiagram(false);
  };

  // Scale beam tilt angle in degrees: positive tilts right (Ham heavier), negative tilts left (Spam heavier)
  const bothZero =
    selectedWords.length > 0 && result.spamScore === 0 && result.hamScore === 0;
  const tiltAngle = bothZero
    ? 0
    : (result.probHam - result.probSpam) * 20; // -20deg (100% Spam) to +20deg (100% Ham)

  // Build live equation tokens
  const spamFormulaTokens: EquationToken[] = [
    { text: 'Score(Spam) = ' },
    {
      text: `P(Spam)=${NB_PRIOR_SPAM.toFixed(1)}`,
      highlightKey: 'prior',
      tone: 'neutral',
      tooltip: 'Prior probability of Spam in corpus (40%)',
    },
    ...result.breakdown.flatMap((item): EquationToken[] => [
      { text: ' × ' },
      {
        text: `${item.word}(${item.pGivenSpam.toFixed(3)})`,
        highlightKey: item.word,
        tone: item.isZeroSpam ? 'danger' : 'primary',
        tooltip: laplaceSmoothing
          ? `(${item.spamCount} + 1) / (${NB_TOTAL_SPAM_WORDS} + ${NB_VOCAB_SIZE})`
          : `${item.spamCount} / ${NB_TOTAL_SPAM_WORDS}`,
      },
    ]),
    { text: ' = ' },
    {
      text: result.spamScore.toExponential(2),
      highlightKey: 'total',
      tone: result.spamScore === 0 ? 'danger' : 'amber',
    },
  ];

  const verdict = bothZero
    ? 'UNDEFINED (0 / 0 Collapse)'
    : result.probSpam >= 0.5
    ? 'SPAM'
    : 'HAM (Legitimate)';

  return (
    <div className="space-y-5">
      {/* Live-Linked Bayes Formula */}
      <LiveEquation
        title="Live Naive Bayes Multiplication Chain (Hover any word term to inspect)"
        subtitle={
          laplaceSmoothing
            ? `Laplace Smoothing ON: α = +1 (Denominator = N + |V| = +${NB_VOCAB_SIZE})`
            : 'Unsmoothed Maximum Likelihood (α = 0)'
        }
        activeHighlight={highlightWord}
        onHighlightChange={setHighlightWord}
        tokens={spamFormulaTokens}
      />

      {/* Controls Bar: Laplace Smoothing Toggle + Explain Naive Assumption */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setLaplaceSmoothing((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              laplaceSmoothing
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Laplace Smoothing (+1): {laplaceSmoothing ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setShowNaiveDiagram((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
              showNaiveDiagram
                ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            {showNaiveDiagram ? 'Hide Naive Assumption' : 'Explain Naive Assumption'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Email
        </button>
      </div>

      {/* Collapsible Naive Independence Visual Diagram */}
      {showNaiveDiagram && (
        <div className="rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/30 p-5">
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div>
              <h4 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Why is it called &ldquo;Naive&rdquo;? (Conditional Independence)
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                Instead of learning joint probabilities for every possible word
                combination—which explodes combinatorially to 2<sup>|V|</sup>{' '}
                entries—Naive Bayes assumes each word is drawn{' '}
                <strong>independently</strong> given the class (Spam or Ham).
                This lets us simply multiply individual word likelihoods!
              </p>
            </div>
            <svg
              viewBox="0 0 360 118"
              className="w-full h-auto rounded-lg border border-sky-200 dark:border-sky-900 bg-white dark:bg-slate-900"
            >
              {/* Class Root Node */}
              <rect
                x={132}
                y={10}
                width={96}
                height={28}
                rx={6}
                fill="#0284C7"
              />
              <text
                x={180}
                y={28}
                textAnchor="middle"
                className="fill-white text-[10px] font-mono font-semibold"
              >
                Class (Spam/Ham)
              </text>

              {/* Independent Arrows to Words */}
              {[56, 180, 304].map((wx, i) => (
                <g key={i}>
                  <line
                    x1={180}
                    y1={38}
                    x2={wx}
                    y2={74}
                    stroke="#0284C7"
                    strokeWidth="1.75"
                  />
                  <rect
                    x={wx - 44}
                    y={74}
                    width={88}
                    height={26}
                    rx={6}
                    className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700"
                  />
                  <text
                    x={wx}
                    y={90}
                    textAnchor="middle"
                    className="fill-slate-800 dark:fill-slate-200 text-[9.5px] font-mono"
                  >
                    {selectedWords[i] ?? `Word ${i + 1}`}
                  </text>
                </g>
              ))}

              {/* Crossed-out direct word-to-word links */}
              <line
                x1={104}
                y1={87}
                x2={132}
                y2={87}
                stroke="#DC2626"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
              <text
                x={118}
                y={83}
                textAnchor="middle"
                className="fill-rose-600 text-[9px] font-bold"
              >
                ✕
              </text>
              <line
                x1={228}
                y1={87}
                x2={256}
                y2={87}
                stroke="#DC2626"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
              <text
                x={242}
                y={83}
                textAnchor="middle"
                className="fill-rose-600 text-[9px] font-bold"
              >
                ✕
              </text>
            </svg>
          </div>
        </div>
      )}

      {/* Main Two-Zone Workspace: Balance Scale (Left) + Email Composer & Likelihood Table (Right) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Zone (60%): Dynamic Two-Pan Balance Scale */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                Posterior Probability Balance Scale
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Heavier posterior tips the scale beam toward Spam or Ham.
              </p>
            </div>
            <span
              className={`font-mono text-xs font-bold ${
                bothZero
                  ? 'text-rose-600 dark:text-rose-400'
                  : result.probSpam >= 0.5
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              Verdict: {verdict}
            </span>
          </div>

          <div className="mt-4">
            <svg
              viewBox="0 0 520 270"
              className="w-full h-auto rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60"
            >
              {/* Fulcrum Stand */}
              <polygon
                points="260,115 232,238 288,238"
                className="fill-slate-300 dark:fill-slate-700"
              />
              <rect
                x={190}
                y={238}
                width={140}
                height={12}
                rx={4}
                className="fill-slate-400 dark:fill-slate-600"
              />

              {/* Rotating Balance Beam Group */}
              <g
                transform={`rotate(${tiltAngle} 260 115)`}
                className="transition-transform duration-500 ease-out"
              >
                {/* Beam Bar */}
                <line
                  x1={95}
                  y1={115}
                  x2={425}
                  y2={115}
                  className="stroke-slate-800 dark:stroke-slate-200"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <circle
                  cx={260}
                  cy={115}
                  r={8}
                  className="fill-slate-900 dark:fill-slate-100"
                />

                {/* Left Pan: SPAM */}
                <g transform={`translate(95, 115) rotate(${-tiltAngle})`}>
                  <line
                    x1={0}
                    y1={0}
                    x2={-36}
                    y2={64}
                    className="stroke-slate-400 dark:stroke-slate-500"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={0}
                    y1={0}
                    x2={36}
                    y2={64}
                    className="stroke-slate-400 dark:stroke-slate-500"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M -46 64 Q 0 84 46 64 Z"
                    fill="#DC2626"
                    opacity={bothZero ? 0.35 : 0.9}
                  />
                  <text
                    x={0}
                    y={54}
                    textAnchor="middle"
                    className="fill-rose-700 dark:fill-rose-400 text-xs font-mono font-bold"
                  >
                    SPAM
                  </text>
                  <text
                    x={0}
                    y={98}
                    textAnchor="middle"
                    className="fill-slate-900 dark:fill-slate-100 text-sm font-mono font-bold tabular-nums"
                  >
                    {(result.probSpam * 100).toFixed(1)}%
                  </text>
                </g>

                {/* Right Pan: HAM */}
                <g transform={`translate(425, 115) rotate(${-tiltAngle})`}>
                  <line
                    x1={0}
                    y1={0}
                    x2={-36}
                    y2={64}
                    className="stroke-slate-400 dark:stroke-slate-500"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={0}
                    y1={0}
                    x2={36}
                    y2={64}
                    className="stroke-slate-400 dark:stroke-slate-500"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M -46 64 Q 0 84 46 64 Z"
                    fill="#059669"
                    opacity={bothZero ? 0.35 : 0.9}
                  />
                  <text
                    x={0}
                    y={54}
                    textAnchor="middle"
                    className="fill-emerald-700 dark:fill-emerald-400 text-xs font-mono font-bold"
                  >
                    HAM
                  </text>
                  <text
                    x={0}
                    y={98}
                    textAnchor="middle"
                    className="fill-slate-900 dark:fill-slate-100 text-sm font-mono font-bold tabular-nums"
                  >
                    {(result.probHam * 100).toFixed(1)}%
                  </text>
                </g>
              </g>
            </svg>

            {/* Zero-Frequency Diagnostic Alert */}
            {result.zeroCollapse && !laplaceSmoothing && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-800 dark:text-rose-200">
                <div className="flex items-start gap-2 max-w-md">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <span>
                    <strong>Zero-Frequency Problem:</strong> At least one word
                    has 0 occurrences in the training corpus, multiplying the
                    entire chain by <code>0</code>! Enable{' '}
                    <strong>Laplace Smoothing (+1)</strong> to fix it.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLaplaceSmoothing(true)}
                  className="rounded-md bg-rose-700 px-3 py-1.5 font-medium text-white hover:bg-rose-800 transition-colors cursor-pointer shrink-0"
                >
                  Apply Laplace (+1)
                </button>
              </div>
            )}

            {laplaceSmoothing && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-2.5 text-xs text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  <strong>Laplace Smoothing Active:</strong> Every word receives
                  a +1 pseudo-count so unseen words like CRYPTO or INVOICE never
                  collapse valid spam/ham evidence to zero.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Zone (40%): Clickable Email Composer + Per-Word Likelihood Table */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                Compose Test Message (Click Words)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Toggle words below to add or remove them from the incoming email.
              </p>
            </div>

            {/* Active Email Preview Box */}
            <div className="min-h-[54px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 p-3 text-xs font-mono">
              <div className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mb-1.5">
                Incoming Email Tokens:
              </div>
              {selectedWords.length === 0 ? (
                <span className="text-slate-400">
                  (Empty message — falling back to Priors: 40% Spam / 60% Ham)
                </span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedWords.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => toggleWord(w)}
                      className={`rounded-md px-2 py-0.5 font-semibold transition-colors cursor-pointer ${
                        highlightWord === w
                          ? 'bg-amber-200 dark:bg-amber-800 text-slate-900 dark:text-white ring-2 ring-amber-500'
                          : 'bg-sky-100 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                      }`}
                      title="Click to remove word"
                    >
                      {w} ×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Word Selector Groups */}
            <div className="space-y-3">
              <div>
                <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 mb-1.5">
                  Spam-Leaning Words
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {NB_CORPUS_VOCAB.filter(
                    (w) => w.category === 'spam-leaning'
                  ).map((item) => {
                    const active = selectedWords.includes(item.word);
                    return (
                      <button
                        key={item.word}
                        type="button"
                        onClick={() => toggleWord(item.word)}
                        className={`rounded-md border px-2.5 py-1.5 font-mono text-xs font-medium transition-colors cursor-pointer ${
                          active
                            ? 'border-rose-600 bg-rose-600 text-white'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-rose-400'
                        }`}
                      >
                        {item.word}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5">
                  Ham-Leaning Words (Legitimate)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {NB_CORPUS_VOCAB.filter(
                    (w) => w.category === 'ham-leaning'
                  ).map((item) => {
                    const active = selectedWords.includes(item.word);
                    return (
                      <button
                        key={item.word}
                        type="button"
                        onClick={() => toggleWord(item.word)}
                        className={`rounded-md border px-2.5 py-1.5 font-mono text-xs font-medium transition-colors cursor-pointer ${
                          active
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        {item.word}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 mb-1.5">
                  Unseen Test Words (0 count in corpus — Test Laplace!)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {NB_CORPUS_VOCAB.filter((w) => w.category === 'unseen').map(
                    (item) => {
                      const active = selectedWords.includes(item.word);
                      return (
                        <button
                          key={item.word}
                          type="button"
                          onClick={() => toggleWord(item.word)}
                          className={`rounded-md border px-2.5 py-1.5 font-mono text-xs font-medium transition-colors cursor-pointer ${
                            active
                              ? 'border-amber-600 bg-amber-600 text-white'
                              : 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 hover:border-amber-500'
                          }`}
                        >
                          {item.word}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Compact Likelihood Table */}
            {result.breakdown.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs font-mono tabular-nums">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <th className="py-1.5 font-sans font-semibold">Word</th>
                      <th className="py-1.5 font-sans font-semibold">P(w | Spam)</th>
                      <th className="py-1.5 font-sans font-semibold">P(w | Ham)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((row) => (
                      <tr
                        key={row.word}
                        onMouseEnter={() => setHighlightWord(row.word)}
                        onMouseLeave={() => setHighlightWord(null)}
                        className={`border-b border-slate-100 dark:border-slate-800/70 ${
                          highlightWord === row.word
                            ? 'bg-sky-50 dark:bg-sky-950/40'
                            : ''
                        }`}
                      >
                        <td className="py-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          {row.word}
                        </td>
                        <td
                          className={`py-1.5 ${
                            row.isZeroSpam
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {row.pGivenSpam.toFixed(4)}
                        </td>
                        <td
                          className={`py-1.5 ${
                            row.isZeroHam
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {row.pGivenHam.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Priors: P(Spam) = {NB_PRIOR_SPAM} · P(Ham) = {NB_PRIOR_HAM}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
