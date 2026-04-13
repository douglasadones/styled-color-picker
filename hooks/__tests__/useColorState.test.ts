import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useColorState } from '../useColorState';

describe('useColorState Hook', () => {
  describe('Initialization', () => {
    it('should initialize with default red color', () => {
      const { result } = renderHook(() => useColorState());
      
      expect(result.current.state.rgb.r).toBe(255);
      expect(result.current.state.rgb.g).toBe(0);
      expect(result.current.state.rgb.b).toBe(0);
      expect(result.current.state.hex).toBe('#ff0000');
    });

    it('should initialize with custom hex color', () => {
      const { result } = renderHook(() => useColorState('#0000ff'));
      
      expect(result.current.state.rgb.r).toBe(0);
      expect(result.current.state.rgb.g).toBe(0);
      expect(result.current.state.rgb.b).toBe(255);
      expect(result.current.state.hex).toBe('#0000ff');
    });

    it('should have alpha disabled by default', () => {
      const { result } = renderHook(() => useColorState());
      
      expect(result.current.state.includeAlpha).toBe(false);
    });
  });

  describe('RGB Updates', () => {
    it('should update RGB and sync all formats', () => {
      const { result } = renderHook(() => useColorState());

      act(() => {
        result.current.updateFromRGB({ r: 100, g: 150, b: 200 });
      });

      expect(result.current.state.rgb.r).toBe(100);
      expect(result.current.state.rgb.g).toBe(150);
      expect(result.current.state.rgb.b).toBe(200);
      
      // HSL should be updated
      expect(result.current.state.hsl.h).not.toBeNaN();
      expect(result.current.state.hsl.s).not.toBeNaN();
      expect(result.current.state.hsl.l).not.toBeNaN();
      
      // HSV should be updated
      expect(result.current.state.hsv.h).not.toBeNaN();
      expect(result.current.state.hsv.s).not.toBeNaN();
      expect(result.current.state.hsv.v).not.toBeNaN();
      
      // CMYK should be updated
      expect(result.current.state.cmyk.c).not.toBeNaN();
      expect(result.current.state.cmyk.m).not.toBeNaN();
      expect(result.current.state.cmyk.y).not.toBeNaN();
      expect(result.current.state.cmyk.k).not.toBeNaN();
    });
  });

  describe('HSL Updates', () => {
    it('should update HSL and sync RGB', () => {
      const { result } = renderHook(() => useColorState());

      act(() => {
        result.current.updateFromHSL({ h: 120, s: 100, l: 50 });
      });

      expect(result.current.state.hsl.h).toBe(120);
      expect(result.current.state.hsl.s).toBe(100);
      expect(result.current.state.hsl.l).toBe(50);
      
      // RGB should be green
      expect(result.current.state.rgb.r).toBe(0);
      expect(result.current.state.rgb.g).toBe(255);
      expect(result.current.state.rgb.b).toBe(0);
    });
  });

  describe('HSV Updates', () => {
    it('should update HSV and sync RGB', () => {
      const { result } = renderHook(() => useColorState());

      act(() => {
        result.current.updateFromHSV({ h: 240, s: 100, v: 100 });
      });

      expect(result.current.state.hsv.h).toBe(240);
      expect(result.current.state.hsv.s).toBe(100);
      expect(result.current.state.hsv.v).toBe(100);
      
      // RGB should be blue
      expect(result.current.state.rgb.r).toBe(0);
      expect(result.current.state.rgb.g).toBe(0);
      expect(result.current.state.rgb.b).toBe(255);
    });
  });

  describe('CMYK Updates', () => {
    it('should update CMYK and sync RGB', () => {
      const { result } = renderHook(() => useColorState());

      act(() => {
        result.current.updateFromCMYK({ c: 100, m: 0, y: 100, k: 0 });
      });

      expect(result.current.state.cmyk.c).toBe(100);
      expect(result.current.state.cmyk.m).toBe(0);
      expect(result.current.state.cmyk.y).toBe(100);
      expect(result.current.state.cmyk.k).toBe(0);
      
      // RGB should be green
      expect(result.current.state.rgb.r).toBe(0);
      expect(result.current.state.rgb.g).toBe(255);
      expect(result.current.state.rgb.b).toBe(0);
    });
  });

  describe('Hex Updates', () => {
    it('should update from hex and sync all formats', () => {
      const { result } = renderHook(() => useColorState());

      act(() => {
        result.current.updateFromHex('#00ff00');
      });

      expect(result.current.state.hex).toBe('#00ff00');
      expect(result.current.state.rgb.r).toBe(0);
      expect(result.current.state.rgb.g).toBe(255);
      expect(result.current.state.rgb.b).toBe(0);
    });
  });

  describe('Alpha Channel', () => {
    it('should toggle alpha channel', () => {
      const { result } = renderHook(() => useColorState());

      expect(result.current.state.includeAlpha).toBe(false);

      act(() => {
        result.current.toggleAlpha();
      });

      expect(result.current.state.includeAlpha).toBe(true);

      act(() => {
        result.current.toggleAlpha();
      });

      expect(result.current.state.includeAlpha).toBe(false);
    });

    it('should update alpha value', () => {
      const { result } = renderHook(() => useColorState());

      act(() => {
        result.current.toggleAlpha();
      });

      act(() => {
        result.current.updateAlpha(0.5);
      });

      expect(result.current.state.rgb.a).toBe(0.5);
    });

    it('should preserve alpha when updating colors', () => {
      const { result } = renderHook(() => useColorState());

      act(() => {
        result.current.toggleAlpha();
        result.current.updateAlpha(0.7);
      });

      act(() => {
        result.current.setColorFromHSV(120, 100, 100);
      });

      expect(result.current.state.rgb.a).toBe(0.7);
    });

    it('should clamp alpha to 0-1 range', () => {
      const { result } = renderHook(() => useColorState());

      act(() => {
        result.current.toggleAlpha();
        result.current.updateAlpha(1.5);
      });

      expect(result.current.state.rgb.a).toBe(1);

      act(() => {
        result.current.updateAlpha(-0.5);
      });

      expect(result.current.state.rgb.a).toBe(0);
    });
  });

  describe('Color Picker Integration', () => {
    it('should update color from HSV picker values', () => {
      const { result } = renderHook(() => useColorState());

      act(() => {
        result.current.setColorFromHSV(0, 100, 100);
      });

      // Should be red
      expect(result.current.state.rgb.r).toBe(255);
      expect(result.current.state.rgb.g).toBe(0);
      expect(result.current.state.rgb.b).toBe(0);
    });

    it('should maintain color consistency across all formats', () => {
      const { result } = renderHook(() => useColorState());

      act(() => {
        result.current.setColorFromHSV(200, 80, 90);
      });

      // Verify all formats have the same color
      const rgb = result.current.state.rgb;
      const fromHSL = result.current.updateFromHSL(result.current.state.hsl);
      const fromHSV = result.current.updateFromHSV(result.current.state.hsv);
      const fromCMYK = result.current.updateFromCMYK(result.current.state.cmyk);

      // After updating from HSL, RGB should stay the same
      expect(result.current.state.rgb.r).toBe(rgb.r);
      expect(result.current.state.rgb.g).toBe(rgb.g);
      expect(result.current.state.rgb.b).toBe(rgb.b);
    });
  });

  describe('Hex with Alpha', () => {
    it('should include alpha in hex when enabled', () => {
      const { result } = renderHook(() => useColorState());

      act(() => {
        result.current.toggleAlpha();
        result.current.updateAlpha(0.5);
      });

      // Hex should include alpha channel
      expect(result.current.state.hex.length).toBe(9); // #RRGGBBAA
    });

    it('should exclude alpha from hex when disabled', () => {
      const { result } = renderHook(() => useColorState());

      // Default without alpha
      expect(result.current.state.hex.length).toBe(7); // #RRGGBB
    });
  });
});
