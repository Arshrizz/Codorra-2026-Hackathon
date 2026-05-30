export default function StatusBar({ stats }) {
  const {
    lastSync = '--:--:--',
    signalsProcessed = 0,
    privacyBudget = 100,
    activeGrids = 0,
  } = stats ?? {};

  const fields = [
    { label: 'LAST SYNC', value: lastSync },
    { label: 'SIGNALS PROCESSED', value: signalsProcessed.toLocaleString() },
    { label: 'PRIVACY BUDGET', value: `${privacyBudget}% INTACT` },
    { label: 'ACTIVE GRIDS', value: `${activeGrids}/256` },
  ];

  return (
    <footer
      style={{
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderTop: '1px solid var(--border-dim)',
        background: 'var(--bg-surface)',
        gap: 0,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {fields.map((field, i) => (
        <span
          key={field.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            fontSize: '11px',
            whiteSpace: 'nowrap',
          }}
        >
          {/* Pipe separator (not before first item) */}
          {i > 0 && (
            <span
              style={{
                color: 'var(--border-active)',
                margin: '0 10px',
                userSelect: 'none',
              }}
            >
              |
            </span>
          )}

          {/* Label */}
          <span style={{ color: 'var(--text-muted)' }}>
            {field.label}:
          </span>

          {/* Value */}
          <span
            style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-data)',
              fontWeight: 500,
              fontSize: '11px',
            }}
          >
            {field.value}
          </span>
        </span>
      ))}
    </footer>
  );
}
