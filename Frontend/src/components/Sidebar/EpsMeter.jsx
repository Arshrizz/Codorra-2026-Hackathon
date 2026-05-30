


const TRACK_H  = 180;
const TRACK_W  = 14;

export default function EpsMeter({ epsilon = 1.0 }) {
  const critical = epsilon < 0.20;
  const fillPct  = Math.max(0, Math.min(epsilon / 1.0, 1)) * 100;

  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        padding:        'var(--space-3) 0 var(--space-3)',
        gap:            '0',
        userSelect:     'none',
      }}
    >
      <div
        style={{
          fontFamily:    'var(--font-data)',
          fontWeight:    700,
          fontSize:      '9px',
          color:         critical ? 'var(--red-threat)' : 'var(--cyan)',
          textAlign:     'center',
          marginBottom:  'var(--space-2)',
          letterSpacing: '0.5px',
          animation:     critical ? 'blink 0.8s ease-in-out infinite' : 'none',
          minHeight:     '13px',
        }}
      >
        {epsilon.toFixed(2)}
      </div>

      <div
        style={{
          position:     'relative',
          width:        `${TRACK_W}px`,
          height:       `${TRACK_H}px`,
          background:   'var(--bg-cell)',
          border:       '1px solid var(--border-active)',
          borderRadius: '2px',
          overflow:     'hidden',
        }}
      >
        <div
          style={{
            position:   'absolute',
            bottom:     0,
            left:       0,
            right:      0,
            height:     `${fillPct}%`,
            background: 'linear-gradient(to top, var(--red-threat) 0%, var(--amber-warn) 25%, var(--cyan) 55%, var(--green-safe) 100%)',
            transition: 'height 1s ease',
            borderRadius: '1px',
          }}
        />

        {[75, 50, 25].map((pct) => (
          <div
            key={pct}
            style={{
              position:   'absolute',
              bottom:     `${pct}%`,
              left:       '-4px',
              width:      `${TRACK_W + 8}px`,
              height:     '1px',
              background: 'var(--border-active)',
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>

      <div
        style={{
          fontFamily:    'var(--font-data)',
          fontWeight:    400,
          fontSize:      '8px',
          color:         'var(--text-dim)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          writingMode:   'vertical-rl',
          transform:     'rotate(180deg)',
          marginTop:     'var(--space-3)',
        }}
      >
        ε-BDG
      </div>
    </div>
  );
}
