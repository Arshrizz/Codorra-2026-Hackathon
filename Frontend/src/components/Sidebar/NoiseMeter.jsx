import { motion } from 'framer-motion';

// 10 blocks — color zones
const BLOCK_COLORS = [
  'var(--accent-noise)',  // 1
  'var(--accent-noise)',  // 2
  'var(--accent-noise)',  // 3
  'var(--accent-noise)',  // 4
  'var(--accent-noise)',  // 5
  'var(--accent-noise)',  // 6
  'var(--accent-warn)',   // 7
  'var(--accent-warn)',   // 8
  'var(--accent-threat)', // 9
  'var(--accent-threat)', // 10
];

const TOTAL_BLOCKS = 10;
const BLOCK_HEIGHT = 8;
const BLOCK_GAP = 2;

export default function NoiseMeter({ value = 7 }) {
  // value: 0–10, how many blocks are "on" (filled)
  const activeCount = Math.min(Math.max(Math.round(value), 0), TOTAL_BLOCKS);

  return (
    <div
      style={{
        padding: '10px 12px 12px',
        borderBottom: '1px solid var(--border-dim)',
        flexShrink: 0,
      }}
    >
      {/* Label */}
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '10px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
          marginBottom: '10px',
        }}
      >
        NOISE ε-BUDGET
      </div>

      {/* Blocks — rendered bottom-up */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: `${BLOCK_GAP}px`,
        }}
      >
        {Array.from({ length: TOTAL_BLOCKS }, (_, i) => {
          const blockIndex = i; // 0 = bottom, 9 = top
          const isActive = blockIndex < activeCount;
          const color = BLOCK_COLORS[blockIndex];

          return (
            <motion.div
              key={blockIndex}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{
                opacity: isActive ? 1 : 0.12,
                scaleY: 1,
                background: isActive ? color : 'var(--bg-elevated)',
                borderColor: isActive ? color : 'var(--border-dim)',
              }}
              transition={{
                delay: blockIndex * 0.06, // 60ms stagger per block on mount
                duration: 0.3,
                ease: 'easeOut',
              }}
              style={{
                height: `${BLOCK_HEIGHT}px`,
                border: '1px solid var(--border-dim)',
                transformOrigin: 'bottom',
                borderRadius: 0,
              }}
            />
          );
        })}
      </div>

      {/* Value readout */}
      <div
        style={{
          marginTop: '8px',
          fontFamily: 'var(--font-data)',
          fontWeight: 500,
          fontSize: '11px',
          color: 'var(--text-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: '10px' }}>LEVEL</span>
        <span>{activeCount}/{TOTAL_BLOCKS}</span>
      </div>
    </div>
  );
}
