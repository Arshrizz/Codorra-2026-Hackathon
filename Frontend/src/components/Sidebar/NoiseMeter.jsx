import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TOTAL_BLOCKS = 10;

// Full height of the tallest bar in px (the container height).
// Each bar's active height scales proportionally to its index + 1.
const CONTAINER_H = 72; // px — compact for sidebar

export default function NoiseMeter({ level = 5 }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  const getBarColor = (index) => {
    // index 0 = leftmost / lowest, 9 = rightmost / highest
    if (index >= 8) return "var(--accent-threat)";
    if (index >= 6) return "var(--accent-warn)";
    return "var(--accent-noise)";
  };

  return (
    <div style={{ marginBottom: "12px" }}>
      {/* Section label */}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "10px",
          letterSpacing: "0.15em",
          color: "var(--text-secondary)",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}
      >
        Noise ε-Budget
      </div>

      {/*
        Vertical bar chart — bars rise from a shared baseline at the bottom.
        alignItems: "flex-end" makes each bar grow upward.
        Each bar's max height is CONTAINER_H px; active bars scale by
        their index so the chart forms a staircase shape.
      */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          gap: "3px",
          width: "100%",
          maxWidth: "260px",
          height: `${CONTAINER_H}px`,
        }}
      >
        {Array.from({ length: TOTAL_BLOCKS }, (_, i) => i).map((barIndex) => {
          const isActive = barIndex < level;
          // Active bars: height scales so bar 0 is shortest, bar 9 tallest.
          // This creates an ascending staircase that fills up with level.
          const activeHeight = Math.round(
            ((barIndex + 1) / TOTAL_BLOCKS) * CONTAINER_H
          );
          // Inactive bars show a dim ghost at a fixed small height
          const ghostHeight = Math.max(4, Math.round(((barIndex + 1) / TOTAL_BLOCKS) * CONTAINER_H * 0.18));

          return (
            <motion.div
              key={barIndex}
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: mounted
                  ? isActive
                    ? activeHeight
                    : ghostHeight
                  : 0,
                opacity: mounted ? (isActive ? 1 : 0.2) : 0,
                backgroundColor: isActive
                  ? getBarColor(barIndex)
                  : "var(--bg-elevated)",
              }}
              transition={{
                height: {
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1], // ease-out-quint
                  delay: mounted ? 0 : barIndex * 0.045,
                },
                opacity: {
                  duration: 0.3,
                  delay: mounted ? 0 : barIndex * 0.045,
                },
                backgroundColor: { duration: 0.25 },
              }}
              style={{
                flex: 1,
                minWidth: 0,
                borderRadius: "2px 2px 1px 1px",
                flexShrink: 0,
              }}
            />
          );
        })}
      </div>

      {/* Baseline rule */}
      <div
        style={{
          width: "100%",
          maxWidth: "260px",
          height: "1px",
          backgroundColor: "var(--border-dim)",
          marginTop: "3px",
        }}
      />

      {/* Level readout */}
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "10px",
          color: "var(--text-muted)",
          marginTop: "5px",
          letterSpacing: "0.05em",
        }}
      >
        LEVEL: {level}/{TOTAL_BLOCKS}
      </div>
    </div>
  );
}
