import React from 'react';
import { useStore } from '../store.js';
import { PLANETS } from '../data/planets.js';

export function NavBar() {
  const mode = useStore((s) => s.mode);
  const index = useStore((s) => s.index);
  const goTo = useStore((s) => s.goTo);
  const next = useStore((s) => s.next);
  const prev = useStore((s) => s.prev);

  const isLanding = index === 0;
  const isLast = index === PLANETS.length;
  const isFree = mode === 'free';

  const handleStart = (e) => {
    e.currentTarget.blur();
    next();
  };

  const handlePrev = (e) => {
    e.currentTarget.blur();
    prev();
  };

  const handleNext = (e) => {
    e.currentTarget.blur();
    next();
  };

  const handleDot = (e, planetIdx) => {
    e.currentTarget.blur();
    goTo(planetIdx);
  };

  return (
    <nav
      id="bar"
      aria-label="Navigasi Perjalanan Kosmis"
      className={isFree ? 'hidden-bar' : ''}
    >
      <div id="go">
        {isLanding ? (
          <button
            type="button"
            id="st"
            aria-label="Mulai Perjalanan (Start Mission)"
            onClick={handleStart}
          >
            Start Mission
            <i aria-hidden="true">↓</i>
          </button>
        ) : (
          <>
            <button
              type="button"
              className="ar"
              id="pv"
              aria-label="Planet Sebelumnya"
              onClick={handlePrev}
            >
              ←
            </button>
            <div id="dots" role="group" aria-label="Pilih Planet">
              {PLANETS.map((p) => {
                const active = index === p.index;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`dot-btn ${active ? 'a' : ''}`}
                    aria-label={`${p.name} — ${p.section}`}
                    aria-current={active ? 'step' : undefined}
                    onClick={(e) => handleDot(e, p.index)}
                  />
                );
              })}
            </div>
            <button
              type="button"
              className="ar"
              id="nx"
              aria-label={isLast ? 'Kembali ke Matahari' : 'Planet Berikutnya'}
              onClick={handleNext}
            >
              {isLast ? '↺' : '→'}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
