'use client';

/**
 * ColorModel3D — High-fidelity Voxel Grid implementation using Three.js and @react-three/fiber.
 * 
 * Renders color spaces as a grid of instanced cubes (voxels).
 *   RGB  → 10x10x10 Solid Cube
 *   HSV  → Conical Voxel Cloud
 *   HSL  → Biconical Voxel Cloud
 *   CMYK → CMY Solid Cube
 */

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Instances, Instance, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { 
  rgbToHSL, rgbToHSV, 
  hslToRGB, hsvToRGB, 
  cmykToRGB,
  type RGBColor, type CMYKColor, type HSLColor, type HSVColor 
} from '@/lib/color-conversion';

// ---------------------------------------------------------------------------
// Constants & Types
// ---------------------------------------------------------------------------

export type ColorModelType = 'RGB' | 'HSV' | 'HSL' | 'CMYK';

interface ColorModel3DProps {
  type: ColorModelType;
  rgb: RGBColor;
  hsv: HSVColor;
  hsl: HSLColor;
  cmyk: CMYKColor;
  autoRotate?: boolean;
}

const GRID_SIZE = 10;
const SPACING = 1.2; // Slightly more spacing
const CUBE_SCALE = 0.7; // Smaller cubes for better visibility "through" the grid

// ---------------------------------------------------------------------------
// Voxel Data Generator
// ---------------------------------------------------------------------------

interface VoxelData {
  pos: [number, number, number];
  color: string;
}

function generateVoxels(type: ColorModelType, kValue: number): VoxelData[] {
  const voxels: VoxelData[] = [];
  const half = (GRID_SIZE - 1) * 0.5;

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const u = x / (GRID_SIZE - 1);
        const v = y / (GRID_SIZE - 1);
        const w = z / (GRID_SIZE - 1);

        let rgb: RGBColor = { r: 0, g: 0, b: 0 };
        let valid = true;

        switch (type) {
          case 'RGB':
            rgb = { 
              r: Math.round(u * 255), 
              g: Math.round(v * 255), 
              b: Math.round(w * 255) 
            };
            break;

          case 'HSV': {
            // Mapping cube to cone/cylinder:
            // h=u*360, s=v*100, v=w*100
            // Shape: circular cross-section that tapers at bottom (v=0)
            const angle = u * Math.PI * 2;
            const radius = v;
            const height = w;
            
            // Only keep voxels within the cylinder/cone boundary
            // (Optional: filter out voxels outside the radius if desired, 
            // but for a "type" request, we can just show the cube volume mapped)
            rgb = hsvToRGB({ h: u * 360, s: v * 100, v: w * 100 });
            
            // Reposition to conical shape for better visualization
            const px = Math.cos(angle) * (radius * height) * half * 1.5;
            const pz = Math.sin(angle) * (radius * height) * half * 1.5;
            const py = (height - 0.5) * GRID_SIZE;
            voxels.push({ pos: [px, py, pz], color: `rgb(${rgb.r},${rgb.g},${rgb.b})` });
            continue; 
          }

          case 'HSL': {
            const angle = u * Math.PI * 2;
            const radius = v;
            const lightness = w;
            
            rgb = hslToRGB({ h: u * 360, s: v * 100, l: w * 100 });
            
            // Bicone scale factor: widest at L=0.5
            const taper = 1 - Math.abs(lightness - 0.5) * 2;
            const px = Math.cos(angle) * (radius * taper) * half * 1.5;
            const pz = Math.sin(angle) * (radius * taper) * half * 1.5;
            const py = (lightness - 0.5) * GRID_SIZE;
            voxels.push({ pos: [px, py, pz], color: `rgb(${rgb.r},${rgb.g},${rgb.b})` });
            continue;
          }

          case 'CMYK': {
            // CMY Cube where C=x, M=y, Y=z, dimmed by current K
            rgb = cmykToRGB({ c: u * 100, m: v * 100, y: w * 100, k: kValue });
            break;
          }
        }

        if (valid) {
          voxels.push({
            pos: [(u - 0.5) * GRID_SIZE * SPACING, (v - 0.5) * GRID_SIZE * SPACING, (w - 0.5) * GRID_SIZE * SPACING],
            color: `rgb(${rgb.r},${rgb.g},${rgb.b})`,
          });
        }
      }
    }
  }
  return voxels;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function VoxelGrid({ type, kValue }: { type: ColorModelType, kValue: number }) {
  const voxelData = useMemo(() => generateVoxels(type, kValue), [type, kValue]);
  
  return (
    <Instances range={voxelData.length}>
      <boxGeometry args={[CUBE_SCALE, CUBE_SCALE, CUBE_SCALE]} />
      {/* Use meshBasicMaterial to prevent lights from washing out the colors, 
          and add transparency to see the internal color structure. */}
      <meshBasicMaterial transparent opacity={0.7} vertexColors={false} />
      {voxelData.map((data, i) => (
        <Instance key={i} position={data.pos} color={data.color} />
      ))}
    </Instances>
  );
}

/** Indicator: a single voxel that represents the ACTIVE color, moving/scaling to highlight */
function ActiveIndicator({ type, rgb, hsv, hsl, cmyk }: ColorModel3DProps) {
  const meshRef = useRef<THREE.Group>(null);

  const pos = useMemo((): [number, number, number] => {
    const half = (GRID_SIZE - 1) * 0.5;
    switch (type) {
      case 'RGB':
        return [
          (rgb.r / 255 - 0.5) * GRID_SIZE * SPACING,
          (rgb.g / 255 - 0.5) * GRID_SIZE * SPACING,
          (rgb.b / 255 - 0.5) * GRID_SIZE * SPACING,
        ];
      case 'HSV': {
        const ha = (hsv.h / 360) * Math.PI * 2;
        const r = (hsv.s / 100) * (hsv.v / 100) * half * 1.5;
        return [Math.cos(ha) * r, (hsv.v / 100 - 0.5) * GRID_SIZE, Math.sin(ha) * r];
      }
      case 'HSL': {
        const ha = (hsl.h / 360) * Math.PI * 2;
        const taper = 1 - Math.abs(hsl.l / 100 - 0.5) * 2;
        const r = (hsl.s / 100) * taper * half * 1.5;
        return [Math.cos(ha) * r, (hsl.l / 100 - 0.5) * GRID_SIZE, Math.sin(ha) * r];
      }
      case 'CMYK':
        return [
          (cmyk.c / 100 - 0.5) * GRID_SIZE * SPACING,
          (cmyk.m / 100 - 0.5) * GRID_SIZE * SPACING,
          (cmyk.y / 100 - 0.5) * GRID_SIZE * SPACING,
        ];
    }
  }, [type, rgb, hsv, hsl, cmyk]);

  useFrame((state) => {
    if (meshRef.current) {
      // Pulse animation
      const s = 1.3 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
      meshRef.current.scale.set(s, s, s);
      meshRef.current.position.lerp(new THREE.Vector3(...pos), 0.1);
    }
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <boxGeometry args={[CUBE_SCALE, CUBE_SCALE, CUBE_SCALE]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} transparent opacity={0.9} />
      </mesh>
      <mesh scale={1.1}>
        <boxGeometry args={[CUBE_SCALE, CUBE_SCALE, CUBE_SCALE]} />
        <meshBasicMaterial color="white" wireframe />
      </mesh>
    </group>
  );
}

function Scene({ type, rgb, hsv, hsl, cmyk, autoRotate = true }: ColorModel3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Auto-rotation
  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  return (
    <>
      <ambientLight intensity={1.0} />
      <pointLight position={[10, 10, 10]} intensity={200} />
      <pointLight position={[-10, -10, -10]} intensity={100} />
      
      <group ref={groupRef}>
        <VoxelGrid type={type} kValue={cmyk.k} />
        <ActiveIndicator type={type} rgb={rgb} hsv={hsv} hsl={hsl} cmyk={cmyk} />
      </group>

      <OrbitControls 
        enableDamping 
        dampingFactor={0.05} 
        rotateSpeed={0.5} 
        autoRotate={false}
        enablePan={false}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ColorModel3D(props: ColorModel3DProps) {
  return (
    <div className="w-full h-52 rounded-xl overflow-hidden relative group" style={{ background: '#71717a' }} suppressHydrationWarning>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[12, 10, 12]} fov={45} />
        <Scene {...props} />
      </Canvas>
      
      {/* Label Overlay */}
      <div className="absolute bottom-3 left-3 pointer-events-none">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase opacity-50 group-hover:opacity-100 transition-opacity">
          3D {props.type} SPACE
        </span>
      </div>
    </div>
  );
}
