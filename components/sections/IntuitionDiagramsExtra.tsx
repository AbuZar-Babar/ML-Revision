'use client';

import React from 'react';
import { motion } from 'motion/react';

/* Chapter 02: Supervised vs. Unsupervised vs. Reinforcement Learning Loop */
export function Stage2ParadigmsIdeaSvg() {
  return (
    <svg viewBox="0 0 420 185" className="w-full h-auto">
      {/* Column 1: Supervised */}
      <rect
        x={10}
        y={14}
        width={124}
        height={156}
        rx={10}
        className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800"
      />
      <text
        x={72}
        y={34}
        textAnchor="middle"
        className="fill-blue-700 dark:fill-blue-400 text-[9.5px] font-mono font-semibold"
      >
        Supervised
      </text>
      <text
        x={72}
        y={48}
        textAnchor="middle"
        className="fill-slate-500 text-[8px] font-mono"
      >
        (x → y labels)
      </text>
      <circle cx={42} cy={82} r={5} fill="#2563EB" />
      <circle cx={58} cy={74} r={5} fill="#2563EB" />
      <circle cx={96} cy={126} r={5} fill="#EA580C" />
      <circle cx={108} cy={112} r={5} fill="#EA580C" />
      <motion.line
        x1={26}
        y1={134}
        x2={118}
        y2={68}
        stroke="#1D4ED8"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7 }}
      />
      <text
        x={72}
        y={156}
        textAnchor="middle"
        className="fill-slate-500 text-[8px] font-sans"
      >
        Predicts known targets
      </text>

      {/* Column 2: Unsupervised */}
      <rect
        x={148}
        y={14}
        width={124}
        height={156}
        rx={10}
        className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800"
      />
      <text
        x={210}
        y={34}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-400 text-[9.5px] font-mono font-semibold"
      >
        Unsupervised
      </text>
      <text
        x={210}
        y={48}
        textAnchor="middle"
        className="fill-slate-500 text-[8px] font-mono"
      >
        (x only, no y)
      </text>
      <motion.circle
        cx={184}
        cy={90}
        r={20}
        fill="#10B981"
        fillOpacity="0.12"
        stroke="#059669"
        strokeDasharray="3 3"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      />
      <motion.circle
        cx={236}
        cy={116}
        r={20}
        fill="#0EA5E9"
        fillOpacity="0.12"
        stroke="#0284C7"
        strokeDasharray="3 3"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.25 }}
      />
      <circle cx={178} cy={86} r={3.5} className="fill-slate-600 dark:fill-slate-300" />
      <circle cx={190} cy={95} r={3.5} className="fill-slate-600 dark:fill-slate-300" />
      <circle cx={231} cy={112} r={3.5} className="fill-slate-600 dark:fill-slate-300" />
      <circle cx={242} cy={121} r={3.5} className="fill-slate-600 dark:fill-slate-300" />
      <text
        x={210}
        y={156}
        textAnchor="middle"
        className="fill-slate-500 text-[8px] font-sans"
      >
        Finds natural groups
      </text>

      {/* Column 3: Reinforcement Learning */}
      <rect
        x={286}
        y={14}
        width={124}
        height={156}
        rx={10}
        className="fill-white dark:fill-slate-900 stroke-blue-300 dark:stroke-blue-800"
      />
      <text
        x={348}
        y={34}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[9.5px] font-mono font-semibold"
      >
        Reinforcement
      </text>
      <text
        x={348}
        y={48}
        textAnchor="middle"
        className="fill-slate-500 text-[8px] font-mono"
      >
        (action → reward)
      </text>
      <rect
        x={314}
        y={60}
        width={68}
        height={24}
        rx={6}
        className="fill-blue-50 dark:fill-blue-950/60 stroke-blue-500"
      />
      <text
        x={348}
        y={75}
        textAnchor="middle"
        className="fill-blue-700 dark:fill-blue-300 text-[8.5px] font-mono font-semibold"
      >
        Agent
      </text>
      <rect
        x={306}
        y={114}
        width={84}
        height={24}
        rx={6}
        className="fill-amber-50 dark:fill-amber-950/40 stroke-amber-500"
      />
      <text
        x={348}
        y={129}
        textAnchor="middle"
        className="fill-amber-800 dark:fill-amber-300 text-[8.5px] font-mono font-semibold"
      >
        Environment
      </text>
      <motion.path
        d="M 378 74 C 398 84, 398 110, 388 122"
        fill="none"
        stroke="#2563EB"
        strokeWidth="1.8"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      />
      <motion.path
        d="M 310 122 C 296 108, 296 86, 314 74"
        fill="none"
        stroke="#059669"
        strokeWidth="1.8"
        strokeDasharray="3 2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, delay: 0.5 }}
      />
      <text
        x={348}
        y={156}
        textAnchor="middle"
        className="fill-slate-500 text-[8px] font-sans"
      >
        Maximizes +reward
      </text>
    </svg>
  );
}

/* Chapter 16: 3x3 Convolution Kernel Sliding to Feature Map */
export function Stage16CNNIdeaSvg() {
  return (
    <svg viewBox="0 0 420 185" className="w-full h-auto">
      <rect
        x={10}
        y={12}
        width={400}
        height={160}
        rx={10}
        className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800"
      />
      <text
        x={82}
        y={32}
        textAnchor="middle"
        className="fill-slate-500 text-[9px] font-mono font-semibold"
      >
        Input Pixels (5×5)
      </text>
      {/* 5x5 input grid */}
      {[0, 1, 2, 3, 4].map((r) =>
        [0, 1, 2, 3, 4].map((c) => {
          const bright = c === 2 || c === 3;
          return (
            <rect
              key={`${r}-${c}`}
              x={32 + c * 20}
              y={44 + r * 20}
              width={18}
              height={18}
              rx={3}
              className={
                bright
                  ? 'fill-blue-600/80 dark:fill-blue-500/80'
                  : 'fill-slate-100 dark:fill-slate-800'
              }
            />
          );
        })
      )}
      {/* Animated sliding 3x3 window */}
      <motion.rect
        y={42}
        width={62}
        height={62}
        rx={5}
        fill="none"
        stroke="#D97706"
        strokeWidth="2.5"
        initial={{ x: 30 }}
        animate={{ x: [30, 50, 70, 50] }}
        transition={{ duration: 2.2, ease: 'easeInOut' }}
      />

      {/* Kernel 3x3 */}
      <text
        x={210}
        y={32}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[9px] font-mono font-semibold"
      >
        3×3 Edge Kernel
      </text>
      <rect
        x={178}
        y={58}
        width={64}
        height={64}
        rx={8}
        className="fill-amber-50 dark:fill-amber-950/40 stroke-amber-400"
      />
      <text
        x={210}
        y={82}
        textAnchor="middle"
        className="fill-amber-900 dark:fill-amber-200 text-[9.5px] font-mono"
      >
        -1 0 +1
      </text>
      <text
        x={210}
        y={96}
        textAnchor="middle"
        className="fill-amber-900 dark:fill-amber-200 text-[9.5px] font-mono"
      >
        -1 0 +1
      </text>
      <text
        x={210}
        y={110}
        textAnchor="middle"
        className="fill-amber-900 dark:fill-amber-200 text-[9.5px] font-mono"
      >
        -1 0 +1
      </text>

      <text
        x={156}
        y={94}
        textAnchor="middle"
        className="fill-slate-400 text-sm font-mono"
      >
        ∗
      </text>
      <text
        x={264}
        y={94}
        textAnchor="middle"
        className="fill-slate-400 text-sm font-mono"
      >
        =
      </text>

      {/* Output Feature Map 3x3 */}
      <text
        x={334}
        y={32}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-400 text-[9px] font-mono font-semibold"
      >
        Feature Map
      </text>
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => {
          const hit = c === 1;
          return (
            <motion.rect
              key={`f-${r}-${c}`}
              x={294 + c * 26}
              y={54 + r * 26}
              width={23}
              height={23}
              rx={4}
              initial={{ opacity: 0.25 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 + c * 0.2 }}
              className={
                hit
                  ? 'fill-emerald-500 dark:fill-emerald-400'
                  : 'fill-slate-100 dark:fill-slate-800'
              }
            />
          );
        })
      )}
      <text
        x={210}
        y={162}
        textAnchor="middle"
        className="fill-slate-500 text-[8.5px] font-sans"
      >
        Same 9 weights scan every patch → detects edges anywhere in the image
      </text>
    </svg>
  );
}

/* Chapter 17: Transformer Self-Attention Arcs */
export function Stage17TransformerIdeaSvg() {
  const words = ['The', 'animal', 'crossed', 'street', 'because', 'it', 'tired'];
  const xs = [36, 92, 154, 214, 278, 332, 380];

  return (
    <svg viewBox="0 0 420 185" className="w-full h-auto">
      <rect
        x={10}
        y={12}
        width={400}
        height={160}
        rx={10}
        className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800"
      />
      <text
        x={210}
        y={32}
        textAnchor="middle"
        className="fill-blue-700 dark:fill-blue-400 text-[9.5px] font-mono font-semibold"
      >
        Self-Attention: Query &ldquo;it&rdquo; attends across the sentence
      </text>

      {/* Strong arc from "it" (332) to "animal" (92) */}
      <motion.path
        d="M 332 114 Q 212 30 92 114"
        fill="none"
        stroke="#1D4ED8"
        strokeWidth="3.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8 }}
      />
      <text
        x={212}
        y={62}
        textAnchor="middle"
        className="fill-blue-700 dark:fill-blue-400 text-[9px] font-mono font-bold"
      >
        0.54 (strong match)
      </text>

      {/* Medium arc from "it" (332) to "tired" (380) */}
      <motion.path
        d="M 332 114 Q 356 80 380 114"
        fill="none"
        stroke="#059669"
        strokeWidth="2.2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.25 }}
      />
      {/* Faint arc to street */}
      <motion.path
        d="M 332 114 Q 273 84 214 114"
        fill="none"
        stroke="#94A3B8"
        strokeWidth="1.2"
        strokeDasharray="3 3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      />

      {words.map((w, i) => {
        const isQuery = w === 'it';
        const isTarget = w === 'animal';
        return (
          <g key={w}>
            <rect
              x={xs[i] - 24}
              y={116}
              width={48}
              height={22}
              rx={5}
              className={
                isQuery
                  ? 'fill-blue-700 dark:fill-blue-500'
                  : isTarget
                  ? 'fill-blue-50 dark:fill-blue-950/60 stroke-blue-500'
                  : 'fill-slate-100 dark:fill-slate-800'
              }
            />
            <text
              x={xs[i]}
              y={130}
              textAnchor="middle"
              className={`text-[9px] font-mono font-semibold ${
                isQuery
                  ? 'fill-white dark:fill-slate-950'
                  : isTarget
                  ? 'fill-blue-800 dark:fill-blue-300'
                  : 'fill-slate-700 dark:fill-slate-300'
              }`}
            >
              {w}
            </text>
          </g>
        );
      })}

      <text
        x={210}
        y={160}
        textAnchor="middle"
        className="fill-slate-500 text-[8.5px] font-sans"
      >
        Weighted Q·K similarity links long-range context in a single parallel step
      </text>
    </svg>
  );
}
