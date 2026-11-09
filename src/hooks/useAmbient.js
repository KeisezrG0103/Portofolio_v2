import { useEffect, useRef } from 'react';
import { useStore } from '../store.js';

/**
 * WebAudio cosmic ambient drone hook.
 * - 5 sine oscillators (55, 82.4, 110, 164.8, 220 Hz) with ±8 cent detune
 * - Slow LFO modulation per voice through a 700 Hz lowpass filter
 * - Strictly no autoplay: creates AudioContext only upon first user activation
 * - 3-second smooth linear gain fade-in / fade-out
 * - Safe against React StrictMode double-mounting and cleans up on unmount
 */
export function useAmbient() {
  const sound = useStore((s) => s.sound);
  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only initialize AudioContext when user explicitly enables sound for the first time
    if (sound && !audioRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ac = new AudioCtx();
      const master = ac.createGain();
      master.gain.value = 0;

      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 700;
      lp.connect(master);
      master.connect(ac.destination);

      const freqs = [55, 82.4, 110, 164.8, 220];
      const nodes = [];

      freqs.forEach((f, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const lfo = ac.createOscillator();
        const lfoGain = ac.createGain();

        osc.type = 'sine';
        osc.frequency.value = f;
        osc.detune.value = -8 + Math.random() * 16;

        const baseGain = 0.05 / (1 + i * 0.5);
        gain.gain.value = baseGain;

        lfo.type = 'sine';
        lfo.frequency.value = 0.04 + i * 0.017;
        lfoGain.gain.value = baseGain * 0.8;

        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        osc.connect(gain);
        gain.connect(lp);

        osc.start();
        lfo.start();
        nodes.push(osc, lfo);
      });

      audioRef.current = { ac, master, nodes };
    }

    const ctxObj = audioRef.current;
    if (!ctxObj) return;

    const { ac, master } = ctxObj;
    if (sound && ac.state === 'suspended') {
      ac.resume().catch(() => {});
    }

    const now = ac.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(sound ? 0.8 : 0, now + 3.0);
  }, [sound]);

  useEffect(() => {
    return () => {
      const ctxObj = audioRef.current;
      if (ctxObj) {
        try {
          ctxObj.nodes.forEach((n) => {
            try {
              n.stop();
            } catch {
              // ignore already stopped
            }
          });
          ctxObj.ac.close().catch(() => {});
        } catch {
          // ignore close errors
        }
        audioRef.current = null;
      }
    };
  }, []);
}

export default useAmbient;
