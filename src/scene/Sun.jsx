import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Model } from './Model.jsx';
import { SUN_DATA } from '../data/planets.js';

const applySunMaterialOverride = (mesh) => {
  mesh.raycast = () => null;
  const toSunMat = (m) => {
    if (!m) return m;
    const isOuterShell = Boolean(m.transparent);
    const tex = m.map || m.emissiveMap || null;
    if (tex) {
      tex.colorSpace = THREE.SRGBColorSpace;
    }
    const basic = new THREE.MeshBasicMaterial({
      map: tex,
      color: 0xffffff,
      transparent: isOuterShell,
      opacity: isOuterShell ? 0.38 : 1.0,
      blending: isOuterShell ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: !isOuterShell,
      toneMapped: false,
    });
    if (typeof m.dispose === 'function') {
      m.dispose();
    }
    return basic;
  };

  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map(toSunMat);
  } else if (mesh.material) {
    mesh.material = toSunMat(mesh.material);
  }
};

export function Sun() {
  const glowRef = useRef(null);
  const coreRef = useRef(null);

  const glowTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const g = canvas.getContext('2d');
    const r = g.createRadialGradient(128, 128, 16, 128, 128, 128);
    r.addColorStop(0, 'rgba(255,210,130,0.55)');
    r.addColorStop(0.25, 'rgba(255,165,80,0.32)');
    r.addColorStop(0.55, 'rgba(255,120,50,0.10)');
    r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 256, 256);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      if (glowTexture) glowTexture.dispose();
    };
  }, [glowTexture]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (glowRef.current) {
      const s = 42 + Math.sin(t * 0.6) * 2;
      glowRef.current.scale.set(s, s, 1);
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.02;
    }
  });

  return (
    <group position={SUN_DATA.position}>
      <group ref={coreRef}>
        <Model
          url={SUN_DATA.file}
          targetRadius={SUN_DATA.radius}
          fallbackColor={SUN_DATA.color}
          emissiveFallback={true}
          materialOverride={applySunMaterialOverride}
        />
      </group>
      {glowTexture && (
        <sprite
          ref={glowRef}
          position={[0, 0, -SUN_DATA.radius * 1.1]}
          scale={[42, 42, 1]}
          raycast={() => null}
        >
          <spriteMaterial
            map={glowTexture}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            transparent={true}
            toneMapped={false}
          />
        </sprite>
      )}
    </group>
  );
}

export default Sun;
