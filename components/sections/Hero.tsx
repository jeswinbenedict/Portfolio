"use client";

import React from "react";
import { PORTFOLIO_DATA } from "@/content/data";
import { ArrowDownRight, FileText, Sparkles, Box, Terminal, Activity } from "lucide-react";

export default function HeroSection() {
  return (
    <section id="hero" className="py-8 md:py-16 space-y-12">
      
      {/* Top Banner Ticker */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-hazard text-ink border-3 border-ink shadow-hard-sm font-mono text-xs font-bold">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 stroke-[3] animate-pulse text-signal" />
          <span className="uppercase">NOW BUILDING →</span>
          <span className="px-2 py-0.5 bg-ink text-hazard font-mono">
            {PORTFOLIO_DATA.hero.nowBuilding.commit}
          </span>
          <span className="hidden sm:inline">
            "{PORTFOLIO_DATA.hero.nowBuilding.message}"
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-white text-ink border border-ink">
            {PORTFOLIO_DATA.hero.nowBuilding.status}
          </span>
          <span className="hidden md:inline font-normal">
            SYS_LOC: {PORTFOLIO_DATA.hero.location}
          </span>
        </div>
      </div>

      {/* Main Hero Grid: Left Content, Right 3D Canvas Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Positioning & CTAs */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            
            {/* Eyebrow Stencil Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-black/50 border-2 border-ink dark:border-concrete font-mono text-xs font-bold tracking-widest text-ink dark:text-concrete shadow-hard-sm">
              <span className="w-2.5 h-2.5 bg-signal" />
              <span>THE BUILD YARD // V2026.8</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl tracking-tight leading-[0.95] uppercase text-ink dark:text-concrete">
                {PORTFOLIO_DATA.hero.name}
              </h1>
              <div className="inline-block px-3 py-1 bg-circuit text-white font-mono font-bold text-sm sm:text-base border-2 border-ink shadow-hard-sm">
                {PORTFOLIO_DATA.hero.role}
              </div>
            </div>

            {/* Subtext */}
            <p className="text-lg sm:text-xl font-medium text-ink/80 dark:text-concrete/90 max-w-2xl leading-relaxed">
              {PORTFOLIO_DATA.hero.tagline}
            </p>

            {/* Status callout */}
            <div className="p-3 bg-white dark:bg-card-bg border-3 border-ink dark:border-concrete shadow-hard-sm font-mono text-xs text-rebar">
              <span className="font-bold text-ink dark:text-concrete">SYSTEM STATEMENT: </span>
              {PORTFOLIO_DATA.hero.statusText}
            </div>

          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            
            {/* Primary CTA */}
            <a
              href="#projects"
              className="group flex items-center gap-3 px-6 py-4 bg-hazard text-ink font-display font-extrabold text-lg uppercase border-3 border-ink shadow-hard hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-hard-sm transition-all cursor-pointer"
            >
              <span>SEE THE WORK</span>
              <ArrowDownRight className="w-6 h-6 stroke-[3] group-hover:rotate-45 transition-transform" />
            </a>

            {/* Secondary CTA: Stamped Barcode Shipping Label */}
            <a
              href={PORTFOLIO_DATA.hero.resumeUrl}
              className="flex items-center gap-3 px-5 py-3.5 bg-concrete dark:bg-ink text-ink dark:text-concrete font-mono text-xs font-bold uppercase border-3 border-ink dark:border-concrete shadow-hard hover:bg-circuit hover:text-white dark:hover:bg-circuit transition-all cursor-pointer"
            >
              <FileText className="w-5 h-5 stroke-[2.5]" />
              <div className="flex flex-col text-left">
                <span>DOWNLOAD RESUME</span>
                <span className="text-[10px] opacity-75 font-normal">BARCODE: #PDF-2026-ENG</span>
              </div>
            </a>

          </div>

        </div>

        {/* Right Column: 3D Yard Canvas Placeholder Container */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="relative flex-1 min-h-[380px] bg-grid-pattern bg-white dark:bg-card-bg border-4 border-ink dark:border-concrete shadow-hard-lg p-6 flex flex-col justify-between overflow-hidden">
            
            {/* Corner Hazard Tape Accents */}
            <div className="absolute top-0 right-0 w-32 h-6 bg-hazard-stripes border-b-2 border-l-2 border-ink -mr-6 mt-3 rotate-45 pointer-events-none" />
            
            {/* Top Canvas Bar */}
            <div className="flex items-center justify-between border-b-3 border-ink dark:border-concrete pb-3 font-mono text-xs font-bold">
              <div className="flex items-center gap-2 text-ink dark:text-concrete">
                <Box className="w-4 h-4 text-circuit stroke-[2.5]" />
                <span>3D_YARD_CANVAS.R3F</span>
              </div>
              <span className="px-2 py-0.5 bg-hazard text-ink text-[10px] font-extrabold border border-ink">
                PHASE 2 PLACEHOLDER
              </span>
            </div>

            {/* Center Interactive Fallback Crate Grid Mockup */}
            <div className="my-auto py-6 space-y-4 text-center">
              
              {/* Stacked Crates Graphic Mockup */}
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                {[
                  { name: "NEXT.JS", color: "bg-hazard text-ink" },
                  { name: "RUST", color: "bg-circuit text-white" },
                  { name: "GO", color: "bg-signal text-white" },
                  { name: "THREE.JS", color: "bg-ink text-hazard dark:bg-concrete dark:text-ink" },
                  { name: "POSTGRES", color: "bg-hazard text-ink" },
                  { name: "RAPIER 3D", color: "bg-circuit text-white" },
                ].map((crate, i) => (
                  <div
                    key={i}
                    className={`p-3 font-mono text-[11px] font-black border-2 border-ink shadow-hard-sm hover:-translate-y-1 hover:scale-105 transition-all cursor-pointer ${crate.color}`}
                  >
                    [ {crate.name} ]
                  </div>
                ))}
              </div>

              <div className="space-y-1 font-mono">
                <p className="text-xs font-bold text-ink dark:text-concrete uppercase">
                  PHYSICS-DRIVEN 3D CRATE YARD
                </p>
                <p className="text-[11px] text-rebar max-w-xs mx-auto">
                  Drag, fling, and stack tech crates. In Phase 2, Rapier3D physics will be loaded here on demand.
                </p>
              </div>

            </div>

            {/* Bottom Status Bar */}
            <div className="pt-3 border-t-3 border-ink dark:border-concrete flex items-center justify-between font-mono text-[10px] text-rebar">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>CANVAS_STATE: IDLE</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-hazard" />
                <span>R3F + RAPIER PREPARED</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}
