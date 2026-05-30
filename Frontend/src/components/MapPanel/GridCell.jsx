import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// Color map by threat_level
const THREAT_COLOR = {
  safe:     'var(--accent-safe)',
  elevated: 'var(--accent-warn)',
  threat:   'var(--accent-threat)',
};

// Opacity values per spec — sparse map with hot-spots effect
const THREAT_OPACITY = {
  safe:     0.20,
  elevated: 0.50,
  threat:   0.80,
};

const INSET = 0.5; // half-pixel inset for crisp border rendering

export default function GridCell({
  x,
  y,
  width,
  height,
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

  const cx = x + width  / 2;
  const cy = y + height / 2;
  const rippleR = Math.min(width, height) * 0.45;

  return (
    <g>
      {/* Cell body */}
      <motion.rect
        x={x + INSET}
        y={y + INSET}
        width={width  - INSET * 2}
        height={height - INSET * 2}
        fill={color}
        stroke="var(--border-dim)"
        strokeWidth={0.5}
        // Data-change pulse: fillOpacity 0.8→1.0→0.8 over 600ms
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
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          transform: hovered ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform 120ms ease',
          cursor: 'crosshair',
        }}
        onMouseEnter={() => { setShowTooltip(true); setHovered(true); }}
        onMouseLeave={() => { setShowTooltip(false); setHovered(false); }}
      />

      {/* Threat crossing — CSS ripple ring */}
      {showRipple && (
        <circle
          cx={cx}
          cy={cy}
          r={rippleR}
          fill="none"
          stroke="var(--accent-threat)"
          strokeWidth={1}
          style={{
            animation: 'ripple 1s ease-out forwards',
            transformOrigin: `${cx}px ${cy}px`,
          }}
        />
      )}

      {/* Hover tooltip */}
      {showTooltip && (
        <foreignObject
          x={cx - 76}
          y={y - 44}
          width={152}
          height={40}
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
              padding: '4px 8px',
              whiteSpace: 'nowrap',
              lineHeight: 1.5,
              borderRadius: 0,
            }}
          >
            <span
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                fontSize: '9px',
                letterSpacing: '0.1em',
              }}
            >
              {gridId}
            </span>
            {' · '}{signalCount} sig{' · '}Δ{noiseDelta >= 0 ? '+' : ''}{noiseDelta}
          </div>
        </foreignObject>
      )}
    </g>
  );
}
