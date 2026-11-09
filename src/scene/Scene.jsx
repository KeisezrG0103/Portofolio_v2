import React, { useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Preload, useGLTF } from '@react-three/drei';
import { DECORATIVE_ASSETS, PLANETS, SUN_DATA } from '../data/planets.js';
import { useStore } from '../store.js';
import { cosmicRuntime } from '../utils/runtime.js';
import { CameraRig } from './CameraRig.jsx';
import { extendGLTFLoader } from './Model.jsx';
import { Sky } from './Sky.jsx';
import { Dust } from './Dust.jsx';
import { Sun } from './Sun.jsx';
import { Planet } from './Planet.jsx';
import { AsteroidBelt } from './AsteroidBelt.jsx';
import { Satellite } from './Satellite.jsx';
import { Probe } from './Probe.jsx';

export function preloadAllModels() {
  if (typeof window === 'undefined') return;
  try {
    useGLTF.preload(SUN_DATA.file, true, true, extendGLTFLoader);
    useGLTF.preload(DECORATIVE_ASSETS.sky, true, true, extendGLTFLoader);
    if (PLANETS[0]) useGLTF.preload(PLANETS[0].file, true, true, extendGLTFLoader);
    if (PLANETS[1]) useGLTF.preload(PLANETS[1].file, true, true, extendGLTFLoader);

    const scheduleIdle =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback
        : (cb) => setTimeout(cb, 250);

    scheduleIdle(() => {
      try {
        PLANETS.slice(2).forEach((p) =>
          useGLTF.preload(p.file, true, true, extendGLTFLoader)
        );
        useGLTF.preload(DECORATIVE_ASSETS.meteor, true, true, extendGLTFLoader);
        useGLTF.preload(DECORATIVE_ASSETS.asteroid, true, true, extendGLTFLoader);
        useGLTF.preload(DECORATIVE_ASSETS.satellite, true, true, extendGLTFLoader);
        useGLTF.preload(DECORATIVE_ASSETS.probe, true, true, extendGLTFLoader);
      } catch {
        // Fallback will handle any model load issue
      }
    });
  } catch {
    // Fallback will handle any model load issue
  }
}

export function Scene() {
  useEffect(() => {
    preloadAllModels();
  }, []);

  const handlePointerMissed = () => {
    const state = useStore.getState();
    const drag = cosmicRuntime.look.dragDistance;
    if (state.mode === 'free' && drag <= 5 && state.panel.open) {
      state.closePanel();
    }
  };

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ fov: 50, near: 0.1, far: 1400, position: [0, 1, 24] }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        powerPreference: 'high-performance',
      }}
      onPointerMissed={handlePointerMissed}
    >
      {/* Observatory Lighting */}
      <ambientLight color="#1a2240" intensity={0.45} />
      <directionalLight color="#fff0dd" intensity={2.3} position={[-14, 8, 40]} />
      <directionalLight color="#6f9bff" intensity={1.5} position={[18, -5, -40]} />

      {/* Camera Controller */}
      <CameraRig />

      {/* Decorative Cosmic Environment (non-interactive) */}
      <Sky />
      <Dust count={2200} />
      <Sun />
      <AsteroidBelt />
      <Satellite />
      <Probe />

      {/* 8 Interactive Planets */}
      {PLANETS.map((planet) => (
        <Planet key={planet.id} planet={planet} />
      ))}

      <Preload all />
    </Canvas>
  );
}

export default Scene;
