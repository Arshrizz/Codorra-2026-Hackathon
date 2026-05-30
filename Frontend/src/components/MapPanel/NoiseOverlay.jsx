import { useEffect, useRef } from 'react';

function getParticleConfig(epsilon) {
  if (epsilon >= 0.8) return { count: 40,  speedMin: 3,   speedMax: 5,   color: 'oklch(55% 0.15 250)' };
  if (epsilon >= 0.5) return { count: 100, speedMin: 2,   speedMax: 4,   color: 'oklch(55% 0.15 250)' };
  if (epsilon >= 0.2) return { count: 160, speedMin: 1,   speedMax: 2.5, color: 'oklch(65% 0.16 55)' };
  return                     { count: 200, speedMin: 0.5, speedMax: 1.5, color: 'oklch(55% 0.22 25)' };
}

function createParticle(id, w, h, speedMin, speedMax) {
  const angle   = Math.random() * Math.PI * 2;
  const speed   = speedMin + Math.random() * (speedMax - speedMin);
  const life    = speedMin + Math.random() * (speedMax - speedMin); // seconds
  const delay   = Math.random() * life;
  return {
    id,
    x:      Math.random() * w,
    y:      Math.random() * h,
    vx:     Math.cos(angle) * speed,
    vy:     Math.sin(angle) * speed,
    life,
    delay,
    opacity: 0.3 + Math.random() * 0.5,
    size:   1.5 + Math.random() * 1.5,
  };
}

export default function NoiseOverlay({ width = 1000, height = 720, epsilon = 1.0 }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({ particles: [], animId: null, epsilon: 1.0 });

  useEffect(() => {
    stateRef.current.epsilon = epsilon;
  }, [epsilon]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let time = 0;

    const MAX_PARTICLES = 200;
    const allParticles = Array.from({ length: MAX_PARTICLES }, (_, i) =>
      createParticle(i, width, height, 0.5, 5)
    );
    stateRef.current.particles = allParticles;

    function render(ts) {
      time = ts / 1000;
      const cfg = getParticleConfig(stateRef.current.epsilon);
      ctx.clearRect(0, 0, width, height);

      const active = allParticles.slice(0, cfg.count);

      for (const p of active) {
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;

        if (p.x < 0)      p.x = width;
        if (p.x > width)  p.x = 0;
        if (p.y < 0)      p.y = height;
        if (p.y > height) p.y = 0;

        const phase = ((time + p.delay) % p.life) / p.life;
        const fade  = Math.sin(phase * Math.PI);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = cfg.color;
        ctx.globalAlpha = fade * p.opacity;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      stateRef.current.animId = requestAnimationFrame(render);
    }

    stateRef.current.animId = requestAnimationFrame(render);
    return () => {
      if (stateRef.current.animId) cancelAnimationFrame(stateRef.current.animId);
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position:      'absolute',
        top:           0,
        left:          0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        20,
      }}
    />
  );
}
