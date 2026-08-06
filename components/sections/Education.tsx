import React from "react";
import { PORTFOLIO_DATA } from "@/content/data";
import { GraduationCap, Award, CheckSquare } from "lucide-react";

export default function EducationSection() {
  return (
    <section id="education" className="py-8 space-y-6">
      
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b-4 border-ink dark:border-concrete pb-4">
        <div className="p-2 bg-hazard text-ink border-2 border-ink shadow-hard-sm">
          <GraduationCap className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <span className="font-mono text-xs text-rebar uppercase tracking-widest">// SECTION 06</span>
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase text-ink dark:text-concrete">
            EDUCATION & CERTIFICATIONS
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PORTFOLIO_DATA.education.map((edu, idx) => (
          <div
            key={idx}
            className="p-6 bg-card-bg border-4 border-ink dark:border-concrete shadow-hard space-y-4"
          >
            <div className="flex items-center justify-between border-b-2 border-ink/10 dark:border-concrete/10 pb-2">
              <span className="font-mono text-xs font-bold text-circuit dark:text-hazard">
                {edu.period}
              </span>
              <span className="px-2 py-0.5 bg-hazard text-ink font-mono text-[10px] font-extrabold border border-ink">
                DEGREE_VERIFIED
              </span>
            </div>

            <div>
              <h3 className="font-display font-extrabold text-xl uppercase text-ink dark:text-concrete">
                {edu.degree}
              </h3>
              <p className="font-mono text-xs text-rebar uppercase mt-0.5">
                {edu.institution}
              </p>
            </div>

            <p className="text-xs font-sans text-ink/80 dark:text-concrete/80">
              {edu.details}
            </p>

            {/* Certifications List */}
            {edu.certifications && (
              <div className="pt-3 border-t-2 border-ink/10 dark:border-concrete/10 space-y-2">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-ink dark:text-concrete">
                  <Award className="w-4 h-4 text-signal stroke-[2.5]" />
                  <span>CREDENTIALS & CERTIFICATIONS:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {edu.certifications.map((cert, cIdx) => (
                    <span
                      key={cIdx}
                      className="flex items-center gap-1 px-2.5 py-1 bg-concrete dark:bg-ink border border-ink dark:border-concrete font-mono text-xs font-bold text-ink dark:text-concrete"
                    >
                      <CheckSquare className="w-3 h-3 text-circuit" />
                      <span>{cert}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        ))}
      </div>

    </section>
  );
}
