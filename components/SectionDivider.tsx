import React from "react";

interface SectionDividerProps {
  label?: string;
}

export default function SectionDivider({ label = "BUILD & SHIP" }: SectionDividerProps) {
  return (
    <div className="relative my-8 flex items-center justify-center">
      
      {/* Sleek Neo-Brutalist Border Rule */}
      <div className="w-full h-[3px] bg-neo-black dark:bg-neo-mint/40" />

      {/* Centered Decorative Section Pill Badge */}
      <div className="absolute px-4 py-1.5 bg-white dark:bg-[#2a2a2a] text-neo-black dark:text-white border-3 border-neo-black dark:border-neo-mint shadow-neo-sm rounded-xl font-mono text-xs font-extrabold uppercase tracking-widest flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-neo-cyan border border-black animate-pulse" />
        <span>{label}</span>
        <span className="w-2.5 h-2.5 rounded-full bg-neo-yellow border border-black" />
      </div>

    </div>
  );
}
