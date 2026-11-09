import React, { Component, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { computeNormalizedModelTransform } from '../utils/math.js';
import {
  extendGLTFLoader,
  mergeUntexturedSceneMeshes,
  sanitizeClonedMaterial,
} from '../utils/gltf.js';

export { extendGLTFLoader };

/**
 * ErrorBoundary that catches GLTF loading/parsing errors and gracefully renders a fallback mesh
 * while logging a console.warn, ensuring the WebGL Canvas never crashes.
 */
class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn(`[Cosmic Observatory] Gagal memuat model 3D (${this.props.url}), menampilkan fallback:`, error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

function DefaultSphereFallback({ radius = 1, color = '#8892b0', emissive = false }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 32, 24]} />
      {emissive ? (
        <meshBasicMaterial color={color} />
      ) : (
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      )}
    </mesh>
  );
}

function LoadedGLTF({
  url,
  targetRadius = 1,
  disableFrustumCulling = false,
  materialOverride = null,
}) {
  const gltf = useGLTF(url, true, true, extendGLTFLoader);

  const normalizedGroup = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    mergeUntexturedSceneMeshes(cloned);
    cloned.updateMatrixWorld(true);

    // Compute Box3 from core body meshes (excluding auxiliary ring meshes when core meshes exist)
    const bodyMeshes = [];
    cloned.traverse((child) => {
      if (child.isMesh) {
        const meshName = `${child.name || ''} ${child.parent?.name || ''} ${child.material?.name || ''}`;
        if (!/ring|circle/i.test(meshName)) {
          bodyMeshes.push(child);
        }
      }
    });

    const box = new THREE.Box3();
    if (bodyMeshes.length > 0) {
      for (const m of bodyMeshes) {
        box.expandByObject(m);
      }
    } else {
      box.setFromObject(cloned);
    }

    const min = [box.min.x, box.min.y, box.min.z];
    const max = [box.max.x, box.max.y, box.max.z];

    const isValidBox =
      Number.isFinite(min[0]) &&
      Number.isFinite(max[0]) &&
      max[0] - min[0] + (max[1] - min[1]) + (max[2] - min[2]) > 1e-6;

    const { scale, offset } = isValidBox
      ? computeNormalizedModelTransform(min, max, targetRadius)
      : { scale: 1, offset: [0, 0, 0] };

    cloned.scale.setScalar(scale);
    cloned.position.set(offset[0], offset[1], offset[2]);
    cloned.updateMatrix();
    cloned.matrixAutoUpdate = false;

    cloned.traverse((child) => {
      if (child !== cloned) {
        child.updateMatrix();
        child.matrixAutoUpdate = false;
      }
      if (child.isMesh) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map(sanitizeClonedMaterial);
        } else if (child.material) {
          child.material = sanitizeClonedMaterial(child.material);
        }

        if (disableFrustumCulling) {
          child.frustumCulled = false;
        }
        if (materialOverride && typeof materialOverride === 'function') {
          materialOverride(child);
        }
      }
    });

    const wrapper = new THREE.Group();
    wrapper.add(cloned);
    return wrapper;
  }, [gltf.scene, targetRadius, disableFrustumCulling, materialOverride]);

  return <primitive object={normalizedGroup} />;
}

/**
 * Standardized <Model> wrapper:
 * 1. Normalizes Box3 to targetRadius
 * 2. Centers pivot at (0,0,0)
 * 3. Clones scene safely via scene.clone(true)
 * 4. Optional frustumCulled override
 * 5. Wrapped in <Suspense> + <ModelErrorBoundary> with procedural sphere fallback
 */
export function Model({
  url,
  targetRadius = 1,
  fallbackColor = '#8892b0',
  emissiveFallback = false,
  fallbackNode = null,
  disableFrustumCulling = false,
  materialOverride = null,
  ...groupProps
}) {
  const fallback =
    fallbackNode !== null ? (
      fallbackNode
    ) : (
      <DefaultSphereFallback
        radius={targetRadius}
        color={fallbackColor}
        emissive={emissiveFallback}
      />
    );

  return (
    <group {...groupProps}>
      <ModelErrorBoundary url={url} fallback={fallback}>
        <Suspense fallback={fallback}>
          <LoadedGLTF
            url={url}
            targetRadius={targetRadius}
            disableFrustumCulling={disableFrustumCulling}
            materialOverride={materialOverride}
          />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  );
}

export default Model;
