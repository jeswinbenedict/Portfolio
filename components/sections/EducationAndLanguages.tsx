"use client";

import React, { useEffect, useRef, useState } from "react";
import { PORTFOLIO_DATA } from "@/content/portfolioData";
import { GraduationCap, Languages, Star, MapPin } from "lucide-react";

export default function EducationAndLanguagesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [starsVisible, setStarsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const renderStars = (starCount: number, itemIndex: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((starIndex) => {
          const isFilled = starIndex <= starCount;
          const delay = (itemIndex * 3 + starIndex) * 80;

          return (
            <Star
              key={starIndex}
              className={`w-4 h-4 transition-all duration-300 transform ${
                starsVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
              } ${
                isFilled
                  ? "text-neo-yellow fill-neo-yellow stroke-black stroke-[2]"
                  : "text-gray-300 dark:text-gray-600 fill-none stroke-[2]"
              }`}
              style={{ transitionDelay: `${starsVisible ? delay : 0}ms` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <section ref={sectionRef} className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Left Column: Education Card */}
      <div className="lg:col-span-6 space-y-4">
        
        <div className="flex items-center gap-3 border-b-3 border-neo-black dark:border-neo-mint pb-3">
          <div className="p-2 bg-neo-yellow text-neo-black border-2 border-neo-black shadow-neo-sm rounded-lg">
            <GraduationCap className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="font-display font-black text-2xl uppercase text-neo-black dark:text-white">
              EDUCATION
            </h2>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2a2a2a] border-3 border-neo-black dark:border-white shadow-neo-lg rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between border-b-2 border-neo-black/10 dark:border-white/10 pb-2 font-mono text-xs font-bold text-gray-500 dark:text-gray-300">
            <span>{PORTFOLIO_DATA.education.period}</span>
            <span className="px-2 py-0.5 bg-neo-mint text-neo-black border border-neo-black rounded">
              DEGREE VERIFIED
            </span>
          </div>

          <div>
            <h3 className="font-display font-black text-xl uppercase text-neo-black dark:text-white">
              {PORTFOLIO_DATA.education.degree}
            </h3>
            {PORTFOLIO_DATA.education.subtitle && (
              <p className="font-sans text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
                {PORTFOLIO_DATA.education.subtitle}
              </p>
            )}
            <p className="font-mono text-sm font-bold text-blue-600 dark:text-neo-yellow mt-1">
              {PORTFOLIO_DATA.education.institution}
            </p>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs text-gray-600 dark:text-gray-300 pt-1">
            <MapPin className="w-4 h-4 text-red-600" />
            <span>{PORTFOLIO_DATA.education.location}</span>
          </div>
        </div>

      </div>

      {/* Right Column: Languages Cards with Star Ratings */}
      <div className="lg:col-span-6 space-y-4">
        
        <div className="flex items-center gap-3 border-b-3 border-neo-black dark:border-neo-mint pb-3">
          <div className="p-2 bg-neo-cyan text-neo-black border-2 border-neo-black shadow-neo-sm rounded-lg">
            <Languages className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="font-display font-black text-2xl uppercase text-neo-black dark:text-white">
              LANGUAGES PROFICIENCY
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PORTFOLIO_DATA.languages.map((lang, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#2a2a2a] border-3 border-neo-black dark:border-white shadow-neo rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-display font-extrabold text-base text-neo-black dark:text-white">
                  {lang.language}
                </div>
                <div className="font-mono text-xs text-gray-500 dark:text-gray-400">
                  {lang.level}
                </div>
              </div>

              <div>
                {renderStars(lang.stars, idx)}
              </div>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
}
