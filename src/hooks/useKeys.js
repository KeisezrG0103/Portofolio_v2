import { useEffect, useRef } from 'react';
import { useStore } from '../store.js';
import { cosmicRuntime } from '../utils/runtime.js';

/**
 * Tracks keyboard state in cosmicRuntime.keys (zero React re-renders per frame)
 * and handles keyboard/wheel/touch navigation in landing, voyage, and free modes.
 */
export function useKeys() {
  const lastNavTimeRef = useRef(0);
  const touchStartYRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isFormElement = (el) => {
      if (!el || !el.tagName) return false;
      const tag = el.tagName.toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
    };

    const onKeyDown = (e) => {
      if (isFormElement(e.target)) {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      const state = useStore.getState();
      const keyLower = e.key.toLowerCase();

      if (keyLower === 'escape') {
        e.preventDefault();
        if (state.panel.open) {
          state.closePanel();
        } else if (state.mode === 'free') {
          state.exitFreeMode();
        }
        return;
      }

      if (state.mode === 'free') {
        cosmicRuntime.keys[keyLower] = true;
        if (e.shiftKey) cosmicRuntime.keys.shift = true;
        if (e.key === ' ') {
          e.preventDefault();
        }
        return;
      }

      // Voyage / Landing mode keyboard navigation
      if (['ArrowRight', 'ArrowDown', ' '].includes(e.key)) {
        if (e.key === ' ' && e.target && e.target.tagName === 'BUTTON') return;
        e.preventDefault();
        lastNavTimeRef.current = performance.now();
        state.next();
      } else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        lastNavTimeRef.current = performance.now();
        state.prev();
      }
    };

    const onKeyUp = (e) => {
      const keyLower = e.key.toLowerCase();
      delete cosmicRuntime.keys[keyLower];
      if (!e.shiftKey) {
        delete cosmicRuntime.keys.shift;
      }
    };

    const onBlur = () => {
      cosmicRuntime.keys = {};
    };

    const onWheel = (e) => {
      const state = useStore.getState();
      if (state.mode === 'free') return;
      if (e.target && e.target.closest && e.target.closest('#panel')) return;
      const now = performance.now();
      if (now - lastNavTimeRef.current < 1700) return;
      if (Math.abs(e.deltaY) < 8) return;

      if (e.deltaY > 0) {
        if (state.index < 8) {
          lastNavTimeRef.current = now;
          state.goTo(state.index + 1);
        }
      } else if (state.index > 0) {
        lastNavTimeRef.current = now;
        state.goTo(state.index - 1);
      }
    };

    const onTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const onTouchEnd = (e) => {
      const state = useStore.getState();
      if (state.mode === 'free') return;
      if (e.target && e.target.closest && e.target.closest('#panel')) return;
      if (!e.changedTouches || e.changedTouches.length === 0) return;

      const dy = touchStartYRef.current - e.changedTouches[0].clientY;
      const now = performance.now();
      if (Math.abs(dy) > 60 && now - lastNavTimeRef.current > 1700) {
        if (dy > 0) {
          if (state.index < 8) {
            lastNavTimeRef.current = now;
            state.goTo(state.index + 1);
          }
        } else if (state.index > 0) {
          lastNavTimeRef.current = now;
          state.goTo(state.index - 1);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);
}

export default useKeys;
