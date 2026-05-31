import { useState, useRef, useEffect, memo } from 'react';

const INSET = 0.5;

function getHeatFill(count) {
  if (count === 0)  return { color: 'var(--bg-cell)', opacity: 1 };
  if (count <= 5)   return { color: 'color-mix(in srgb, var(--cyan) 20%, var(--bg-cell))', opacity: 0.4 + count * 0.1 };
  if (count <= 15)  return { color: 'color-mix(in srgb, var(--cyan) 50%, var(--bg-cell))', opacity: 0.5 + (count - 6)  * 0.04 };
  if (count <= 30)  return { color: 'var(--cyan)', opacity: 0.5 + (count - 16) * 0.025 };
  if (count <= 49)  return { color: 'var(--amber-warn)', opacity: 0.5 + (count - 31) * 0.02  };
  return             { color: 'var(--red-threat)', opacity: Math.min(0.75 + (count - 50) * 0.01, 1.0) };
}

const GridCell = memo(function GridCell({
  x,
  y,
  width,
  height,
  gridId,
  signalCount,
  noiseDelta,
  hasChanged,
  isThreatCrossing,
  cellPhase = 0,
}) {
  const [showTooltip,   setShowTooltip]   = useState(false);
  const [showRipple,    setShowRipple]    = useState(false);
  const [bumpActive,    setBumpActive]    = useState(false);
  const [enterActive,   setEnterActive]   = useState(false);
  const rippleTimer  = useRef(null);
  const bumpTimer    = useRef(null);
  const prevCount    = useRef(signalCount);

  const { color, opacity } = getHeatFill(signalCount);
  const cx = x + width  / 2;
  const cy = y + height / 2;

  useEffect(() => {
    setEnterActive(true);
    const t = setTimeout(() => setEnterActive(false), 220);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (hasChanged && signalCount !== prevCount.current) {
      setBumpActive(true);
      clearTimeout(bumpTimer.current);
      bumpTimer.current = setTimeout(() => setBumpActive(false), 200);
    }
    prevCount.current = signalCount;
  }, [hasChanged, signalCount]);

  useEffect(() => {
    if (isThreatCrossing) {
      setShowRipple(true);
      clearTimeout(rippleTimer.current);
      rippleTimer.current = setTimeout(() => setShowRipple(false), 1700);
    }
    return () => clearTimeout(rippleTimer.current);
  }, [isThreatCrossing]);

  const breatheDelay = `-${(cellPhase * 2.8).toFixed(2)}s`;

  const isThreat    = signalCount >= 50;
  const isElevated  = signalCount >= 20 && signalCount < 50;

  return (
    <g
      role="gridcell"
      aria-label={`Sector ${gridId} - Signals: ${signalCount}`}
      tabIndex={0}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <title>Sector {gridId} - Signals: {signalCount}, Threat: {isThreat ? 'high' : isElevated ? 'elevated' : 'safe'}</title>
      <rect
        x={x + INSET}
        y={y + INSET}
        width={width  - INSET * 2}
        height={height - INSET * 2}
        fill={color}
        fillOpacity={opacity}
        stroke="var(--border-dim)"
        strokeWidth={0.4}
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: enterActive
            ? `cell-enter 200ms var(--ease-out-quint) forwards`
            : bumpActive
            ? `cell-bump 180ms ease-out forwards`
            : signalCount > 0
            ? `cell-breathe 2.8s ease-in-out ${breatheDelay} infinite`
            : 'none',
          cursor: 'crosshair',
        }}
      />

      {(isThreat) && (
        <circle
          cx={cx}
          cy={cy}
          r={Math.min(width, height) * 0.38}
          fill="none"
          stroke="var(--red-threat)"
          strokeWidth={1.2}
          style={{
            animation: 'threat-ring 1.6s ease-out infinite',
            transformOrigin: `${cx}px ${cy}px`,
            pointerEvents: 'none',
          }}
        />
      )}
      
      {showRipple && (
        <circle
          cx={cx}
          cy={cy}
          r={Math.min(width, height) * 0.45}
          fill="none"
          stroke="var(--red-threat)"
          strokeWidth={1.5}
          style={{
            animation: 'ripple 1.1s ease-out forwards',
            transformOrigin: `${cx}px ${cy}px`,
            pointerEvents: 'none',
          }}
        />
      )}

      {showTooltip && (
        <foreignObject
          x={cx - 80}
          y={y - 48}
          width={160}
          height={44}
          style={{ overflow: 'visible', pointerEvents: 'none' }}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              background:   'var(--bg-elevated)',
              border:       '1px solid var(--border-active)',
              color:        'var(--text-secondary)',
              fontFamily:   "var(--font-data)",
              fontSize:     '10px',
              padding:      '5px 9px',
              whiteSpace:   'nowrap',
              lineHeight:   1.6,
              borderRadius: '2px',
            }}
          >
            <span style={{ color: 'var(--cyan)', fontWeight: 700, letterSpacing: '1px' }}>
              [{gridId}]
            </span>
            {' · '}
            <span style={{ color: signalCount >= 50 ? 'var(--red-threat)' : signalCount >= 20 ? 'var(--amber-warn)' : 'var(--text-secondary)' }}>
              {signalCount} sig
            </span>
            {' · '}
            <span style={{ color: 'var(--text-muted)' }}>
              Δ{noiseDelta >= 0 ? '+' : ''}{noiseDelta}
            </span>
          </div>
        </foreignObject>
      )}
    </g>
  );
});

export default GridCell;
