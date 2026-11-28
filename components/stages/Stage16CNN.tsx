'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, StepForward } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import InfoPopover from '@/components/common/InfoPopover';
import LiveEquation from '@/components/common/LiveEquation';
import {
  CNN_IMAGE_PRESETS,
  CNN_KERNEL_PRESETS,
  CNNImagePresetId,
  CNNKernelPresetId,
  computeConvolution2D,
} from '@/lib/ml-modern-math';

export default function Stage16CNN() {
  const { registerProofHandler } = useApp();

  const [imagePreset, setImagePreset] =
    useState<CNNImagePresetId>('vertical_bar');
  const [imageGrid, setImageGrid] = useState<number[][]>(() =>
    CNN_IMAGE_PRESETS.vertical_bar.grid.map((row) => [...row])
  );
  const [kernelPreset, setKernelPreset] =
    useState<CNNKernelPresetId>('vertical_edge');
  const [applyRelu, setApplyRelu] = useState<boolean>(true);
  const [focusPos, setFocusPos] = useState<{ r: number; c: number }>({
    r: 1,
    c: 1,
  });
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  const stopScan = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const activeKernel = CNN_KERNEL_PRESETS[kernelPreset].kernel;

  const conv = useMemo(
    () =>
      computeConvolution2D(
        imageGrid,
        activeKernel,
        applyRelu,
        focusPos.r,
        focusPos.c
      ),
    [imageGrid, activeKernel, applyRelu, focusPos]
  );

  const handleSelectImage = (id: CNNImagePresetId) => {
    stopScan();
    setImagePreset(id);
    setImageGrid(CNN_IMAGE_PRESETS[id].grid.map((row) => [...row]));
  };

  const handleTogglePixel = (r: number, c: number) => {
    stopScan();
    setImageGrid((prev) =>
      prev.map((row, ri) =>
        ri === r ? row.map((v, ci) => (ci === c ? (v > 0.5 ? 0 : 1) : v)) : row
      )
    );
  };

  const handleNextPatch = () => {
    stopScan();
    setFocusPos((prev) => {
      const idx = (prev.r * 5 + prev.c + 1) % 25;
      return { r: Math.floor(idx / 5), c: idx % 5 };
    });
  };

  const handleToggleScan = () => {
    if (isScanning) {
      stopScan();
      return;
    }
    setIsScanning(true);
    timerRef.current = window.setInterval(() => {
      setFocusPos((prev) => {
        const idx = (prev.r * 5 + prev.c + 1) % 25;
        return { r: Math.floor(idx / 5), c: idx % 5 };
      });
    }, 260);
  };

  useEffect(() => {
    const runProof = () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setImagePreset('vertical_bar');
      setImageGrid(CNN_IMAGE_PRESETS.vertical_bar.grid.map((r) => [...r]));
      setKernelPreset('vertical_edge');
      setApplyRelu(true);
      setFocusPos({ r: 0, c: 0 });
      setIsScanning(true);
      let step = 0;
      timerRef.current = window.setInterval(() => {
        step++;
        const idx = step % 25;
        setFocusPos({ r: Math.floor(idx / 5), c: idx % 5 });
        if (step >= 12) {
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsScanning(false);
        }
      }, 220);
    };
    const unregister = registerProofHandler(16, runProof);
    return () => unregister();
  }, [registerProofHandler]);

  const maxAbsFeat = Math.max(
    1,
    ...conv.activatedMap.flat().map((v) => Math.abs(v))
  );

  return (
    <div className="space-y-5">
      {/* Integrated Example Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-medium text-slate-400 mr-1">Image Example:</span>
          {(Object.keys(CNN_IMAGE_PRESETS) as CNNImagePresetId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => handleSelectImage(id)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
                imagePreset === id
                  ? 'bg-blue-700 dark:bg-blue-500 text-white dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {CNN_IMAGE_PRESETS[id].label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-medium text-slate-400 mr-1">3×3 Kernel:</span>
          {(Object.keys(CNN_KERNEL_PRESETS) as CNNKernelPresetId[]).map(
            (id) => (
              <button
                key={id}
                type="button"
                onClick={() => setKernelPreset(id)}
                className={`rounded-md border px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  kernelPreset === id
                    ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {CNN_KERNEL_PRESETS[id].label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main 65/35 Two-Zone Sandbox */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left 8 Cols: Pixel Grid -> Feature Map -> Max Pooling Pipeline */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-3 items-start">
            {/* 1. Interactive 7x7 Pixel Input */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span>1. Input Image (7×7)</span>
                <InfoPopover
                  title="Editable Pixel Grid"
                  content="Click any cell to toggle pixels on (1) or off (0). The amber frame marks the active 3×3 receptive field being multiplied by the kernel."
                  align="left"
                />
              </div>

              <div className="grid grid-cols-7 gap-1 bg-slate-100 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                {imageGrid.map((row, r) =>
                  row.map((val, c) => {
                    const inWindow =
                      r >= focusPos.r &&
                      r < focusPos.r + 3 &&
                      c >= focusPos.c &&
                      c < focusPos.c + 3;
                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        onClick={() => handleTogglePixel(r, c)}
                        className={`aspect-square rounded text-[10px] font-mono tabular-nums font-semibold transition-all cursor-pointer ${
                          val > 0.5
                            ? 'bg-blue-700 dark:bg-blue-500 text-white dark:text-slate-950'
                            : 'bg-white dark:bg-slate-900 text-slate-400'
                        } ${
                          inWindow
                            ? 'ring-2 ring-amber-500 dark:ring-amber-400 z-10'
                            : ''
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* 2. 5x5 Feature Map */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span>2. Feature Map (5×5)</span>
                <InfoPopover
                  title="Convolution Output"
                  content="Click any output cell to move the 3×3 kernel window directly to that position and inspect its 9-term dot product."
                />
              </div>

              <div className="grid grid-cols-5 gap-1.5 bg-slate-100 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                {conv.activatedMap.map((row, r) =>
                  row.map((val, c) => {
                    const isFocused = r === focusPos.r && c === focusPos.c;
                    const norm = Math.min(1, Math.abs(val) / maxAbsFeat);
                    return (
                      <button
                        key={`fm-${r}-${c}`}
                        type="button"
                        onClick={() => {
                          stopScan();
                          setFocusPos({ r, c });
                        }}
                        style={{
                          backgroundColor:
                            val > 0.05
                              ? `rgba(5, 150, 105, ${0.14 + norm * 0.65})`
                              : val < -0.05
                              ? `rgba(225, 29, 72, ${0.14 + norm * 0.55})`
                              : undefined,
                        }}
                        className={`aspect-square rounded text-[10px] font-mono tabular-nums font-semibold transition-all cursor-pointer ${
                          Math.abs(val) <= 0.05
                            ? 'bg-white dark:bg-slate-900 text-slate-400'
                            : 'text-slate-950 dark:text-white'
                        } ${
                          isFocused
                            ? 'ring-2 ring-amber-500 dark:ring-amber-400 scale-105 z-10'
                            : ''
                        }`}
                      >
                        {Number.isInteger(val) ? val : val.toFixed(1)}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3. 2x2 Max Pooling */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span>3. Max Pool (2×2)</span>
                <InfoPopover
                  title="2×2 Stride-2 Max Pooling"
                  content="Keeps only the largest activation from each 2×2 quadrant of the Feature Map, cutting spatial size while keeping detected edges intact."
                  align="right"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 max-w-[170px]">
                {conv.pooledMap.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`mp-${r}-${c}`}
                      className="aspect-square rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center font-mono text-sm font-bold tabular-nums text-blue-800 dark:text-blue-200"
                    >
                      {Number.isInteger(val) ? val : val.toFixed(1)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 9-Term Dot Product Breakdown Strip */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Active Patch ({focusPos.r}, {focusPos.c}) Dot Product
              </span>
              <span className="font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400">
                Sum = {conv.activeSum.toFixed(2)} → Output ={' '}
                {conv.activeOutput.toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
              {conv.activeTerms.map((t, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 py-1.5 text-center font-mono text-[10px] tabular-nums"
                >
                  <div className="text-slate-500">
                    {t.pixel}×{t.weight}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {t.product >= 0 ? `+${t.product.toFixed(1)}` : t.product.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Kernel Weights & Playback Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span>Active 3×3 Kernel Weights</span>
                <InfoPopover
                  title={CNN_KERNEL_PRESETS[kernelPreset].label}
                  content={CNN_KERNEL_PRESETS[kernelPreset].description}
                  align="right"
                />
              </div>
              <button
                type="button"
                onClick={() => handleSelectImage(imagePreset)}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 max-w-[180px] mx-auto">
              {activeKernel.flat().map((w, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border py-2 text-center font-mono text-xs font-bold tabular-nums ${
                    w > 0
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                      : w < 0
                      ? 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500'
                  }`}
                >
                  {w > 0 ? `+${w}` : w}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleToggleScan}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  isScanning
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-blue-700 dark:bg-blue-500 text-white dark:text-slate-950 hover:bg-blue-800'
                }`}
              >
                <Play className="h-3.5 w-3.5" />
                {isScanning ? 'Pause Scan' : 'Slide Filter'}
              </button>
              <button
                type="button"
                onClick={handleNextPatch}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <StepForward className="h-3.5 w-3.5" />
                Next Patch
              </button>
            </div>

            <label className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs cursor-pointer">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                Apply ReLU Activation
                <InfoPopover
                  title="ReLU After Convolution"
                  content="ReLU clamps negative filter scores to 0 so the Feature Map highlights only positive pattern matches."
                  align="right"
                />
              </span>
              <input
                type="checkbox"
                checked={applyRelu}
                onChange={(e) => setApplyRelu(e.target.checked)}
                className="h-4 w-4 accent-blue-700 cursor-pointer"
              />
            </label>
          </div>

          <LiveEquation
            label="Active Feature Cell Formula"
            formula={`F(${focusPos.r},${focusPos.c}) = ${applyRelu ? 'ReLU(' : ''}${conv.activeSum.toFixed(2)}${applyRelu ? ')' : ''} = ${conv.activeOutput.toFixed(2)}`}
          />
        </div>
      </div>
    </div>
  );
}
