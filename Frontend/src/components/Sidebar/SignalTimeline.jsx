import { useRef, useEffect, useState } from 'react';

const BAR_W     = 6;   // px per bar
const BAR_GAP   = 2;   // px gap
const MAX_BARS  = 60;
const CHART_H   = 64;  // px

const LEVEL_COLOR = {
  threat:   'var(--red-threat)',
  elevated: 'var(--amber-warn)',
  safe:     'var(--cyan)',
};

function Tooltip({ text, x, y }) {
  return (
    <div
      style={{
        position:   'absolute',
        left:       x + 8,
        top:        y - 28,
        background: 'var(--bg-elevated)',
        border:     '1px solid var(--border-active)',
        color:      'var(--text-secondary)',
        fontFamily: 'var(--font-data)',
        fontSize:   '9px',
        padding:    'var(--space-1) var(--space-2)',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex:     30,
        borderRadius: '2px',
      }}
    >
      {text}
    </div>
  );
}

export default function SignalTimeline({ eventLog }) {
  const [tooltip, setTooltip] = useState(null);
  const wrapRef = useRef(null);

  const recent = eventLog.slice(0, MAX_BARS).reverse();

  useEffect(() => {
    if (wrapRef.current) {
      wrapRef.current.scrollLeft = wrapRef.current.scrollWidth;
    }
  }, [eventLog.length]);

  return (
    <div
      style={{
        borderTop:     '1px solid var(--border-dim)',
        flexShrink:    0,
        position:      'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding:       'var(--space-1) var(--space-3)',
          fontFamily:    'var(--font-display)',
          fontWeight:    600,
          fontSize:      '10px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color:         'var(--text-muted)',
        }}
      >
        Signal Timeline
      </div>

      {/* Scrollable bar chart */}
      <div
        ref={wrapRef}
        className="no-scrollbar"
        style={{
          overflowX:   'auto',
          padding:     '0 var(--space-3) var(--space-2)',
          height:      `${CHART_H + 4}px`,
          display:     'flex',
          alignItems:  'flex-end',
          gap:         `${BAR_GAP}px`,
          position:    'relative',
        }}
        onMouseLeave={() => setTooltip(null)}
      >
        {recent.some((e) => e.threat_level === 'threat') && (
          <div
            style={{
              position:   'absolute',
              left:       12,
              right:      12,
              bottom:     `${CHART_H * 0.5 + 4}px`,
              height:     '1px',
              background: 'var(--red-threat)',
              opacity:    0.4,
              pointerEvents: 'none',
              zIndex:     5,
            }}
          />
        )}

        {recent.map((entry, i) => {
          const pct   = Math.min(entry.signal_delta / 30, 1);
          const barH  = Math.max(3, Math.round(pct * CHART_H));
          const color = LEVEL_COLOR[entry.threat_level] ?? LEVEL_COLOR.safe;

          return (
            <div
              key={entry.id}
              title={`[${entry.grid_id}] Δ+${entry.signal_delta} · ${entry.timestamp}`}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const parentRect = e.currentTarget.closest('[class]')?.getBoundingClientRect?.() ??
                  e.currentTarget.parentElement?.getBoundingClientRect();
                setTooltip({
                  text: `[${entry.grid_id}] Δ+${entry.signal_delta} · ${entry.timestamp}`,
                  x: i * (BAR_W + BAR_GAP),
                  y: CHART_H - barH,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
              style={{
                width:       `${BAR_W}px`,
                height:      `${barH}px`,
                background:  color,
                flexShrink:  0,
                borderRadius: '1px 1px 0 0',
                opacity:     0.85,
                cursor:      'default',
                transition:  'opacity 120ms ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.opacity = '1'; }}
            />
          );
        })}

        {recent.length === 0 && (
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 300,
              fontSize:   '10px',
              color:      'var(--text-dim)',
              alignSelf:  'center',
              flex:       1,
              textAlign:  'center',
            }}
          >
            No signal events yet
          </div>
        )}
      </div>

      {tooltip && (
        <Tooltip text={tooltip.text} x={tooltip.x + 12} y={tooltip.y} />
      )}
    </div>
  );
}
