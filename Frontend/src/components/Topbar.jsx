import { useState, useRef } from 'react';

const TOOLTIP_STYLE = {
  position: 'absolute',
  bottom: '110%',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-active)',
  color: 'var(--text-secondary)',
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  fontSize: '10px',
  padding: '4px 8px',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  zIndex: 50,
  borderRadius: 0,
  lineHeight: 1.4,
};

export default function Topbar() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <header
      style={{
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Left — logo */}
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '14px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '16px', lineHeight: 1 }}>▣</span>
        <span>[VEIL]</span>
      </div>

      {/* Center — live status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-body)',
          fontWeight: 400,
          fontSize: '12px',
          color: 'var(--accent-safe)',
          letterSpacing: '0.08em',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--accent-safe)',
            animation: 'pulse-dot 1.4s ease-in-out infinite',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--accent-safe)',
          }}
        >
          LIVE
        </span>
      </div>

      {/* Right — epsilon readout */}
      <div
        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span
          style={{
            fontFamily: 'var(--font-data)',
            fontWeight: 500,
            fontSize: '13px',
            color: 'var(--text-secondary)',
            cursor: 'default',
            borderBottom: '1px solid var(--border-dim)',
            paddingBottom: '1px',
          }}
        >
          ε = 0.42
        </span>
        {showTooltip && (
          <div style={TOOLTIP_STYLE}>
            Lower ε = stronger privacy. Higher ε = more accurate signal.
          </div>
        )}
      </div>
    </header>
  );
}
