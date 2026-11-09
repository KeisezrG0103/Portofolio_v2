import React from 'react';
import { useStore } from '../store.js';
import { PLANETS } from '../data/planets.js';
import { setLabelElement } from '../utils/runtime.js';

export function Hint() {
  const mode = useStore((s) => s.mode);
  const isFree = mode === 'free';

  return (
    <>
      <div
        id="hint"
        className={isFree ? 'on' : ''}
        aria-hidden={!isFree}
      >
        W A S D bergerak · Q / E turun · naik · Shift lebih cepat · seret untuk
        melihat · klik planet untuk terbang mendekat · deskripsi muncul · Esc
        keluar
      </div>

      {/* Projected 3D planet labels updated directly via DOM helpers in CameraRig */}
      <div aria-hidden="true">
        {PLANETS.map((p, idx) => (
          <div
            key={p.id}
            ref={(el) => setLabelElement(idx, el)}
            className="fl"
          >
            {p.name}
          </div>
        ))}
      </div>
    </>
  );
}

export default Hint;
