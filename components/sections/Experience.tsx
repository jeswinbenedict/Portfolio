import React from "react";
import { PORTFOLIO_DATA } from "@/content/data";
import { GitCommit, Calendar, MapPin, CheckCircle2 } from "lucide-react";

export default function ExperienceSection() {
  return (
    <section id="experience" className="py-12 space-y-8">
      
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b-4 border-ink dark:border-concrete pb-4">
        <div className="p-2 bg-hazard text-ink border-2 border-ink shadow-hard-sm">
          <GitCommit className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <span className="font-mono text-xs text-rebar uppercase tracking-widest">// SECTION 04</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-ink dark:text-concrete">
            BUILD LOG & COMMIT HISTORY
          </h2>
        </div>
      </div>

      {/* Commit Hash Timeline */}
      <div className="relative pl-6 md:pl-8 border-l-4 border-ink dark:border-concrete space-y-10">
        
        {PORTFOLIO_DATA.experiences.map((exp, idx) => (
          <div key={idx} className="relative group">
            
            {/* Timeline Commit Hash Marker */}
            <div className="absolute -left-[35px] md:-left-[43px] top-1.5 flex items-center justify-center w-8 h-8 bg-hazard text-ink border-3 border-ink font-mono text-[11px] font-extrabold shadow-hard-sm">
              <GitCommit className="w-4 h-4 stroke-[3]" />
            </div>

            {/* Main Log Card */}
            <div className="bg-card-bg border-4 border-ink dark:border-concrete shadow-hard-lg p-6 space-y-4">
              
              {/* Log Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b-2 border-ink/10 dark:border-concrete/10 pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-ink text-hazard dark:bg-concrete dark:text-ink font-mono text-xs font-black">
                      COMMIT #{exp.commitHash}
                    </span>
                    <span className="px-2 py-0.5 bg-circuit text-white font-mono text-xs font-bold">
                      {exp.versionTag}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-ink dark:text-concrete mt-2">
                    {exp.role} <span className="text-circuit dark:text-hazard">@ {exp.company}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-4 font-mono text-xs text-rebar">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{exp.period}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{exp.location}</span>
                  </div>
                </div>
              </div>

              {/* Concrete Outcome Bullets */}
              <ul className="space-y-2.5 font-sans text-sm text-ink/90 dark:text-concrete/90">
                {exp.highlights.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-signal shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}
