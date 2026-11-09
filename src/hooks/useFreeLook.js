import { useEffect } from 'react';
import { useStore } from '../store.js';
import { clamp } from '../utils/math.js';
import { cosmicRuntime } from '../utils/runtime.js';

/**
 * Tracks pointer look (yaw/pitch) in free mode and normalized pointer offset (mx/my)
 * for subtle camera drift in voyage/landing mode, plus prefers-reduced-motion state.
 */
export function useFreeLook() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const look = cosmicRuntime.look;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    look.reducedMotion = mq.matches;
    const onMqChange = (e) => {
      look.reducedMotion = e.matches;
    };
    if (mq.addEventListener) {
      mq.addEventListener('change', onMqChange);
    }

    const onPointerDown = (e) => {
      if (
        e.target &&
        e.target.closest &&
        e.target.closest('#panel, #bar, #lg, #snd, #fb, .brand, button, a, input, textarea')
      ) {
        return;
      }
      look.pointerDown = true;
      look.dragDistance = 0;
      look.lastPointerX = e.clientX;
      look.lastPointerY = e.clientY;
    };

    const onPointerMove = (e) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      look.mx = e.clientX / w - 0.5;
      look.my = e.clientY / h - 0.5;

      const state = useStore.getState();
      if (state.mode === 'free' && look.pointerDown) {
        const dx = e.clientX - look.lastPointerX;
        const dy = e.clientY - look.lastPointerY;

        look.lastPointerX = e.clientX;
        look.lastPointerY = e.clientY;

        look.targetYaw -= dx * 0.003;
        look.targetPitch = clamp(look.targetPitch - dy * 0.003, -1.5, 1.5);
        if (look.reducedMotion) {
          look.yaw = look.targetYaw;
          look.pitch = look.targetPitch;
        }
        look.dragDistance += Math.abs(dx) + Math.abs(dy);

        if (look.dragDistance > 8 && typeof cosmicRuntime.cancelFreeFlight === 'function') {
          cosmicRuntime.cancelFreeFlight();
        }
      }
    };

    const onPointerUp = () => {
      look.pointerDown = false;
    };

    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', onMqChange);
      }
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, []);
}

export default useFreeLook;
