'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { isValidHex } from '@/lib/color-conversion';
import type { Translations } from '@/lib/i18n';
import type { RGBColor, HSVColor, CMYKColor, HSLColor } from '@/lib/color-conversion';

interface ColorPickerPanelProps {
  hsv: HSVColor;
  rgb: RGBColor;
  cmyk: CMYKColor;
  hsl: HSLColor;
  hex: string;
  includeAlpha: boolean;
  alpha: number;
  t: Translations;
  onHSVChange: (h: number, s: number, v: number) => void;
  onAlphaChange: (a: number) => void;
  onHexChange: (hex: string) => void;
}

// ---------------------------------------------------------------------------
// Canvas drawing helpers
// ---------------------------------------------------------------------------

function drawSVGradient(canvas: HTMLCanvasElement, hue: number): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
  ctx.fillRect(0, 0, width, height);
  const whiteGrad = ctx.createLinearGradient(0, 0, width, 0);
  whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
  whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = whiteGrad;
  ctx.fillRect(0, 0, width, height);
  const blackGrad = ctx.createLinearGradient(0, 0, 0, height);
  blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
  blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = blackGrad;
  ctx.fillRect(0, 0, width, height);
}

function drawAlphaCanvas(canvas: HTMLCanvasElement, rgb: RGBColor): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  const size = 6;
  for (let x = 0; x < width; x += size) {
    for (let y = 0; y < height; y += size) {
      ctx.fillStyle = (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0 ? '#555' : '#888';
      ctx.fillRect(x, y, size, size);
    }
  }
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
  grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},1)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

// ---------------------------------------------------------------------------
// Safe number helpers
// ---------------------------------------------------------------------------

function safeNum(v: number, fallback = 0): number {
  return Number.isFinite(v) ? v : fallback;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ColorPickerPanel({
  hsv,
  rgb,
  cmyk,
  hsl,
  hex,
  includeAlpha,
  alpha,
  t,
  onHSVChange,
  onAlphaChange,
  onHexChange,
}: ColorPickerPanelProps) {
  const svCanvasRef  = useRef<HTMLCanvasElement>(null);
  const alphaCanvasRef = useRef<HTMLCanvasElement>(null);
  const svAreaRef    = useRef<HTMLDivElement>(null);
  const hueTrackRef  = useRef<HTMLDivElement>(null);
  const alphaTrackRef = useRef<HTMLDivElement>(null);

  // Which area is being dragged
  const dragging = useRef<'sv' | 'hue' | 'alpha' | null>(null);

  const [hexInput, setHexInput] = useState(hex);
  const [hexError, setHexError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Sanitised HSV values — never NaN
  const H = safeNum(hsv.h, 0);
  const S = safeNum(hsv.s, 0);
  const V = safeNum(hsv.v, 100);
  const A = safeNum(alpha, 1);

  // ---------------------------------------------------------------------------
  // Canvas redraws
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (svCanvasRef.current) drawSVGradient(svCanvasRef.current, H);
  }, [H]);

  useEffect(() => {
    if (alphaCanvasRef.current && includeAlpha) drawAlphaCanvas(alphaCanvasRef.current, rgb);
  }, [rgb, includeAlpha]);

  // Sync hex field when external state changes
  useEffect(() => {
    setHexInput(hex);
    setHexError(false);
  }, [hex]);

  // ---------------------------------------------------------------------------
  // Unified pointer-position → value calculators
  // ---------------------------------------------------------------------------

  const svFromPointer = useCallback((clientX: number, clientY: number) => {
    const el = svAreaRef.current;
    if (!el) return { s: S, v: V };
    const rect = el.getBoundingClientRect();
    const s = Math.round(Math.max(0, Math.min(1, (clientX - rect.left)  / rect.width))  * 100);
    const v = Math.round(Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height)) * 100);
    return { s, v };
  }, [S, V]);

  const hueFromPointer = useCallback((clientX: number): number => {
    const el = hueTrackRef.current;
    if (!el) return H;
    const rect = el.getBoundingClientRect();
    return Math.round(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 360);
  }, [H]);

  const alphaFromPointer = useCallback((clientX: number): number => {
    const el = alphaTrackRef.current;
    if (!el) return A;
    const rect = el.getBoundingClientRect();
    return Math.round(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 100) / 100;
  }, [A]);

  // ---------------------------------------------------------------------------
  // Global pointer move / up (one listener for all drags)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      if (dragging.current === 'sv') {
        const { s, v } = svFromPointer(e.clientX, e.clientY);
        onHSVChange(H, s, v);
      } else if (dragging.current === 'hue') {
        const h = hueFromPointer(e.clientX);
        onHSVChange(h, S, V);
      } else if (dragging.current === 'alpha') {
        onAlphaChange(alphaFromPointer(e.clientX));
      }
    };
    const onUp = () => { dragging.current = null; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [H, S, V, svFromPointer, hueFromPointer, alphaFromPointer, onHSVChange, onAlphaChange]);

  // ---------------------------------------------------------------------------
  // Hex input
  // ---------------------------------------------------------------------------

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setHexInput(raw);
    const withHash = raw.startsWith('#') ? raw : `#${raw}`;
    if (isValidHex(withHash)) {
      setHexError(false);
      onHexChange(withHash);
    } else {
      setHexError(true);
    }
  };

  const handleCopyHex = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyFormat = (format: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // ---------------------------------------------------------------------------
  // Derived display values
  // ---------------------------------------------------------------------------

  const previewCSS = rgb.a !== undefined && includeAlpha
    ? `rgba(${rgb.r},${rgb.g},${rgb.b},${A})`
    : `rgb(${rgb.r},${rgb.g},${rgb.b})`;

  const svLeft  = `${S}%`;
  const svTop   = `${100 - V}%`;
  const hueLeft   = `${(H / 360) * 100}%`;
  const alphaLeft = `${A * 100}%`;

  // Quick-view data — safe values from the props
  const safeH_hsl = safeNum(hsl.h, 0);
  const safeS_hsl = safeNum(hsl.s, 0);
  const safeL_hsl = safeNum(hsl.l, 0);
  const safeH_hsv = safeNum(hsv.h, 0);
  const safeS_hsv = safeNum(hsv.s, 0);
  const safeV_hsv = safeNum(hsv.v, 0);

  const quickView = [
    {
      label: includeAlpha ? 'ARGB' : 'RGB',
      value: includeAlpha
        ? `${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.round(A * 100)}%`
        : `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    },
    { label: 'CMYK', value: `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%` },
    { label: 'HSV',  value: `${safeH_hsv}°, ${safeS_hsv}%, ${safeV_hsv}%` },
    { label: 'HSL',  value: `${safeH_hsl}°, ${safeS_hsl}%, ${safeL_hsl}%` },
  ];

  return (
    <div className="bg-panel rounded-xl overflow-hidden border border-panel-border">
      {/* Top: colour swatch + SV canvas */}
      <div className="flex" style={{ height: '180px' }}>
        {/* Colour swatch */}
        <div
          className="w-40 shrink-0 h-full"
          style={{ backgroundColor: previewCSS }}
          aria-label="Cor selecionada"
        />

        {/* SV gradient area */}
        <div
          ref={svAreaRef}
          className="relative flex-1 h-full cursor-crosshair select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            dragging.current = 'sv';
            const { s, v } = svFromPointer(e.clientX, e.clientY);
            onHSVChange(H, s, v);
          }}
        >
          <canvas
            ref={svCanvasRef}
            width={600}
            height={180}
            className="w-full h-full block pointer-events-none"
            aria-hidden="true"
          />
          {/* SV cursor ring */}
          <div
            className="absolute w-5 h-5 rounded-full border-2 border-white pointer-events-none"
            style={{
              left: svLeft,
              top: svTop,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 0 1.5px rgba(0,0,0,0.5)',
            }}
          />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="bg-panel-bottom px-4 py-3 flex flex-col gap-2.5">

        {/* Hue slider */}
        <div
          ref={hueTrackRef}
          role="slider"
          aria-label="Matiz"
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={H}
          tabIndex={0}
          className="relative h-4 rounded-full cursor-pointer select-none"
          style={{ background: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }}
          onPointerDown={(e) => {
            e.preventDefault();
            dragging.current = 'hue';
            onHSVChange(hueFromPointer(e.clientX), S, V);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') onHSVChange(Math.min(360, H + 1), S, V);
            if (e.key === 'ArrowLeft')  onHSVChange(Math.max(0,   H - 1), S, V);
          }}
        >
          {/* Hue thumb */}
          <div
            className="absolute top-1/2 w-5 h-5 rounded-full border-2 border-white pointer-events-none"
            style={{
              left: hueLeft,
              transform: 'translate(-50%, -50%)',
              backgroundColor: `hsl(${H}, 100%, 50%)`,
              boxShadow: '0 0 0 1.5px rgba(0,0,0,0.5)',
            }}
          />
        </div>

        {/* Alpha slider (if enabled) */}
        {includeAlpha && (
          <>
            <canvas ref={alphaCanvasRef} width={600} height={1} className="hidden" aria-hidden="true" />
            <div
              ref={alphaTrackRef}
              role="slider"
              aria-label="Alpha"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(A * 100)}
              tabIndex={0}
              className="relative h-4 rounded-full cursor-pointer select-none overflow-hidden"
              onPointerDown={(e) => {
                e.preventDefault();
                dragging.current = 'alpha';
                onAlphaChange(alphaFromPointer(e.clientX));
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') onAlphaChange(Math.min(1, A + 0.01));
                if (e.key === 'ArrowLeft')  onAlphaChange(Math.max(0, A - 0.01));
              }}
            >
              {/* Checkerboard */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ backgroundImage: 'repeating-conic-gradient(#555 0% 25%, #888 0% 50%)', backgroundSize: '12px 12px' }}
              />
              {/* Colour gradient */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: `linear-gradient(to right, rgba(${rgb.r},${rgb.g},${rgb.b},0), rgba(${rgb.r},${rgb.g},${rgb.b},1))` }}
              />
              {/* Alpha thumb */}
              <div
                className="absolute top-1/2 w-5 h-5 rounded-full border-2 border-white pointer-events-none"
                style={{
                  left: alphaLeft,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: `rgba(${rgb.r},${rgb.g},${rgb.b},${A})`,
                  boxShadow: '0 0 0 1.5px rgba(0,0,0,0.5)',
                }}
              />
            </div>
          </>
        )}

        {/* HEX row */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-mono uppercase tracking-widest w-8">{t.hexLabel}</span>
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInputChange}
            placeholder={t.hexPlaceholder}
            spellCheck={false}
            className={`flex-1 bg-input text-sm font-mono text-center py-1.5 px-2 rounded-md outline-none border transition-colors
              ${hexError
                ? 'border-red-500 text-red-400'
                : 'border-input-border text-foreground focus:border-accent'}`}
            aria-label="Código hexadecimal"
          />
          <button
            onClick={handleCopyHex}
            className="p-1.5 rounded-md text-muted hover:text-foreground transition-colors"
            title={t.copyLabel}
            aria-label={t.copyLabel}
          >
            {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
          </button>
        </div>

        {/* Quick-view row: RGB · CMYK · HSV · HSL */}
        <div className="grid grid-cols-4 gap-1">
          {quickView.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => handleCopyFormat(label, value)}
              className="bg-input rounded-md px-1 py-1.5 hover:bg-hover transition-colors group text-center"
              title={`${t.copyLabel}: ${value}`}
            >
              <p className="text-xs text-muted leading-none mb-0.5">{label}</p>
              <div className="flex items-center justify-center gap-0.5">
                <p className="text-xs font-mono text-foreground leading-snug truncate">
                  {value}
                </p>
                {copiedFormat === label
                  ? <Check size={10} className="text-green-400 shrink-0 ml-0.5" />
                  : <Copy  size={10} className="text-muted group-hover:text-foreground shrink-0 ml-0.5 transition-colors" />
                }
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
