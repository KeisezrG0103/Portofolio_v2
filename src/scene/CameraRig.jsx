import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../store.js';
import { PLANETS, SUN_DATA, getPlanetByIndex } from '../data/planets.js';
import {
  applyCosmicCollisionAndBounds,
  calcFreeApproachDuration,
  calcVoyageDuration,
  clampDelta,
  computeFreeApproach,
  computeVoyageTarget,
  easeOutCubic,
} from '../utils/math.js';
import { cosmicRuntime, hideAllLabels, updateLabelElement } from '../utils/runtime.js';

// Pre-allocated scratch vectors for zero per-frame GC pressure
const _dir = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _tempVec = new THREE.Vector3();
const _planetPos = new THREE.Vector3();

export function CameraRig() {
  const { camera } = useThree();

  // Mutable flight & physics state (zero React state re-renders per frame)
  const rigRef = useRef({
    bp: new THREE.Vector3(...SUN_DATA.landingCameraPos),
    bl: new THREE.Vector3(...SUN_DATA.landingLookAt),
    fp: new THREE.Vector3(...SUN_DATA.landingCameraPos),
    vel: new THREE.Vector3(0, 0, 0),
    voyageFlight: {
      active: false,
      a: new THREE.Vector3(...SUN_DATA.landingCameraPos),
      b: new THREE.Vector3(...SUN_DATA.landingCameraPos),
      la: new THREE.Vector3(...SUN_DATA.landingLookAt),
      lb: new THREE.Vector3(...SUN_DATA.landingLookAt),
      startTime: 0,
      duration: 2800,
    },
    freeFlight: null,
    voyageToken: 0,
    freeToken: 0,
    panelTimer: null,
    freeTimer: null,
    prevMode: 'landing',
    prevIndex: 0,
    prevNavTrigger: 0,
    prevFreeTimestamp: 0,
  });

  const clearTimers = useCallback(() => {
    if (rigRef.current.panelTimer) {
      clearTimeout(rigRef.current.panelTimer);
      rigRef.current.panelTimer = null;
    }
    if (rigRef.current.freeTimer) {
      clearTimeout(rigRef.current.freeTimer);
      rigRef.current.freeTimer = null;
    }
  }, []);

  const cancelFreeFlight = useCallback(() => {
    const r = rigRef.current;
    if (r.freeFlight) {
      r.freeFlight = null;
    }
    r.freeToken += 1;
    if (r.freeTimer) {
      clearTimeout(r.freeTimer);
      r.freeTimer = null;
    }
  }, []);

  useEffect(() => {
    cosmicRuntime.cancelFreeFlight = cancelFreeFlight;
    return () => {
      cosmicRuntime.cancelFreeFlight = null;
    };
  }, [cancelFreeFlight]);

  useEffect(() => {
    camera.position.set(...SUN_DATA.landingCameraPos);
    camera.lookAt(...SUN_DATA.landingLookAt);

    const onResize = () => {
      const state = useStore.getState();
      const r = rigRef.current;
      if (state.mode !== 'free' && !r.voyageFlight.active && state.index > 0) {
        const planet = getPlanetByIndex(state.index);
        const isMobile = window.innerWidth <= 800;
        const target = computeVoyageTarget(planet, isMobile);
        r.bp.set(...target.position);
        r.bl.set(...target.lookAt);
      }
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimers();
    };
  }, [camera, clearTimers]);

  const startVoyageTo = useCallback(
    (targetIndex) => {
      const r = rigRef.current;
      clearTimers();
      r.voyageToken += 1;
      const token = r.voyageToken;

      const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 800 : false;
      const reducedMotion = Boolean(cosmicRuntime.look.reducedMotion);

      const planet = getPlanetByIndex(targetIndex);
      const target = computeVoyageTarget(planet, isMobile);

      const destPos = new THREE.Vector3(...target.position);
      const destLook = new THREE.Vector3(...target.lookAt);
      const distance = r.bp.distanceTo(destPos);
      const duration = calcVoyageDuration(distance, reducedMotion);

      r.voyageFlight = {
        active: true,
        a: r.bp.clone(),
        b: destPos,
        la: r.bl.clone(),
        lb: destLook,
        startTime: performance.now(),
        duration,
      };

      if (planet) {
        r.panelTimer = setTimeout(() => {
          const st = useStore.getState();
          if (r.voyageToken === token && st.mode !== 'free' && st.index === targetIndex) {
            st.openPanel(targetIndex, target.side);
          }
        }, duration * 0.78);
      }
    },
    [clearTimers]
  );

  const startFreeApproachTo = useCallback(
    (targetIndex, explicitScreenX) => {
      const r = rigRef.current;
      const planet = getPlanetByIndex(targetIndex);
      if (!planet) return;

      if (r.freeTimer) {
        clearTimeout(r.freeTimer);
        r.freeTimer = null;
      }
      r.freeToken += 1;
      const token = r.freeToken;

      let screenX = explicitScreenX;
      if (screenX === null || screenX === undefined) {
        const proj = new THREE.Vector3(...planet.position).project(camera);
        screenX = proj.x;
      }

      const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 800 : false;
      const reducedMotion = Boolean(cosmicRuntime.look.reducedMotion);

      const currentYaw = cosmicRuntime.look.yaw;
      const currentPitch = cosmicRuntime.look.pitch;

      const approach = computeFreeApproach(
        [r.fp.x, r.fp.y, r.fp.z],
        currentYaw,
        currentPitch,
        planet,
        screenX,
        isMobile
      );

      const duration = calcFreeApproachDuration(approach.distance, reducedMotion);

      r.freeFlight = {
        a: r.fp.clone(),
        b: new THREE.Vector3(...approach.targetPos),
        startYaw: approach.startYaw,
        dyaw: approach.dyaw,
        startPitch: approach.startPitch,
        dpitch: approach.dpitch,
        startTime: performance.now(),
        duration,
      };

      r.freeTimer = setTimeout(() => {
        const st = useStore.getState();
        if (r.freeToken === token && st.mode === 'free') {
          st.openPanel(targetIndex, approach.side);
        }
      }, duration * 0.78);
    },
    [camera]
  );

  useFrame((state, delta) => {
    const storeState = useStore.getState();
    const r = rigRef.current;
    const look = cosmicRuntime.look;
    const keys = cosmicRuntime.keys;
    const now = performance.now();

    // 1. Detect mode transitions (Voyage/Landing <-> Free)
    if (storeState.mode !== r.prevMode) {
      if (storeState.mode === 'free') {
        clearTimers();
        r.voyageFlight.active = false;
        r.voyageToken += 1;
        r.freeFlight = null;
        r.freeToken += 1;

        camera.getWorldDirection(_dir);
        look.yaw = Math.atan2(-_dir.x, -_dir.z);
        look.pitch = Math.asin(Math.max(-1, Math.min(1, _dir.y)));
        look.targetYaw = look.yaw;
        look.targetPitch = look.pitch;
        look.dragDistance = 0;

        r.fp.copy(camera.position);
        r.vel.set(0, 0, 0);

        if (typeof document !== 'undefined') {
          document.body.style.cursor = 'grab';
        }
      } else if (r.prevMode === 'free') {
        clearTimers();
        r.freeFlight = null;
        r.freeToken += 1;

        r.bp.copy(r.fp);
        camera.getWorldDirection(_dir);
        r.bl.copy(r.fp).addScaledVector(_dir, 60);

        hideAllLabels();

        if (typeof document !== 'undefined') {
          document.body.style.cursor = 'default';
        }

        startVoyageTo(storeState.index);
        r.prevIndex = storeState.index;
        r.prevNavTrigger = storeState.navTrigger;
      }
      r.prevMode = storeState.mode;
    }

    // 2. Detect voyage navigation changes
    if (
      storeState.mode !== 'free' &&
      (storeState.index !== r.prevIndex || storeState.navTrigger !== r.prevNavTrigger)
    ) {
      r.prevIndex = storeState.index;
      r.prevNavTrigger = storeState.navTrigger;
      startVoyageTo(storeState.index);
    }

    // 3. Detect free-mode planet approach requests
    if (
      storeState.mode === 'free' &&
      storeState.freeTarget &&
      storeState.freeTarget.timestamp !== r.prevFreeTimestamp
    ) {
      r.prevFreeTimestamp = storeState.freeTarget.timestamp;
      r.prevIndex = storeState.freeTarget.index;
      startFreeApproachTo(storeState.freeTarget.index, storeState.freeTarget.screenX);
    }

    // 4. Execute per-frame camera kinematics
    const dt = clampDelta(delta);

    if (storeState.mode === 'free') {
      if (r.freeFlight) {
        const hasMoveKey =
          keys.w || keys.a || keys.s || keys.d || keys.q || keys.e || keys[' '];
        const hasDragged = look.pointerDown && look.dragDistance > 8;

        if (hasMoveKey || hasDragged) {
          cancelFreeFlight();
        } else {
          const progress = Math.min(
            1,
            (now - r.freeFlight.startTime) / r.freeFlight.duration
          );
          const e = easeOutCubic(progress);
          r.fp.lerpVectors(r.freeFlight.a, r.freeFlight.b, e);
          look.yaw = r.freeFlight.startYaw + r.freeFlight.dyaw * e;
          look.pitch = r.freeFlight.startPitch + r.freeFlight.dpitch * e;
          look.targetYaw = look.yaw;
          look.targetPitch = look.pitch;
          r.vel.set(0, 0, 0);
          if (progress >= 1) {
            r.freeFlight = null;
          }
        }
      } else {
        const lookDamp = look.reducedMotion ? 1 : 1 - Math.exp(-dt * 20);
        look.yaw += (look.targetYaw - look.yaw) * lookDamp;
        look.pitch += (look.targetPitch - look.pitch) * lookDamp;
      }

      const yaw = look.yaw;
      const pitch = look.pitch;
      const cp = Math.cos(pitch);

      _forward.set(-Math.sin(yaw) * cp, Math.sin(pitch), -Math.cos(yaw) * cp);
      _right.set(Math.cos(yaw), 0, -Math.sin(yaw));
      _moveDir.set(0, 0, 0);

      if (keys.w) _moveDir.add(_forward);
      if (keys.s) _moveDir.sub(_forward);
      if (keys.d) _moveDir.add(_right);
      if (keys.a) _moveDir.sub(_right);
      if (keys.e || keys[' ']) _moveDir.y += 1;
      if (keys.q) _moveDir.y -= 1;

      if (_moveDir.lengthSq() > 0) {
        _moveDir.normalize().multiplyScalar(keys.shift ? 60 : 16);
      }

      r.vel.lerp(_moveDir, 1 - Math.exp(-dt * 5.5));
      r.fp.addScaledVector(r.vel, dt);

      const clampedPos = applyCosmicCollisionAndBounds(
        [r.fp.x, r.fp.y, r.fp.z],
        PLANETS,
        SUN_DATA.position,
        SUN_DATA.collisionRadius
      );
      r.fp.set(clampedPos[0], clampedPos[1], clampedPos[2]);

      camera.position.copy(r.fp);
      camera.rotation.set(pitch, yaw, 0, 'YXZ');

      // Project floating planet labels directly via DOM helpers (zero GC allocations)
      const width = state.size.width || window.innerWidth;
      const height = state.size.height || window.innerHeight;

      for (let i = 0; i < PLANETS.length; i++) {
        const p = PLANETS[i];
        _planetPos.set(p.position[0], p.position[1], p.position[2]);
        const dist = camera.position.distanceTo(_planetPos);
        _tempVec.set(p.position[0], p.position[1] + p.radius * 1.35 + 0.5, p.position[2]);
        _tempVec.project(camera);
        const visible =
          _tempVec.z < 1 && Math.abs(_tempVec.x) < 1.1 && Math.abs(_tempVec.y) < 1.1;
        const opacity = visible ? Math.min(0.75, dist / (p.radius * 5)) : 0;
        const xPx = (_tempVec.x * 0.5 + 0.5) * width;
        const yPx = (-_tempVec.y * 0.5 + 0.5) * height;
        updateLabelElement(i, opacity, xPx, yPx);
      }
    } else {
      if (r.voyageFlight.active) {
        const progress = Math.min(
          1,
          (now - r.voyageFlight.startTime) / r.voyageFlight.duration
        );
        const e = easeOutCubic(progress);
        r.bp.lerpVectors(r.voyageFlight.a, r.voyageFlight.b, e);
        r.bl.lerpVectors(r.voyageFlight.la, r.voyageFlight.lb, e);
        if (progress >= 1) {
          r.voyageFlight.active = false;
        }
      }

      let driftX = 0;
      let driftY = 0;
      if (!look.reducedMotion) {
        const driftDamp = 1 - Math.exp(-dt * 2.5);
        look.sx += (look.mx - look.sx) * driftDamp;
        look.sy += (look.my - look.sy) * driftDamp;
        driftX = look.sx * 2.2;
        driftY = -look.sy * 1.4;
      }

      camera.position.set(r.bp.x + driftX, r.bp.y + driftY, r.bp.z);
      camera.lookAt(r.bl);
    }
  });

  return null;
}

export default CameraRig;
