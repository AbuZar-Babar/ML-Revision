'use client';

import React, { useRef, useState } from 'react';

interface RotaryKnobProps {
  label: string;
  symbol: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  accentColor?: string;
  highlighted?: boolean;
  onChange: (val: number) => void;
  onHover?: (hovering: boolean) => void;
}

export default function RotaryKnob({
  label,
  symbol,
  value,
  min,
  max,
  step = 0.05,
  unit = '',
  accentColor = '#0284C7',
  highlighted = false,
  onChange,
  onHover,
}: RotaryKnobProps) {
  const dragStartY = useRef<number | null>(null);
  const dragStartVal = useRef<number>(value);
  const [dragging, setDragging] = useState(false);

  const clamped = Math.max(min, Math.min(max, value));
  const ratio = (clamped - min) / (max - min || 1);
  // Sweep from -135 deg to +135 deg
  const angle = -135 + ratio * 270;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartY.current = e.clientY;
    dragStartVal.current = value;
    setDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartY.current === null) return;
    const deltaY = dragStartY.current - e.clientY; // drag up increases value
    const range = max - min;
    const nextRaw = dragStartVal.current + (deltaY / 160) * range;
    const snapped = Math.round(nextRaw / step) * step;
    const bounded = Math.max(min, Math.min(max, Number(snapped.toFixed(3))));
    onChange(bounded);
  };

  const handlePointerUp = () => {
    dragStartY.current = null;
    setDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      onChange(Math.min(max, Number((value + step).toFixed(3))));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(Math.max(min, Number((value - step).toFixed(3))));
    }
  };

  // Arc math for SVG track
  const r = 34;
  const cx = 44;
  const cy = 44;
  const startAngleRad = ((-135 - 90) * Math.PI) / 180;
  const curAngleRad = ((angle - 90) * Math.PI) / 180;
  const endAngleRad = ((135 - 90) * Math.PI) / 180;

  const arcPoint = (rad: number) => ({
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  });

  const startPt = arcPoint(startAngleRad);
  const endPt = arcPoint(endAngleRad);
  const curPt = arcPoint(curAngleRad);
  const activeSweep = ratio * 270 > 180 ? 1 : 0;

  return (
    <div
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className={`flex flex-col items-center rounded-xl border p-3.5 transition-colors select-none ${
        highlighted || dragging
          ? 'border-sky-500 dark:border-sky-400 bg-sky-50/50 dark:bg-sky-950/30'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
      }`}
    >
      <div className="flex w-full items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-slate-600 dark:text-slate-400">
          {label}
        </span>
        <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
          {symbol} = {clamped.toFixed(2)}
          {unit}
        </span>
      </div>

      <div
        role="slider"
        tabIndex={0}
        aria-label={`${label} (${symbol})`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clamped}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className="relative mt-2 h-[88px] w-[88px] cursor-ns-resize touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded-full"
        title="Drag vertically or use arrow keys to turn dial"
      >
        <svg viewBox="0 0 88 88" className="h-full w-full">
          {/* Background track arc */}
          <path
            d={`M ${startPt.x} ${startPt.y} A ${r} ${r} 0 1 1 ${endPt.x} ${endPt.y}`}
            fill="none"
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-700"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Active progress arc */}
          {ratio > 0.005 && (
            <path
              d={`M ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${activeSweep} 1 ${curPt.x} ${curPt.y}`}
              fill="none"
              stroke={accentColor}
              strokeWidth="6"
              strokeLinecap="round"
            />
          )}
          {/* Inner dial cap */}
          <circle
            cx={cx}
            cy={cy}
            r="24"
            className="fill-slate-50 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600"
            strokeWidth="1.5"
          />
          {/* Rotating indicator needle */}
          <g transform={`rotate(${angle} ${cx} ${cy})`}>
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - 18}
              stroke={accentColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r="3.5" fill={accentColor} />
          </g>
        </svg>
      </div>

      {/* Fine-tuning accessible range fallback directly underneath */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        aria-label={`${label} slider`}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="ml-slider mt-1 w-full bg-slate-200 dark:bg-slate-700"
      />
    </div>
  );
}
