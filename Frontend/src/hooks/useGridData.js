import { useState, useEffect, useRef, useCallback } from 'react';

let _eventSeq = 0;
const nextId = (prefix) => `${prefix}-${++_eventSeq}`;

const EPSILON_START       = 1.0;
const EPSILON_DECAY       = 0.008;
const EPSILON_FLOOR       = 0.05;
const EPSILON_INJECT_COST = 0.05;
const THREAT_THRESHOLD    = 50;

function getThreatLevel(signalCount) {
  if (signalCount >= THREAT_THRESHOLD) return 'threat';
  if (signalCount >= 20) return 'elevated';
  return 'safe';
}

function laplace(b) {
  const u = Math.random() - 0.5;
  return -b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

function buildMockGrid() {
  const data = new Map();
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const gridId = `${String(row).padStart(2, '0')}-${String(col).padStart(2, '0')}`;
      const roll = Math.random();
      const signalCount =
        roll < 0.65
          ? Math.floor(Math.random() * 20)
          : roll < 0.90
          ? 20 + Math.floor(Math.random() * 30)
          : 50 + Math.floor(Math.random() * 50);

      data.set(gridId, {
        grid_id:      gridId,
        signal_count: signalCount,
        noise_delta:  parseFloat((Math.random() * 2 - 1).toFixed(3)),
        last_updated: new Date().toISOString(),
        threat_level: getThreatLevel(signalCount),
      });
    }
  }
  return data;
}

function buildMockEventLog(gridData) {
  const entries = [];
  for (const [, row] of gridData) {
    if (row.threat_level !== 'safe') {
      const d = new Date(Date.now() - Math.random() * 300_000);
      entries.push({
        id:           nextId(row.grid_id),
        timestamp:    d.toTimeString().slice(0, 8),
        grid_id:      row.grid_id,
        signal_delta: Math.floor(Math.random() * 30) + 1,
        threat_level: row.threat_level,
      });
    }
  }
  return entries.slice(0, 50).sort(() => Math.random() - 0.5);
}

export function useGridData() {
  const [gridData, setGridData] = useState(() => buildMockGrid());
  const [eventLog, setEventLog] = useState([]);
  const [epsilon,  setEpsilon]  = useState(EPSILON_START);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({
    lastSync:          '--:--:--',
    signalsProcessed:  0,
    privacyBudget:     100,
    activeGrids:       0,
  });

  const channelRef   = useRef(null);
  const intervalRef  = useRef(null);
  const isPausedRef  = useRef(false);

  const hasSupabase =
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  const recomputeStats = useCallback((gd) => {
    let total = 0;
    let active = 0;
    for (const [, row] of gd) {
      total  += row.signal_count;
      if (row.threat_level !== 'safe') active++;
    }
    const now = new Date();
    setStats({
      lastSync:         now.toTimeString().slice(0, 8),
      signalsProcessed: total,
      privacyBudget:    Math.max(5, Math.round(100 - (total / 500) * 100)),
      activeGrids:      active,
    });
  }, []);

  const appendEvent = useCallback((row) => {
    const ts = new Date().toTimeString().slice(0, 8);
    setEventLog((prev) => {
      const entry = {
        id:           nextId(row.grid_id),
        timestamp:    ts,
        grid_id:      row.grid_id,
        signal_delta: Math.floor(Math.random() * 20) + 1,
        threat_level: row.threat_level,
      };
      return [entry, ...prev].slice(0, 60);
    });
  }, []);

  const startMockSimulation = useCallback(() => {
    const initial = buildMockGrid();
    setGridData(initial);
    setEventLog(buildMockEventLog(initial));
    recomputeStats(initial);

    intervalRef.current = setInterval(() => {
      if (isPausedRef.current) return;

      setEpsilon((prev) => Math.max(EPSILON_FLOOR, prev - EPSILON_DECAY));

      setGridData((prev) => {
        const next = new Map(prev);
        const keys = Array.from(next.keys());

        const count = Math.floor(Math.random() * 6) + 3;
        for (let i = 0; i < count; i++) {
          const key = keys[Math.floor(Math.random() * keys.length)];
          const old = next.get(key);
          if (!old) continue;

          const raw     = Math.random() * 14;
          const noisy   = Math.max(0, old.signal_count * 0.94 + raw + laplace(2.5));
          const newCount = Math.round(Math.max(0, Math.min(noisy, 120)));
          const level    = getThreatLevel(newCount);

          const updated = {
            ...old,
            signal_count: newCount,
            noise_delta:  parseFloat((Math.random() * 2 - 1).toFixed(3)),
            last_updated: new Date().toISOString(),
            threat_level: level,
          };
          next.set(key, updated);

          if (level !== 'safe') appendEvent(updated);
        }

        recomputeStats(next);
        return next;
      });
    }, 2000);
  }, [appendEvent, recomputeStats]);

  const startSupabaseSubscription = useCallback(async () => {
    const { supabase } = await import('../lib/supabase');

    const { data: rows } = await supabase
      .from('grid_threats')
      .select('*');

    if (rows) {
      const gd = new Map();
      for (const row of rows) {
        const score = Math.round(row.threat_score ?? 0);
        const level = getThreatLevel(score);
        gd.set(row.grid_id, { ...row, signal_count: score, threat_level: level });
      }
      setGridData(gd);
      setEventLog(buildMockEventLog(gd));
      recomputeStats(gd);
    }

    channelRef.current = supabase
      .channel('grid-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'grid_threats' },
        (payload) => {
          if (isPausedRef.current) return;   // honour pause in production
          const row   = payload.new;
          const score = Math.round(row.threat_score ?? 0);
          const level = getThreatLevel(score);
          const rowWithLevel = { ...row, signal_count: score, threat_level: level };
          setGridData((prev) => {
            const next = new Map(prev);
            next.set(row.grid_id, rowWithLevel);
            recomputeStats(next);
            return next;
          });
          appendEvent(rowWithLevel);
        }
      )
      .subscribe();
  }, [appendEvent, recomputeStats]);

  useEffect(() => {
    if (hasSupabase) {
      startSupabaseSubscription();
    } else {
      startMockSimulation();
    }
    return () => {
      if (channelRef.current)  channelRef.current.unsubscribe();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasSupabase, startMockSimulation, startSupabaseSubscription]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const injectAnomaly = useCallback(() => {
    setGridData((prev) => {
      const next    = new Map(prev);
      const keys    = Array.from(next.keys());
      const centerKey = keys[2 + Math.floor(Math.random() * 12) * 16 + 2 + Math.floor(Math.random() * 12)];
      const fallback  = keys[Math.floor(Math.random() * keys.length)];
      const chosen    = centerKey ?? fallback;
      const [cr, cc]  = chosen.split('-').map(Number);

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const r = cr + dr;
          const c = cc + dc;
          if (r < 0 || r >= 16 || c < 0 || c >= 16) continue;
          const id  = `${String(r).padStart(2, '0')}-${String(c).padStart(2, '0')}`;
          const old = next.get(id);
          if (!old) continue;
          const boost    = 40 + Math.floor(Math.random() * 30);
          const newCount = Math.min(old.signal_count + boost, 120);
          const updated  = {
            ...old,
            signal_count: newCount,
            threat_level: getThreatLevel(newCount),
            last_updated: new Date().toISOString(),
          };
          next.set(id, updated);
          if (updated.threat_level !== 'safe') appendEvent(updated);
        }
      }

      recomputeStats(next);
      return next;
    });
    setEpsilon((prev) => Math.max(EPSILON_FLOOR, prev - EPSILON_INJECT_COST));
  }, [appendEvent, recomputeStats]);

  const resetGrid = useCallback(() => {
    const fresh = buildMockGrid();
    setGridData(fresh);
    setEventLog(buildMockEventLog(fresh));
    setEpsilon(EPSILON_START);
    recomputeStats(fresh);
  }, [recomputeStats]);

  const togglePause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  return {
    gridData,
    eventLog,
    stats,
    epsilon,
    isPaused,
    injectAnomaly,
    resetGrid,
    togglePause,
  };
}
