'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';

interface IntuitionDiagramProps {
  stageId: number;
}

export default function IntuitionDiagram({ stageId }: IntuitionDiagramProps) {
  const [replayNonce, setReplayNonce] = useState(0);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 p-4">
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2 border-b border-slate-200/80 dark:border-slate-800">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Animated Visual Intuition
        </span>
        <button
          type="button"
          onClick={() => setReplayNonce((n) => n + 1)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          Replay
        </button>
      </div>

      <div key={`${stageId}-${replayNonce}`}>
        {stageId === 1 && <Stage1IdeaSvg />}
        {stageId === 2 && <Stage2IdeaSvg />}
        {stageId === 3 && <Stage3IdeaSvg />}
        {stageId === 4 && <Stage4IdeaSvg />}
        {stageId === 5 && <Stage5IdeaSvg />}
        {stageId === 6 && <Stage6IdeaSvg />}
        {stageId === 7 && <Stage7IdeaSvg />}
      </div>
    </div>
  );
}

/* Stage 1: Hardcoded gate failing on Yellow Apple vs Adaptive ML Boundary */
function Stage1IdeaSvg() {
  return (
    <svg viewBox="0 0 420 190" className="w-full h-auto">
      {/* Left box: Rigid Rule */}
      <rect
        x={12}
        y={16}
        width={182}
        height={158}
        rx={10}
        className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800"
      />
      <text
        x={103}
        y={36}
        textAnchor="middle"
        className="fill-rose-700 dark:fill-rose-400 text-[10px] font-mono font-semibold"
      >
        Hardcoded if/else
      </text>
      {/* Fixed horizontal cutoff */}
      <line
        x1={26}
        y1={96}
        x2={180}
        y2={96}
        stroke="#DC2626"
        strokeWidth="2"
        strokeDasharray="5 4"
      />
      <text
        x={178}
        y={90}
        textAnchor="end"
        className="fill-rose-600 dark:fill-rose-400 text-[8.5px] font-mono"
      >
        redness ≥ 55%
      </text>
      <circle cx={60} cy={65} r={6} fill="#0284C7" />
      <circle cx={96} cy={58} r={6} fill="#0284C7" />
      <polygon points="55,134 61,140 55,146 49,140" fill="#D97706" />
      <polygon points="92,142 98,148 92,154 86,148" fill="#D97706" />
      {/* Yellow Apple outlier drops below fixed line and triggers error ring */}
      <motion.g
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <circle cx={150} cy={132} r={7} fill="#EAB308" stroke="#0284C7" strokeWidth="2" />
        <motion.circle
          cx={150}
          cy={132}
          r={13}
          fill="none"
          stroke="#DC2626"
          strokeWidth="2"
          animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{ transformOrigin: '150px 132px' }}
        />
        <text
          x={150}
          y={162}
          textAnchor="middle"
          className="fill-rose-600 dark:fill-rose-400 text-[8.5px] font-mono font-bold"
        >
          Rule Fails!
        </text>
      </motion.g>

      {/* Right box: Adaptive ML Boundary */}
      <rect
        x={226}
        y={16}
        width={182}
        height={158}
        rx={10}
        className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800"
      />
      <text
        x={317}
        y={36}
        textAnchor="middle"
        className="fill-sky-700 dark:fill-sky-400 text-[10px] font-mono font-semibold"
      >
        Data-Driven ML Boundary
      </text>
      <circle cx={340} cy={65} r={6} fill="#0284C7" />
      <circle cx={366} cy={58} r={6} fill="#0284C7" />
      <polygon points="265,134 271,140 265,146 259,140" fill="#D97706" />
      <polygon points="282,110 288,116 282,122 276,116" fill="#D97706" />
      {/* Boundary rotates smoothly to include Yellow Apple */}
      <motion.line
        x1={314}
        y1={46}
        x2={314}
        y2={164}
        stroke="#0284C7"
        strokeWidth="2.8"
        strokeLinecap="round"
        initial={{ rotate: 68 }}
        animate={{ rotate: [68, 68, 8, 8] }}
        transition={{ duration: 3.4, repeat: Infinity, repeatDelay: 0.8 }}
        style={{ transformOrigin: '314px 105px' }}
      />
      <motion.circle
        cx={356}
        cy={132}
        r={7}
        fill="#EAB308"
        stroke="#0284C7"
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />
      <text
        x={356}
        y={162}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-400 text-[8.5px] font-mono font-bold"
      >
        Adapts!
      </text>
    </svg>
  );
}

/* Stage 2: Animated 4-step Feedback Wheel (Guess -> Loss -> Gradient -> Nudge) */
function Stage2IdeaSvg() {
  const nodes = [
    { x: 210, y: 34, label: '1. Guess', sub: 'ŷ = wx + b', color: '#0284C7' },
    { x: 348, y: 98, label: '2. Loss', sub: 'Measure MSE', color: '#DC2626' },
    { x: 210, y: 160, label: '3. Gradient', sub: 'Find downhill', color: '#D97706' },
    { x: 72, y: 98, label: '4. Nudge', sub: 'Turn w & b', color: '#059669' },
  ];

  return (
    <svg viewBox="0 0 420 194" className="w-full h-auto">
      {/* Orbital loop ellipse */}
      <ellipse
        cx={210}
        cy={97}
        rx={132}
        ry={62}
        fill="none"
        className="stroke-slate-300 dark:stroke-slate-700"
        strokeWidth="2"
        strokeDasharray="6 5"
      />
      {/* Animated traveling pulse dot around loop */}
      <motion.circle
        r={6}
        fill="#0284C7"
        animate={{
          cx: [210, 342, 210, 78, 210],
          cy: [35, 97, 159, 97, 35],
        }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'linear' }}
      />
      <text
        x={210}
        y={94}
        textAnchor="middle"
        className="fill-slate-800 dark:fill-slate-100 text-[11px] font-semibold"
      >
        Repeat until
      </text>
      <text
        x={210}
        y={109}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-400 text-[10px] font-mono font-bold"
      >
        MSE → Minimum
      </text>

      {nodes.map((n, idx) => (
        <motion.g
          key={n.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.14, duration: 0.35 }}
        >
          <rect
            x={n.x - 52}
            y={n.y - 20}
            width={104}
            height={40}
            rx={9}
            className="fill-white dark:fill-slate-900"
            stroke={n.color}
            strokeWidth="1.8"
          />
          <text
            x={n.x}
            y={n.y - 2}
            textAnchor="middle"
            fill={n.color}
            className="text-[10px] font-bold"
          >
            {n.label}
          </text>
          <text
            x={n.x}
            y={n.y + 12}
            textAnchor="middle"
            className="fill-slate-500 dark:fill-slate-400 text-[8.5px] font-mono"
          >
            {n.sub}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

/* Stage 3: Same dots rendered across 3 mini panels (Regression | Classification | Clustering) */
function Stage3IdeaSvg() {
  const dots = [
    { x: 22, y: 118 },
    { x: 34, y: 108 },
    { x: 45, y: 114 },
    { x: 64, y: 82 },
    { x: 76, y: 74 },
    { x: 96, y: 54 },
    { x: 108, y: 46 },
  ];

  return (
    <svg viewBox="0 0 420 176" className="w-full h-auto">
      {[
        { title: 'Regression', ox: 10, mode: 'reg' },
        { title: 'Classification', ox: 146, mode: 'clf' },
        { title: 'Unsupervised', ox: 282, mode: 'km' },
      ].map((panel, pIdx) => (
        <motion.g
          key={panel.title}
          transform={`translate(${panel.ox}, 12)`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: pIdx * 0.18, duration: 0.4 }}
        >
          <rect
            x={0}
            y={0}
            width={126}
            height={152}
            rx={10}
            className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800"
          />
          <text
            x={63}
            y={20}
            textAnchor="middle"
            className="fill-slate-800 dark:fill-slate-100 text-[10px] font-semibold"
          >
            {panel.title}
          </text>

          {panel.mode === 'reg' && (
            <motion.line
              x1={14}
              y1={126}
              x2={114}
              y2={40}
              stroke="#0284C7"
              strokeWidth="2.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, delay: 0.3 }}
            />
          )}

          {panel.mode === 'clf' && (
            <motion.line
              x1={40}
              y1={36}
              x2={88}
              y2={136}
              stroke="#0F172A"
              className="stroke-slate-800 dark:stroke-slate-200"
              strokeWidth="2"
              strokeDasharray="4 3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            />
          )}

          {panel.mode === 'km' && (
            <>
              <motion.circle
                cx={34}
                cy={113}
                r={22}
                fill="#0284C7"
                fillOpacity={0.12}
                stroke="#0284C7"
                strokeWidth="1.2"
                strokeDasharray="3 2"
                animate={{ scale: [0.92, 1.04, 0.92] }}
                transition={{ duration: 2.6, repeat: Infinity }}
                style={{ transformOrigin: '34px 113px' }}
              />
              <motion.circle
                cx={92}
                cy={58}
                r={26}
                fill="#059669"
                fillOpacity={0.12}
                stroke="#059669"
                strokeWidth="1.2"
                strokeDasharray="3 2"
                animate={{ scale: [0.92, 1.04, 0.92] }}
                transition={{ duration: 2.6, delay: 0.4, repeat: Infinity }}
                style={{ transformOrigin: '92px 58px' }}
              />
            </>
          )}

          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={4.2}
              fill={
                panel.mode === 'reg'
                  ? '#0284C7'
                  : panel.mode === 'clf'
                  ? i < 3
                    ? '#DC2626'
                    : '#0284C7'
                  : i < 3
                  ? '#0284C7'
                  : '#059669'
              }
            />
          ))}
        </motion.g>
      ))}
    </svg>
  );
}

/* Stage 4: Animated ball descending convex MSE parabola */
function Stage4IdeaSvg() {
  return (
    <svg viewBox="0 0 420 186" className="w-full h-auto">
      <line
        x1={30}
        y1={154}
        x2={390}
        y2={154}
        className="stroke-slate-300 dark:stroke-slate-700"
      />
      {/* Convex MSE Bowl */}
      <path
        d="M 54 32 Q 210 264 366 32"
        fill="none"
        stroke="#0284C7"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Global minimum marker */}
      <line
        x1={210}
        y1={42}
        x2={210}
        y2={154}
        stroke="#059669"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <text
        x={210}
        y={170}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-400 text-[10px] font-mono font-bold"
      >
        Global Minimum w*
      </text>

      {/* Safe smooth descent ball (Azure/Emerald) */}
      <motion.circle
        r={8}
        fill="#059669"
        stroke="#ffffff"
        strokeWidth="2"
        animate={{
          cx: [92, 128, 162, 188, 204, 210, 210],
          cy: [74, 111, 134, 145, 148, 148, 148],
        }}
        transition={{
          duration: 3.4,
          repeat: Infinity,
          repeatDelay: 0.9,
          ease: 'easeInOut',
        }}
      />
      <text
        x={96}
        y={48}
        className="fill-emerald-700 dark:fill-emerald-400 text-[9.5px] font-mono font-semibold"
      >
        Safe α: steps downhill
      </text>

      {/* Overshoot arrow hint on right wall */}
      <motion.path
        d="M 290 112 Q 210 70 115 62"
        fill="none"
        stroke="#DC2626"
        strokeWidth="1.6"
        strokeDasharray="4 3"
        initial={{ pathLength: 0, opacity: 0.3 }}
        animate={{ pathLength: 1, opacity: [0.3, 0.9, 0.3] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      />
      <text
        x={306}
        y={48}
        textAnchor="middle"
        className="fill-rose-600 dark:fill-rose-400 text-[9.5px] font-mono font-semibold"
      >
        Huge α: overshoots!
      </text>
    </svg>
  );
}

/* Stage 5: Straight line tilting vs Sigmoid S-curve staying locked inside [0, 1] */
function Stage5IdeaSvg() {
  return (
    <svg viewBox="0 0 420 186" className="w-full h-auto">
      {/* Bounds Y=1 and Y=0 */}
      <line
        x1={42}
        y1={42}
        x2={392}
        y2={42}
        className="stroke-slate-300 dark:stroke-slate-700"
        strokeDasharray="4 4"
      />
      <line
        x1={42}
        y1={144}
        x2={392}
        y2={144}
        className="stroke-slate-300 dark:stroke-slate-700"
        strokeDasharray="4 4"
      />
      <text
        x={34}
        y={46}
        textAnchor="end"
        className="fill-slate-500 text-[9.5px] font-mono"
      >
        1.0
      </text>
      <text
        x={34}
        y={148}
        textAnchor="end"
        className="fill-slate-500 text-[9.5px] font-mono"
      >
        0.0
      </text>

      {/* Straight line escaping above 1.0 & below 0.0 */}
      <line
        x1={52}
        y1={168}
        x2={360}
        y2={16}
        stroke="#DC2626"
        strokeWidth="1.8"
        strokeDasharray="5 4"
        opacity={0.7}
      />
      <text
        x={355}
        y={14}
        textAnchor="end"
        className="fill-rose-600 dark:fill-rose-400 text-[8.5px] font-mono"
      >
        Linear (&gt; 1.0 invalid)
      </text>

      {/* Animated Sigmoid S-curve drawing smoothly */}
      <motion.path
        d="M 46 142 C 138 142, 152 140, 190 93 C 228 46, 248 44, 386 43"
        fill="none"
        stroke="#0284C7"
        strokeWidth="3.2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <text
        x={292}
        y={64}
        className="fill-sky-700 dark:fill-sky-400 text-[9.5px] font-mono font-semibold"
      >
        Sigmoid S(z) ∈ (0, 1)
      </text>

      {/* Outlier dot pulsing safely on right plateau */}
      <motion.circle
        cx={368}
        cy={43}
        r={6.5}
        fill="#D97706"
        stroke="#ffffff"
        strokeWidth="2"
        animate={{ cx: [275, 368, 368, 275] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <text
        x={348}
        y={32}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8.5px] font-mono"
      >
        Outlier X=50
      </text>
    </svg>
  );
}

/* Stage 6: KNN Expanding Radar Circle vs Decision Tree Orthogonal Cuts */
function Stage6IdeaSvg() {
  return (
    <svg viewBox="0 0 420 184" className="w-full h-auto">
      {/* Left: KNN Expanding Neighborhood */}
      <rect
        x={12}
        y={14}
        width={184}
        height={156}
        rx={10}
        className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800"
      />
      <text
        x={104}
        y={33}
        textAnchor="middle"
        className="fill-sky-700 dark:fill-sky-400 text-[10px] font-mono font-semibold"
      >
        KNN: Local Neighbor Vote
      </text>
      <motion.circle
        cx={104}
        cy={102}
        r={42}
        fill="#0284C7"
        fillOpacity={0.14}
        stroke="#0284C7"
        strokeWidth="1.8"
        strokeDasharray="4 3"
        animate={{ r: [16, 44, 44, 16] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <circle cx={82} cy={88} r={5} fill="#0284C7" />
      <circle cx={120} cy={84} r={5} fill="#0284C7" />
      <circle cx={96} cy={124} r={5} fill="#0284C7" />
      <circle cx={130} cy={118} r={5} fill="#DC2626" />
      <circle cx={56} cy={136} r={5} fill="#DC2626" />
      <circle cx={104} cy={102} r={7} className="fill-slate-900 dark:fill-white" />
      <text
        x={104}
        y={105}
        textAnchor="middle"
        className="fill-white dark:fill-slate-900 text-[8.5px] font-mono font-bold"
      >
        ?
      </text>

      {/* Right: Decision Tree Orthogonal Box Slicing */}
      <rect
        x={224}
        y={14}
        width={184}
        height={156}
        rx={10}
        className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800"
      />
      <text
        x={316}
        y={33}
        textAnchor="middle"
        className="fill-emerald-700 dark:fill-emerald-400 text-[10px] font-mono font-semibold"
      >
        Decision Tree: Box Cuts
      </text>
      {/* Animated vertical cut 1 */}
      <motion.line
        x1={314}
        y1={44}
        x2={314}
        y2={158}
        stroke="#0F172A"
        className="stroke-slate-700 dark:stroke-slate-300"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      />
      {/* Animated horizontal cut 2 */}
      <motion.line
        x1={236}
        y1={104}
        x2={314}
        y2={104}
        stroke="#0F172A"
        className="stroke-slate-700 dark:stroke-slate-300"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, delay: 0.9 }}
      />
      <rect x={238} y={46} width={74} height={56} fill="#0284C7" opacity={0.14} />
      <rect x={238} y={106} width={74} height={50} fill="#DC2626" opacity={0.14} />
      <rect x={316} y={46} width={80} height={110} fill="#DC2626" opacity={0.14} />
      <circle cx={264} cy={72} r={5} fill="#0284C7" />
      <circle cx={288} cy={82} r={5} fill="#0284C7" />
      <circle cx={274} cy={132} r={5} fill="#DC2626" />
      <circle cx={354} cy={92} r={5} fill="#DC2626" />
      <circle cx={368} cy={126} r={5} fill="#DC2626" />
    </svg>
  );
}

/* Stage 7: Animated Balance Scale weighing Spam vs Ham word clues */
function Stage7IdeaSvg() {
  return (
    <svg viewBox="0 0 420 186" className="w-full h-auto">
      {/* Fulcrum */}
      <polygon
        points="210,92 190,164 230,164"
        className="fill-slate-300 dark:fill-slate-700"
      />
      <rect
        x={160}
        y={164}
        width={100}
        height={8}
        rx={4}
        className="fill-slate-400 dark:fill-slate-600"
      />

      {/* Gently rocking beam tilting toward Spam as clues drop */}
      <motion.g
        animate={{ rotate: [8, -14, -14, 8] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '210px 92px' }}
      >
        <line
          x1={92}
          y1={92}
          x2={328}
          y2={92}
          className="stroke-slate-800 dark:stroke-slate-200"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Left Pan: Spam */}
        <line x1={92} y1={92} x2={68} y2={132} className="stroke-slate-400" strokeWidth="1.5" />
        <line x1={92} y1={92} x2={116} y2={132} className="stroke-slate-400" strokeWidth="1.5" />
        <path d="M 60 132 Q 92 148 124 132 Z" fill="#DC2626" />
        <text x={92} y={124} textAnchor="middle" className="fill-rose-700 dark:fill-rose-400 text-[10px] font-mono font-bold">
          SPAM
        </text>

        {/* Right Pan: Ham */}
        <line x1={328} y1={92} x2={304} y2={132} className="stroke-slate-400" strokeWidth="1.5" />
        <line x1={328} y1={92} x2={352} y2={132} className="stroke-slate-400" strokeWidth="1.5" />
        <path d="M 296 132 Q 328 148 360 132 Z" fill="#059669" />
        <text x={328} y={124} textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400 text-[10px] font-mono font-bold">
          HAM
        </text>
      </motion.g>

      {/* Dropping word badge "WINNER" */}
      <motion.g
        animate={{ y: [-12, 26, 26, -12], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x={60} y={24} width={64} height={22} rx={5} fill="#DC2626" />
        <text x={92} y={39} textAnchor="middle" className="fill-white text-[9px] font-mono font-bold">
          &quot;WINNER&quot;
        </text>
      </motion.g>
    </svg>
  );
}
