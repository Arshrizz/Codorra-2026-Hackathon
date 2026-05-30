import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LEVEL_COLOR = {
  threat:   'var(--red-threat)',
  elevated: 'var(--amber-warn)',
  safe:     'var(--cyan-dim)',
};

const LEVEL_BORDER = {
  threat:   'var(--red-threat)',
  elevated: 'var(--amber-warn)',
  safe:     'var(--border-dim)',
};

export default function EventFeed({ eventLog }) {
  const feedRef = useRef(null);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [eventLog.length]);

  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        flex:          1,
        minHeight:     0,
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding:       'var(--space-2) var(--space-3)',
          borderBottom:  '1px solid var(--border-dim)',
          fontFamily:    'var(--font-display)',
          fontWeight:    600,
          fontSize:      '10px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color:         'var(--text-muted)',
          flexShrink:    0,
        }}
      >
        Signal Log
      </div>

      {/* Scrollable list */}
      <div
        ref={feedRef}
        className="no-scrollbar"
        style={{ overflowY: 'auto', flex: 1, padding: 'var(--space-1) 0' }}
      >
        <AnimatePresence initial={false}>
          {eventLog.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }} // ease-out-quart
              style={{
                padding:      'var(--space-1) 0 var(--space-1) var(--space-3)',
                borderBottom: '1px solid var(--border-dim)',
                borderLeft:   `2px solid ${LEVEL_BORDER[entry.threat_level] ?? 'var(--border-dim)'}`,
                display:      'flex',
                gap:          'var(--space-2)',
                alignItems:   'baseline',
                animation:    'entry-shimmer 0.3s ease-out',
              }}
            >
              {/* Timestamp — Space Mono data tier */}
              <span
                style={{
                  fontFamily:    'var(--font-data)',
                  fontWeight:    400,
                  fontSize:      '9px',
                  color:         'var(--text-dim)',
                  flexShrink:    0,
                  letterSpacing: '0.5px',
                }}
              >
                {entry.timestamp}
              </span>

              {/* Separator */}
              <span style={{ color: 'var(--border-active)', flexShrink: 0 }}>·</span>

              {/* Sector ID — Barlow Condensed display tier */}
              <span
                style={{
                  fontFamily:    'var(--font-display)',
                  fontWeight:    600,
                  fontSize:      '11px',
                  letterSpacing: '1px',
                  color:         LEVEL_COLOR[entry.threat_level] ?? 'var(--cyan)',
                  flexShrink:    0,
                }}
              >
                [{entry.grid_id}]
              </span>

              {/* Separator */}
              <span style={{ color: 'var(--border-active)', flexShrink: 0 }}>·</span>

              {/* Delta — data tier */}
              <span
                style={{
                  fontFamily: 'var(--font-data)',
                  fontWeight: 700,
                  fontSize:   '10px',
                  color:      'var(--text-secondary)',
                  flexShrink: 0,
                }}
              >
                Δ+{entry.signal_delta}
              </span>

              {/* ε-protected label — UI tier */}
              <span
                style={{
                  fontFamily:    'var(--font-ui)',
                  fontWeight:    300,
                  fontSize:      '9px',
                  color:         'var(--text-muted)',
                  flexShrink:    0,
                  marginLeft:    'auto',
                  paddingRight:  '10px',
                }}
              >
                ε-protected
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {eventLog.length === 0 && (
          <div
            style={{
              padding:    'var(--space-4) var(--space-3)',
              fontFamily: 'var(--font-ui)',
              fontWeight: 300,
              fontSize:   '11px',
              color:      'var(--text-muted)',
            }}
          >
            Awaiting signals…
          </div>
        )}
      </div>
    </div>
  );
}
