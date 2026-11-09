import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Model } from './Model.jsx';
import { DECORATIVE_ASSETS, PLANETS } from '../data/planets.js';

function SatelliteFallback() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.5, 0.4, 0.4]} />
        <meshStandardMaterial color="#cfd4de" metalness={0.7} roughness={0.35} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.75, 0, 0]}>
          <boxGeometry args={[0.9, 0.02, 0.4]} />
          <meshStandardMaterial
            color="#2c4f9e"
            metalness={0.5}
            roughness={0.3}
            emissive="#0a1a44"
          />
        </mesh>
      ))}
      <mesh position={[0, 0.32, 0]}>
        <coneGeometry args={[0.22, 0.18, 24, 1, true]} />
        <meshStandardMaterial color="#cfd4de" metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  );
}

const disableRaycast = (mesh) => {
  mesh.raycast = () => null;
};

export function Satellite() {
  const satRef = useRef(null);
  const earthPos = PLANETS[2].position; // Earth at index 3 (array index 2)

  useFrame((state) => {
    if (!satRef.current) return;
    const dz = Math.abs(state.camera.position.z - earthPos[2]);
    const shouldShow = dz < 85;
    if (satRef.current.visible !== shouldShow) {
      satRef.current.visible = shouldShow;
    }
    if (!shouldShow) return;

    const s = state.clock.elapsedTime;
    const a = s * 0.4;
    satRef.current.position.set(
      earthPos[0] + Math.cos(a) * 4.6,
      earthPos[1] + 0.8 + Math.sin(a * 0.7),
      earthPos[2] + Math.sin(a) * 4.6
    );
    satRef.current.rotation.y = a;
  });

  return (
    <group ref={satRef}>
      <Model
        url={DECORATIVE_ASSETS.satellite}
        targetRadius={0.85}
        materialOverride={disableRaycast}
        fallbackNode={<SatelliteFallback />}
      />
    </group>
  );
}

export default Satellite;
