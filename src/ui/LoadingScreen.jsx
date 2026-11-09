import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

export function LoadingScreen() {
  const { active, progress } = useProgress();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!active && progress >= 99) {
      const t = setTimeout(() => setDismissed(true), 450);
      return () => clearTimeout(t);
    }
  }, [active, progress]);

  // Safety fallback timeout so progressive/fallback assets never block the observatory
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setDismissed(true);
    }, 3200);
    return () => clearTimeout(fallbackTimer);
  }, []);

  const pct = dismissed ? 100 : Math.min(100, Math.max(8, Math.round(progress || 0)));

  return (
    <div
      id="loading-screen"
      className={dismissed ? 'done' : ''}
      aria-hidden={dismissed}
    >
      <div className="loader-inner">
        <div
          className="loader-bar"
          role="progressbar"
          aria-label="Memuat aset observatorium kosmis"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <span className="loader-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="loader-pct">{pct}%</div>
      </div>
    </div>
  );
}

export default LoadingScreen;
