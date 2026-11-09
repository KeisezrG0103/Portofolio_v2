import React from 'react';
import { useStore } from '../store.js';
import { PROFILE_META } from '../data/content.js';

export function Brand() {
  const mode = useStore((s) => s.mode);
  const goTo = useStore((s) => s.goTo);
  const exitFreeMode = useStore((s) => s.exitFreeMode);

  const handleClick = (e) => {
    e.currentTarget.blur();
    if (mode === 'free') {
      exitFreeMode(0);
    } else {
      goTo(0);
    }
  };

  return (
    <button
      type="button"
      className="brand"
      id="home"
      aria-label="Kembali ke Matahari (Halaman Awal)"
      onClick={handleClick}
    >
      {PROFILE_META.brand}
    </button>
  );
}

export default Brand;
