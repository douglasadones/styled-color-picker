'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { Translations } from '@/lib/i18n';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SliderDef {
  key: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  /** CSS color for the slider track fill */
  trackColor: string;
}

interface FormatCardProps {
  title: string;
  formatString: string;
  placeholder: string;
  sliders: SliderDef[];
  onSliderChange: (key: string, value: number) => void;
  onStringPaste: (raw: string) => boolean;
  t: Translations;
  /** Rendered inside the collapse panel (the 3-D model) */
  model3D?: React.ReactNode;
  showModel?: boolean;
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Internal slider — uses pointer events + getBoundingClientRect to avoid
// the "controlled range input stuck at 0" bug caused by opacity-0 overlays.
// ---------------------------------------------------------------------------

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  trackColor: string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, unit, trackColor, onChange }: SliderRowProps) {
  // Always a safe, finite number in range
  const safeValue = Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : min;
  const percent = max === min ? 0 : ((safeValue - min) / (max - min)) * 100;

  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Calculate value from a pointer X position relative to the track
  const valueFromPointer = useCallback(
    (clientX: number): number => {
      const el = trackRef.current;
      if (!el) return safeValue;
      const rect = el.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      // Round to integer for all our cases (RGB 0-255, HSL/HSV 0-360, etc.)
      return Math.round(ratio * (max - min) + min);
    },
    [min, max, safeValue],
  );

  // Global pointermove/pointerup while dragging (attached to window)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      onChange(valueFromPointer(e.clientX));
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [onChange, valueFromPointer]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    onChange(valueFromPointer(e.clientX));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (Number.isFinite(v)) onChange(Math.max(min, Math.min(max, Math.round(v))));
  };

  return (
    <div className="flex items-center gap-2">
      {/* Label */}
      <span className="text-xs text-muted w-14 shrink-0 truncate">{label}</span>

      {/* Track — click / drag anywhere on it */}
      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={safeValue}
        tabIndex={0}
        className="flex-1 relative h-3 rounded-full cursor-pointer select-none"
        style={{ backgroundColor: 'var(--slider-bg)' }}
        onPointerDown={handlePointerDown}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp')
            onChange(Math.min(max, safeValue + 1));
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown')
            onChange(Math.max(min, safeValue - 1));
        }}
      >
        {/* Filled portion */}
        <div
          className="absolute left-0 top-0 h-full rounded-full pointer-events-none"
          style={{ width: `${percent}%`, backgroundColor: trackColor }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white pointer-events-none"
          style={{
            left: `${percent}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: trackColor,
            boxShadow: '0 1px 4px rgba(0,0,0,0.6)',
          }}
        />
      </div>

      {/* Number input */}
      <input
        type="number"
        min={min}
        max={max}
        value={safeValue}
        onChange={handleNumberChange}
        className="w-12 bg-input text-foreground text-xs font-mono text-right py-0.5 px-1 rounded border border-input-border outline-none focus:border-accent"
        aria-label={`${label} valor numérico`}
      />
      {unit && <span className="text-xs text-muted w-4 shrink-0">{unit}</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FormatCard
// ---------------------------------------------------------------------------

export function FormatCard({
  title,
  formatString,
  placeholder,
  sliders,
  onSliderChange,
  onStringPaste,
  t,
  model3D,
  showModel,
  children,
}: FormatCardProps) {
  const [copied, setCopied] = useState(false);
  const [pasteValue, setPasteValue] = useState(formatString);
  const [pasteError, setPasteError] = useState(false);
  const isEditing = useRef(false);

  // Sync paste field when external state changes (only when not actively editing)
  useEffect(() => {
    if (!isEditing.current) {
      setPasteValue(formatString);
      setPasteError(false);
    }
  }, [formatString]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(formatString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [formatString]);

  const handlePasteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isEditing.current = true;
    const raw = e.target.value;
    setPasteValue(raw);
    if (raw.trim() === '') { setPasteError(false); return; }
    const ok = onStringPaste(raw.trim());
    setPasteError(!ok);
  };

  const handlePasteBlur = () => {
    isEditing.current = false;
    if (pasteError) {
      setPasteValue(formatString);
      setPasteError(false);
    }
  };

  return (
    <div className="bg-panel border border-panel-border rounded-xl p-4 flex flex-col gap-3 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground tracking-wide">{title}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted hover:text-foreground hover:bg-hover transition-colors"
          title={t.copyLabel}
          aria-label={`${t.copyLabel} ${title}`}
        >
          {copied
            ? <><Check size={12} className="text-green-400" /><span className="text-green-400">{t.copiedLabel}</span></>
            : <><Copy size={12} /><span>{t.copyLabel}</span></>
          }
        </button>
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-2.5">
        {sliders.map((s) => (
          <SliderRow
            key={s.key}
            label={s.label}
            value={s.value}
            min={s.min}
            max={s.max}
            unit={s.unit}
            trackColor={s.trackColor}
            onChange={(v) => onSliderChange(s.key, v)}
          />
        ))}
      </div>

      {/* Extra slot (e.g. Alpha toggle) */}
      {children}

      {/* Paste / format field */}
      <div className="mt-auto pt-1">
        <p className="text-xs text-muted mb-1">{t.formatCode}</p>
        <input
          type="text"
          value={pasteValue}
          onChange={handlePasteChange}
          onBlur={handlePasteBlur}
          placeholder={placeholder}
          spellCheck={false}
          className={`w-full bg-input text-xs font-mono py-1.5 px-2 rounded-md border outline-none transition-colors
            ${pasteError ? 'border-red-500 text-red-400' : 'border-input-border text-foreground focus:border-accent'}`}
          aria-label={`${t.formatCode} ${title}`}
        />
        {pasteError && (
          <p className="text-xs text-red-400 mt-1">{t.invalidFormat}</p>
        )}
      </div>

      {/* 3-D model area — controlled externally */}
      {model3D && showModel && (
        <div className="mt-1">
          <p className="text-xs text-muted text-center mb-2">{t.model3DHint}</p>
          {model3D}
        </div>
      )}
    </div>
  );
}
