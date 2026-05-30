import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const PARTICLE_COUNT = 200;

function initParticles(count, w, h) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    cx: Math.random() * w,
    cy: Math.random() * h,
  }));
}

export default function NoiseOverlay({ width = 1000, height = 720 }) {
  const [particles, setParticles] = useState(() =>
    initParticles(PARTICLE_COUNT, width, height)
  );
  const intervalRef = useRef(null);

  useEffect(() => {
    // Confirm mounting — remove after verifying dots are visible
    console.log("[NoiseOverlay] mounted, particles:", PARTICLE_COUNT, "canvas:", width, "x", height);

    intervalRef.current = setInterval(() => {
      const driftCount = Math.floor(Math.random() * 21) + 30; // 30–50
      const toMove = new Set();
      while (toMove.size < driftCount) {
        toMove.add(Math.floor(Math.random() * PARTICLE_COUNT));
      }
      setParticles((prev) =>
        prev.map((p) =>
          toMove.has(p.id)
            ? { ...p, cx: Math.random() * width, cy: Math.random() * height }
            : p
        )
      );
    }, 2000);

    return () => clearInterval(intervalRef.current);
  }, [width, height]);

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 20,
        overflow: "visible",
      }}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {particles.map((p) => (
        <motion.circle
          key={p.id}
          r={2}
          fill="#1F6FEB"
          fillOpacity={0.5}
          animate={{ cx: p.cx, cy: p.cy }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}
