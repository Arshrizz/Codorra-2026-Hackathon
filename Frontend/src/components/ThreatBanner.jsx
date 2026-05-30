import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DISMISS_SECONDS = 8;

function AnomalyGauge({ score }) {
  const R   = 18;
  const C   = 2 * Math.PI * R;
  const pct = Math.min(score / 100, 1);

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
      <circle
        cx="26" cy="26" r={R}
        fill="none"
        stroke="rgba(255, 50, 50, 0.15)"
        strokeWidth="3"
      />
      <circle
        cx="26" cy="26" r={R}
        fill="none"
        stroke="var(--red-threat)"
        strokeWidth="3"
        strokeDasharray={`${pct * C} ${C}`}
        strokeDashoffset={C * 0.25} // start at 12 o'clock
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
      <text
        x="26" y="30"
        textAnchor="middle"
        fontFamily="'Space Mono', monospace"
        fontWeight="700"
        fontSize="11"
        fill="var(--red-threat)"
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}

export default function ThreatBanner({ alert, onDismiss }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!alert) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (onDismiss) onDismiss();
    }, DISMISS_SECONDS * 1000);
    return () => clearTimeout(timerRef.current);
  }, [alert, onDismiss]);

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          role="alert"
          aria-live="assertive"
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position:     'absolute',
            top:          0,
            left:         0,
            right:        0,
            zIndex:       50,
            background:   'color-mix(in srgb, var(--red-threat) 12%, transparent)',
            borderTop:    '1px solid color-mix(in srgb, var(--red-threat) 30%, transparent)',
            borderBottom: '1px solid color-mix(in srgb, var(--red-threat) 30%, transparent)',
            borderLeft:   '3px solid var(--red-threat)',
            overflow:     'hidden',
          }}
        >
          <div
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        'var(--space-3)',
              padding:    'var(--space-2) var(--space-4)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-data)',
                fontSize:   '14px',
                color:      'var(--red-threat)',
                flexShrink: 0,
              }}
            >
              ⚠
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily:    'var(--font-display)',
                  fontWeight:    600,
                  fontSize:      '13px',
                  letterSpacing: '2px',
                  color:         'var(--red-threat)',
                  textTransform: 'uppercase',
                }}
              >
                THRESHOLD BREACH · SECTOR [{alert.grid_id}]
              </div>
              <div
                style={{
                  fontFamily:    'var(--font-ui)',
                  fontWeight:    300,
                  fontSize:      '10px',
                  color:         'var(--text-secondary)',
                  marginTop:     'var(--space-1)',
                  letterSpacing: '0.5px',
                }}
              >
                anomaly score {alert.score.toFixed(1)} · ε remaining {alert.epsilonRemaining.toFixed(2)} · {alert.signalCount} signals
              </div>
            </div>

            <AnomalyGauge score={alert.score} />
          </div>

          <div
            key={alert.id} // re-mount to restart animation on new alerts
            style={{
              height:     '2px',
              background: 'var(--red-threat)',
              animation:  `drain ${DISMISS_SECONDS}s linear forwards`,
              transformOrigin: 'left',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
