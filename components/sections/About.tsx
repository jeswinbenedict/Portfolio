import React from "react";
import { PORTFOLIO_DATA } from "@/content/data";
import { Cpu, Terminal, ShieldCheck, Zap } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-12 space-y-8">
      
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b-4 border-ink dark:border-concrete pb-4">
        <div className="p-2 bg-hazard text-ink border-2 border-ink shadow-hard-sm">
          <Terminal className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <span className="font-mono text-xs text-rebar uppercase tracking-widest">// SECTION 02</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-ink dark:text-concrete">
            ABOUT & HARDWARE SPEC SHEET
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Plain-Written Bio & Philosophy */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="p-6 bg-card-bg border-4 border-ink dark:border-concrete shadow-hard space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-hazard text-ink font-mono text-xs font-bold border border-ink">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>VERIFIED ENGINEER BIOGRAPHY</span>
            </div>

            <p className="text-xl sm:text-2xl font-bold leading-relaxed text-ink dark:text-concrete">
              "{PORTFOLIO_DATA.about.bio}"
            </p>

            <div className="pt-4 border-t-2 border-ink/10 dark:border-concrete/10 flex flex-wrap items-center justify-between font-mono text-xs text-rebar gap-2">
              <span>ZERO BUZZWORDS // REAL METRICS ONLY</span>
              <span>EST. 2019 — PRESENT</span>
            </div>
          </div>

          {/* Core Philosophy Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-card-bg border-3 border-ink dark:border-concrete shadow-hard-sm space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-circuit dark:text-hazard">
                <Zap className="w-4 h-4 stroke-[2.5]" />
                <span>PERFORMANCE FIRST</span>
              </div>
              <p className="text-xs text-ink/80 dark:text-concrete/80 font-mono">
                Microsecond latency, zero client-side bloat, and physical-feeling UI states over heavy animation libraries.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-card-bg border-3 border-ink dark:border-concrete shadow-hard-sm space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-signal">
                <Cpu className="w-4 h-4 stroke-[2.5]" />
                <span>FULL-STACK DOMAIN</span>
              </div>
              <p className="text-xs text-ink/80 dark:text-concrete/80 font-mono">
                From raw SQL indexing and Go microservices down to custom React shaders and state synchronization.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Hardware Spec Sheet Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-card-bg border-4 border-ink dark:border-concrete shadow-hard-lg overflow-hidden">
            
            {/* Spec Sheet Header */}
            <div className="p-4 bg-ink text-hazard dark:bg-concrete dark:text-ink font-mono font-bold text-sm flex items-center justify-between border-b-4 border-ink dark:border-concrete">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 stroke-[2.5]" />
                <span>SPEC_SHEET // SYS_CONFIG</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-hazard text-ink dark:bg-ink dark:text-hazard font-mono">
                REV_2026.8
              </span>
            </div>

            {/* Table Rows */}
            <div className="divide-y-2 divide-ink/10 dark:divide-concrete/10 font-mono text-xs">
              {PORTFOLIO_DATA.about.specSheet.map((item, idx) => (
                <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-hazard/10 transition-colors">
                  <span className="text-rebar font-bold uppercase">{item.label}:</span>
                  <span className="text-ink dark:text-concrete font-extrabold sm:text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer status */}
            <div className="p-3 bg-concrete dark:bg-ink border-t-3 border-ink dark:border-concrete font-mono text-[10px] text-rebar flex justify-between">
              <span>HARDWARE_VERIFIED</span>
              <span className="text-circuit dark:text-hazard font-bold">ALL SYSTEMS GO</span>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}
