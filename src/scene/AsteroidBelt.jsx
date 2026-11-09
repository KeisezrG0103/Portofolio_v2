import React, { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { DECORATIVE_ASSETS } from '../data/planets.js';
import { decimateBufferGeometry, extendGLTFLoader } from '../utils/gltf.js';

function createBeltMatrices(count, s0, s1, seedOffset = 0) {
  const matrices = [];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();

  // Deterministic pseudo-random generator so SSR/client or re-mounts stay consistent
  let seed = 1337 + seedOffset * 997;
  const rnd = (a, b) => {
    seed = (seed * 16807) % 2147483647;
    const f = (seed - 1) / 2147483646;
    return a + f * (b - a);
  };

  for (let i = 0; i < count; i++) {
    const t = rnd(0, 1);
    e.set(rnd(0, 6.28), rnd(0, 6.28), rnd(0, 6.28));
    q.setFromEuler(e);
    const s = rnd(s0, s1);
    pos.set(
      -7 + 16 * t + rnd(-15, 15),
      rnd(-8, 7),
      -176 - t * 26 + rnd(-5, 5)
    );
    scl.set(s * rnd(0.7, 1.3), s * rnd(0.6, 1.0), s * rnd(0.7, 1.2));
    m.compose(pos, q, scl);
    matrices.push(m.clone());
  }
  return matrices;
}

function InstancedRocks({ matrices, geometry, material }) {
  const meshRef = useRef(null);

  useEffect(() => {
    const im = meshRef.current;
    if (!im) return;
    for (let i = 0; i < matrices.length; i++) {
      im.setMatrixAt(i, matrices[i]);
    }
    im.instanceMatrix.needsUpdate = true;
    im.computeBoundingBox();
    im.computeBoundingSphere();
  }, [matrices, geometry, material]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, matrices.length]}
      frustumCulled={true}
      raycast={() => null}
    />
  );
}

function GLTFInstancedBelt({ url, matrices, fallbackGeo, fallbackMat, gridRes = 8 }) {
  const gltf = useGLTF(url, true, true, extendGLTFLoader);

  const { geometry, material } = useMemo(() => {
    let foundMesh = null;
    gltf.scene.traverse((child) => {
      if (!foundMesh && child.isMesh && child.geometry) {
        foundMesh = child;
      }
    });

    if (!foundMesh) {
      return { geometry: fallbackGeo, material: fallbackMat };
    }

    const rawGeo = foundMesh.geometry.clone();
    rawGeo.computeBoundingSphere();
    const r = rawGeo.boundingSphere ? rawGeo.boundingSphere.radius : 1;
    if (r > 1e-5) {
      const inv = 1 / r;
      rawGeo.scale(inv, inv, inv);
      if (rawGeo.boundingSphere) {
        rawGeo.center();
      }
    }

    const geo = decimateBufferGeometry(rawGeo, gridRes);
    if (geo !== rawGeo) {
      rawGeo.dispose();
    }

    const mat = foundMesh.material ? foundMesh.material.clone() : fallbackMat;
    return { geometry: geo, material: mat };
  }, [gltf.scene, fallbackGeo, fallbackMat, gridRes]);

  useEffect(() => {
    return () => {
      if (geometry && geometry !== fallbackGeo) geometry.dispose();
      if (material && material !== fallbackMat && material.dispose) material.dispose();
    };
  }, [geometry, material, fallbackGeo, fallbackMat]);

  return <InstancedRocks matrices={matrices} geometry={geometry} material={material} />;
}

class BeltErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    console.warn(`[Cosmic Observatory] Fallback sabuk asteroid (${this.props.url}):`, err);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export function AsteroidBelt() {
  const beltGroupRef = useRef(null);
  const smallMatrices = useMemo(() => createBeltMatrices(280, 0.1, 0.45, 1), []);
  const largeMatrices = useMemo(() => createBeltMatrices(18, 0.8, 2.2, 2), []);

  useFrame((state) => {
    if (!beltGroupRef.current) return;
    // Asteroid belt spans z = -176 to -202 (center -189); cull when camera is far away
    const dz = Math.abs(state.camera.position.z - -189);
    const shouldShow = dz < 140;
    if (beltGroupRef.current.visible !== shouldShow) {
      beltGroupRef.current.visible = shouldShow;
    }
  });

  const { fallbackGeo, fallbackMat } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x8a8174,
      roughness: 0.95,
      flatShading: true,
    });
    return { fallbackGeo: geo, fallbackMat: mat };
  }, []);

  useEffect(() => {
    return () => {
      fallbackGeo.dispose();
      fallbackMat.dispose();
    };
  }, [fallbackGeo, fallbackMat]);

  const smallFallback = (
    <InstancedRocks
      matrices={smallMatrices}
      geometry={fallbackGeo}
      material={fallbackMat}
    />
  );

  const largeFallback = (
    <InstancedRocks
      matrices={largeMatrices}
      geometry={fallbackGeo}
      material={fallbackMat}
    />
  );

  return (
    <group ref={beltGroupRef}>
      {/* 280 small rocks from meteor_opt.glb */}
      <BeltErrorBoundary url={DECORATIVE_ASSETS.meteor} fallback={smallFallback}>
        <Suspense fallback={smallFallback}>
          <GLTFInstancedBelt
            url={DECORATIVE_ASSETS.meteor}
            matrices={smallMatrices}
            fallbackGeo={fallbackGeo}
            fallbackMat={fallbackMat}
            gridRes={6}
          />
        </Suspense>
      </BeltErrorBoundary>

      {/* 18 large rocks from asteroid_2d_opt.glb */}
      <BeltErrorBoundary url={DECORATIVE_ASSETS.asteroid} fallback={largeFallback}>
        <Suspense fallback={largeFallback}>
          <GLTFInstancedBelt
            url={DECORATIVE_ASSETS.asteroid}
            matrices={largeMatrices}
            fallbackGeo={fallbackGeo}
            fallbackMat={fallbackMat}
            gridRes={10}
          />
        </Suspense>
      </BeltErrorBoundary>
    </group>
  );
}

export default AsteroidBelt;
