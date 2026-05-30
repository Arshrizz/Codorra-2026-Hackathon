import { useState, useEffect, useRef, useCallback } from 'react';

// Threat level enum values
const THREAT_LEVELS = ['safe', 'elevated', 'threat'];

// ── Mock data generator ─────────────────────────────────────────────────────
// Generates a full 16×16 grid of mock cells so the UI works without Supabase.
function buildMockGrid() {
  const data = new Map();
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const gridId = `${String(row).padStart(2, '0')}-${String(col).padStart(2, '0')}`;
      const roll = Math.random();
      const threatLevel =
        roll < 0.7 ? 'safe' : roll < 0.9 ? 'elevated' : 'threat';
      data.set(gridId, {
        grid_id: gridId,
        signal_count: Math.floor(Math.random() * 120),
        noise_delta: parseFloat((Math.random() * 2 - 1).toFixed(3)),
        last_updated: new Date().toISOString(),
        threat_level: threatLevel,
      });
    }
  }
  return data;
}

function buildMockEventLog(gridData) {
  const entries = [];
  for (const [, row] of gridData) {
    if (row.threat_level !== 'safe') {
      const d = new Date(Date.now() - Math.random() * 300000);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      entries.push({
        id: `${row.grid_id}-${d.getTime()}`,
        timestamp: `${hh}:${mm}:${ss}`,
        grid_id: row.grid_id,
        signal_delta: Math.floor(Math.random() * 30) + 1,
        threat_level: row.threat_level,
      });
    }
  }
  return entries.slice(0, 50).sort(() => Math.random() - 0.5);
}

// ── Hook ────────────────────────────────────────────────────────────────────
export function useGridData() {
  const [gridData, setGridData] = useState(() => buildMockGrid());
  const [eventLog, setEventLog] = useState(() => []);
  const [stats, setStats] = useState({
    lastSync: '--:--:--',
    signalsProcessed: 0,
    privacyBudget: 100,
    activeGrids: 0,
  });
  const channelRef = useRef(null);
  const intervalRef = useRef(null);
  const hasSupabase =
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  // ── Compute stats from grid data ─────────────────────────────────────────
  const recomputeStats = useCallback((gd) => {
    let total = 0;
    let active = 0;
    for (const [, row] of gd) {
      total += row.signal_count;
      if (row.threat_level !== 'safe') active++;
    }
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    setStats({
      lastSync: `${hh}:${mm}:${ss}`,
      signalsProcessed: total,
      privacyBudget: Math.max(40, 100 - Math.floor(total / 300)),
      activeGrids: active,
    });
  }, []);

  // ── Append to event log ───────────────────────────────────────────────────
  const appendEvent = useCallback((row) => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    setEventLog((prev) => {
      const entry = {
        id: `${row.grid_id}-${Date.now()}`,
        timestamp: `${hh}:${mm}:${ss}`,
        grid_id: row.grid_id,
        signal_delta: Math.floor(Math.random() * 20) + 1,
        threat_level: row.threat_level,
      };
      return [entry, ...prev].slice(0, 50);
    });
  }, []);

  // ── Mock live simulation (when no Supabase) ──────────────────────────────
  const startMockSimulation = useCallback(() => {
    const initial = buildMockGrid();
    setGridData(initial);
    setEventLog(buildMockEventLog(initial));
    recomputeStats(initial);

    intervalRef.current = setInterval(() => {
      setGridData((prev) => {
        const next = new Map(prev);
        const keys = Array.from(next.keys());
        // Mutate 3–8 random cells per tick
        const count = Math.floor(Math.random() * 6) + 3;
        for (let i = 0; i < count; i++) {
          const key = keys[Math.floor(Math.random() * keys.length)];
          const old = next.get(key);
          const roll = Math.random();
          const threatLevel =
            roll < 0.68 ? 'safe' : roll < 0.88 ? 'elevated' : 'threat';
          const updated = {
            ...old,
            signal_count: Math.max(
              0,
              old.signal_count + Math.floor(Math.random() * 10) - 4
            ),
            noise_delta: parseFloat((Math.random() * 2 - 1).toFixed(3)),
            last_updated: new Date().toISOString(),
            threat_level: threatLevel,
          };
          next.set(key, updated);
          if (threatLevel !== 'safe') {
            appendEvent(updated);
          }
        }
        recomputeStats(next);
        return next;
      });
    }, 2000);
  }, [appendEvent, recomputeStats]);

  // ── Supabase realtime subscription ───────────────────────────────────────
  const startSupabaseSubscription = useCallback(async () => {
    const { supabase } = await import('../lib/supabase');

    // Initial fetch
    const { data: rows } = await supabase
      .from('grid_aggregates')
      .select('*');

    if (rows) {
      const gd = new Map();
      for (const row of rows) gd.set(row.grid_id, row);
      setGridData(gd);
      setEventLog(buildMockEventLog(gd));
      recomputeStats(gd);
    }

    channelRef.current = supabase
      .channel('grid-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'grid_aggregates' },
        (payload) => {
          const row = payload.new;
          setGridData((prev) => {
            const next = new Map(prev);
            next.set(row.grid_id, row);
            recomputeStats(next);
            return next;
          });
          appendEvent(row);
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
      if (channelRef.current) channelRef.current.unsubscribe();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasSupabase, startMockSimulation, startSupabaseSubscription]);

  return { gridData, eventLog, stats };
}
