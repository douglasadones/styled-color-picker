'use client';

/**
 * ColorModel3DLazy
 * Dynamic-imports ColorModel3D with ssr:false so Three.js never runs on the server.
 */

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import type { ColorModel3D as ColorModel3DType } from './ColorModel3D';

const ColorModel3D = dynamic(
  () => import('./ColorModel3D').then((m) => m.ColorModel3D),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-52 rounded-lg flex items-center justify-center"
        style={{ background: 'var(--input)' }}
      >
        <span className="text-xs text-muted animate-pulse">Carregando modelo 3D…</span>
      </div>
    ),
  },
);

export type ColorModel3DProps = ComponentProps<typeof ColorModel3DType>;

export function ColorModel3DLazy(props: ColorModel3DProps) {
  return <ColorModel3D {...props} />;
}
