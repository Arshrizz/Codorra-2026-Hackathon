import { useRef, useEffect, useState } from 'react';
import GridCell from './GridCell';
import NoiseOverlay from './NoiseOverlay';

const GRID_SIZE = 16;

// Button style for the control strip
function CtrlBtn({ label, color = 'var(--text-muted)', onClick, title }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:    'transparent',
        border:        `1px solid ${hovered ? 'var(--cyan)' : 'var(--border-dim)'}`,
        color:         hovered ? 'var(--cyan)' : color,
        fontFamily:    'var(--font-data)',
        fontWeight:    400,
        fontSize:      '10px',
        padding:       'var(--space-1) var(--space-3)',
        cursor:        'pointer',
        letterSpacing: '1px',
        borderRadius:  '2px',
        transition:    'border-color 150ms ease, color 150ms ease',
      }}
    >
      {label}
    </button>
  );
}

export default function MapGrid({ gridData, epsilon = 1.0, isPaused, onInject, onReset, onTogglePause }) {
  const containerRef = useRef(null);
  const [dims, setDims]         = useState({ width: 600, height: 600 });
  const prevDataRef             = useRef(new Map());

  // Diff: which cells changed this render cycle
  const changedCells    = new Set();
  const threatCrossings = new Set();

  for (const [id, row] of gridData) {
    const prev = prevDataRef.current.get(id);
    if (prev) {
      if (prev.signal_count !== row.signal_count || prev.threat_level !== row.threat_level) {
        changedCells.add(id);
      }
      if (prev.threat_level !== 'threat' && row.threat_level === 'threat') {
        threatCrossings.add(id);
      }
    }
  }

  useEffect(() => { prevDataRef.current = new Map(gridData); });

  // Responsive container measurement
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      // Reserve 32px at bottom for control strip
      setDims({ width, height: height - 32 });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const cellW = dims.width  / GRID_SIZE;
  const cellH = dims.height / GRID_SIZE;

  return (
    <div
      ref={containerRef}
      style={{
        position:        'relative',
        width:           '100%',
        height:          '100%',
        overflow:        'hidden',
        background:      'var(--bg-grid)',
        display:         'flex',
        flexDirection:   'column',
      }}
    >
      {/* ── Grid SVG ─────────────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', height: `${dims.height}px`, flexShrink: 0 }}>
        <svg
          width={dims.width}
          height={dims.height}
          style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}
        >
          {Array.from(gridData.values()).map((row) => {
            const parts  = row.grid_id.split('-');
            const rowIdx = parseInt(parts[0], 10);
            const colIdx = parseInt(parts[1], 10);
            // Phase offset spreads breathing across the grid (0–1 normalized then *2π)
            const phase  = ((rowIdx * GRID_SIZE + colIdx) / (GRID_SIZE * GRID_SIZE));

            return (
              <GridCell
                key={row.grid_id}
                x={colIdx * cellW}
                y={rowIdx * cellH}
                width={cellW}
                height={cellH}
                gridId={row.grid_id}
                signalCount={row.signal_count}
                noiseDelta={row.noise_delta}
                hasChanged={changedCells.has(row.grid_id)}
                isThreatCrossing={threatCrossings.has(row.grid_id)}
                cellPhase={phase}
              />
            );
          })}
        </svg>

        {/* ── Diagonal shimmer sweep ────────────────────────── */}
        <div
          style={{
            position:      'absolute',
            top:           0,
            left:          0,
            width:         '40%',
            height:        '200%',
            background:    'linear-gradient(105deg, transparent 30%, color-mix(in srgb, var(--cyan) 10%, transparent) 50%, transparent 70%)',
            pointerEvents: 'none',
            animation:     'grid-shimmer 8s linear infinite',
            zIndex:        25,
          }}
        />

        {/* ── Noise particle overlay ────────────────────────── */}
        <NoiseOverlay width={dims.width} height={dims.height} epsilon={epsilon} />
      </div>

      {/* ── Control strip ────────────────────────────────────── */}
      <div
        style={{
          height:         'var(--space-8)',
          display:        'flex',
          alignItems:     'center',
          gap:            'var(--space-2)',
          padding:        '0 var(--space-3)',
          borderTop:      '1px solid var(--border-dim)',
          background:     'color-mix(in srgb, var(--bg-surface) 85%, transparent)',
          flexShrink:     0,
        }}
      >
        <CtrlBtn
          label={isPaused ? '▶ RESUME' : '⏸ PAUSE'}
          color={isPaused ? 'var(--amber-warn)' : 'var(--text-muted)'}
          onClick={onTogglePause}
          title="Toggle live updates"
        />
        <CtrlBtn
          label="⚡ INJECT"
          color="var(--amber-warn)"
          onClick={onInject}
          title="Fire synthetic anomaly cluster"
        />
        <CtrlBtn
          label="↺ RESET"
          color="var(--text-muted)"
          onClick={onReset}
          title="Zero grid and restore ε to 1.0"
        />

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span
            style={{
              display:       'inline-block',
              width:         '5px',
              height:        '5px',
              borderRadius:  '50%',
              background:    isPaused ? 'var(--amber-warn)' : 'var(--green-safe)',
              animation:     isPaused ? 'none' : 'pulse-dot 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontFamily:    'var(--font-data)',
              fontSize:      '9px',
              letterSpacing: '1px',
              color:         isPaused ? 'var(--amber-warn)' : 'var(--text-muted)',
            }}
          >
            {isPaused ? 'PAUSED' : 'LIVE · 16×16 GRID · 256 SECTORS'}
          </span>
        </div>
      </div>
    </div>
  );
}
