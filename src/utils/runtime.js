/**
 * Shared mutable 60fps runtime state for CameraRig, input hooks, and DOM label projection.
 * Lives outside React state/props so per-frame mutations have zero re-render overhead
 * and strictly satisfy React 19 compiler immutability rules on component props.
 */

export const cosmicRuntime = {
  keys: {},
  look: {
    mx: 0,
    my: 0,
    sx: 0,
    sy: 0,
    yaw: 0,
    pitch: 0,
    targetYaw: 0,
    targetPitch: 0,
    pointerDown: false,
    dragDistance: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    reducedMotion: false,
  },
  labelElements: [],
  labelVisCache: [],
  cancelFreeFlight: null,
};

export function setLabelElement(index, el) {
  cosmicRuntime.labelElements[index] = el;
  cosmicRuntime.labelVisCache[index] = -1;
}

export function hideAllLabels() {
  for (let i = 0; i < cosmicRuntime.labelElements.length; i++) {
    const el = cosmicRuntime.labelElements[i];
    if (el && cosmicRuntime.labelVisCache[i] !== 0) {
      el.style.opacity = '0';
      cosmicRuntime.labelVisCache[i] = 0;
    }
  }
}

export function updateLabelElement(index, opacity, xPx, yPx) {
  const el = cosmicRuntime.labelElements[index];
  if (!el) return;
  const roundedOp = opacity <= 0.01 ? 0 : Math.round(opacity * 100) / 100;
  if (roundedOp === 0) {
    if (cosmicRuntime.labelVisCache[index] !== 0) {
      el.style.opacity = '0';
      cosmicRuntime.labelVisCache[index] = 0;
    }
    return;
  }
  if (cosmicRuntime.labelVisCache[index] !== roundedOp) {
    el.style.opacity = String(roundedOp);
    cosmicRuntime.labelVisCache[index] = roundedOp;
  }
  el.style.transform = `translate3d(${xPx.toFixed(1)}px, ${yPx.toFixed(1)}px, 0) translate(-50%, -100%)`;
}
