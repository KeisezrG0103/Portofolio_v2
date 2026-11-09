import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Model } from './Model.jsx';
import { DECORATIVE_ASSETS } from '../data/planets.js';

function ProbeFallback() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 8]} />
        <meshStandardMaterial color="#cfd4de" metalness={0.7} roughness={0.35} />
      </mesh>
      {[0, 1, 2, 3].map((k) => (
        <mesh
          key={k}
          position={[Math.cos(k * 1.57) * 0.8, 0, Math.sin(k * 1.57) * 0.8]}
          rotation={[0, -k * 1.57, 0]}
        >
          <boxGeometry args={[0.9, 0.02, 0.35]} />
          <meshStandardMaterial
            color="#2c4f9e"
            metalness={0.5}
            roughness={0.3}
            emissive="#0a1a44"
          />
        </mesh>
      ))}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.4, 8]} />
        <meshStandardMaterial color="#cfd4de" metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  );
}

const disableRaycast = (mesh) => {
  mesh.raycast = () => null;
};

export function Probe() {
  const probeRef = useRef(null);

  useFrame((state) => {
    if (!probeRef.current) return;
    const dz = Math.abs(state.camera.position.z - -285);
    const shouldShow = dz < 85;
    if (probeRef.current.visible !== shouldShow) {
      probeRef.current.visible = shouldShow;
    }
    if (!shouldShow) return;

    const s = state.clock.elapsedTime;
    probeRef.current.rotation.set(s * 0.1, s * 0.25, 0);
    probeRef.current.position.set(3, 2 + Math.sin(s * 0.4) * 0.4, -285);
  });

  return (
    <group ref={probeRef} position={[3, 2, -285]}>
      <Model
        url={DECORATIVE_ASSETS.probe}
        targetRadius={1.3}
        materialOverride={disableRaycast}
        fallbackNode={<ProbeFallback />}
      />
    </group>
  );
}

export default Probe;
