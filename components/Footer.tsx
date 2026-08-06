import React from "react";
import HazardDivider from "./HazardDivider";
import { PORTFOLIO_DATA } from "@/content/data";
import { Cpu, ArrowUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-concrete dark:bg-ink border-t-3 border-ink dark:border-concrete mt-20">
      <HazardDivider height="h-3" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand & Tagline */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-hazard text-ink border-2 border-ink shadow-hard-sm">
              <Cpu className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-display font-black text-lg tracking-tight text-ink dark:text-concrete">
                THE BUILD YARD
              </div>
              <div className="font-mono text-xs text-rebar uppercase">
                {PORTFOLIO_DATA.hero.name} // FULL-STACK SYSTEMS ARCHITECTURE
              </div>
            </div>
          </div>

          {/* Telemetry Badge */}
          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
            <div className="px-3 py-1 bg-white dark:bg-black/50 border-2 border-ink dark:border-concrete flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-signal animate-ping" />
              <span className="text-rebar font-bold">STATUS:</span>
              <span className="text-ink dark:text-concrete font-bold">ONLINE (99.99% UP)</span>
            </div>

            <div className="px-3 py-1 bg-white dark:bg-black/50 border-2 border-ink dark:border-concrete text-rebar">
              COMMIT <span className="text-circuit dark:text-hazard font-bold">{PORTFOLIO_DATA.hero.nowBuilding.commit}</span>
            </div>
          </div>

          {/* Scroll to Top */}
          <a
            href="#"
            className="flex items-center gap-2 px-3 py-2 bg-hazard text-ink font-mono text-xs font-bold border-2 border-ink shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </a>

        </div>

        <div className="mt-8 pt-4 border-t border-ink/10 dark:border-concrete/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-rebar gap-2">
          <div>
            © {new Date().getFullYear()} {PORTFOLIO_DATA.hero.name}. ALL RIGHTS RESERVED.
          </div>
          <div>
            NEO-BRUTALIST ARCHITECTURE // NO PLACEHOLDERS
          </div>
        </div>
      </div>
    </footer>
  );
}
