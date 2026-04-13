/**
 * Color Conversion Utilities
 * Bidirectional conversion between RGB, CMYK, HSL and HSV,
 * plus string-parsing helpers for user-pasted codes.
 */

export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a?: number; // 0-1 (optional alpha)
}

export interface CMYKColor {
  c: number; // 0-100
  m: number; // 0-100
  y: number; // 0-100
  k: number; // 0-100
}

export interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface HSVColor {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

// ---------------------------------------------------------------------------
// Internal normalisation helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeRGB(value: number): number {
  return Math.round(clamp(value, 0, 255));
}

function normalizePercent(value: number): number {
  return clamp(value, 0, 100);
}

function normalizeAngle(value: number): number {
  const mod = value % 360;
  return mod < 0 ? mod + 360 : mod;
}

function normalizeAlpha(value: number): number {
  return clamp(value, 0, 1);
}

// ---------------------------------------------------------------------------
// RGB <-> HSL
// ---------------------------------------------------------------------------

/** Convert RGB (0-255 each) to HSL (h:0-360, s/l:0-100) */
export function rgbToHSL(rgb: RGBColor): HSLColor {
  const r = clamp(rgb.r, 0, 255) / 255;
  const g = clamp(rgb.g, 0, 255) / 255;
  const b = clamp(rgb.b, 0, 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  // Achromatic (grey) — no hue or saturation
  if (delta === 0) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / delta + 2) / 6;
  else h = ((r - g) / delta + 4) / 6;

  const hResult = Math.round(h * 360);
  const sResult = Math.round(s * 100);
  const lResult = Math.round(l * 100);

  return {
    h: Number.isFinite(hResult) ? hResult : 0,
    s: Number.isFinite(sResult) ? sResult : 0,
    l: Number.isFinite(lResult) ? lResult : 0,
  };
}

/** Convert HSL (h:0-360, s/l:0-100) to RGB (0-255 each) */
export function hslToRGB(hsl: HSLColor): RGBColor {
  const h = normalizeAngle(hsl.h) / 360;
  const s = normalizePercent(hsl.s) / 100;
  const l = normalizePercent(hsl.l) / 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: normalizeRGB(hue2rgb(p, q, h + 1 / 3) * 255),
    g: normalizeRGB(hue2rgb(p, q, h) * 255),
    b: normalizeRGB(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

// ---------------------------------------------------------------------------
// RGB <-> HSV
// ---------------------------------------------------------------------------

/** Convert RGB (0-255 each) to HSV (h:0-360, s/v:0-100) */
export function rgbToHSV(rgb: RGBColor): HSVColor {
  const r = clamp(rgb.r, 0, 255) / 255;
  const g = clamp(rgb.g, 0, 255) / 255;
  const b = clamp(rgb.b, 0, 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  // Pure black
  if (max === 0) return { h: 0, s: 0, v: 0 };

  const v = max;
  // Achromatic (grey)
  const s = delta === 0 ? 0 : delta / max;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / delta + 2) / 6;
    else h = ((r - g) / delta + 4) / 6;
  }

  const hResult = Math.round(h * 360);
  const sResult = Math.round(s * 100);
  const vResult = Math.round(v * 100);

  return {
    h: Number.isFinite(hResult) ? hResult : 0,
    s: Number.isFinite(sResult) ? sResult : 0,
    v: Number.isFinite(vResult) ? vResult : 0,
  };
}

/** Convert HSV (h:0-360, s/v:0-100) to RGB (0-255 each) */
export function hsvToRGB(hsv: HSVColor): RGBColor {
  const h = normalizeAngle(hsv.h) / 60;
  const s = normalizePercent(hsv.s) / 100;
  const v = normalizePercent(hsv.v) / 100;

  const c = v * s;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 1)      [r, g, b] = [c, x, 0];
  else if (h >= 1 && h < 2) [r, g, b] = [x, c, 0];
  else if (h >= 2 && h < 3) [r, g, b] = [0, c, x];
  else if (h >= 3 && h < 4) [r, g, b] = [0, x, c];
  else if (h >= 4 && h < 5) [r, g, b] = [x, 0, c];
  else                       [r, g, b] = [c, 0, x];

  return {
    r: normalizeRGB((r + m) * 255),
    g: normalizeRGB((g + m) * 255),
    b: normalizeRGB((b + m) * 255),
  };
}

// ---------------------------------------------------------------------------
// RGB <-> CMYK
// ---------------------------------------------------------------------------

/** Convert RGB (0-255 each) to CMYK (0-100 each) */
export function rgbToCMYK(rgb: RGBColor): CMYKColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const k = 1 - Math.max(r, g, b);

  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };

  const denom = 1 - k;
  const c = denom === 0 ? 0 : Math.round(((1 - r - k) / denom) * 100);
  const m = denom === 0 ? 0 : Math.round(((1 - g - k) / denom) * 100);
  const y = denom === 0 ? 0 : Math.round(((1 - b - k) / denom) * 100);
  return {
    c: Number.isFinite(c) ? c : 0,
    m: Number.isFinite(m) ? m : 0,
    y: Number.isFinite(y) ? y : 0,
    k: Math.round(k * 100),
  };
}

/** Convert CMYK (0-100 each) to RGB (0-255 each) */
export function cmykToRGB(cmyk: CMYKColor): RGBColor {
  const c = normalizePercent(cmyk.c) / 100;
  const m = normalizePercent(cmyk.m) / 100;
  const y = normalizePercent(cmyk.y) / 100;
  const k = normalizePercent(cmyk.k) / 100;

  return {
    r: normalizeRGB(255 * (1 - c) * (1 - k)),
    g: normalizeRGB(255 * (1 - m) * (1 - k)),
    b: normalizeRGB(255 * (1 - y) * (1 - k)),
  };
}

// ---------------------------------------------------------------------------
// RGB <-> Hexadecimal
// ---------------------------------------------------------------------------

/** Convert RGB (optionally with alpha) to hex string (#rrggbb or #rrggbbaa) */
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number): string => {
    const h = normalizeRGB(n).toString(16);
    return h.length === 1 ? '0' + h : h;
  };

  const base = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  if (rgb.a !== undefined) {
    const alphaHex = Math.round(normalizeAlpha(rgb.a) * 255)
      .toString(16)
      .padStart(2, '0');
    return base + alphaHex;
  }
  return base;
}

/** Convert hex string (#rgb, #rrggbb or #rrggbbaa) to RGB */
export function hexToRGB(hex: string): RGBColor {
  const cleaned = hex.replace('#', '').toLowerCase();

  // Short form #rgb -> #rrggbb
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return { r, g, b };
  }

  if (cleaned.length === 6) {
    return {
      r: parseInt(cleaned.slice(0, 2), 16),
      g: parseInt(cleaned.slice(2, 4), 16),
      b: parseInt(cleaned.slice(4, 6), 16),
    };
  }

  if (cleaned.length === 8) {
    return {
      r: parseInt(cleaned.slice(0, 2), 16),
      g: parseInt(cleaned.slice(2, 4), 16),
      b: parseInt(cleaned.slice(4, 6), 16),
      a: parseInt(cleaned.slice(6, 8), 16) / 255,
    };
  }

  return { r: 0, g: 0, b: 0 };
}

/** Validate whether a string is a valid hex colour */
export function isValidHex(hex: string): boolean {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(hex.trim());
}

// ---------------------------------------------------------------------------
// String parsers – let users paste CSS colour strings directly
// ---------------------------------------------------------------------------

/** Parse an rgb() or rgba() string. Returns null on failure. */
export function parseRGBString(value: string): RGBColor | null {
  const trimmed = value.trim();
  // rgba(r, g, b, a) or rgb(r, g, b)
  const match = trimmed.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+))?\s*\)$/i
  );
  if (!match) return null;

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);

  if (r > 255 || g > 255 || b > 255) return null;

  const result: RGBColor = { r, g, b };
  if (match[4] !== undefined) {
    result.a = parseFloat(match[4]);
    if (result.a > 1) result.a = result.a / 255; // handle 0-255 alpha
    result.a = normalizeAlpha(result.a);
  }
  return result;
}

/** Parse an hsl() string. Returns null on failure. */
export function parseHSLString(value: string): HSLColor | null {
  const trimmed = value.trim();
  const match = trimmed.match(
    /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*(?:,\s*[\d.]+)?\s*\)$/i
  );
  if (!match) return null;

  const h = parseFloat(match[1]);
  const s = parseFloat(match[2]);
  const l = parseFloat(match[3]);

  if (h > 360 || s > 100 || l > 100) return null;
  return { h: Math.round(h), s: Math.round(s), l: Math.round(l) };
}

/** Parse an hsv() string. Returns null on failure. */
export function parseHSVString(value: string): HSVColor | null {
  const trimmed = value.trim();
  const match = trimmed.match(
    /^hsv\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*\)$/i
  );
  if (!match) return null;

  const h = parseFloat(match[1]);
  const s = parseFloat(match[2]);
  const v = parseFloat(match[3]);

  if (h > 360 || s > 100 || v > 100) return null;
  return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
}

/** Parse a cmyk() string. Returns null on failure. */
export function parseCMYKString(value: string): CMYKColor | null {
  const trimmed = value.trim();
  const match = trimmed.match(
    /^cmyk\(\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*\)$/i
  );
  if (!match) return null;

  const c = parseFloat(match[1]);
  const m = parseFloat(match[2]);
  const y = parseFloat(match[3]);
  const k = parseFloat(match[4]);

  if (c > 100 || m > 100 || y > 100 || k > 100) return null;
  return { c: Math.round(c), m: Math.round(m), y: Math.round(y), k: Math.round(k) };
}

// ---------------------------------------------------------------------------
// Formatters – canonical string representations
// ---------------------------------------------------------------------------

export function formatRGB(rgb: RGBColor, includeAlpha = false): string {
  if (includeAlpha && rgb.a !== undefined) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a.toFixed(2)})`;
  }
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function formatCMYK(cmyk: CMYKColor): string {
  return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
}

export function formatHSL(hsl: HSLColor): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

export function formatHSV(hsv: HSVColor): string {
  return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
}
