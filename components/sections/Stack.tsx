"use client";

import React, { useState } from "react";
import { PORTFOLIO_DATA } from "@/content/data";
import { FileCode2, Package, Check, Terminal } from "lucide-react";

export default function StackSection() {
  const [activeCategory, setActiveCategory] = useState(0);

  const currentCat = PORTFOLIO_DATA.manifest.categories[activeCategory];

  return (
    <section id="stack" className="py-12 space-y-8">
      
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b-4 border-ink dark:border-concrete pb-4">
        <div className="p-2 bg-hazard text-ink border-2 border-ink shadow-hard-sm">
          <FileCode2 className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <span className="font-mono text-xs text-rebar uppercase tracking-widest">// SECTION 05</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-ink dark:text-concrete">
            MANIFEST & PACKAGE.JSON
          </h2>
        </div>
      </div>

      {/* Package.json Editor Box */}
      <div className="bg-card-bg border-4 border-ink dark:border-concrete shadow-hard-lg overflow-hidden">
        
        {/* Editor Title Bar */}
        <div className="p-3 bg-ink text-hazard dark:bg-concrete dark:text-ink font-mono text-xs font-bold flex items-center justify-between border-b-4 border-ink dark:border-concrete">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 stroke-[2.5]" />
            <span>{PORTFOLIO_DATA.manifest.packageName} // package.json</span>
          </div>
          <span>VERSION: {PORTFOLIO_DATA.manifest.version}</span>
        </div>

        {/* Tab Headers */}
        <div className="flex flex-wrap border-b-3 border-ink dark:border-concrete bg-concrete dark:bg-black/50 p-2 gap-2">
          {PORTFOLIO_DATA.manifest.categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(idx)}
              className={`px-4 py-2 font-mono text-xs font-bold border-2 transition-all cursor-pointer ${
                activeCategory === idx
                  ? "bg-hazard text-ink border-ink shadow-hard-sm"
                  : "bg-card-bg text-ink dark:text-concrete border-ink/40 dark:border-concrete/40 hover:border-ink"
              }`}
            >
              [ {cat.category} ]
            </button>
          ))}
        </div>

        {/* Category Description */}
        <div className="p-4 bg-hazard/10 border-b-2 border-ink/10 dark:border-concrete/10 font-mono text-xs text-rebar">
          <span className="font-bold text-ink dark:text-concrete">// DESCRIPTION: </span>
          {currentCat.description}
        </div>

        {/* Dependency Items Table */}
        <div className="divide-y-2 divide-ink/10 dark:divide-concrete/10 font-mono text-xs">
          {currentCat.items.map((item, idx) => (
            <div
              key={idx}
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-hazard/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-circuit" />
                <span className="font-extrabold text-sm text-ink dark:text-concrete">
                  "{item.name}":
                </span>
                <span className="text-signal font-bold">"{item.version}"</span>
                <span className="px-2 py-0.5 text-[10px] bg-concrete dark:bg-ink text-rebar border border-ink dark:border-concrete">
                  {item.type}
                </span>
              </div>

              {item.notes && (
                <div className="text-rebar text-xs italic md:text-right">
                  // {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* JSON Code Snippet Footer */}
        <div className="p-3 bg-ink/5 dark:bg-black/80 border-t-3 border-ink dark:border-concrete font-mono text-[11px] text-rebar flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>NPM_DEPENDENCIES_VERIFIED</span>
          </div>
          <div className="flex items-center gap-1 text-circuit dark:text-hazard font-bold">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>100% TYPED & AUDITED</span>
          </div>
        </div>

      </div>

    </section>
  );
}
