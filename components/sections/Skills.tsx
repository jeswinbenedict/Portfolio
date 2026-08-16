import React from "react";
import { PORTFOLIO_DATA } from "@/content/portfolioData";
import { Layers, Check, Star } from "lucide-react";

export default function SkillsSection() {
  return (
    <section id="skills" className="py-12 space-y-8">
      
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b-3 border-neo-black dark:border-neo-mint pb-4">
        <div className="p-2 bg-neo-yellow text-neo-black border-2 border-neo-black shadow-neo-sm rounded-lg">
          <Layers className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-neo-black dark:text-white">
            TECHNICAL SKILLS & COMPETENCIES
          </h2>
        </div>
      </div>

      {/* Grid of Skill Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PORTFOLIO_DATA.skillCategories.map((cat, idx) => (
          <div
            key={idx}
            className={`bg-white dark:bg-[#2a2a2a] border-3 border-neo-black dark:border-white shadow-neo-lg rounded-xl overflow-hidden flex flex-col justify-between ${
              cat.highlighted ? "ring-2 ring-neo-yellow dark:ring-neo-yellow" : ""
            }`}
          >
            
            {/* Category Header Bar */}
            <div className={`p-3.5 border-b-3 border-neo-black font-display font-extrabold text-base uppercase tracking-tight flex items-center justify-between ${cat.color}`}>
              <div className="flex items-center gap-2">
                {cat.highlighted && <Star className="w-4 h-4 text-black fill-black" />}
                <span>{cat.category}</span>
              </div>
              {cat.highlighted && (
                <span className="px-2 py-0.5 bg-black text-neo-yellow font-mono text-[10px] font-bold rounded">
                  KEY FOCUS
                </span>
              )}
            </div>

            {/* Skill Tag Chips */}
            <div className="p-4 flex-1">
              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-black border border-neo-black dark:border-white font-mono text-xs font-bold text-neo-black dark:text-white rounded-md shadow-neo-sm hover:translate-x-[-1px] transition-transform"
                  >
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Info Bar */}
            <div className="p-2.5 bg-gray-50 dark:bg-black/40 border-t-2 border-neo-black/10 dark:border-white/10 font-mono text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <span>{cat.skills.length} TAGS</span>
              <span className="font-bold text-neo-black dark:text-white">VERIFIED</span>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}
