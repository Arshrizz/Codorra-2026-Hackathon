import { motion } from 'framer-motion';
import { useNoiseParticles } from '../../hooks/useNoiseParticles';

export default function NoiseOverlay({ width, height }) {
  const particles = useNoiseParticles(width, height);

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.circle
          key={p.id}
          r={1.5}
          fill="var(--accent-noise)"
          fillOpacity={0.25}
          animate={{ cx: p.x, cy: p.y }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />
      ))}

      {/* Legend */}
      <text
        x={10}
        y={height - 10}
        fill="var(--text-muted)"
        fontFamily="var(--font-body)"
        fontWeight={400}
        fontSize={10}
        letterSpacing="0.05em"
      >
        ◈ DIFFERENTIAL NOISE LAYER
      </text>
    </svg>
  );
}
