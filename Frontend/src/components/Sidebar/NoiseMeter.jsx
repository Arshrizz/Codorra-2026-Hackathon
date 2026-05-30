import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TOTAL_BLOCKS = 10;

export default function NoiseMeter({ level = 5 }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const getBlockColor = (index) => {
    if (index >= 8) return "var(--accent-threat)";
    if (index >= 6) return "var(--accent-warn)";
    return "var(--accent-noise)";
  };

  return (
    <div style={{ marginBottom: "12px" }}>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 700,
          fontSize: "10px",
          letterSpacing: "0.15em",
          color: "var(--text-secondary)",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        Noise ε-Budget
      </div>

      {/* 
        VU Meter: 10 blocks stacked top-to-bottom.
        We render index 9 at top, 0 at bottom.
        Block is "active" if its index < level (counting from bottom).
      */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          width: "100%",
          maxWidth: "260px",
          height: "108px", // 10 * 8px blocks + 9 * 2px gaps
          justifyContent: "flex-end",
        }}
      >
        {Array.from({ length: TOTAL_BLOCKS }, (_, i) => TOTAL_BLOCKS - 1 - i).map(
          (blockIndex) => {
            const isActive = blockIndex < level;
            return (
              <motion.div
                key={blockIndex}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: mounted ? (isActive ? 1 : 0.15) : 0,
                  backgroundColor: isActive
                    ? getBlockColor(blockIndex)
                    : "var(--bg-elevated)",
                }}
                transition={{
                  duration: 0.3,
                  delay: mounted ? 0 : (TOTAL_BLOCKS - 1 - blockIndex) * 0.06,
                }}
                style={{
                  height: "8px",
                  width: "100%",
                  borderRadius: "1px",
                  flexShrink: 0,
                }}
              />
            );
          }
        )}
      </div>

      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "10px",
          color: "var(--text-muted)",
          marginTop: "6px",
        }}
      >
        LEVEL: {level}/{TOTAL_BLOCKS}
      </div>
    </div>
  );
}
