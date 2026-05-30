import { motion } from 'framer-motion';
import './styles/globals.css';
import { useGridData } from './hooks/useGridData';
import Topbar from './components/Topbar';
import MapGrid from './components/MapPanel/MapGrid';
import EventFeed from './components/Sidebar/EventFeed';
import NoiseMeter from './components/Sidebar/NoiseMeter';
import ThresholdConfig from './components/Sidebar/ThresholdConfig';
import StatusBar from './components/StatusBar';

// Page-load stagger: 80ms delay increments (topbar → map → sidebar → statusbar)
const STAGGER = {
  topbar: { delay: 0 },
  map: { delay: 0.08 },
  sidebar: { delay: 0.16 },
  statusbar: { delay: 0.24 },
};

const fadeIn = (delay) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.35, ease: 'easeOut', delay },
});

export default function App() {
  const { gridData, eventLog, stats } = useGridData();

  // Derive noise meter level from privacy budget (0–10 scale)
  const noiseMeterValue = Math.round((100 - (stats.privacyBudget ?? 100)) / 10);

  return (
    <div
      className="bg-crosshatch"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        minWidth: '1280px',
      }}
    >
      {/* Topbar */}
      <motion.div {...fadeIn(STAGGER.topbar.delay)}>
        <Topbar />
      </motion.div>

      {/* Main content row */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Map Panel — ~65% width */}
        <motion.div
          {...fadeIn(STAGGER.map.delay)}
          style={{
            flex: '0 0 65%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--border-dim)',
            overflow: 'hidden',
          }}
        >
          {/* Map panel header */}
          <div
            style={{
              padding: '6px 14px',
              borderBottom: '1px solid var(--border-dim)',
              background: 'var(--bg-surface)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}
          >
            CITY GRID — THREAT HEATMAP · 16×16
          </div>
          <MapGrid gridData={gridData} />
        </motion.div>

        {/* Sidebar — ~35% width */}
        <motion.div
          {...fadeIn(STAGGER.sidebar.delay)}
          style={{
            flex: '0 0 35%',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-surface)',
            borderLeft: '1px solid var(--border-dim)',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          {/* Noise meter */}
          <div className="sidebar-section">
            <div style={{ width: "100%", display: "block" }}>
              <NoiseMeter level={noiseMeterValue} />
            </div>
          </div>

          {/* ── Section divider ───────────────────── */}
          <div
            style={{
              borderTop: '1px solid var(--border-dim)',
              padding: '6px 12px 0',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}
          >
            ALERT CONFIG
          </div>

          {/* Threshold config */}
          <ThresholdConfig defaultValue={50} />

          {/* ── Section divider ───────────────────── */}
          <div
            style={{
              borderTop: '1px solid var(--border-dim)',
              padding: '6px 12px 0',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}
          >
            SIGNAL LOG
          </div>

          {/* Event feed — takes remaining space */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <EventFeed eventLog={eventLog} />
          </div>
        </motion.div>
      </div>

      {/* Status bar */}
      <motion.div {...fadeIn(STAGGER.statusbar.delay)}>
        <StatusBar stats={stats} />
      </motion.div>
    </div>
  );
}
