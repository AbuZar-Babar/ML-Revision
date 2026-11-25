'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Pause,
  Play,
  RotateCcw,
  StepForward,
  Sliders,
} from 'lucide-react';
import {
  EvaluatedStep,
  STAGE_INTERACTIVE_EXAMPLES,
} from '@/data/interactiveExamples';
import { useApp } from '@/context/AppContext';

interface InteractiveExampleSectionProps {
  stageId: number;
}

const STEP_TONE_RING: Record<
  NonNullable<EvaluatedStep['highlight']>,
  string
> = {
  primary: 'border-sky-300 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/20',
  success:
    'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20',
  danger:
    'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/25',
  amber:
    'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/25',
  neutral: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
};

const RESULT_TONE_TEXT: Record<
  'primary' | 'success' | 'danger' | 'amber',
  string
> = {
  primary: 'text-sky-700 dark:text-sky-400',
  success: 'text-emerald-700 dark:text-emerald-400',
  danger: 'text-rose-700 dark:text-rose-400',
  amber: 'text-amber-700 dark:text-amber-400',
};

export default function InteractiveExampleSection({
  stageId,
}: InteractiveExampleSectionProps) {
  const { setActiveSection } = useApp();
  const spec =
    STAGE_INTERACTIVE_EXAMPLES[stageId] ?? STAGE_INTERACTIVE_EXAMPLES[1];

  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    spec.presets[1]?.id ?? spec.presets[0].id
  );
  const [values, setValues] = useState<Record<string, number>>(
    () => ({ ...(spec.presets[1]?.values ?? spec.presets[0].values) })
  );
  const [visibleSteps, setVisibleSteps] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playTimerRef = useRef<number | null>(null);

  const evaluation = useMemo(() => spec.evaluate(values), [spec, values]);
  const totalSteps = evaluation.steps.length;

  // Pre-evaluate all 3 real-world presets for side-by-side comparison cards
  const presetComparisons = useMemo(
    () =>
      spec.presets.map((preset) => ({
        preset,
        result: spec.evaluate(preset.values),
      })),
    [spec]
  );

  const stopPlayback = () => {
    if (playTimerRef.current !== null) {
      window.clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => stopPlayback();
  }, []);

  const handlePlay = () => {
    stopPlayback();
    setVisibleSteps((cur) => (cur >= totalSteps ? 1 : Math.max(1, cur)));
    setIsPlaying(true);

    playTimerRef.current = window.setInterval(() => {
      setVisibleSteps((cur) => {
        if (cur >= totalSteps) {
          stopPlayback();
          return totalSteps;
        }
        return cur + 1;
      });
    }, 1050);
  };

  const handleNextStep = () => {
    stopPlayback();
    setVisibleSteps((cur) => Math.min(totalSteps, cur + 1));
  };

  const handleResetSteps = () => {
    stopPlayback();
    setVisibleSteps(1);
  };

  const handleSelectPreset = (presetId: string, presetValues: Record<string, number>) => {
    stopPlayback();
    setSelectedPresetId(presetId);
    setValues({ ...presetValues });
    setVisibleSteps(1);
    // Automatically step smoothly through the loaded preset so students watch the comparison animate
    setIsPlaying(true);
    playTimerRef.current = window.setInterval(() => {
      setVisibleSteps((cur) => {
        if (cur >= totalSteps) {
          stopPlayback();
          return totalSteps;
        }
        return cur + 1;
      });
    }, 850);
  };

  const handleInputChange = (key: string, nextVal: number) => {
    stopPlayback();
    setSelectedPresetId(null);
    setValues((prev) => ({ ...prev, [key]: nextVal }));
    // When students live-edit inputs, reveal all steps immediately so live recalculation is visible
    setVisibleSteps(totalSteps);
  };

  const clampedVisible = Math.min(visibleSteps, totalSteps);
  const allRevealed = clampedVisible >= totalSteps;

  return (
    <div className="mx-auto max-w-[1060px] space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <Calculator className="h-4 w-4" />
          <span>Interactive Worked Example</span>
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {spec.title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          {spec.prompt}
        </p>
      </div>

      {/* Side-by-Side Real-World Preset Mini-Cases Comparison */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Compare Real-World Mini-Cases Side by Side (Click any card to animate its math)
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {selectedPresetId ? 'Preset Loaded' : 'Custom Live Values'}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {presetComparisons.map(({ preset, result }) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id, preset.values)}
                className={`text-left rounded-xl border p-4 space-y-2.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                  isSelected
                    ? 'border-sky-600 dark:border-sky-400 bg-sky-50/50 dark:bg-sky-950/35 ring-1 ring-sky-600/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
                    {preset.title}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {preset.subtitle}
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between gap-2">
                  <span
                    className={`font-mono text-xs font-bold tabular-nums ${
                      RESULT_TONE_TEXT[result.resultTone]
                    }`}
                  >
                    {result.resultMetric}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {result.resultBadge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Interactive Sandbox: Live Editable Inputs (Left) + Animated Step Walkthrough (Right) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left: Live Editable Inputs + Playback Bar */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Sliders className="h-3.5 w-3.5 text-sky-700 dark:text-sky-400" />
              <span>Edit Input Values Live</span>
            </div>

            <div className="space-y-5">
              {spec.inputs.map((field) => {
                const val = values[field.key] ?? field.min;
                if (field.isBoolean) {
                  const isOn = val >= 1;
                  return (
                    <div key={field.key} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {field.label} ({field.symbol})
                        </span>
                        <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                          {isOn
                            ? field.booleanLabels?.[1] ?? 'ON'
                            : field.booleanLabels?.[0] ?? 'OFF'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                        <button
                          type="button"
                          onClick={() => handleInputChange(field.key, 0)}
                          className={`rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer ${
                            !isOn
                              ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {field.booleanLabels?.[0] ?? 'OFF'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange(field.key, 1)}
                          className={`rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer ${
                            isOn
                              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {field.booleanLabels?.[1] ?? 'ON'}
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={field.key} className="space-y-2">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <label
                        htmlFor={`ex-input-${field.key}`}
                        className="font-medium text-slate-700 dark:text-slate-300"
                      >
                        {field.label}{' '}
                        <span className="font-mono text-slate-500">
                          ({field.symbol})
                        </span>
                      </label>
                      <span className="font-mono text-sm font-bold tabular-nums text-sky-700 dark:text-sky-400">
                        {field.step < 1 ? val.toFixed(2) : val}
                        {field.unit ?? ''}
                      </span>
                    </div>
                    <input
                      id={`ex-input-${field.key}`}
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={val}
                      onChange={(e) =>
                        handleInputChange(field.key, parseFloat(e.target.value))
                      }
                      className="ml-slider w-full bg-slate-200 dark:bg-slate-700"
                    />
                    <div className="flex justify-between font-mono text-[11px] text-slate-400">
                      <span>
                        {field.min}
                        {field.unit ?? ''}
                      </span>
                      <span>
                        {field.max}
                        {field.unit ?? ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step-by-Step Playback Controls */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Step-by-Step Playback
                </span>
                <span className="font-mono tabular-nums">
                  Step {clampedVisible} of {totalSteps}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={isPlaying ? stopPlayback : handlePlay}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-700 dark:bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white dark:text-slate-950 hover:bg-sky-800 dark:hover:bg-sky-400 transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      {allRevealed ? 'Replay Steps' : 'Play Steps'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={allRevealed}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <StepForward className="h-3.5 w-3.5" />
                  Next Step
                </button>

                <button
                  type="button"
                  onClick={handleResetSteps}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Reset to Step 1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Animated Step-by-Step Calculation Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-3.5">
            <AnimatePresence initial={false}>
              {evaluation.steps.slice(0, clampedVisible).map((step, idx) => {
                const isLatest = idx === clampedVisible - 1;
                const toneClass = STEP_TONE_RING[step.highlight ?? 'neutral'];
                return (
                  <motion.div
                    key={`${idx}-${step.label}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                    className={`rounded-xl border p-5 space-y-2.5 transition-all ${toneClass} ${
                      isLatest ? 'ring-2 ring-sky-600/35 dark:ring-sky-400/40' : ''
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
                          Step 0{idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {step.label}
                        </span>
                      </div>
                      {isLatest && !allRevealed && (
                        <span className="text-[11px] font-mono text-sky-700 dark:text-sky-400">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 font-mono text-xs sm:text-sm font-medium tabular-nums text-slate-900 dark:text-slate-100 overflow-x-auto">
                      {step.math}
                    </div>

                    <p className="text-xs sm:text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {step.note}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Animated Final Result & Conclusion Banner once all steps revealed */}
          {allRevealed ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-2"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span
                  className={`font-mono text-sm font-bold tabular-nums ${
                    RESULT_TONE_TEXT[evaluation.resultTone]
                  }`}
                >
                  Result: {evaluation.resultMetric}
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {evaluation.resultBadge}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {evaluation.conclusion}
              </p>
            </motion.div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center text-xs text-slate-500 dark:text-slate-400">
              Click <strong>Next Step</strong> or <strong>Play Steps</strong> to
              reveal remaining calculation steps ({totalSteps - clampedVisible}{' '}
              left).
            </div>
          )}
        </div>
      </div>

      {/* Section Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-5">
        <button
          type="button"
          onClick={() => setActiveSection('formula')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to 02. Formula
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('lab')}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 dark:bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-950 hover:bg-sky-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          Launch 04. Interactive Visual Lab
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
