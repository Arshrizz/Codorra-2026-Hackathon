import { useState, useRef, useCallback } from 'react';

export default function ThresholdConfig({ defaultValue = 50 }) {
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState(null); // 'sending' | 'ok' | 'err'
  const debounceRef = useRef(null);

  const postThreshold = useCallback(async (val) => {
    setStatus('sending');
    try {
      await fetch('/api/config/threshold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: val }),
      });
      setStatus('ok');
    } catch {
      setStatus('err');
    }
    setTimeout(() => setStatus(null), 2000);
  }, []);

  const handleChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    setValue(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => postThreshold(val), 500);
  };

  return (
    <div
      style={{
        padding: 'var(--space-3)',
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
          marginBottom: 'var(--space-2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>ALERT THRESHOLD</span>
        {status === 'sending' && (
          <span style={{ color: 'var(--text-muted)', fontSize: '9px', fontFamily: 'var(--font-body)', fontWeight: 400 }}>
            SYNCING...
          </span>
        )}
        {status === 'ok' && (
          <span style={{ color: 'var(--accent-safe)', fontSize: '9px', fontFamily: 'var(--font-body)', fontWeight: 400 }}>
            SAVED
          </span>
        )}
        {status === 'err' && (
          <span style={{ color: 'var(--accent-threat)', fontSize: '9px', fontFamily: 'var(--font-body)', fontWeight: 400 }}>
            OFFLINE
          </span>
        )}
      </div>

      <input
        type="number"
        value={value}
        min={1}
        max={9999}
        onChange={handleChange}
        style={{
          width: '100%',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-active)',
          borderRadius: 0,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-data)',
          fontWeight: 500,
          fontSize: '14px',
          padding: 'var(--space-2)',
          outline: 'none',
          appearance: 'textfield',
        }}
        onFocus={(e) =>
          (e.target.style.borderColor = 'var(--accent-noise)')
        }
        onBlur={(e) =>
          (e.target.style.borderColor = 'var(--border-active)')
        }
      />

      <div
        style={{
          marginTop: 'var(--space-1)',
          fontFamily: 'var(--font-body)',
          fontWeight: 400,
          fontSize: '10px',
          color: 'var(--text-muted)',
        }}
      >
        signals / grid / interval
      </div>
    </div>
  );
}
