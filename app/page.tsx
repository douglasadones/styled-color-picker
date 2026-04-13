'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Box, Play, Pause } from 'lucide-react';
import { useColorState } from '@/hooks/useColorState';
import { ColorPickerPanel } from '@/components/ColorPickerPanel';
import { FormatCard } from '@/components/FormatCard';
import { ColorModel3DLazy as ColorModel3D } from '@/components/ColorModel3DLazy';
import { formatRGB, formatCMYK, formatHSL, formatHSV } from '@/lib/color-conversion';
import { getTranslations, type Language } from '@/lib/i18n';
import type { SliderDef } from '@/components/FormatCard';

type Theme = 'dark' | 'light';

export default function Home() {
  const [lang, setLang] = useState<Language>('pt-BR');
  const [theme, setTheme] = useState<Theme>('dark');
  const [show3D, setShow3D] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const t = getTranslations(lang);

  // Apply theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  const {
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
  } = useColorState('#E03535');

  const { rgb, hsl, hsv, cmyk, hex, includeAlpha } = state;
  const alpha = rgb.a ?? 1;

  // ------------------------------------------------------------------
  // Helper: guarantee slider value is always a finite number
  // ------------------------------------------------------------------
  const safe = (v: number, fallback = 0): number =>
    Number.isFinite(v) ? v : fallback;

  // ------------------------------------------------------------------
  // Slider definitions per format
  // ------------------------------------------------------------------

  const rgbSliders: SliderDef[] = [
    { key: 'r', label: t.sliderRed,   value: safe(rgb.r), min: 0, max: 255, unit: '',  trackColor: '#ef4444' },
    { key: 'g', label: t.sliderGreen, value: safe(rgb.g), min: 0, max: 255, unit: '',  trackColor: '#22c55e' },
    { key: 'b', label: t.sliderBlue,  value: safe(rgb.b), min: 0, max: 255, unit: '',  trackColor: '#3b82f6' },
    ...(includeAlpha
      ? [{ key: 'a', label: t.sliderAlpha, value: safe(Math.round(alpha * 100)), min: 0, max: 100, unit: '%', trackColor: '#a78bfa' }]
      : []),
  ];

  const hslH = safe(hsl.h);
  const hslSliders: SliderDef[] = [
    { key: 'h', label: t.sliderHue,        value: hslH,         min: 0, max: 360, unit: '°', trackColor: `hsl(${hslH},100%,50%)` },
    { key: 's', label: t.sliderSaturation, value: safe(hsl.s),  min: 0, max: 100, unit: '%', trackColor: '#6b7cff' },
    { key: 'l', label: t.sliderLightness,  value: safe(hsl.l),  min: 0, max: 100, unit: '%', trackColor: '#f59e0b' },
  ];

  const hsvH = safe(hsv.h);
  const hsvSliders: SliderDef[] = [
    { key: 'h', label: t.sliderHue,        value: hsvH,         min: 0, max: 360, unit: '°', trackColor: `hsl(${hsvH},100%,50%)` },
    { key: 's', label: t.sliderSaturation, value: safe(hsv.s),  min: 0, max: 100, unit: '%', trackColor: '#6b7cff' },
    { key: 'v', label: t.sliderValue,      value: safe(hsv.v),  min: 0, max: 100, unit: '%', trackColor: '#10b981' },
  ];

  const cmykSliders: SliderDef[] = [
    { key: 'c', label: t.sliderCyan,    value: safe(cmyk.c), min: 0, max: 100, unit: '%', trackColor: '#06b6d4' },
    { key: 'm', label: t.sliderMagenta, value: safe(cmyk.m), min: 0, max: 100, unit: '%', trackColor: '#ec4899' },
    { key: 'y', label: t.sliderYellow,  value: safe(cmyk.y), min: 0, max: 100, unit: '%', trackColor: '#eab308' },
    { key: 'k', label: t.sliderBlack,   value: safe(cmyk.k), min: 0, max: 100, unit: '%', trackColor: '#94a3b8' },
  ];

  // ------------------------------------------------------------------
  // Slider change handlers
  // ------------------------------------------------------------------

  const handleRGBSlider = (key: string, value: number) => {
    if (key === 'a') { updateAlpha(value / 100); return; }
    updateFromRGB({ ...rgb, [key]: value });
  };

  const handleHSLSlider = (key: string, value: number) =>
    updateFromHSL({ ...hsl, [key]: value });

  const handleHSVSlider = (key: string, value: number) =>
    updateFromHSV({ ...hsv, [key]: value });

  const handleCMYKSlider = (key: string, value: number) =>
    updateFromCMYK({ ...cmyk, [key]: value });

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-panel-border">
        <div>
          <h1 className="text-lg font-semibold text-foreground leading-tight">
            {t.appTitle}
          </h1>
          <p className="text-xs text-muted mt-0.5">{t.appSubtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-panel-border text-muted hover:text-foreground hover:border-accent transition-colors"
            aria-label={theme === 'dark' ? t.themeToggleLight : t.themeToggleDark}
          >
            {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            <span>{theme === 'dark' ? t.themeToggleLight : t.themeToggleDark}</span>
          </button>
          {/* Language toggle */}
          <button
            onClick={() => setLang((l) => (l === 'pt-BR' ? 'en' : 'pt-BR'))}
            className="text-xs font-medium px-3 py-1.5 rounded-md border border-panel-border text-muted hover:text-foreground hover:border-accent transition-colors"
            aria-label="Trocar idioma"
          >
            {t.langToggle}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 flex flex-col gap-5 max-w-screen-2xl mx-auto">

        {/* ─── Main picker panel ─── */}
        <ColorPickerPanel
          hsv={hsv}
          rgb={rgb}
          cmyk={cmyk}
          hsl={hsl}
          hex={hex}
          includeAlpha={includeAlpha}
          alpha={alpha}
          t={t}
          onHSVChange={(h, s, v) => setColorFromHSV(h, s, v)}
          onAlphaChange={updateAlpha}
          onHexChange={updateFromHex}
        />

        {/* ─── 3D Models Control Bar ─── */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShow3D(!show3D)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all border
              ${show3D 
                ? 'bg-accent text-accent-foreground border-accent' 
                : 'bg-panel text-muted border-panel-border hover:border-accent hover:text-foreground'}`}
            aria-pressed={show3D}
          >
            <Box size={14} />
            <span>{show3D ? t.hideAll3D : t.showAll3D}</span>
          </button>

          {show3D && (
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-panel text-muted border border-panel-border hover:border-accent hover:text-foreground transition-all"
              aria-pressed={!autoRotate}
            >
              {autoRotate ? <Pause size={14} /> : <Play size={14} />}
              <span>{autoRotate ? t.stopRotation : t.startRotation}</span>
            </button>
          )}
        </div>

        {/* ─── Format cards row ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* RGB */}
          <FormatCard
            title={includeAlpha ? 'ARGB' : 'RGB'}
            formatString={formatRGB(rgb, includeAlpha)}
            placeholder={t.formatCodePlaceholder['RGB']}
            sliders={rgbSliders}
            onSliderChange={handleRGBSlider}
            onStringPaste={updateFromRGBString}
            t={t}
            showModel={show3D}
            model3D={<ColorModel3D type="RGB" rgb={rgb} hsv={hsv} hsl={hsl} cmyk={cmyk} autoRotate={autoRotate} />}
          >
            {/* Alpha toggle – subtle link style */}
            <button
              onClick={toggleAlpha}
              className={`text-xs mt-1 transition-colors ${
                includeAlpha
                  ? 'text-accent hover:text-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
              aria-pressed={includeAlpha}
            >
              {includeAlpha ? `— ${t.disableAlpha}` : `+ ${t.enableAlpha}`}
            </button>
          </FormatCard>

          {/* HSL */}
          <FormatCard
            title="HSL"
            formatString={formatHSL(hsl)}
            placeholder={t.formatCodePlaceholder['HSL']}
            sliders={hslSliders}
            onSliderChange={handleHSLSlider}
            onStringPaste={updateFromHSLString}
            t={t}
            showModel={show3D}
            model3D={<ColorModel3D type="HSL" rgb={rgb} hsv={hsv} hsl={hsl} cmyk={cmyk} autoRotate={autoRotate} />}
          />

          {/* HSV */}
          <FormatCard
            title="HSV"
            formatString={formatHSV(hsv)}
            placeholder={t.formatCodePlaceholder['HSV']}
            sliders={hsvSliders}
            onSliderChange={handleHSVSlider}
            onStringPaste={updateFromHSVString}
            t={t}
            showModel={show3D}
            model3D={<ColorModel3D type="HSV" rgb={rgb} hsv={hsv} hsl={hsl} cmyk={cmyk} autoRotate={autoRotate} />}
          />

          {/* CMYK */}
          <FormatCard
            title="CMYK"
            formatString={formatCMYK(cmyk)}
            placeholder={t.formatCodePlaceholder['CMYK']}
            sliders={cmykSliders}
            onSliderChange={handleCMYKSlider}
            onStringPaste={updateFromCMYKString}
            t={t}
            showModel={show3D}
            model3D={<ColorModel3D type="CMYK" rgb={rgb} hsv={hsv} hsl={hsl} cmyk={cmyk} autoRotate={autoRotate} />}
          />
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted text-center pb-2">{t.footerNote}</p>
      </div>
    </main>
  );
}
