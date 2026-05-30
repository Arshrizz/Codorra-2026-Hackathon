import { useRef, useEffect, useState } from 'react';
import GridCell from './GridCell';
import NoiseOverlay from './NoiseOverlay';

const GRID_SIZE = 16;
const CELL_PADDING = 2; // px inset so border breathes

export default function MapGrid({ gridData }) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ width: 600, height: 600 });
  const prevDataRef = useRef(new Map());

  // Track which cells changed this render cycle
  const changedCells = new Set();
  const threatCrossings = new Set();

  for (const [id, row] of gridData) {
    const prev = prevDataRef.current.get(id);
    if (prev) {
      if (prev.signal_count !== row.signal_count || prev.threat_level !== row.threat_level) {
        changedCells.add(id);
      }
      if (prev.threat_level !== 'threat' && row.threat_level === 'threat') {
        threatCrossings.add(id);
      }
    }
  }

  // Update ref after diff
  useEffect(() => {
    prevDataRef.current = new Map(gridData);
  });

  // Measure container for responsive SVG
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDims({ width, height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const cellW = dims.width  / GRID_SIZE;
  const cellH = dims.height / GRID_SIZE;

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        position: 'relative',
        background:
          'radial-gradient(ellipse at 50% 50%, var(--bg-elevated) 0%, var(--bg-void) 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Grid SVG */}
      <svg
        width={dims.width}
        height={dims.height}
        style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}
      >
        {Array.from(gridData.values()).map((row) => {
          const parts = row.grid_id.split('-');
          const rowIdx = parseInt(parts[0], 10);
          const colIdx = parseInt(parts[1], 10);
          return (
            <GridCell
              key={row.grid_id}
              x={colIdx * cellW + CELL_PADDING}
              y={rowIdx * cellH + CELL_PADDING}
              size={Math.min(cellW, cellH) - CELL_PADDING}
              gridId={row.grid_id}
              threatLevel={row.threat_level}
              signalCount={row.signal_count}
              noiseDelta={row.noise_delta}
              hasChanged={changedCells.has(row.grid_id)}
              isThreatCrossing={threatCrossings.has(row.grid_id)}
            />
          );
        })}
      </svg>

      {/* Noise overlay — absolute, pointer-events none */}
      <NoiseOverlay width={dims.width} height={dims.height} />
    </div>
  );
}
