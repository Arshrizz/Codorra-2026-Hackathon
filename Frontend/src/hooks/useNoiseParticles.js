import { useState, useEffect, useRef } from 'react';

const PARTICLE_COUNT = 200;

function randomPosition(width, height) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
  };
}

function initParticles(width, height) {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    ...randomPosition(width, height),
  }));
}

export function useNoiseParticles(width = 600, height = 600) {
  const [particles, setParticles] = useState(() => initParticles(width, height));
  const intervalRef = useRef(null);

  useEffect(() => {
    setParticles(initParticles(width, height));
  }, [width, height]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setParticles((prev) => {
        const next = [...prev];
        const count = Math.floor(Math.random() * 21) + 30;
        const indices = new Set();
        while (indices.size < count) {
          indices.add(Math.floor(Math.random() * PARTICLE_COUNT));
        }
        for (const idx of indices) {
          next[idx] = { ...next[idx], ...randomPosition(width, height) };
        }
        return next;
      });
    }, 2000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [width, height]);

  return particles;
}
