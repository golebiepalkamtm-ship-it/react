import { useEffect, useRef } from 'react';

export function ReactiveAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const onPointerMove = (e: PointerEvent) => {
      if (!ctxRef.current) return;
      const w = window.innerWidth;
      const pan = (e.clientX / w) * 2 - 1;
      if (pannerRef.current) {
        pannerRef.current.pan.value = pan;
      }
    };

    const init = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        ctxRef.current = ctx;
        const gain = ctx.createGain();
        gainRef.current = gain;
        gain.gain.value = 0.0;

        const panner = ctx.createStereoPanner();
        pannerRef.current = panner;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filterRef.current = filter;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 220;
        oscRef.current = osc;

        osc.connect(filter);
        filter.connect(panner);
        panner.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
      } catch {
        return;
      }
    };

    const resumeOnMove = async () => {
      if (!ctxRef.current) {
        init();
      }
      if (ctxRef.current && ctxRef.current.state !== 'running') {
        await ctxRef.current.resume().catch(() => {});
      }
    };

    const tick = () => {
      const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scroll-velocity') || '0');
      const speed = Math.min(Math.abs(v), 6);
      const g = speed * 0.02;
      if (gainRef.current) {
        gainRef.current.gain.value = g;
      }
      if (filterRef.current) {
        filterRef.current.frequency.value = 600 + speed * 200;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', resumeOnMove, { once: true });
    window.addEventListener('pointermove', onPointerMove);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (oscRef.current) oscRef.current.stop();
      if (ctxRef.current) ctxRef.current.close();
      ctxRef.current = null;
    };
  }, []);

  return null;
}

export default ReactiveAudio;
