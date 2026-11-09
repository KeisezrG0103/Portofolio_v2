/**
 * Pure mathematical & 3D trajectory helpers for "Cosmic Observatory".
 * Isolated for unit testing and zero-allocation/low-overhead frame ticks.
 */

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function clampDelta(delta) {
  if (!Number.isFinite(delta) || delta < 0) return 0;
  return Math.min(0.05, delta);
}

export function easeOutCubic(t) {
  const c = clamp(t, 0, 1);
  return 1 - Math.pow(1 - c, 3);
}

export function calcVoyageDuration(distance, reducedMotion = false) {
  const d = Math.max(0, distance || 0);
  if (reducedMotion) {
    return clamp(900 + d * 8, 900, 1600);
  }
  return clamp(2800 + d * 26, 2800, 5600);
}

export function calcFreeApproachDuration(distance, reducedMotion = false) {
  const d = Math.max(0, distance || 0);
  if (reducedMotion) {
    return clamp(800 + d * 7, 800, 1400);
  }
  return clamp(2200 + d * 22, 2200, 4500);
}

export function shortestAngleDiff(fromYaw, toYaw) {
  return (((toYaw - fromYaw + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
}

/**
 * Computes the camera target position, lookAt point, and panel side ('l' | 'r')
 * for a given planet (or null/0 for Landing/Sun).
 */
export function computeVoyageTarget(planet, isMobile = false) {
  if (!planet || !planet.index) {
    return {
      position: [0, 1, 24],
      lookAt: [0, -2, -14],
      side: 'r',
      sideNum: 1,
    };
  }

  // Odd planets -> right panel (sideNum = 1), Even planets -> left panel (sideNum = -1)
  const sideNum = planet.index % 2 === 1 ? 1 : -1;
  const side = sideNum > 0 ? 'r' : 'l';
  const [px, py, pz] = planet.position;
  const d = planet.cameraDistance;

  const position = [px, py + (isMobile ? 0 : 0.5), pz + d];
  const lookAt = isMobile
    ? [px, py, pz]
    : [px + sideNum * d * 0.4, py, pz];

  return {
    position,
    lookAt,
    side,
    sideNum,
  };
}

/**
 * Computes free-mode approach target position, yaw delta, target pitch, and panel side.
 * Stops at planet.cameraDistance along the vector from planet to current camera position.
 */
export function computeFreeApproach(
  camPos,
  currentYaw,
  currentPitch,
  planet,
  screenX = -0.2,
  isMobile = false
) {
  const [ox, oy, oz] = planet.position;
  const sideNum = screenX < 0 ? 1 : -1;
  const side = sideNum > 0 ? 'r' : 'l';

  let dx = camPos[0] - ox;
  let dy = camPos[1] - oy;
  let dz = camPos[2] - oz;
  let lenSq = dx * dx + dy * dy + dz * dz;

  if (lenSq < 1e-4) {
    dx = 0;
    dy = 0.2;
    dz = 1;
    lenSq = dx * dx + dy * dy + dz * dz;
  }

  const len = Math.sqrt(lenSq);
  const nx = dx / len;
  const ny = dy / len;
  const nz = dz / len;

  const targetPos = [
    ox + nx * planet.cameraDistance,
    oy + ny * planet.cameraDistance,
    oz + nz * planet.cameraDistance,
  ];

  // Look direction from targetPos toward planet center
  let lkx = ox - targetPos[0];
  let lky = oy - targetPos[1];
  let lkz = oz - targetPos[2];
  const lkLen = Math.hypot(lkx, lky, lkz) || 1;
  lkx /= lkLen;
  lky /= lkLen;
  lkz /= lkLen;

  const targetYaw = Math.atan2(-lkx, -lkz) - (!isMobile ? sideNum * 0.34 : 0);
  const targetPitch = Math.asin(clamp(lky, -1, 1));
  const dyaw = shortestAngleDiff(currentYaw, targetYaw);
  const dpitch = targetPitch - currentPitch;

  const moveDist = Math.hypot(
    targetPos[0] - camPos[0],
    targetPos[1] - camPos[1],
    targetPos[2] - camPos[2]
  );

  return {
    targetPos,
    startYaw: currentYaw,
    dyaw,
    startPitch: currentPitch,
    targetPitch,
    dpitch,
    side,
    sideNum,
    distance: moveDist,
  };
}

/**
 * Pushes camera position outside planet collision spheres (radius * 1.3) and Sun (radius 5),
 * and clamps position within the cosmic bounding box: x ±150, y ±70, z [-420, 80].
 */
export function applyCosmicCollisionAndBounds(
  pos,
  planets,
  sunPos = [0, -4, -14],
  sunCollisionRadius = 5
) {
  let [x, y, z] = pos;

  if (Array.isArray(planets)) {
    for (let i = 0; i < planets.length; i++) {
      const p = planets[i];
      const [px, py, pz] = p.position;
      const minR = p.radius * 1.3;
      let dx = x - px;
      let dy = y - py;
      let dz = z - pz;
      const dist = Math.hypot(dx, dy, dz);
      if (dist < minR) {
        if (dist < 1e-5) {
          dx = 0;
          dy = 0;
          dz = 1;
        } else {
          dx /= dist;
          dy /= dist;
          dz /= dist;
        }
        x = px + dx * minR;
        y = py + dy * minR;
        z = pz + dz * minR;
      }
    }
  }

  if (sunPos) {
    const [sx, sy, sz] = sunPos;
    let dx = x - sx;
    let dy = y - sy;
    let dz = z - sz;
    const dist = Math.hypot(dx, dy, dz);
    if (dist < sunCollisionRadius) {
      if (dist < 1e-5) {
        dx = 0;
        dy = 0;
        dz = 1;
      } else {
        dx /= dist;
        dy /= dist;
        dz /= dist;
      }
      x = sx + dx * sunCollisionRadius;
      y = sy + dy * sunCollisionRadius;
      z = sz + dz * sunCollisionRadius;
    }
  }

  x = clamp(x, -150, 150);
  y = clamp(y, -70, 70);
  z = clamp(z, -420, 80);

  return [x, y, z];
}

/**
 * Given a bounding box min [x,y,z] and max [x,y,z] and target radius,
 * calculates uniform scale factor and pivot center offset so the model fits targetRadius
 * and is centered at (0,0,0).
 */
export function computeNormalizedModelTransform(minBox, maxBox, targetRadius) {
  const sx = maxBox[0] - minBox[0];
  const sy = maxBox[1] - minBox[1];
  const sz = maxBox[2] - minBox[2];

  const cx = (minBox[0] + maxBox[0]) * 0.5;
  const cy = (minBox[1] + maxBox[1]) * 0.5;
  const cz = (minBox[2] + maxBox[2]) * 0.5;

  const maxDim = Math.max(sx, sy, sz);
  const scale = maxDim > 1e-6 ? (targetRadius * 2) / maxDim : 1;

  const offset = [
    cx === 0 ? 0 : -cx * scale,
    cy === 0 ? 0 : -cy * scale,
    cz === 0 ? 0 : -cz * scale,
  ];

  return {
    scale,
    center: [cx, cy, cz],
    size: [sx, sy, sz],
    offset,
  };
}
