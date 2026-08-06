"use client";

import React, { useEffect, useState } from "react";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.closest("button") ||
          target.closest("a") ||
          target.getAttribute("role") === "button")
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-50 transition-transform duration-75 ease-out"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      }}
    >
      {/* Outer Industrial Reticle Ring */}
      <div
        className={`relative -top-4 -left-4 flex items-center justify-center rounded-none border-2 border-ink dark:border-hazard transition-all duration-150 ${
          isHovered
            ? "w-10 h-10 bg-hazard/30 dark:bg-hazard/20 border-circuit scale-110"
            : "w-8 h-8 bg-transparent"
        }`}
      >
        {/* Center Crosshair Dot */}
        <div className="w-1.5 h-1.5 bg-signal dark:bg-hazard" />
        
        {/* Reticle Corner Marks */}
        <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t-2 border-l-2 border-ink dark:border-hazard" />
        <div className="absolute -top-1 -right-1 w-1.5 h-1.5 border-t-2 border-r-2 border-ink dark:border-hazard" />
        <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 border-b-2 border-l-2 border-ink dark:border-hazard" />
        <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b-2 border-r-2 border-ink dark:border-hazard" />
      </div>
    </div>
  );
}
