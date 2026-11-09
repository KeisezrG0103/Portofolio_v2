import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export function Rings({
  innerRadius = 4.6,
  outerRadius = 7.8,
  color = '#d9c9a0',
  rotationX = 1.35,
  opacity = 0.42,
}) {
  const ringRef = useRef(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[rotationX, 0, 0]}>
      <ringGeometry args={[innerRadius, outerRadius, 96]} />
      <meshBasicMaterial
        color={color}
        transparent={true}
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export default Rings;
