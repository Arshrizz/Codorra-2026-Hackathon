import { useState, useEffect } from 'react';

function useLiveClock() {
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 8));
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toTimeString().slice(0, 8)), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Topbar() {
  const [epsilonTip, setEpsilonTip] = useState(false);
  const clock = useLiveClock();

  return (
    <header
      style={{
        height: 'var(--space-12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        borderBottom: '1px solid var(--border-dim)',
        background: 'color-mix(in srgb, var(--bg-surface) 85%, transparent)',
        flexShrink: 0,
        zIndex: 10,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* ── Left: VEIL logotype ───────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '22px',
            letterSpacing: '4px',
            color: 'var(--cyan)',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          VEIL
        </div>
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 300,
            fontSize: '9px',
            letterSpacing: '1.5px',
            color: 'var(--text-muted)',
            marginTop: '2px',
            textTransform: 'uppercase',
          }}
        >
          Differential Privacy · Threat Monitor
        </div>
      </div>

      {/* ── Center: LIVE pill ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-1) var(--space-3)',
          border: '1px solid color-mix(in srgb, var(--green-safe) 30%, transparent)',
          borderRadius: '2px',
          background: 'color-mix(in srgb, var(--green-safe) 10%, transparent)',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'var(--green-safe)',
            flexShrink: 0,
            animation: 'pulse-dot 2s ease-in-out infinite',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '11px',
            letterSpacing: '2px',
            color: 'var(--green-safe)',
            textTransform: 'uppercase',
          }}
        >
          LIVE
        </span>
      </div>

      {/* ── Right: nodes + clock ──────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-6)',
        }}
      >
        {/* Node count */}
        <div
          style={{
            fontFamily: 'var(--font-data)',
            fontWeight: 400,
            fontSize: '11px',
            color: 'var(--text-muted)',
            letterSpacing: '0.5px',
          }}
        >
          <span style={{ color: 'var(--cyan)', marginRight: '5px' }}>⬡</span>
          <span style={{ color: 'var(--text-secondary)' }}>10,000</span>
          {' '}NODES
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'var(--border-dim)' }} />

        {/* Live clock */}
        <div
          style={{
            fontFamily: 'var(--font-data)',
            fontWeight: 700,
            fontSize: '12px',
            color: 'var(--text-primary)',
            letterSpacing: '1px',
            minWidth: '72px',
            textAlign: 'right',
          }}
        >
          {clock}
        </div>

        {/* ε readout with tooltip */}
        <div
          style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
          onMouseEnter={() => setEpsilonTip(true)}
          onMouseLeave={() => setEpsilonTip(false)}
        >
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontWeight: 400,
              fontSize: '11px',
              color: 'var(--text-muted)',
              cursor: 'default',
              borderBottom: '1px solid var(--border-dim)',
              paddingBottom: '1px',
            }}
          >
            ε = 0.42
          </span>
          {epsilonTip && (
            <div
              style={{
                position: 'absolute',
                bottom: '130%',
                right: 0,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-active)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 300,
                fontSize: '10px',
                padding: 'var(--space-1) var(--space-2)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 50,
                borderRadius: '2px',
                lineHeight: 1.5,
              }}
            >
              Lower ε = stronger privacy. Higher ε = more accurate signal.
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
