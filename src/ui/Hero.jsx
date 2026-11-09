import React from 'react';
import { useStore } from '../store.js';
import { PROFILE_META } from '../data/content.js';

export function Hero() {
  const mode = useStore((s) => s.mode);
  const index = useStore((s) => s.index);
  const isHidden = mode === 'free' || index > 0;

  return (
    <header
      id="hero"
      className={isHidden ? 'away' : ''}
      aria-hidden={isHidden ? 'true' : undefined}
    >
      <h1>{PROFILE_META.name}</h1>
      <p>{PROFILE_META.role}</p>
    </header>
  );
}

export default Hero;
