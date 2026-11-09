import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Model } from './Model.jsx';
import { Rings } from './Rings.jsx';
import { useStore } from '../store.js';
import { cosmicRuntime } from '../utils/runtime.js';

const disableRaycast = (mesh) => {
  mesh.raycast = () => null;
};

const _projVec = new THREE.Vector3();

export function Planet({ planet }) {
  const spinRef = useRef(null);

  useFrame((state) => {
    if (spinRef.current) {
      spinRef.current.rotation.y = state.clock.elapsedTime * (planet.spinSpeed || 0.05);
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    if (typeof document !== 'undefined') {
      const mode = useStore.getState().mode;
      document.body.style.cursor = mode === 'free' ? 'grab' : 'default';
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    const r3fDelta = typeof e.delta === 'number' ? e.delta : 0;
    const customDrag = cosmicRuntime.look.dragDistance;
    if (r3fDelta > 5 || customDrag > 5) return;

    const state = useStore.getState();
    if (state.mode === 'free') {
      const proj = _projVec.set(...planet.position).project(e.camera);
      state.visitInFreeMode(planet.index, proj.x);
    } else if (state.index !== planet.index) {
      state.goTo(planet.index);
    }
  };

  const fallbackNode = (
    <group>
      <mesh raycast={() => null}>
        <sphereGeometry args={[planet.radius, 32, 24]} />
        <meshStandardMaterial color={planet.color} roughness={0.8} metalness={0.1} />
      </mesh>
      {planet.ring && <Rings {...planet.ring} />}
    </group>
  );

  return (
    <group position={planet.position} rotation={[0, 0, planet.tilt || 0]}>
      <group ref={spinRef}>
        <Model
          url={planet.file}
          targetRadius={planet.radius}
          fallbackColor={planet.color}
          fallbackNode={fallbackNode}
          materialOverride={disableRaycast}
        />
      </group>

      {planet.atmosphere && (
        <mesh raycast={() => null}>
          <sphereGeometry args={[planet.atmosphere.radius, 32, 24]} />
          <meshBasicMaterial
            color={planet.atmosphere.color}
            transparent={true}
            opacity={planet.atmosphere.opacity}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[planet.radius * 1.3, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}

export default Planet;
