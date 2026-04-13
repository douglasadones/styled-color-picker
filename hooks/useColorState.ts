'use client';

import { useState, useCallback } from 'react';
import {
  rgbToHSL,
  hslToRGB,
  rgbToHSV,
  hsvToRGB,
  rgbToCMYK,
  cmykToRGB,
  rgbToHex,
  hexToRGB,
  isValidHex,
  parseRGBString,
  parseHSLString,
  parseHSVString,
  parseCMYKString,
  type RGBColor,
  type CMYKColor,
  type HSLColor,
  type HSVColor,
} from '@/lib/color-conversion';

export type ColorFormat = 'RGB' | 'CMYK' | 'HSL' | 'HSV';

export interface ColorState {
  rgb: RGBColor;
  cmyk: CMYKColor;
  hsl: HSLColor;
  hsv: HSVColor;
  hex: string;
  includeAlpha: boolean;
}

/** Derive all colour spaces from a single RGB value */
function deriveAllFromRGB(rgb: RGBColor, includeAlpha: boolean): ColorState {
  const baseRGB = includeAlpha ? rgb : { r: rgb.r, g: rgb.g, b: rgb.b };
  return {
    rgb: baseRGB,
    cmyk: rgbToCMYK(baseRGB),
    hsl: rgbToHSL(baseRGB),
    hsv: rgbToHSV(baseRGB),
    hex: rgbToHex(baseRGB),
    includeAlpha,
  };
}

export function useColorState(initialHex = '#FF0000') {
  const [state, setState] = useState<ColorState>(() => {
    const rgb = hexToRGB(initialHex);
    return deriveAllFromRGB(rgb, false);
  });

  // ------------------------------------------------------------------
  // Core updaters – each accepts its native type and recalculates all
  // ------------------------------------------------------------------

  const updateFromRGB = useCallback((rgb: RGBColor) => {
    setState((prev) => {
      const withAlpha = prev.includeAlpha
        ? { ...rgb, a: rgb.a ?? prev.rgb.a ?? 1 }
        : { r: rgb.r, g: rgb.g, b: rgb.b };
      return deriveAllFromRGB(withAlpha, prev.includeAlpha);
    });
  }, []);

  const updateFromHSL = useCallback((hsl: HSLColor) => {
    setState((prev) => {
      const rgb = hslToRGB(hsl);
      const withAlpha = prev.includeAlpha
        ? { ...rgb, a: prev.rgb.a ?? 1 }
        : rgb;
      return { ...deriveAllFromRGB(withAlpha, prev.includeAlpha), hsl };
    });
  }, []);

  const updateFromHSV = useCallback((hsv: HSVColor) => {
    setState((prev) => {
      const rgb = hsvToRGB(hsv);
      const withAlpha = prev.includeAlpha
        ? { ...rgb, a: prev.rgb.a ?? 1 }
        : rgb;
      return { ...deriveAllFromRGB(withAlpha, prev.includeAlpha), hsv };
    });
  }, []);

  const updateFromCMYK = useCallback((cmyk: CMYKColor) => {
    setState((prev) => {
      const rgb = cmykToRGB(cmyk);
      const withAlpha = prev.includeAlpha
        ? { ...rgb, a: prev.rgb.a ?? 1 }
        : rgb;
      return { ...deriveAllFromRGB(withAlpha, prev.includeAlpha), cmyk };
    });
  }, []);

  /** Update from a validated hex string (#rrggbb or #rrggbbaa) */
  const updateFromHex = useCallback((hex: string) => {
    if (!isValidHex(hex)) return;
    const rgb = hexToRGB(hex);
    const hasAlpha = rgb.a !== undefined;
    setState((prev) => {
      return deriveAllFromRGB(rgb, hasAlpha || prev.includeAlpha);
    });
  }, []);

  // ------------------------------------------------------------------
  // Paste parsers – parse a full CSS string and update accordingly
  // ------------------------------------------------------------------

  /** Try to parse a pasted RGB/RGBA string and update state */
  const updateFromRGBString = useCallback((raw: string): boolean => {
    const parsed = parseRGBString(raw);
    if (!parsed) return false;
    setState((prev) => {
      const hasAlpha = parsed.a !== undefined;
      const newInclude = hasAlpha || prev.includeAlpha;
      return deriveAllFromRGB(parsed, newInclude);
    });
    return true;
  }, []);

  /** Try to parse a pasted HSL string and update state */
  const updateFromHSLString = useCallback((raw: string): boolean => {
    const parsed = parseHSLString(raw);
    if (!parsed) return false;
    setState((prev) => {
      const rgb = hslToRGB(parsed);
      const withAlpha = prev.includeAlpha ? { ...rgb, a: prev.rgb.a ?? 1 } : rgb;
      return { ...deriveAllFromRGB(withAlpha, prev.includeAlpha), hsl: parsed };
    });
    return true;
  }, []);

  /** Try to parse a pasted HSV string and update state */
  const updateFromHSVString = useCallback((raw: string): boolean => {
    const parsed = parseHSVString(raw);
    if (!parsed) return false;
    setState((prev) => {
      const rgb = hsvToRGB(parsed);
      const withAlpha = prev.includeAlpha ? { ...rgb, a: prev.rgb.a ?? 1 } : rgb;
      return { ...deriveAllFromRGB(withAlpha, prev.includeAlpha), hsv: parsed };
    });
    return true;
  }, []);

  /** Try to parse a pasted CMYK string and update state */
  const updateFromCMYKString = useCallback((raw: string): boolean => {
    const parsed = parseCMYKString(raw);
    if (!parsed) return false;
    setState((prev) => {
      const rgb = cmykToRGB(parsed);
      const withAlpha = prev.includeAlpha ? { ...rgb, a: prev.rgb.a ?? 1 } : rgb;
      return { ...deriveAllFromRGB(withAlpha, prev.includeAlpha), cmyk: parsed };
    });
    return true;
  }, []);

  // ------------------------------------------------------------------
  // Alpha helpers
  // ------------------------------------------------------------------

  const updateAlpha = useCallback((alpha: number) => {
    setState((prev) => {
      const newRGB = { ...prev.rgb, a: Math.max(0, Math.min(1, alpha)) };
      return {
        ...prev,
        rgb: newRGB,
        hex: rgbToHex(newRGB),
      };
    });
  }, []);

  const toggleAlpha = useCallback(() => {
    setState((prev) => {
      const newInclude = !prev.includeAlpha;
      const newRGB = newInclude
        ? { ...prev.rgb, a: prev.rgb.a ?? 1 }
        : { r: prev.rgb.r, g: prev.rgb.g, b: prev.rgb.b };
      return {
        ...prev,
        rgb: newRGB,
        includeAlpha: newInclude,
        hex: rgbToHex(newRGB),
      };
    });
  }, []);

  // ------------------------------------------------------------------
  // Color-picker convenience helper (HSV coords from canvas)
  // ------------------------------------------------------------------

  const setColorFromHSV = useCallback((h: number, s: number, v: number) => {
    setState((prev) => {
      const rgb = hsvToRGB({ h, s, v });
      const withAlpha = prev.includeAlpha
        ? { ...rgb, a: prev.rgb.a ?? 1 }
        : rgb;
      return { ...deriveAllFromRGB(withAlpha, prev.includeAlpha), hsv: { h, s, v } };
    });
  }, []);

  return {
    state,
    updateFromRGB,
    updateFromHSL,
    updateFromHSV,
    updateFromCMYK,
    updateFromHex,
    updateFromRGBString,
    updateFromHSLString,
    updateFromHSVString,
    updateFromCMYKString,
    updateAlpha,
    toggleAlpha,
    setColorFromHSV,
  };
}
