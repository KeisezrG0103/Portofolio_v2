import React from 'react';
import { useStore } from '../store.js';

export function SoundButton() {
  const sound = useStore((s) => s.sound);
  const toggleSound = useStore((s) => s.toggleSound);

  const handleClick = (e) => {
    e.currentTarget.blur();
    toggleSound();
  };

  return (
    <button
      type="button"
      id="snd"
      aria-pressed={sound}
      aria-label={`Suara ambient saat ini ${sound ? 'hidup' : 'mati'}, klik untuk mengubah`}
      onClick={handleClick}
    >
      ♪ Suara ambient: {sound ? 'hidup' : 'mati'}
    </button>
  );
}

export default SoundButton;
