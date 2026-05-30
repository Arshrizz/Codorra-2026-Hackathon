import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import './styles/globals.css';
import './styles/responsive.css';
import { useGridData }    from './hooks/useGridData';
import Topbar             from './components/Topbar';
import MapGrid            from './components/MapPanel/MapGrid';
import EventFeed          from './components/Sidebar/EventFeed';
import EpsMeter           from './components/Sidebar/EpsMeter';
import MetricCards        from './components/Sidebar/MetricCards';
import SignalTimeline     from './components/Sidebar/SignalTimeline';
import ThresholdConfig    from './components/Sidebar/ThresholdConfig';
import ThreatBanner       from './components/ThreatBanner';
import StatusBar          from './components/StatusBar';

const fadeIn = (delay) => ({
  initial:    { opacity: 0 },
  animate:    { opacity: 1 },
  transition: { duration: 0.4, ease: 'easeOut', delay },
});

const THREAT_THRESHOLD = 50;

export default function App() {
  const {
    gridData,
    eventLog,
    stats,
    epsilon,
    isPaused,
    injectAnomaly,
    resetGrid,
    togglePause,
  } = useGridData();

  const [currentAlert, setCurrentAlert] = useState(null);
  const prevGridRef = useRef(new Map());

  useEffect(() => {
    for (const [id, row] of gridData) {
      const prev = prevGridRef.current.get(id);
      if (
        prev &&
        prev.signal_count < THREAT_THRESHOLD &&
        row.signal_count >= THREAT_THRESHOLD
      ) {
        const score = Math.min(100, 50 + (row.signal_count - THREAT_THRESHOLD) * 0.8 + Math.random() * 10);
        setCurrentAlert({
          id:               `${id}-${Date.now()}`,
          grid_id:          id,
          signalCount:      row.signal_count,
          score:            parseFloat(score.toFixed(1)),
          epsilonRemaining: epsilon,
        });
        break;
      }
    }
    prevGridRef.current = new Map(gridData);
  }, [gridData, epsilon]);

  const dismissAlert = useCallback(() => setCurrentAlert(null), []);

  return (
    <div className="bg-crosshatch app-container">
      <motion.div {...fadeIn(0)}>
        <Topbar />
      </motion.div>

      <div className="main-content-row">
        <motion.div
          {...fadeIn(0.06)}
          style={{
            width:         '44px',
            flexShrink:    0,
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            background:    'var(--bg-surface)',
            borderRight:   '1px solid var(--border-dim)',
          }}
        >
          <EpsMeter epsilon={epsilon} />
        </motion.div>

        <motion.div
          {...fadeIn(0.10)}
          style={{
            flex:          '1 1 0',
            display:       'flex',
            flexDirection: 'column',
            borderRight:   '1px solid var(--border-dim)',
            overflow:      'hidden',
            position:      'relative',
            minHeight:     '400px',
          }}
        >
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
            City Grid — Threat Heatmap · 16×16
          </div>

          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <ThreatBanner alert={currentAlert} onDismiss={dismissAlert} />

            <MapGrid
              gridData={gridData}
              epsilon={epsilon}
              isPaused={isPaused}
              onInject={injectAnomaly}
              onReset={resetGrid}
              onTogglePause={togglePause}
            />
          </div>
        </motion.div>

        <motion.div
          {...fadeIn(0.16)}
          className="sidebar-panel"
        >
          <div style={{ flexShrink: 0 }}>
            <MetricCards stats={stats} epsilon={epsilon} />
          </div>

          <div
            style={{
              borderTop:     '1px solid var(--border-dim)',
              padding:       'var(--space-2) var(--space-3) 0',
              fontFamily:    'var(--font-display)',
              fontWeight:    600,
              fontSize:      '10px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color:         'var(--text-muted)',
              flexShrink:    0,
            }}
          >
            Alert Config
          </div>
          <ThresholdConfig defaultValue={THREAT_THRESHOLD} />

          <SignalTimeline eventLog={eventLog} />

          <div
            style={{
              flex:          1,
              display:       'flex',
              flexDirection: 'column',
              minHeight:     0,
              overflow:      'hidden',
            }}
          >
            <EventFeed eventLog={eventLog} />
          </div>
        </motion.div>
      </div>

      <motion.div {...fadeIn(0.22)}>
        <StatusBar stats={stats} />
      </motion.div>
    </div>
  );
}
