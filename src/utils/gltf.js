import * as THREE from 'three';

// Suppress internal @react-three/fiber THREE.Clock deprecation warning in Three.js r183+
export function configureThreeConsoleFilter() {
  if (typeof THREE.setConsoleFunction === 'function') {
    THREE.setConsoleFunction((type, message, ...params) => {
      if (
        type === 'warn' &&
        typeof message === 'string' &&
        message.includes('Clock: This module has been deprecated')
      ) {
        return;
      }
      const fn = console[type] || console.log;
      fn.call(console, message, ...params);
    });
  }
}

configureThreeConsoleFilter();

/**
 * GLTFLoader plugin for legacy glTF 2.0 extension "KHR_materials_pbrSpecularGlossiness".
 * Used by mercury.glb, earth.glb, mars.glb, jupiter.glb, and saturn.glb.
 */
export function createSpecularGlossinessPlugin(parser) {
  return {
    name: 'KHR_materials_pbrSpecularGlossiness',
    getMaterialType(materialIndex) {
      const materialDef = parser?.json?.materials?.[materialIndex];
      if (!materialDef?.extensions?.KHR_materials_pbrSpecularGlossiness) return null;
      return THREE.MeshStandardMaterial;
    },
    extendMaterialParams(materialIndex, materialParams) {
      const materialDef = parser?.json?.materials?.[materialIndex];
      const ext = materialDef?.extensions?.KHR_materials_pbrSpecularGlossiness;
      if (!ext) return Promise.resolve();

      const pending = [];

      materialParams.color = new THREE.Color(1.0, 1.0, 1.0);
      materialParams.opacity = 1.0;

      if (Array.isArray(ext.diffuseFactor)) {
        const [r = 1, g = 1, b = 1, a = 1] = ext.diffuseFactor;
        materialParams.color.setRGB(r, g, b, THREE.LinearSRGBColorSpace);
        materialParams.opacity = a;
      }

      if (ext.diffuseTexture !== undefined && typeof parser.assignTexture === 'function') {
        pending.push(
          parser.assignTexture(materialParams, 'map', ext.diffuseTexture, THREE.SRGBColorSpace)
        );
      }

      materialParams.metalness = 0.0;
      const specMax = Array.isArray(ext.specularFactor)
        ? Math.max(
            ext.specularFactor[0] ?? 0,
            ext.specularFactor[1] ?? 0,
            ext.specularFactor[2] ?? 0
          )
        : 0.2;
      const gloss = ext.glossinessFactor !== undefined ? ext.glossinessFactor : 0.5;
      const effectiveGloss = gloss * Math.min(1.0, specMax * 4.0);
      materialParams.roughness = THREE.MathUtils.clamp(1.0 - effectiveGloss * 0.7, 0.25, 0.9);

      return Promise.all(pending);
    },
  };
}

export function extendGLTFLoader(loader) {
  if (loader && typeof loader.register === 'function') {
    loader.register(createSpecularGlossinessPlugin);
  }
}

export function sanitizeClonedMaterial(mat) {
  if (!mat) return mat;
  const clonedMat = mat.clone();

  // Disable frosted-glass transmission exported from Sketchfab on cloud/corona shells
  if ('transmission' in clonedMat && clonedMat.transmission > 0) {
    clonedMat.transmission = 0;
    clonedMat.transmissionMap = null;
  }

  // Prevent self-emissive blowout on planets where emissiveMap duplicates diffuse map (e.g. Jupiter)
  if (clonedMat.map && clonedMat.emissiveMap && clonedMat.map === clonedMat.emissiveMap) {
    clonedMat.emissiveIntensity = 0.08;
  }

  // Restore full brightness on textured planet cores darkened by baseColorFactor (e.g. Neptune SphereOne)
  if (
    clonedMat.map &&
    !clonedMat.transparent &&
    clonedMat.color &&
    clonedMat.color.r > 0.1 &&
    clonedMat.color.r < 0.5 &&
    Math.abs(clonedMat.color.r - clonedMat.color.g) < 0.01 &&
    Math.abs(clonedMat.color.g - clonedMat.color.b) < 0.01
  ) {
    clonedMat.color.setRGB(1, 1, 1);
  }

  // Soften untextured opaque outer atmosphere shell (e.g. Neptune SphereThree material_2)
  if (
    !clonedMat.map &&
    !clonedMat.emissiveMap &&
    clonedMat.transparent &&
    clonedMat.opacity > 0.7 &&
    clonedMat.metalness > 0.7
  ) {
    clonedMat.opacity = 0.14;
    clonedMat.metalness = 0.0;
    clonedMat.roughness = 0.85;
    clonedMat.depthWrite = false;
  }

  // Restore visibility on Uranus ring material where baseColorFactor alpha is 0.02
  if (clonedMat.transparent && clonedMat.opacity < 0.05 && clonedMat.emissiveMap) {
    clonedMat.map = clonedMat.emissiveMap;
    clonedMat.color.setRGB(1, 1, 1);
    clonedMat.opacity = 0.55;
    clonedMat.emissiveIntensity = 0.35;
    clonedMat.depthWrite = false;
  }

  clonedMat.needsUpdate = true;
  return clonedMat;
}

/**
 * Fast vertex-clustering decimation for high-poly BufferGeometries.
 */
export function decimateBufferGeometry(geo, gridRes = 10) {
  if (!geo || !geo.attributes?.position) return geo;
  const posAttr = geo.attributes.position;
  const indexAttr = geo.index;
  const triCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3;
  if (triCount <= 350) return geo;

  geo.computeBoundingBox();
  const box = geo.boundingBox;
  if (!box) return geo;

  const dx = box.max.x - box.min.x || 1;
  const dy = box.max.y - box.min.y || 1;
  const dz = box.max.z - box.min.z || 1;

  const cellMap = new Map();
  const oldToNew = new Int32Array(posAttr.count);
  const newPositions = [];
  let newVertCount = 0;

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);
    const gx = Math.round(((x - box.min.x) / dx) * gridRes);
    const gy = Math.round(((y - box.min.y) / dy) * gridRes);
    const gz = Math.round(((z - box.min.z) / dz) * gridRes);
    const key = (gx << 16) | (gy << 8) | gz;
    let ni = cellMap.get(key);
    if (ni === undefined) {
      ni = newVertCount++;
      cellMap.set(key, ni);
      newPositions.push(x, y, z);
    }
    oldToNew[i] = ni;
  }

  const newIndices = [];
  if (indexAttr) {
    const arr = indexAttr.array;
    for (let i = 0; i < arr.length; i += 3) {
      const a = oldToNew[arr[i]];
      const b = oldToNew[arr[i + 1]];
      const c = oldToNew[arr[i + 2]];
      if (a !== b && b !== c && a !== c) {
        newIndices.push(a, b, c);
      }
    }
  } else {
    for (let i = 0; i < posAttr.count; i += 3) {
      const a = oldToNew[i];
      const b = oldToNew[i + 1];
      const c = oldToNew[i + 2];
      if (a !== b && b !== c && a !== c) {
        newIndices.push(a, b, c);
      }
    }
  }

  if (newIndices.length < 3) return geo;

  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
  out.setIndex(newIndices);
  out.computeVertexNormals();
  return out;
}

/**
 * Merges multi-part untextured CAD models (e.g. Satellite with 69 meshes / 121k tris,
 * Probe with 27 meshes / 25k tris) into a single decimated vertex-colored Mesh (1 draw call).
 */
export function mergeUntexturedSceneMeshes(rootGroup) {
  if (!rootGroup) return;
  const meshes = [];
  let hasTextures = false;

  rootGroup.traverse((child) => {
    if (child.isMesh && child.geometry) {
      meshes.push(child);
      const mat = Array.isArray(child.material) ? child.material[0] : child.material;
      if (mat && (mat.map || mat.emissiveMap)) {
        hasTextures = true;
      }
    }
  });

  if (hasTextures || meshes.length <= 6) return;

  rootGroup.updateMatrixWorld(true);
  const rootInv = new THREE.Matrix4().copy(rootGroup.matrixWorld).invert();
  const relMat = new THREE.Matrix4();
  const normalMat = new THREE.Matrix3();
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();

  const mergedPositions = [];
  const mergedNormals = [];
  const mergedColors = [];
  const mergedIndices = [];
  let vertexOffset = 0;

  for (const mesh of meshes) {
    let geo = mesh.geometry;
    const posAttr = geo.attributes?.position;
    if (!posAttr) continue;

    const triCount = geo.index ? geo.index.count / 3 : posAttr.count / 3;
    const decimated = triCount > 350 ? decimateBufferGeometry(geo, 12) : geo;
    const dPos = decimated.attributes.position;
    const dNorm = decimated.attributes.normal;
    const dIdx = decimated.index;

    relMat.multiplyMatrices(rootInv, mesh.matrixWorld);
    normalMat.getNormalMatrix(relMat);

    const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const col = mat?.color || new THREE.Color(0.8, 0.82, 0.86);
    const cr = col.r;
    const cg = col.g;
    const cb = col.b;

    for (let i = 0; i < dPos.count; i++) {
      v.set(dPos.getX(i), dPos.getY(i), dPos.getZ(i)).applyMatrix4(relMat);
      mergedPositions.push(v.x, v.y, v.z);

      if (dNorm) {
        n.set(dNorm.getX(i), dNorm.getY(i), dNorm.getZ(i)).applyMatrix3(normalMat).normalize();
        mergedNormals.push(n.x, n.y, n.z);
      } else {
        mergedNormals.push(0, 1, 0);
      }
      mergedColors.push(cr, cg, cb);
    }

    if (dIdx) {
      const idxArr = dIdx.array;
      for (let i = 0; i < idxArr.length; i++) {
        mergedIndices.push(vertexOffset + idxArr[i]);
      }
    } else {
      for (let i = 0; i < dPos.count; i++) {
        mergedIndices.push(vertexOffset + i);
      }
    }

    vertexOffset += dPos.count;
    if (decimated !== geo) {
      decimated.dispose();
    }
  }

  if (mergedIndices.length < 3) return;

  const mergedGeo = new THREE.BufferGeometry();
  mergedGeo.setAttribute('position', new THREE.Float32BufferAttribute(mergedPositions, 3));
  mergedGeo.setAttribute('normal', new THREE.Float32BufferAttribute(mergedNormals, 3));
  mergedGeo.setAttribute('color', new THREE.Float32BufferAttribute(mergedColors, 3));
  mergedGeo.setIndex(mergedIndices);
  mergedGeo.computeBoundingBox();
  mergedGeo.computeBoundingSphere();

  const mergedMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.55,
    metalness: 0.35,
  });

  const singleMesh = new THREE.Mesh(mergedGeo, mergedMat);
  singleMesh.name = 'MergedOptimizedMesh';

  rootGroup.clear();
  rootGroup.add(singleMesh);
}
