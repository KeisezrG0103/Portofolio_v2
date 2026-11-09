import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';

function createDustPositions(count) {
  const positions = new Float32Array(count * 3);
  let seed = 424242;
  const nextRand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < count; i++) {
    positions[i * 3] = -50 + nextRand() * 100;
    positions[i * 3 + 1] = -30 + nextRand() * 60;
    positions[i * 3 + 2] = 30 - nextRand() * 410; // +30 down to -380
  }
  return positions;
}

export function Dust({ count = 2200 }) {
  const { geometry, material } = useMemo(() => {
    const positions = createDustPositions(count);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.17,
      color: 0xbfd0ff,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { geometry: geo, material: mat };
  }, [count]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <points geometry={geometry} material={material} raycast={() => null} />;
}

export default Dust;
