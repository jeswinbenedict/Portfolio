"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollHighlightProps {
  children: ReactNode;
  color: "yellow" | "cyan" | "pink" | "mint";
  direction?: "left" | "right";
}

const colorMap = {
  yellow: "rgba(255, 217, 61, 0.7)",
  cyan: "rgba(102, 217, 239, 0.7)",
  pink: "rgba(255, 107, 157, 0.7)",
  mint: "rgba(168, 230, 207, 0.7)",
};

export default function ScrollHighlight({ children, color, direction = "left" }: ScrollHighlightProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [progress, setProgress] = useState(0);
  const startScrollRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const triggerPoint = window.scrollY + window.innerHeight * 0.8;
      
      if (startScrollRef.current === null && triggerPoint >= elementTop) {
        startScrollRef.current = window.scrollY;
      }

      if (startScrollRef.current !== null) {
        const p = Math.min(1, Math.max(0, (window.scrollY - startScrollRef.current) / 100));
        setProgress(p);
      }

      // Reset if scrolled back
      if (startScrollRef.current !== null && window.scrollY < startScrollRef.current - 50) {
        startScrollRef.current = null;
        setProgress(0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <span
      ref={ref}
      className="relative inline-block font-bold text-neo-black dark:text-neo-black px-1 rounded-sm"
      style={{ zIndex: 1 }}
    >
      <span
        className="absolute top-[-2px] h-[calc(100%+4px)] rounded-sm"
        style={{
          [direction === "left" ? "left" : "right"]: "-2px",
          width: `calc(${progress * 100}% + 2px)`,
          background: colorMap[color],
          zIndex: -1,
          transition: "width 0.05s linear",
        }}
      />
      {children}
    </span>
  );
}
