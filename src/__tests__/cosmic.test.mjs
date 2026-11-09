import test from 'node:test';
import assert from 'node:assert/strict';

import {
  clamp,
  clampDelta,
  easeOutCubic,
  calcVoyageDuration,
  calcFreeApproachDuration,
  shortestAngleDiff,
  computeVoyageTarget,
  computeFreeApproach,
  applyCosmicCollisionAndBounds,
  computeNormalizedModelTransform,
} from '../utils/math.js';
import { PLANETS, SUN_DATA } from '../data/planets.js';
import { CONTENT } from '../data/content.js';
import { createCosmicStore } from '../store.js';
import {
  createSpecularGlossinessPlugin,
  decimateBufferGeometry,
  extendGLTFLoader,
  mergeUntexturedSceneMeshes,
  sanitizeClonedMaterial,
} from '../utils/gltf.js';
import * as THREE from 'three';

test('Math Helpers: clamp and clampDelta', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);

  // Delta time must be capped at 0.05s to prevent frame-drop jumps
  assert.equal(clampDelta(0.016), 0.016);
  assert.equal(clampDelta(0.5), 0.05);
  assert.equal(clampDelta(-0.1), 0);
});

test('Math Helpers: easeOutCubic interpolation', () => {
  assert.equal(easeOutCubic(0), 0);
  assert.equal(easeOutCubic(1), 1);
  assert.equal(easeOutCubic(-0.5), 0);
  assert.equal(easeOutCubic(1.5), 1);
  const mid = easeOutCubic(0.5);
  assert.ok(mid > 0.8 && mid < 0.9, `Expected 0.875, got ${mid}`);
  assert.equal(mid, 0.875);
});

test('Math Helpers: voyage and free approach durations with clamp & reduced motion', () => {
  assert.equal(calcVoyageDuration(0, false), 2800);
  assert.equal(calcVoyageDuration(50, false), 2800 + 50 * 26);
  assert.equal(calcVoyageDuration(500, false), 5600);
  assert.ok(calcVoyageDuration(50, true) < calcVoyageDuration(50, false));

  assert.equal(calcFreeApproachDuration(0, false), 2200);
  assert.equal(calcFreeApproachDuration(500, false), 4500);
  assert.ok(calcFreeApproachDuration(50, true) < calcFreeApproachDuration(50, false));
});

test('Math Helpers: shortestAngleDiff wraps around [-PI, PI]', () => {
  const diff = shortestAngleDiff(Math.PI - 0.1, -Math.PI + 0.1);
  assert.ok(Math.abs(diff - 0.2) < 1e-6, `Expected +0.2 rad, got ${diff}`);

  const diffRev = shortestAngleDiff(-Math.PI + 0.1, Math.PI - 0.1);
  assert.ok(Math.abs(diffRev + 0.2) < 1e-6, `Expected -0.2 rad, got ${diffRev}`);
});

test('Math Helpers: computeVoyageTarget for Sun and odd/even planets (desktop vs mobile)', () => {
  const sunTarget = computeVoyageTarget(null, false);
  assert.deepEqual(sunTarget.position, [0, 1, 24]);
  assert.deepEqual(sunTarget.lookAt, [0, -2, -14]);

  const mercury = PLANETS[0]; // index 1 (odd -> right panel, sideNum = 1)
  const mDesktop = computeVoyageTarget(mercury, false);
  assert.equal(mDesktop.side, 'r');
  assert.deepEqual(mDesktop.position, [
    mercury.position[0],
    mercury.position[1] + 0.5,
    mercury.position[2] + mercury.cameraDistance,
  ]);
  assert.ok(Math.abs(mDesktop.lookAt[0] - (mercury.position[0] + mercury.cameraDistance * 0.4)) < 1e-6);

  const venus = PLANETS[1]; // index 2 (even -> left panel, sideNum = -1)
  const vDesktop = computeVoyageTarget(venus, false);
  assert.equal(vDesktop.side, 'l');
  assert.ok(Math.abs(vDesktop.lookAt[0] - (venus.position[0] - venus.cameraDistance * 0.4)) < 1e-6);

  const mMobile = computeVoyageTarget(mercury, true);
  assert.deepEqual(mMobile.lookAt, mercury.position);
});

test('Math Helpers: computeFreeApproach stops at planet cameraDistance and offsets look angle', () => {
  const earth = PLANETS[2]; // radius 2.6, cameraDistance 9.5
  const camPos = [earth.position[0], earth.position[1], earth.position[2] + 30];
  const res = computeFreeApproach(camPos, 0, 0, earth, -0.3, false);

  const dx = res.targetPos[0] - earth.position[0];
  const dy = res.targetPos[1] - earth.position[1];
  const dz = res.targetPos[2] - earth.position[2];
  const dist = Math.hypot(dx, dy, dz);
  assert.ok(Math.abs(dist - earth.cameraDistance) < 1e-5, `Expected ${earth.cameraDistance}, got ${dist}`);
  assert.equal(res.side, 'r'); // screenX < 0 -> panel on right
});

test('Math Helpers: applyCosmicCollisionAndBounds pushes out of planet/sun and clamps bounds', () => {
  const mercury = PLANETS[0];
  // Inside Mercury
  const insideMercury = [...mercury.position];
  const pushed = applyCosmicCollisionAndBounds(insideMercury, PLANETS, SUN_DATA.position, SUN_DATA.collisionRadius);
  const distToMercury = Math.hypot(
    pushed[0] - mercury.position[0],
    pushed[1] - mercury.position[1],
    pushed[2] - mercury.position[2]
  );
  assert.ok(distToMercury >= mercury.radius * 1.3 - 1e-4, `Expected >= ${mercury.radius * 1.3}, got ${distToMercury}`);

  // Inside Sun
  const insideSun = [SUN_DATA.position[0], SUN_DATA.position[1], SUN_DATA.position[2] + 1];
  const pushedSun = applyCosmicCollisionAndBounds(insideSun, PLANETS, SUN_DATA.position, SUN_DATA.collisionRadius);
  const distToSun = Math.hypot(
    pushedSun[0] - SUN_DATA.position[0],
    pushedSun[1] - SUN_DATA.position[1],
    pushedSun[2] - SUN_DATA.position[2]
  );
  assert.ok(distToSun >= SUN_DATA.collisionRadius - 1e-4);

  // Out of bounds
  const farOut = [500, -200, -900];
  const clamped = applyCosmicCollisionAndBounds(farOut, PLANETS, SUN_DATA.position, SUN_DATA.collisionRadius);
  assert.equal(clamped[0], 150);
  assert.equal(clamped[1], -70);
  assert.equal(clamped[2], -420);
});

test('Math Helpers: computeNormalizedModelTransform normalizes Box3 to target radius and centers pivot', () => {
  const norm = computeNormalizedModelTransform([-2, -4, -2], [2, 6, 2], 2.5);
  // Box size is [4, 10, 4], maxDim = 10, target diameter = 5 -> scale = 0.5
  // Box center is [0, 1, 0]
  assert.ok(Math.abs(norm.scale - 0.5) < 1e-6);
  assert.deepEqual(norm.center, [0, 1, 0]);
  assert.deepEqual(norm.offset, [0, -0.5, 0]);
});

test('Data Integrity: PLANETS and CONTENT match master.md & profile.md specifications', () => {
  assert.equal(PLANETS.length, 8);
  const expectedNames = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
  assert.deepEqual(PLANETS.map((p) => p.name), expectedNames);

  PLANETS.forEach((p, idx) => {
    assert.equal(p.index, idx + 1);
    assert.equal(p.position[2], -42 * (idx + 1));
    assert.ok(CONTENT[p.id], `Missing CONTENT for ${p.id}`);
    assert.ok(CONTENT[p.id].kicker.includes(p.name));
  });

  // Verify profile data presence
  const edu = CONTENT.mercury;
  assert.ok(edu.timeline.some((t) => t.title.includes('Magister Informatika') && t.description.includes('3.98')));
  const exp = CONTENT.venus;
  assert.ok(exp.timeline.some((t) => t.title.includes('VAPubs') && t.description.includes('98')));
  const skills = CONTENT.jupiter;
  assert.ok(skills.skills.length >= 6);
});

test('Zustand Store: mode transitions, navigation, panel, sound, and legend actions', () => {
  const store = createCosmicStore();
  assert.equal(store.getState().mode, 'landing');
  assert.equal(store.getState().index, 0);
  assert.equal(store.getState().sound, false);

  // Start voyage -> index 1 (Mercury)
  store.getState().next();
  assert.equal(store.getState().mode, 'voyage');
  assert.equal(store.getState().index, 1);

  // Open panel for Mercury
  store.getState().openPanel(1, 'r');
  assert.equal(store.getState().panel.open, true);
  assert.equal(store.getState().panel.index, 1);
  assert.equal(store.getState().panel.side, 'r');

  // Navigate to Neptune (8), then next wraps around to 0 (Sun / landing)
  store.getState().goTo(8);
  assert.equal(store.getState().index, 8);
  assert.equal(store.getState().panel.open, false);

  store.getState().next();
  assert.equal(store.getState().index, 0);
  assert.equal(store.getState().mode, 'landing');

  // Enter Free Mode
  store.getState().goTo(3);
  store.getState().enterFreeMode();
  assert.equal(store.getState().mode, 'free');
  assert.equal(store.getState().panel.open, false);

  // Visit planet in Free Mode
  store.getState().visitInFreeMode(5);
  assert.equal(store.getState().mode, 'free');
  assert.equal(store.getState().index, 5);
  assert.equal(store.getState().freeTarget.index, 5);

  // Exit Free Mode back to voyage
  store.getState().exitFreeMode(5);
  assert.equal(store.getState().mode, 'voyage');
  assert.equal(store.getState().index, 5);
  assert.equal(store.getState().freeTarget, null);

  // Sound & Legend toggles
  store.getState().toggleSound();
  assert.equal(store.getState().sound, true);
  store.getState().toggleLegend();
  assert.equal(store.getState().legendOpen, false);
});

test('GLTF Extension & Material Sanitization: KHR_materials_pbrSpecularGlossiness and transmission fix', async () => {
  const registered = [];
  extendGLTFLoader({
    register(fn) {
      registered.push(fn);
    },
  });
  assert.equal(registered.length, 1);

  const assignedTextures = [];
  const fakeParser = {
    json: {
      materials: [
        {
          name: 'earth_mat',
          extensions: {
            KHR_materials_pbrSpecularGlossiness: {
              diffuseFactor: [1, 1, 1, 1],
              diffuseTexture: { index: 0 },
              glossinessFactor: 0,
              specularFactor: [0, 0, 0],
            },
          },
        },
      ],
    },
    assignTexture(materialParams, mapName, mapDef, colorSpace) {
      assignedTextures.push({ mapName, index: mapDef.index, colorSpace });
      materialParams[mapName] = new THREE.Texture();
      return Promise.resolve(materialParams[mapName]);
    },
  };

  const plugin = createSpecularGlossinessPlugin(fakeParser);
  assert.equal(plugin.name, 'KHR_materials_pbrSpecularGlossiness');
  assert.equal(plugin.getMaterialType(0), THREE.MeshStandardMaterial);

  const params = {};
  await plugin.extendMaterialParams(0, params);
  assert.equal(params.metalness, 0);
  assert.ok(params.roughness >= 0.25 && params.roughness <= 0.9);
  assert.equal(assignedTextures.length, 1);
  assert.equal(assignedTextures[0].mapName, 'map');
  assert.equal(assignedTextures[0].index, 0);

  // Sanitize frosted-glass transmission & duplicate emissiveMap
  const physicalMat = new THREE.MeshPhysicalMaterial({
    transmission: 1,
    roughness: 1,
  });
  const sharedTex = new THREE.Texture();
  physicalMat.map = sharedTex;
  physicalMat.emissiveMap = sharedTex;
  physicalMat.emissiveIntensity = 1;

  const sanitized = sanitizeClonedMaterial(physicalMat);
  assert.equal(sanitized.transmission, 0);
  assert.equal(sanitized.emissiveIntensity, 0.08);

  // Decimate high-poly sphere geometry
  const highPoly = new THREE.SphereGeometry(1, 32, 32);
  const origTris = highPoly.index.count / 3;
  const decimated = decimateBufferGeometry(highPoly, 6);
  const newTris = decimated.index.count / 3;
  assert.ok(newTris < origTris * 0.25, `Expected ${newTris} < ${origTris * 0.25}`);

  // Merge multi-part untextured scene into 1 mesh
  const group = new THREE.Group();
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x336699 })
    );
    m.position.set(i, 0, 0);
    group.add(m);
  }
  mergeUntexturedSceneMeshes(group);
  assert.equal(group.children.length, 1);
  assert.equal(group.children[0].isMesh, true);
});
