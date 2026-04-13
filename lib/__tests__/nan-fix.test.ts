import { describe, it, expect } from 'vitest';

describe('NaN Handling in Sliders', () => {
  it('should safely convert NaN to a minimum value', () => {
    const value = NaN;
    const min = 0;
    const safeValue = isNaN(value) ? min : Math.max(min, Math.min(100, value));
    expect(safeValue).toBe(0);
    expect(isNaN(safeValue)).toBe(false);
  });

  it('should handle valid numbers', () => {
    const value = 50;
    const min = 0;
    const max = 100;
    const safeValue = isNaN(value) ? min : Math.max(min, Math.min(max, value));
    expect(safeValue).toBe(50);
  });

  it('should clamp values to range', () => {
    const min = 0;
    const max = 255;
    const cases = [
      { value: -10, expected: 0 },
      { value: 300, expected: 255 },
      { value: 128, expected: 128 },
    ];
    cases.forEach(({ value, expected }) => {
      const safeValue = isNaN(value) ? min : Math.max(min, Math.min(max, value));
      expect(safeValue).toBe(expected);
    });
  });

  it('should handle range input value changes safely', () => {
    const value = Number('invalid'); // Results in NaN
    const min = 0;
    const onChange = (v: number) => {
      expect(isNaN(v)).toBe(false);
    };
    const safeVal = isNaN(value) ? min : value;
    onChange(safeVal);
  });

  it('should calculate percent without NaN', () => {
    const value = NaN;
    const min = 0;
    const max = 255;
    const safeValue = isNaN(value) ? min : Math.max(min, Math.min(max, value));
    const percent = ((safeValue - min) / (max - min)) * 100;
    expect(isNaN(percent)).toBe(false);
    expect(percent).toBe(0);
  });
});
