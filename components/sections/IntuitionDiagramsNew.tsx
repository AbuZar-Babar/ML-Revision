'use client';

import React from 'react';
import { motion } from 'motion/react';

/* Chapter 03: Unscaled elongated canyon vs Z-Score circular bowl */
export function Stage3PrepIdeaSvg() {
  return (
    <svg viewBox="0 0 420 190" className="w-full h-auto">
      <rect x={12} y={16} width={184} height={158} rx={10} className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800" />
      <text x={104} y={35} textAnchor="middle" className="fill-rose-600 dark:fill-rose-400 text-[10px] font-mono font-semibold">
        Unscaled (Canyon Zig-Zag)
      </text>
      <ellipse cx={104} cy={104} rx={72} ry={16} fill="none" stroke="#dc2626" strokeOpacity={0.35} strokeWidth={1.5} />
      <ellipse cx={104} cy={104} rx={44} ry={9} fill="none" stroke="#dc2626" strokeOpacity={0.5} strokeWidth={1.5} />
      <motion.polyline
        points="40,94 62,120 74,89 88,116 96,95 104,104"
        fill="none"
        stroke="#dc2626"
        strokeWidth={2.2}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />
      <circle cx={104} cy={104} r={4} fill="#059669" />

      <rect x={224} y={16} width={184} height={158} rx={10} className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800" />
      <text x={316} y={35} textAnchor="middle" className="fill-blue-700 dark:fill-blue-400 text-[10px] font-mono font-semibold">
        Standardized (Direct Path)
      </text>
      <circle cx={316} cy={104} r={54} fill="none" stroke="#1d4ed8" strokeOpacity={0.25} strokeWidth={1.5} />
      <circle cx={316} cy={104} r={32} fill="none" stroke="#1d4ed8" strokeOpacity={0.45} strokeWidth={1.5} />
      <motion.line
        x1={268}
        y1={76}
        x2={316}
        y2={104}
        stroke="#1d4ed8"
        strokeWidth={2.6}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
      <circle cx={316} cy={104} r={4.5} fill="#059669" />
    </svg>
  );
}

/* Chapter 05: Overfit wiggle tamed by Regularization λ */
export function Stage5BiasVarIdeaSvg() {
  return (
    <svg viewBox="0 0 420 190" className="w-full h-auto">
      <rect x={14} y={14} width={392} height={162} rx={10} className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800" />
      <text x={210} y={34} textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-[10px] font-mono font-semibold">
        λ = 0 Overfit Wiggles (Red) vs. Regularized Smooth Fit (Blue)
      </text>
      {/* Wild overfit path */}
      <motion.path
        d="M 42 132 C 65 55, 86 155, 114 78 C 142 30, 175 148, 210 92 C 245 40, 278 158, 308 82 C 334 36, 360 144, 378 72"
        fill="none"
        stroke="#dc2626"
        strokeWidth={2}
        strokeDasharray="4 4"
        initial={{ pathLength: 0, opacity: 0.3 }}
        animate={{ pathLength: 1, opacity: 0.75 }}
        transition={{ duration: 1.1 }}
      />
      {/* Smooth regularized curve */}
      <motion.path
        d="M 42 130 Q 130 62, 210 96 T 378 74"
        fill="none"
        stroke="#1d4ed8"
        strokeWidth={3}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.0, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
      {[
        [48, 128], [108, 82], [164, 90], [214, 98], [272, 108], [326, 94], [374, 74],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={4.5} fill="#1d4ed8" />
      ))}
    </svg>
  );
}

/* Chapter 07: Support Vector Machine Maximum-Margin Street & Support Vectors */
export function Stage7SVMIdeaSvg() {
  return (
    <svg viewBox="0 0 420 190" className="w-full h-auto">
      <rect x={14} y={14} width={392} height={162} rx={10} className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800" />
      <text x={210} y={34} textAnchor="middle" className="fill-blue-700 dark:fill-blue-400 text-[10px] font-mono font-semibold">
        Widest Margin Street (2 / ‖w‖) Anchored by Support Vectors
      </text>

      {/* Margin band expanding */}
      <motion.polygon
        points="160,168 250,40 302,40 212,168"
        fill="#2563eb"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      />
      {/* Gutters */}
      <motion.line x1={160} y1={168} x2={250} y2={40} stroke="#1d4ed8" strokeWidth={1.6} strokeDasharray="5 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.2 }} />
      <motion.line x1={212} y1={168} x2={302} y2={40} stroke="#dc2626" strokeWidth={1.6} strokeDasharray="5 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.2 }} />
      {/* Center Hyperplane */}
      <motion.line x1={186} y1={168} x2={276} y2={40} className="stroke-slate-900 dark:stroke-slate-100" strokeWidth={2.8} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7 }} />

      {/* Class -1 Blue points */}
      {[[74, 80], [108, 128], [134, 66], [190, 124], [220, 82]].map(([cx, cy], idx) => (
        <g key={`b-${idx}`}>
          {idx >= 3 && (
            <motion.circle
              cx={cx}
              cy={cy}
              r={10.5}
              fill="none"
              stroke="#0f172a"
              className="stroke-slate-900 dark:stroke-amber-300"
              strokeWidth={2}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          )}
          <circle cx={cx} cy={cy} r={5.5} fill="#1d4ed8" />
        </g>
      ))}

      {/* Class +1 Red points */}
      {[[268, 88], [244, 124], [322, 108], [352, 74], [336, 146]].map(([cx, cy], idx) => (
        <g key={`r-${idx}`}>
          {idx <= 1 && (
            <motion.circle
              cx={cx}
              cy={cy}
              r={10.5}
              fill="none"
              className="stroke-slate-900 dark:stroke-amber-300"
              strokeWidth={2}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          )}
          <circle cx={cx} cy={cy} r={5.5} fill="#dc2626" />
        </g>
      ))}
    </svg>
  );
}

/* Chapter 10: Ensemble Wisdom of Crowds (3 trees voting into 1 stable prediction) */
export function Stage10EnsembleIdeaSvg() {
  return (
    <svg viewBox="0 0 420 190" className="w-full h-auto">
      <rect x={14} y={14} width={392} height={162} rx={10} className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800" />
      <text x={210} y={34} textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-[10px] font-mono font-semibold">
        Diverse Trees Vote Together → Stable Ensemble Consensus
      </text>

      {[
        { y: 64, label: 'Tree 1', vote: 'Class 1', color: '#1d4ed8' },
        { y: 102, label: 'Tree 2', vote: 'Class 1', color: '#1d4ed8' },
        { y: 140, label: 'Tree 3', vote: 'Class 0', color: '#dc2626' },
      ].map((t, i) => (
        <motion.g
          key={t.label}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: i * 0.16 }}
        >
          <rect x={44} y={t.y - 14} width={116} height={28} rx={6} className="fill-slate-50 dark:fill-slate-950 stroke-slate-300 dark:stroke-slate-700" />
          <text x={102} y={t.y + 4} textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[10px] font-mono font-semibold">
            {t.label} → {t.vote}
          </text>
          <line x1={160} y1={t.y} x2={252} y2={102} stroke={t.color} strokeWidth={2} strokeOpacity={0.7} />
        </motion.g>
      ))}

      <motion.g
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.35 }}
        style={{ transformOrigin: '322px 102px' }}
      >
        <rect x={254} y={76} width={132} height={52} rx={10} fill="#1d4ed8" />
        <text x={320} y={98} textAnchor="middle" className="fill-white text-[10px] font-mono">
          Majority Vote (2/3)
        </text>
        <text x={320} y={116} textAnchor="middle" className="fill-white text-[12px] font-display font-bold">
          Class 1 Wins
        </text>
      </motion.g>
    </svg>
  );
}

/* Chapter 12: PCA rotating axis onto diagonal cloud & projecting points */
export function Stage12PCAIdeaSvg() {
  return (
    <svg viewBox="0 0 420 190" className="w-full h-auto">
      <rect x={14} y={14} width={392} height={162} rx={10} className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800" />
      <text x={210} y={34} textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400 text-[10px] font-mono font-semibold">
        PC1 Aligns Along Maximum Data Spread (Minimal Loss)
      </text>

      <motion.line
        x1={76}
        y1={148}
        x2={344}
        y2={58}
        stroke="#059669"
        strokeWidth={2.8}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
      {[
        [114, 122], [148, 134], [176, 102], [212, 112], [244, 84], [282, 92], [312, 64],
      ].map(([cx, cy], i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r={5}
          fill="#1d4ed8"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.08 }}
        />
      ))}
      <text x={346} y={54} className="fill-emerald-700 dark:fill-emerald-400 text-[10px] font-mono font-bold">
        PC1
      </text>
    </svg>
  );
}

/* Chapter 13: Multi-Layer Neural Network Forward Pass */
export function Stage13NeuralIdeaSvg() {
  return (
    <svg viewBox="0 0 420 190" className="w-full h-auto">
      <rect x={14} y={14} width={392} height={162} rx={10} className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800" />
      <text x={210} y={34} textAnchor="middle" className="fill-blue-700 dark:fill-blue-400 text-[10px] font-mono font-semibold">
        Input → Hidden ReLU Layer (Bends Space) → Output ŷ
      </text>

      {/* Connections */}
      {[78, 134].map((iy) =>
        [72, 140].map((hy) => (
          <line key={`${iy}-${hy}`} x1={96} y1={iy} x2={210} y2={hy} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1.8} />
        ))
      )}
      {[72, 140].map((hy) => (
        <line key={`out-${hy}`} x1={210} y1={hy} x2={326} y2={106} stroke="#1d4ed8" strokeWidth={2.2} />
      ))}

      {/* Input Nodes */}
      {[{ y: 78, lbl: 'x₁' }, { y: 134, lbl: 'x₂' }].map((n) => (
        <g key={n.lbl}>
          <circle cx={96} cy={n.y} r={16} className="fill-slate-800 dark:fill-slate-700" />
          <text x={96} y={n.y + 4} textAnchor="middle" className="fill-white text-[11px] font-mono font-bold">{n.lbl}</text>
        </g>
      ))}
      {/* Hidden ReLU Nodes */}
      {[{ y: 72, lbl: 'h₁' }, { y: 140, lbl: 'h₂' }].map((n, i) => (
        <motion.g
          key={n.lbl}
          initial={{ scale: 0.8, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35 + i * 0.15 }}
          style={{ transformOrigin: `210px ${n.y}px` }}
        >
          <circle cx={210} cy={n.y} r={18} fill="#1d4ed8" />
          <text x={210} y={n.y + 4} textAnchor="middle" className="fill-white text-[11px] font-mono font-bold">{n.lbl}</text>
        </motion.g>
      ))}
      {/* Output Node */}
      <motion.g
        initial={{ scale: 0.8, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{ transformOrigin: '326px 106px' }}
      >
        <circle cx={326} cy={106} r={19} fill="#059669" />
        <text x={326} y={110} textAnchor="middle" className="fill-white text-[12px] font-mono font-bold">ŷ</text>
      </motion.g>
    </svg>
  );
}

/* Chapter 14: Forward Signal → Loss → Backward Chain Rule Wave */
export function Stage14BackpropIdeaSvg() {
  return (
    <svg viewBox="0 0 420 190" className="w-full h-auto">
      <rect x={14} y={14} width={392} height={162} rx={10} className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800" />
      <text x={210} y={34} textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-[10px] font-mono font-semibold">
        Forward Pass (Blue →) · Backward Chain-Rule Gradients (← Red)
      </text>

      {/* Forward arrow */}
      <motion.line
        x1={74}
        y1={84}
        x2={346}
        y2={84}
        stroke="#1d4ed8"
        strokeWidth={3}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8 }}
      />
      {/* Backward gradient wave */}
      <motion.line
        x1={346}
        y1={124}
        x2={74}
        y2={124}
        stroke="#dc2626"
        strokeWidth={3}
        strokeDasharray="6 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay: 0.7 }}
      />

      {[
        { x: 74, label: 'w₁' },
        { x: 165, label: 'h' },
        { x: 256, label: 'w₂' },
        { x: 346, label: 'Loss' },
      ].map((node) => (
        <g key={node.label}>
          <circle cx={node.x} cy={104} r={20} className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700" strokeWidth={2} />
          <text x={node.x} y={108} textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-[11px] font-mono font-bold">
            {node.label}
          </text>
        </g>
      ))}
      <text x={210} y={70} textAnchor="middle" className="fill-blue-700 dark:fill-blue-400 text-[9.5px] font-mono font-semibold">
        Forward Prediction →
      </text>
      <text x={210} y={154} textAnchor="middle" className="fill-rose-600 dark:fill-rose-400 text-[9.5px] font-mono font-semibold">
        ← Backward ∂L/∂w₁ = (∂L/∂ŷ)(∂ŷ/∂h)(∂h/∂w₁)
      </text>
    </svg>
  );
}
