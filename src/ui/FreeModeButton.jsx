import React from 'react';
import { useStore } from '../store.js';

export function FreeModeButton() {
  const mode = useStore((s) => s.mode);
  const enterFreeMode = useStore((s) => s.enterFreeMode);
  const exitFreeMode = useStore((s) => s.exitFreeMode);

  const isFree = mode === 'free';

  const handleClick = (e) => {
    e.currentTarget.blur();
    if (isFree) {
      exitFreeMode();
    } else {
      enterFreeMode();
    }
  };

  return (
    <button
      type="button"
      id="fb"
      aria-pressed={isFree}
      aria-label={isFree ? 'Kembali ke perjalanan terpandu' : 'Aktifkan mode jelajah bebas'}
      onClick={handleClick}
    >
      {isFree ? '← Kembali ke perjalanan' : '✦ Jelajah bebas'}
    </button>
  );
}

export default FreeModeButton;
