'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface InfoPopoverProps {
  title?: string;
  content: string;
  example?: string;
  align?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md';
  label?: string;
}

export default function InfoPopover({
  title,
  content,
  example,
  align = 'center',
  size = 'sm',
  label,
}: InfoPopoverProps) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const popoverId = useId();

  const isOpen = pinned || hovered;

  useEffect(() => {
    if (!pinned) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setPinned(false);
        setHovered(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPinned(false);
        setHovered(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pinned]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setHovered(false);
    }, 120);
  };

  const alignmentClasses =
    align === 'left'
      ? 'left-0'
      : align === 'right'
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  return (
    <span
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-flex items-center align-middle"
    >
      <button
        type="button"
        aria-label={label ?? (title ? `Explain ${title}` : 'Show explanation')}
        aria-expanded={isOpen}
        aria-controls={popoverId}
        onClick={(e) => {
          e.stopPropagation();
          setPinned((prev) => !prev);
        }}
        onFocus={() => setHovered(true)}
        onBlur={() => {
          if (!pinned) setHovered(false);
        }}
        className={`inline-flex items-center justify-center rounded-full border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
          size === 'md' ? 'h-5 w-5' : 'h-[18px] w-[18px]'
        } ${
          isOpen
            ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300'
        }`}
      >
        <HelpCircle className={size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
      </button>

      {isOpen && (
        <span
          id={popoverId}
          role="tooltip"
          className={`absolute top-full mt-2 z-40 w-72 sm:w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-left shadow-lg ${alignmentClasses}`}
        >
          <span className="flex items-start justify-between gap-2">
            {title && (
              <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                {title}
              </span>
            )}
            {pinned && (
              <button
                type="button"
                aria-label="Close explanation"
                onClick={(e) => {
                  e.stopPropagation();
                  setPinned(false);
                  setHovered(false);
                }}
                className="ml-auto rounded p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
          <span className="mt-1 block text-xs font-normal leading-relaxed text-slate-600 dark:text-slate-300">
            {content}
          </span>
          {example && (
            <span className="mt-2 block rounded-md bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
              {example}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
