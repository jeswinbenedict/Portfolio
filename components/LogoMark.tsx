"use client";

import React from "react";

export default function LogoMark({ className = "" }: { className?: string }) {
  return (
    <a
      href="#hero"
      aria-label="Jeswin Karunya Benedict - Home"
      className={`group relative inline-flex items-center gap-2.5 px-3 py-1.5 bg-neo-yellow text-neo-black font-display font-black text-xl tracking-tight border-3 border-neo-black shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all rounded-xl select-none ${className}`}
    >
      {/* Custom Icon Emblem */}
      <div className="relative flex items-center justify-center w-8 h-8 bg-neo-black text-neo-yellow rounded-lg border-2 border-neo-black group-hover:rotate-6 transition-transform duration-300">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-neo-yellow"
        >
          {/* Code Prompt >_ combined with JKB initials */}
          <path d="M4 17l6-5-6-5" />
          <line x1="12" y1="17" x2="20" y2="17" />
        </svg>
        {/* Subtle accent dot */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neo-pink rounded-full border border-neo-black animate-pulse" />
      </div>

      {/* Brand Monogram */}
      <div className="flex items-center gap-1 font-black font-display tracking-tight text-xl text-neo-black">
        <span>JKB</span>
        <span className="text-neo-pink group-hover:translate-x-0.5 transition-transform inline-block">
          .
        </span>
      </div>
    </a>
  );
}
