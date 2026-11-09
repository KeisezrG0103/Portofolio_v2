import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Model } from './Model.jsx';
import { DECORATIVE_ASSETS } from '../data/planets.js';

function createMilkyWayCanvasTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const g = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  let seed = 98765;
  const nextRand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  g.fillStyle = '#02030a';
  g.fillRect(0, 0, w, h);

  for (let i = 0; i < 6000; i++) {
    const x = nextRand() * w;
    const y =
      h / 2 +
      Math.sin((x / w) * 6.28) * h * 0.14 +
      (nextRand() + nextRand() + nextRand() - 1.5) * h * 0.2;
    const rCol = (150 + nextRand() * 80) | 0;
    const gCol = (160 + nextRand() * 60) | 0;
    const alpha = nextRand() * 0.06;
    g.fillStyle = `rgba(${rCol},${gCol},255,${alpha})`;
    g.beginPath();
    g.arc(x, y, 1 + nextRand() * 5, 0, 7);
    g.fill();
  }

  for (let i = 0; i < 2500; i++) {
    g.fillStyle = `rgba(255,255,255,${nextRand() * 0.8})`;
    g.fillRect(nextRand() * w, nextRand() * h, 1, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function ProceduralSkyFallback() {
  const texture = useMemo(() => createMilkyWayCanvasTexture(), []);

  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
    };
  }, [texture]);

  return (
    <mesh renderOrder={-10}>
      <sphereGeometry args={[950, 32, 24]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        fog={false}
        depthWrite={false}
      />
    </mesh>
  );
}

const applySkyMaterialOverride = (mesh) => {
  mesh.renderOrder = -10;
  mesh.raycast = () => null;
  const toSkyBasicMat = (m) => {
    if (!m) return m;
    const skyMap = m.map || m.emissiveMap || null;
    if (skyMap) {
      skyMap.colorSpace = THREE.SRGBColorSpace;
    }
    const basic = new THREE.MeshBasicMaterial({
      map: skyMap,
      color: 0xffffff,
      side: THREE.DoubleSide,
      fog: false,
      depthWrite: false,
      toneMapped: false,
    });
    if (typeof m.dispose === 'function') {
      m.dispose();
    }
    return basic;
  };
  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map(toSkyBasicMat);
  } else if (mesh.material) {
    mesh.material = toSkyBasicMat(mesh.material);
  }
};

export function Sky() {
  const skyRef = useRef(null);

  useFrame((state) => {
    if (skyRef.current) {
      skyRef.current.position.copy(state.camera.position);
    }
  });

  return (
    <group ref={skyRef}>
      <Model
        url={DECORATIVE_ASSETS.sky}
        targetRadius={950}
        disableFrustumCulling={true}
        materialOverride={applySkyMaterialOverride}
        fallbackNode={<ProceduralSkyFallback />}
      />
    </group>
  );
}

export default Sky;
