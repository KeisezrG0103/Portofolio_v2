import React, { useEffect, useRef } from 'react';
import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { Model } from './Model.jsx';
import { DECORATIVE_ASSETS } from '../data/planets.js';

function AstronautFallback() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.2, 16, 12]} />
        <meshStandardMaterial color="#f1f2f6" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.26, 0.06]}>
        <sphereGeometry args={[0.15, 16, 12]} />
        <meshStandardMaterial color="#0b1020" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[0.24, 0.28, 0.1]} />
        <meshStandardMaterial color="#f1f2f6" roughness={0.6} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.1, -0.28, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.28, 8]} />
            <meshStandardMaterial color="#f1f2f6" roughness={0.6} />
          </mesh>
          <mesh position={[s * 0.25, 0.02, 0]} rotation={[0, 0, s * 0.6]}>
            <cylinderGeometry args={[0.045, 0.045, 0.25, 8]} />
            <meshStandardMaterial color="#f1f2f6" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const disableRaycast = (mesh) => {
  mesh.raycast = () => null;
};

export function AstronautMascot() {
  const { scene, camera } = useThree();
  const astroRef = useRef(null);

  // Ensure camera is added to the scene graph so its portaled children render
  useEffect(() => {
    scene.add(camera);
    return () => {
      scene.remove(camera);
    };
  }, [scene, camera]);

  useFrame((state) => {
    if (!astroRef.current) return;
    const s = state.clock.elapsedTime;
    const width = state.size.width || 1200;
    const height = state.size.height || 800;
    const aspect = width / height;
    const isMobile = width < 800;

    const h = Math.tan((25 * Math.PI) / 180) * 7;
    const w = h * aspect;

    const baseX = isMobile ? w * 0.75 : w * 0.84;
    const baseY = isMobile ? h * 0.68 : -h * 0.68;
    const bobOffset = Math.sin(s * 0.7) * 0.06;

    astroRef.current.position.set(baseX, baseY + bobOffset, -7);
    astroRef.current.scale.setScalar(isMobile ? 0.7 : 1);
    astroRef.current.rotation.set(
      Math.sin(s * 0.4) * 0.3,
      s * 0.25,
      Math.cos(s * 0.35) * 0.3
    );
  });

  return createPortal(
    <group ref={astroRef} position={[2.8, -1.8, -7]}>
      <Model
        url={DECORATIVE_ASSETS.astronaut}
        targetRadius={0.42}
        disableFrustumCulling={true}
        materialOverride={disableRaycast}
        fallbackNode={<AstronautFallback />}
      />
    </group>,
    camera
  );
}

export default AstronautMascot;
