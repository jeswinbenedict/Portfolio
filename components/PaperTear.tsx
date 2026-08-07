"use client";

import React, { useEffect, useRef, useState } from "react";

export default function PaperTear() {
  const [gapHeight, setGapHeight] = useState(200);
  const [stickerOpacity, setStickerOpacity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMobile = () => window.innerWidth <= 768;

    const handleScroll = () => {
      if (isMobile()) return;

      const scrollY = window.scrollY;
      const scrollStart = 100;
      const scrollRange = 200;
      const stickerStart = scrollStart + scrollRange + 30;
      const stickerRange = 60;

      if (scrollY <= scrollStart) {
        setGapHeight(200);
        setStickerOpacity(0);
      } else if (scrollY <= scrollStart + scrollRange) {
        const progress = (scrollY - scrollStart) / scrollRange;
        setGapHeight(Math.max(0, 200 - 230 * progress));
        setStickerOpacity(0);
      } else if (scrollY > stickerStart && scrollY < stickerStart + stickerRange) {
        setGapHeight(0);
        const stickerProgress = (scrollY - stickerStart) / stickerRange;
        setStickerOpacity(Math.min(1, Math.max(0, (stickerProgress - 0.35) * 1.54)));
      } else if (scrollY >= stickerStart + stickerRange) {
        setGapHeight(0);
        setStickerOpacity(1);
      } else {
        setGapHeight(0);
        setStickerOpacity(0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tearPath = "M0,15 Q10,5 20,15 T40,15 Q50,5 60,15 T80,15 Q90,20 100,15 T120,15 Q130,10 140,15 T160,15 Q170,5 180,15 T200,15 Q210,20 220,15 T240,15 Q250,8 260,15 T280,15 Q290,18 300,15 T320,15 Q330,5 340,15 T360,15 Q370,12 380,15 T400,15 Q410,20 420,15 T440,15 Q450,6 460,15 T480,15 Q490,16 500,15 T520,15 Q530,8 540,15 T560,15 Q570,20 580,15 T600,15 Q610,10 620,15 T640,15 Q650,5 660,15 T680,15 Q690,18 700,15 T720,15 Q730,12 740,15 T760,15 Q770,7 780,15 T800,15 Q810,20 820,15 T840,15 Q850,9 860,15 T880,15 Q890,14 900,15 T920,15 Q930,6 940,15 T960,15 Q970,19 980,15 T1000,15 Q1010,11 1020,15 T1040,15 Q1050,5 1060,15 T1080,15 Q1090,17 1100,15 T1120,15 Q1130,8 1140,15 T1160,15 Q1170,13 1180,15 T1200,15 Q1210,20 1220,15 T1240,15 Q1250,7 1260,15 T1280,15 Q1290,16 1300,15 T1320,15 Q1330,10 1340,15 T1360,15 Q1370,5 1380,15 T1400,15 Q1410,18 1420,15 T1440,15";

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Top Tear */}
      <div className="relative w-full h-[30px] -mb-px">
        <svg width="100%" height="30" viewBox="0 0 1440 30" preserveAspectRatio="none">
          <path
            d={`M0,0 L0,15 ${tearPath.substring(5)} L1440,0 Z`}
            fill="var(--bg, #ffffff)"
            stroke="none"
          />
          <path
            d={`M0,30 L0,15 ${tearPath.substring(5)} L1440,30 Z`}
            fill="#d0d0d0"
            stroke="none"
            className="dark:fill-[#333]"
          />
          <path
            d={tearPath}
            fill="none"
            stroke="var(--border, #000)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Gap */}
      <div
        className="w-full bg-[#d0d0d0] dark:bg-[#333] transition-none overflow-hidden"
        style={{ height: `${Math.max(0, gapHeight)}px` }}
      />

      {/* Bottom Tear */}
      <div className="relative w-full h-[30px] -mt-px" style={{ marginTop: gapHeight <= 0 ? "-30px" : undefined }}>
        <svg width="100%" height="30" viewBox="0 0 1440 30" preserveAspectRatio="none">
          <path
            d={`M0,0 L0,15 ${tearPath.substring(5)} L1440,0 Z`}
            fill="#d0d0d0"
            stroke="none"
            className="dark:fill-[#333]"
            style={{ opacity: gapHeight > 0 ? 1 : 0 }}
          />
          <path
            d={`M0,30 L0,15 ${tearPath.substring(5)} L1440,30 Z`}
            fill="var(--bg, #ffffff)"
            stroke="none"
          />
          <path
            d={tearPath}
            fill="none"
            stroke="var(--border, #000)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Tape Sticker */}
      <div
        className="absolute left-1/2 z-10 w-[120px] h-[45px] bg-[#ffd93d]/80 border-2 border-black/20 rounded-sm shadow-md"
        style={{
          top: "50%",
          transform: `translate(-50%, -50%) rotate(-8deg)`,
          opacity: stickerOpacity,
          transition: "opacity 0.2s ease",
        }}
      >
        {/* Tape texture lines */}
        <div className="absolute top-[30%] left-[10%] right-[10%] h-[1px] bg-black/10" />
        <div className="absolute top-[50%] left-[10%] right-[10%] h-[1px] bg-black/10" />
        <div className="absolute top-[70%] left-[10%] right-[10%] h-[1px] bg-black/10" />
      </div>
    </div>
  );
}
