import React from 'react';
import { useStore } from '../store.js';
import { PLANETS, getPlanetByIndex } from '../data/planets.js';

export function Counter() {
  const mode = useStore((s) => s.mode);
  const index = useStore((s) => s.index);

  if (mode === 'free' || index <= 0) {
    return <div id="cnt" aria-live="polite" />;
  }

  const planet = getPlanetByIndex(index);
  const total = String(PLANETS.length).padStart(2, '0');
  const current = String(index).padStart(2, '0');
  const label = planet ? `${current} / ${total} · ${planet.name.toUpperCase()}` : '';

  return (
    <div id="cnt" aria-live="polite">
      {label}
    </div>
  );
}

export default Counter;
