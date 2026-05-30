import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Color map by threat_level — opacity applied via fill-opacity on the SVG rect
const THREAT_COLOR = {
  safe:     'var(--accent-safe)',
  elevated: 'var(--accent-warn)',
  threat:   'var(--accent-threat)',
};

const THREAT_OPACITY = {
  safe:     0.20,
  elevated: 0.50,
  threat:   0.80,
};

export default function GridCell({
  x,
  y,
  size,
  gridId,
  threatLevel,
  signalCount,
  noiseDelta,
  hasChanged,
  isThreatCrossing,
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [hovered, setHovered] = useState(false);
  const rippleTimerRef = useRef(null);

  const color   = THREAT_COLOR[threatLevel]   ?? THREAT_COLOR.safe;
  const opacity = THREAT_OPACITY[threatLevel] ?? THREAT_OPACITY.safe;

  // Trigger ripple on threat crossing
  useEffect(() => {
    if (isThreatCrossing) {
      setShowRipple(true);
      clearTimeout(rippleTimerRef.current);
      rippleTimerRef.current = setTimeout(() => setShowRipple(false), 1100);
    }
    return () => clearTimeout(rippleTimerRef.current);
  }, [isThreatCrossing]);

  const cx = x + size / 2;
  const cy = y + size / 2;

  return (
    <g>
      {/* Cell body */}
      <motion.rect
        x={x + 0.5}
        y={y + 0.5}
        width={size - 1}
        height={size - 1}
        fill={color}
        fillOpacity={opacity}
        stroke="var(--border-dim)"
        strokeWidth={0.5}
        // Data-change pulse: opacity 0.8 → 1.0 → 0.8, 600ms
        animate={
          hasChanged
            ? { fillOpacity: [opacity * 0.8, opacity, opacity * 0.8, opacity] }
            : { fillOpacity: opacity }
        }
        transition={
          hasChanged
            ? { duration: 0.6, ease: 'easeInOut' }
            : { duration: 0.3 }
        }
        // Hover scale via transform
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          transform: hovered ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform 120ms ease',
          cursor: 'crosshair',
        }}
        onMouseEnter={() => { setShowTooltip(true); setHovered(true); }}
        onMouseLeave={() => { setShowTooltip(false); setHovered(false); }}
      />

      {/* Threat ripple ring */}
      {showRipple && (
        <circle
          cx={cx}
          cy={cy}
          r={size * 0.45}
          fill="none"
          stroke="var(--accent-threat)"
          strokeWidth={1}
          style={{
            position: 'absolute',
            animation: 'ripple 1s ease-out forwards',
            transformOrigin: `${cx}px ${cy}px`,
            borderRadius: '50%',
          }}
        />
      )}

      {/* Tooltip — rendered as foreignObject for crisp monospace text */}
      {showTooltip && (
        <foreignObject
          x={cx - 72}
          y={y - 42}
          width={144}
          height={38}
          style={{ overflow: 'visible', pointerEvents: 'none' }}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-active)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              fontSize: '10px',
              padding: '4px 7px',
              whiteSpace: 'nowrap',
              lineHeight: 1.5,
              borderRadius: 0,
            }}
          >
            <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: '9px', letterSpacing: '0.1em' }}>
              {gridId}
            </span>
            {' · '}
            {signalCount} sig
            {' · '}
            Δ{noiseDelta >= 0 ? '+' : ''}{noiseDelta}
          </div>
        </foreignObject>
      )}
    </g>
  );
}
