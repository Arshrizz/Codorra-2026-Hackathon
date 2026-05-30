import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';



export default function EventFeed({ eventLog }) {
  const feedRef = useRef(null);

  // Auto-scroll to top when new entries arrive
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [eventLog.length]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--border-dim)',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '10px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          flexShrink: 0,
        }}
      >
        LIVE EVENT FEED
      </div>

      {/* Scrollable list */}
      <div
        ref={feedRef}
        className="no-scrollbar"
        style={{
          overflowY: 'auto',
          flex: 1,
          padding: '4px 0',
        }}
      >
        <AnimatePresence initial={false}>
          {eventLog.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                padding: '5px 12px',
                borderBottom: '1px solid var(--border-dim)',
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                fontSize: '11px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                display: 'flex',
                gap: '6px',
                alignItems: 'baseline',
              }}
            >
              {/* Timestamp */}
              <span
                style={{
                  fontFamily: 'var(--font-data)',
                  fontWeight: 500,
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                [{entry.timestamp}]
              </span>

              {/* Grid ID — always text-primary */}
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '9px',
                  letterSpacing: '0.1em',
                  color: 'var(--text-primary)',
                  flexShrink: 0,
                }}
              >
                {entry.grid_id}
              </span>

              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>·</span>

              {/* Delta */}
              <span style={{ flexShrink: 0 }}>
                Δ+{entry.signal_delta} signals
              </span>

              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>·</span>

              {/* Privacy tag */}
              <span
                style={{
                  color: 'var(--accent-noise)',
                  fontSize: '10px',
                  flexShrink: 0,
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
              padding: '16px 12px',
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            AWAITING SIGNALS...
          </div>
        )}
      </div>
    </div>
  );
}
