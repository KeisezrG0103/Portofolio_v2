import React, { useEffect } from 'react';
import { useStore } from '../store.js';
import { PLANETS } from '../data/planets.js';

export function Legend() {
  const mode = useStore((s) => s.mode);
  const index = useStore((s) => s.index);
  const panel = useStore((s) => s.panel);
  const legendOpen = useStore((s) => s.legendOpen);
  const toggleLegend = useStore((s) => s.toggleLegend);
  const setLegendOpen = useStore((s) => s.setLegendOpen);
  const goTo = useStore((s) => s.goTo);
  const visitInFreeMode = useStore((s) => s.visitInFreeMode);

  // Default closed on mobile (<800px)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 800) {
      setLegendOpen(false);
    }
  }, [setLegendOpen]);

  // Auto-fade when left panel is open on desktop
  const fadeForLeftPanel = panel.open && panel.side === 'l';

  const handleToggle = (e) => {
    e.currentTarget.blur();
    toggleLegend();
  };

  const handleSelectPlanet = (e, planetIndex) => {
    e.currentTarget.blur();
    if (mode === 'free') {
      visitInFreeMode(planetIndex, null);
    } else {
      goTo(planetIndex);
    }
  };

  return (
    <aside
      id="lg"
      aria-label="Legenda Tata Surya"
      className={`${!legendOpen ? 'shut' : ''} ${fadeForLeftPanel ? 'fade-left' : ''}`}
    >
      <button
        type="button"
        id="lgb"
        aria-expanded={legendOpen}
        aria-controls="lgl"
        aria-label="Buka atau tutup legenda kosmis"
        onClick={handleToggle}
      >
        ◐ Legenda
      </button>
      <div id="lgl" role="list">
        {PLANETS.map((p) => {
          const isActive = index === p.index;
          return (
            <button
              key={p.id}
              type="button"
              role="listitem"
              className={`lr ${isActive ? 'a' : ''}`}
              aria-label={`Menuju ${p.name} — ${p.section}`}
              onClick={(e) => handleSelectPlanet(e, p.index)}
            >
              <i
                style={{ background: p.color, color: p.color }}
                aria-hidden="true"
              />
              <b>{p.name}</b>
              <span>{p.section}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default Legend;
