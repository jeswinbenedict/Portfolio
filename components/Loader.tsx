"use client";

import React, { useState, useEffect } from "react";

export default function Loader() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Prevent scrolling during load
    document.body.style.overflow = "hidden";
    
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setLoading(false);
        document.body.style.overflow = "";
      }, 400);
    }, 1200);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-neo-yellow transition-opacity duration-300 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Floating Decorative SVG Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Code Brackets - Top Left */}
        <div className="absolute top-[15%] left-[10%] animate-[floatDeco_3s_ease-in-out_infinite]">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
            <rect x="6" y="6" width="88" height="88" rx="8" fill="#66d9ef" stroke="#000" strokeWidth="4"/>
            <rect x="3" y="3" width="88" height="88" rx="8" fill="#66d9ef" stroke="#000" strokeWidth="4"/>
            <path d="M35 40 L20 50 L35 60" stroke="#000" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M65 40 L80 50 L65 60" stroke="#000" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="55" y1="35" x2="45" y2="65" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Terminal - Top Right */}
        <div className="absolute top-[20%] right-[15%] animate-[floatDeco_3s_ease-in-out_infinite_0.5s]">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
            <rect x="6" y="6" width="88" height="88" rx="8" fill="#ffd93d" stroke="#000" strokeWidth="4"/>
            <rect x="3" y="3" width="88" height="88" rx="8" fill="#ffd93d" stroke="#000" strokeWidth="4"/>
            <path d="M25 35 L40 50 L25 65" stroke="#000" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="50" y1="65" x2="75" y2="65" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Floppy Disk - Bottom Left */}
        <div className="absolute bottom-[20%] left-[15%] animate-[floatDeco_3s_ease-in-out_infinite_1s]">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
            <rect x="6" y="6" width="88" height="88" rx="8" fill="#a8e6cf" stroke="#000" strokeWidth="4"/>
            <rect x="3" y="3" width="88" height="88" rx="8" fill="#a8e6cf" stroke="#000" strokeWidth="4"/>
            <rect x="20" y="20" width="60" height="60" rx="3" fill="#ffd93d" stroke="#000" strokeWidth="4"/>
            <rect x="30" y="20" width="40" height="20" fill="#66d9ef" stroke="#000" strokeWidth="3"/>
            <rect x="35" y="55" width="30" height="15" rx="2" fill="#000"/>
            <circle cx="50" cy="35" r="3" fill="#000"/>
          </svg>
        </div>
      </div>

      {/* Letter Pop Animation */}
      <div className="relative z-10 flex items-center gap-6">
        <div className="loader-letter loader-letter-1">J</div>
        <div className="loader-letter loader-letter-2">B</div>
      </div>

      {/* Neo Progress Bar */}
      <div className="relative z-10 mt-10 w-[300px] h-5 bg-white border-4 border-neo-black shadow-[6px_6px_0_#000] overflow-hidden">
        <div className="h-full bg-neo-yellow loader-progress-fill">
          <div className="absolute top-0 right-0 w-1 h-full bg-neo-black" />
        </div>
      </div>
    </div>
  );
}
