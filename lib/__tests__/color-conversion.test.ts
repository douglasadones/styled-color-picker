import { describe, it, expect } from 'vitest';
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
  formatRGB,
  formatCMYK,
  formatHSL,
  formatHSV,
  type RGBColor,
} from '../color-conversion';

// ---------------------------------------------------------------------------
// RGB → HSL
// ---------------------------------------------------------------------------
describe('rgbToHSL', () => {
  it('converts pure red', () => {
    expect(rgbToHSL({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
  });
  it('converts pure green', () => {
    expect(rgbToHSL({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, l: 50 });
  });
  it('converts pure blue', () => {
    expect(rgbToHSL({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, l: 50 });
  });
  it('converts black', () => {
    expect(rgbToHSL({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 });
  });
  it('converts white', () => {
    expect(rgbToHSL({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100 });
  });
  it('converts mid gray', () => {
    const { h, s, l } = rgbToHSL({ r: 128, g: 128, b: 128 });
    expect(h).toBe(0);
    expect(s).toBe(0);
    expect(l).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// HSL → RGB
// ---------------------------------------------------------------------------
describe('hslToRGB', () => {
  it('converts red', () => {
    expect(hslToRGB({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 });
  });
  it('converts green', () => {
    expect(hslToRGB({ h: 120, s: 100, l: 50 })).toEqual({ r: 0, g: 255, b: 0 });
  });
  it('converts blue', () => {
    expect(hslToRGB({ h: 240, s: 100, l: 50 })).toEqual({ r: 0, g: 0, b: 255 });
  });
  it('converts achromatic (gray)', () => {
    const result = hslToRGB({ h: 0, s: 0, l: 50 });
    expect(result.r).toBe(result.g);
    expect(result.g).toBe(result.b);
  });
});

// ---------------------------------------------------------------------------
// RGB → HSV
// ---------------------------------------------------------------------------
describe('rgbToHSV', () => {
  it('converts pure red', () => {
    expect(rgbToHSV({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, v: 100 });
  });
  it('converts pure green', () => {
    expect(rgbToHSV({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, v: 100 });
  });
  it('converts pure blue', () => {
    expect(rgbToHSV({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, v: 100 });
  });
  it('converts black', () => {
    expect(rgbToHSV({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, v: 0 });
  });
  it('converts white', () => {
    expect(rgbToHSV({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, v: 100 });
  });
});

// ---------------------------------------------------------------------------
// HSV → RGB
// ---------------------------------------------------------------------------
describe('hsvToRGB', () => {
  it('converts red', () => {
    expect(hsvToRGB({ h: 0, s: 100, v: 100 })).toEqual({ r: 255, g: 0, b: 0 });
  });
  it('converts green', () => {
    expect(hsvToRGB({ h: 120, s: 100, v: 100 })).toEqual({ r: 0, g: 255, b: 0 });
  });
  it('converts blue', () => {
    expect(hsvToRGB({ h: 240, s: 100, v: 100 })).toEqual({ r: 0, g: 0, b: 255 });
  });
  it('converts black (v=0)', () => {
    expect(hsvToRGB({ h: 0, s: 100, v: 0 })).toEqual({ r: 0, g: 0, b: 0 });
  });
  it('converts white (s=0, v=100)', () => {
    expect(hsvToRGB({ h: 0, s: 0, v: 100 })).toEqual({ r: 255, g: 255, b: 255 });
  });
});

// ---------------------------------------------------------------------------
// RGB → CMYK
// ---------------------------------------------------------------------------
describe('rgbToCMYK', () => {
  it('converts pure red', () => {
    expect(rgbToCMYK({ r: 255, g: 0, b: 0 })).toEqual({ c: 0, m: 100, y: 100, k: 0 });
  });
  it('converts pure green', () => {
    expect(rgbToCMYK({ r: 0, g: 255, b: 0 })).toEqual({ c: 100, m: 0, y: 100, k: 0 });
  });
  it('converts pure blue', () => {
    expect(rgbToCMYK({ r: 0, g: 0, b: 255 })).toEqual({ c: 100, m: 100, y: 0, k: 0 });
  });
  it('converts black', () => {
    expect(rgbToCMYK({ r: 0, g: 0, b: 0 })).toEqual({ c: 0, m: 0, y: 0, k: 100 });
  });
  it('converts white', () => {
    expect(rgbToCMYK({ r: 255, g: 255, b: 255 })).toEqual({ c: 0, m: 0, y: 0, k: 0 });
  });
});

// ---------------------------------------------------------------------------
// CMYK → RGB
// ---------------------------------------------------------------------------
describe('cmykToRGB', () => {
  it('converts red', () => {
    expect(cmykToRGB({ c: 0, m: 100, y: 100, k: 0 })).toEqual({ r: 255, g: 0, b: 0 });
  });
  it('converts black', () => {
    expect(cmykToRGB({ c: 0, m: 0, y: 0, k: 100 })).toEqual({ r: 0, g: 0, b: 0 });
  });
  it('converts white', () => {
    expect(cmykToRGB({ c: 0, m: 0, y: 0, k: 0 })).toEqual({ r: 255, g: 255, b: 255 });
  });
});

// ---------------------------------------------------------------------------
// RGB → HEX
// ---------------------------------------------------------------------------
describe('rgbToHex', () => {
  it('red', () => expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000'));
  it('green', () => expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00ff00'));
  it('blue', () => expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000ff'));
  it('white', () => expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff'));
  it('black', () => expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000'));
  it('pads single digits', () => expect(rgbToHex({ r: 1, g: 2, b: 3 })).toBe('#010203'));
  it('includes alpha when provided', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('#ff000080');
  });
  it('full alpha produces ff suffix', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0, a: 1 })).toBe('#000000ff');
  });
});

// ---------------------------------------------------------------------------
// HEX → RGB
// ---------------------------------------------------------------------------
describe('hexToRGB', () => {
  it('parses 6-digit hex', () => {
    expect(hexToRGB('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });
  it('parses 6-digit hex without hash', () => {
    expect(hexToRGB('ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });
  it('parses 3-digit shorthand', () => {
    expect(hexToRGB('#f00')).toEqual({ r: 255, g: 0, b: 0 });
  });
  it('parses 8-digit hex with alpha', () => {
    const result = hexToRGB('#ff000080');
    expect(result.r).toBe(255);
    expect(result.g).toBe(0);
    expect(result.b).toBe(0);
    expect(result.a).toBeCloseTo(0.502, 2);
  });
  it('returns black for invalid input', () => {
    expect(hexToRGB('#xyz')).toEqual({ r: 0, g: 0, b: 0 });
  });
});

// ---------------------------------------------------------------------------
// isValidHex
// ---------------------------------------------------------------------------
describe('isValidHex', () => {
  it('accepts #rrggbb', () => expect(isValidHex('#a1b2c3')).toBe(true));
  it('accepts #rgb', () => expect(isValidHex('#abc')).toBe(true));
  it('accepts #rrggbbaa', () => expect(isValidHex('#a1b2c3d4')).toBe(true));
  it('accepts without hash', () => expect(isValidHex('ff0000')).toBe(true));
  it('rejects invalid string', () => expect(isValidHex('#xyz')).toBe(false));
  it('rejects partial hex', () => expect(isValidHex('#ff00')).toBe(false));
  it('rejects empty string', () => expect(isValidHex('')).toBe(false));
});

// ---------------------------------------------------------------------------
// String parsers
// ---------------------------------------------------------------------------
describe('parseRGBString', () => {
  it('parses rgb()', () => {
    expect(parseRGBString('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
  });
  it('parses rgba()', () => {
    const result = parseRGBString('rgba(255, 0, 0, 0.5)');
    expect(result?.r).toBe(255);
    expect(result?.a).toBeCloseTo(0.5);
  });
  it('parses without spaces', () => {
    expect(parseRGBString('rgb(10,20,30)')).toEqual({ r: 10, g: 20, b: 30 });
  });
  it('returns null for invalid', () => {
    expect(parseRGBString('rgb(999, 0, 0)')).toBeNull();
    expect(parseRGBString('not a color')).toBeNull();
  });
});

describe('parseHSLString', () => {
  it('parses hsl()', () => {
    expect(parseHSLString('hsl(0, 100%, 50%)')).toEqual({ h: 0, s: 100, l: 50 });
  });
  it('parses without % symbols', () => {
    expect(parseHSLString('hsl(120, 100, 50)')).toEqual({ h: 120, s: 100, l: 50 });
  });
  it('returns null for invalid', () => {
    expect(parseHSLString('hsl(400, 100%, 50%)')).toBeNull();
    expect(parseHSLString('not valid')).toBeNull();
  });
});

describe('parseHSVString', () => {
  it('parses hsv()', () => {
    expect(parseHSVString('hsv(0, 100%, 100%)')).toEqual({ h: 0, s: 100, v: 100 });
  });
  it('returns null for invalid', () => {
    expect(parseHSVString('hsv(400, 50%, 50%)')).toBeNull();
  });
});

describe('parseCMYKString', () => {
  it('parses cmyk()', () => {
    expect(parseCMYKString('cmyk(0%, 100%, 100%, 0%)')).toEqual({ c: 0, m: 100, y: 100, k: 0 });
  });
  it('parses without % symbols', () => {
    expect(parseCMYKString('cmyk(10, 20, 30, 40)')).toEqual({ c: 10, m: 20, y: 30, k: 40 });
  });
  it('returns null for out-of-range', () => {
    expect(parseCMYKString('cmyk(200, 0, 0, 0)')).toBeNull();
  });
  it('returns null for invalid string', () => {
    expect(parseCMYKString('not a color')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Round-trip conversions
// ---------------------------------------------------------------------------
describe('Round-trip conversions', () => {
  const cases: RGBColor[] = [
    { r: 255, g: 0, b: 0 },
    { r: 0, g: 255, b: 0 },
    { r: 0, g: 0, b: 255 },
    { r: 100, g: 150, b: 200 },
    { r: 0, g: 0, b: 0 },
    { r: 255, g: 255, b: 255 },
  ];

  cases.forEach(({ r, g, b }) => {
    const label = `rgb(${r},${g},${b})`;

    it(`RGB → HSL → RGB: ${label}`, () => {
      const result = hslToRGB(rgbToHSL({ r, g, b }));
      expect(result.r).toBe(r);
      expect(result.g).toBe(g);
      expect(result.b).toBe(b);
    });

    it(`RGB → HSV → RGB: ${label}`, () => {
      const result = hsvToRGB(rgbToHSV({ r, g, b }));
      expect(result.r).toBe(r);
      expect(result.g).toBe(g);
      expect(result.b).toBe(b);
    });

    it(`RGB → CMYK → RGB: ${label}`, () => {
      const result = cmykToRGB(rgbToCMYK({ r, g, b }));
      expect(result.r).toBe(r);
      expect(result.g).toBe(g);
      expect(result.b).toBe(b);
    });

    it(`RGB → HEX → RGB: ${label}`, () => {
      const result = hexToRGB(rgbToHex({ r, g, b }));
      expect(result.r).toBe(r);
      expect(result.g).toBe(g);
      expect(result.b).toBe(b);
    });
  });
});

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------
describe('Formatters', () => {
  it('formatRGB without alpha', () => {
    expect(formatRGB({ r: 255, g: 0, b: 0 })).toBe('rgb(255, 0, 0)');
  });
  it('formatRGB with alpha', () => {
    expect(formatRGB({ r: 255, g: 0, b: 0, a: 0.5 }, true)).toBe('rgba(255, 0, 0, 0.50)');
  });
  it('formatCMYK', () => {
    expect(formatCMYK({ c: 0, m: 100, y: 100, k: 0 })).toBe('cmyk(0%, 100%, 100%, 0%)');
  });
  it('formatHSL', () => {
    expect(formatHSL({ h: 0, s: 100, l: 50 })).toBe('hsl(0, 100%, 50%)');
  });
  it('formatHSV', () => {
    expect(formatHSV({ h: 0, s: 100, v: 100 })).toBe('hsv(0, 100%, 100%)');
  });
});
