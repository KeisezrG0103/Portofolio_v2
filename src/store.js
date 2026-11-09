import { create } from 'zustand';
import { clamp } from './utils/math.js';

const MAX_INDEX = 8;

const storeInitializer = (set, get) => ({
  mode: 'landing', // 'landing' | 'voyage' | 'free'
  index: 0, // 0 = Sun, 1..8 = Mercury..Neptune
  panel: {
    open: false,
    index: 0,
    side: 'r', // 'l' | 'r'
  },
  sound: false,
  legendOpen: true,
  freeTarget: null, // { index, screenX, timestamp } when approaching a planet in free mode
  navTrigger: 0, // increments on explicit navigation to trigger flight in CameraRig

  goTo: (targetIndex) => {
    const idx = clamp(targetIndex, 0, MAX_INDEX);
    set((state) => ({
      mode: idx === 0 ? 'landing' : 'voyage',
      index: idx,
      panel: { ...state.panel, open: false },
      freeTarget: null,
      navTrigger: state.navTrigger + 1,
    }));
  },

  next: () => {
    const { index } = get();
    const nextIdx = index >= MAX_INDEX ? 0 : index + 1;
    get().goTo(nextIdx);
  },

  prev: () => {
    const { index } = get();
    if (index <= 0) return;
    get().goTo(index - 1);
  },

  openPanel: (index, side = 'r') => {
    set({
      panel: {
        open: true,
        index: clamp(index, 1, MAX_INDEX),
        side: side === 'l' ? 'l' : 'r',
      },
    });
  },

  closePanel: () => {
    set((state) => ({
      panel: { ...state.panel, open: false },
    }));
  },

  enterFreeMode: () => {
    set((state) => ({
      mode: 'free',
      panel: { ...state.panel, open: false },
      freeTarget: null,
    }));
  },

  exitFreeMode: (toIndex = null) => {
    const currentIdx = get().index;
    const targetIdx = toIndex !== null && toIndex !== undefined ? clamp(toIndex, 0, MAX_INDEX) : currentIdx;
    set((state) => ({
      mode: targetIdx === 0 ? 'landing' : 'voyage',
      index: targetIdx,
      panel: { ...state.panel, open: false },
      freeTarget: null,
      navTrigger: state.navTrigger + 1,
    }));
  },

  visitInFreeMode: (planetIndex, screenX = null) => {
    const idx = clamp(planetIndex, 1, MAX_INDEX);
    set((state) => ({
      mode: 'free',
      index: idx,
      panel: { ...state.panel, open: false },
      freeTarget: {
        index: idx,
        screenX,
        timestamp: Date.now() + Math.random(),
      },
    }));
  },

  cancelFreeTarget: () => {
    set({ freeTarget: null });
  },

  toggleSound: () => {
    set((state) => ({ sound: !state.sound }));
  },

  setSound: (val) => {
    set({ sound: Boolean(val) });
  },

  toggleLegend: () => {
    set((state) => ({ legendOpen: !state.legendOpen }));
  },

  setLegendOpen: (val) => {
    set({ legendOpen: Boolean(val) });
  },
});

export function createCosmicStore() {
  return create(storeInitializer);
}

export const useStore = create(storeInitializer);
export default useStore;
