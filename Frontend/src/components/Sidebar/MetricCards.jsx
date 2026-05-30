import { useEffect, useRef, useState, useCallback } from 'react';

const SPARK_W  = 52;
const SPARK_H  = 20;
const HISTORY  = 30;

function Sparkline({ history, color }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 2) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SPARK_W, SPARK_H);

    const max = Math.max(...history, 1);
    const min = Math.min(...history, 0);
    const range = max - min || 1;
    const step  = SPARK_W / (HISTORY - 1);

    ctx.beginPath();
    history.forEach((v, i) => {
      const px = i * step;
      const py = SPARK_H - ((v - min) / range) * (SPARK_H - 2) - 1;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });

    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }, [history, color]);

  return (
    <canvas
      ref={canvasRef}
      width={SPARK_W}
      height={SPARK_H}
      style={{ display: 'block' }}
    />
  );
}

function MetricCard({ label, value, color, history, unit = '' }) {
  return (
    <div
      style={{
        background:   'var(--bg-surface)',
        border:       '0.5px solid var(--border-dim)',
        borderRadius: '3px',
        padding:      'var(--space-2) var(--space-3)',
        display:      'flex',
        flexDirection:'column',
        gap:          'var(--space-1)',
      }}
    >
      <div
        style={{
          fontFamily:    'var(--font-data)',
          fontWeight:    700,
          fontSize:      '20px',
          color:         color,
          lineHeight:    1,
          letterSpacing: '0.5px',
        }}
      >
        {value}
        {unit && (
          <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '3px' }}>
            {unit}
          </span>
        )}
      </div>
      <div
        style={{
          fontFamily:    'var(--font-ui)',
          fontWeight:    300,
          fontSize:      '9px',
          color:         'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
        }}
      >
        {label}
      </div>
      {history.length >= 2 && (
        <Sparkline history={history} color={color} />
      )}
    </div>
  );
}

function PrivacyRow({ label, value, valueColor }) {
  return (
    <div
      style={{
        display:       'flex',
        justifyContent:'space-between',
        alignItems:    'center',
        padding:       '2px 0',
      }}
    >
      <span
        style={{
          fontFamily:    'var(--font-ui)',
          fontWeight:    300,
          fontSize:      '10px',
          color:         'var(--text-muted)',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily:    'var(--font-data)',
          fontWeight:    400,
          fontSize:      '10px',
          color:         valueColor ?? 'var(--text-secondary)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function MetricCards({ stats, epsilon }) {
  const {
    signalsProcessed = 0,
    activeGrids      = 0,
    privacyBudget    = 100,
  } = stats ?? {};

  const histRef = useRef({
    signals:  Array(HISTORY).fill(0),
    active:   Array(HISTORY).fill(0),
    epsilon:  Array(HISTORY).fill(1),
    privacy:  Array(HISTORY).fill(100),
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const h = histRef.current;
    h.signals = [...h.signals.slice(1), signalsProcessed];
    h.active  = [...h.active.slice(1),  activeGrids];
    h.epsilon = [...h.epsilon.slice(1), epsilon];
    h.privacy = [...h.privacy.slice(1), privacyBudget];
    setTick((t) => t + 1);
  }, [signalsProcessed, activeGrids, epsilon, privacyBudget]);

  const epsilonColor  = epsilon < 0.2 ? 'var(--red-threat)'
                      : epsilon < 0.5 ? 'var(--amber-warn)'
                      : 'var(--green-safe)';

  const activeColor   = activeGrids > 20 ? 'var(--red-threat)'
                      : activeGrids > 8  ? 'var(--amber-warn)'
                      : 'var(--green-safe)';

  const privacyScore  = Math.round(epsilon * 100);
  const privacyColor  = privacyScore < 20 ? 'var(--red-threat)'
                      : privacyScore < 50 ? 'var(--amber-warn)'
                      : 'var(--green-safe)';

  const h = histRef.current;

  return (
    <div style={{ padding: 'var(--space-3) var(--space-3) 0' }}>
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr',
          gap:                 'var(--space-2)',
          marginBottom:        'var(--space-3)',
        }}
      >
        <MetricCard
          label="Signals"
          value={signalsProcessed.toLocaleString()}
          color="var(--cyan)"
          history={h.signals}
        />
        <MetricCard
          label="Active"
          value={`${activeGrids}/256`}
          color={activeColor}
          history={h.active}
        />
        <MetricCard
          label="ε-Budget"
          value={epsilon.toFixed(2)}
          color={epsilonColor}
          history={h.epsilon}
        />
        <MetricCard
          label="Priv Score"
          value={privacyScore}
          unit="%"
          color={privacyColor}
          history={h.privacy}
        />
      </div>

      <div
        style={{
          background:   'var(--bg-surface)',
          border:       '0.5px solid var(--border-dim)',
          borderRadius: '3px',
          padding:      'var(--space-2) var(--space-3)',
          marginBottom: 'var(--space-2)',
        }}
      >
        <div
          style={{
            fontFamily:    'var(--font-display)',
            fontWeight:    600,
            fontSize:      '9px',
            letterSpacing: '2px',
            color:         'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom:  '6px',
          }}
        >
          DP Mechanism
        </div>
        <PrivacyRow label="Mechanism"   value="Laplace"            />
        <PrivacyRow label="δ"           value="10⁻⁵"               />
        <PrivacyRow label="Sensitivity" value="1.0"                 />
        <PrivacyRow label="Clipping"    value="ON"  valueColor="var(--green-safe)" />
        <PrivacyRow label="Aggregation" value="Grid-k"              />
      </div>
    </div>
  );
}
