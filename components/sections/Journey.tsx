"use client";

import React, { useState } from "react";
import { PORTFOLIO_DATA } from "@/content/portfolioData";
import { Briefcase, MapPin, CheckCircle, Navigation, Compass } from "lucide-react";

export default function JourneySection() {
  const [viewMode, setViewMode] = useState<"timeline" | "map">("timeline");
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");

  const countries = [
    { code: "ALL", label: "All Locations" },
    { code: "India", label: "India" },
  ];

  const filteredItems = selectedCountry === "ALL"
    ? PORTFOLIO_DATA.journey
    : PORTFOLIO_DATA.journey.filter((item) => item.country === selectedCountry);

  return (
    <section id="experience" className="py-12 space-y-8">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-3 border-neo-black dark:border-neo-mint pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neo-yellow text-neo-black border-2 border-neo-black shadow-neo-sm rounded-lg">
            <Briefcase className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-neo-black dark:text-white">
              MY JOURNEY (EXPERIENCE TIMELINE)
            </h2>
          </div>
        </div>

        {/* View Switcher & Country Filters */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold">
          
          {/* Timeline / Map Flip Toggle */}
          <button
            onClick={() => setViewMode(viewMode === "timeline" ? "map" : "timeline")}
            className="px-3.5 py-1.5 bg-neo-pink text-neo-black border-2 border-neo-black shadow-neo-sm hover:bg-neo-yellow transition-all rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>{viewMode === "timeline" ? "Flip to Treasure Map" : "Flip to Timeline"}</span>
          </button>

          {/* Location Filter Tabs */}
          {countries.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCountry(c.code)}
              className={`px-3 py-1.5 rounded-lg border-2 transition-all cursor-pointer ${
                selectedCountry === c.code
                  ? "bg-neo-yellow text-neo-black border-neo-black shadow-neo-sm font-extrabold"
                  : "bg-white dark:bg-[#2a2a2a] text-neo-black dark:text-white border-neo-black dark:border-white hover:bg-neo-cyan hover:text-neo-black"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER VIEW: Timeline OR Map Flip Card */}
      {viewMode === "timeline" ? (
        
        /* Timeline View */
        <div className="relative pl-6 md:pl-8 border-l-4 border-neo-black dark:border-neo-mint space-y-8">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative group">
              
              {/* Timeline Marker Badge */}
              <div className="absolute -left-[35px] md:-left-[43px] top-2 flex items-center justify-center w-9 h-9 bg-neo-yellow text-neo-black border-3 border-neo-black rounded-full font-mono text-xs font-extrabold shadow-neo-sm">
                <span>{item.flag}</span>
              </div>

              {/* Journey Card */}
              <div className="bg-white dark:bg-[#2a2a2a] border-3 border-neo-black dark:border-white shadow-neo-lg rounded-xl p-6 space-y-4 hover:translate-x-[-2px] transition-transform">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b-2 border-neo-black/10 dark:border-white/10 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-neo-yellow text-neo-black font-mono text-xs font-bold border border-neo-black rounded-md">
                        {item.period}
                      </span>
                      <span className="px-2.5 py-0.5 bg-neo-cyan text-neo-black font-mono text-xs font-bold border border-neo-black rounded-md">
                        {item.country}
                      </span>
                    </div>

                    <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-neo-black dark:text-white mt-2">
                      {item.role} <span className="text-blue-600 dark:text-neo-yellow">@ {item.company}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs text-gray-600 dark:text-gray-300 bg-neo-mint/30 px-3 py-1.5 border border-neo-black rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>{item.location}</span>
                  </div>
                </div>

                <p className="text-sm font-sans font-medium text-neo-black/85 dark:text-gray-200 leading-relaxed">
                  {item.description}
                </p>

                <ul className="space-y-2 font-sans text-xs sm:text-sm text-neo-black/90 dark:text-gray-200">
                  {item.highlights.map((h, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {item.technologies.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-0.5 bg-gray-100 dark:bg-black border border-neo-black dark:border-white font-mono text-xs font-bold text-neo-black dark:text-white rounded-md"
                    >
                      #{tech}
                    </span>
                  ))}
                </div>

              </div>

            </div>
          ))}
        </div>

      ) : (

        /* Map View: Interactive Treasure Map View */
        <div className="p-6 bg-neo-cyan/20 border-4 border-neo-black dark:border-white shadow-neo-lg rounded-2xl space-y-6">
          <div className="flex items-center justify-between font-mono text-xs font-bold text-neo-black dark:text-white border-b-2 border-neo-black pb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-base uppercase font-display font-black">INTERACTIVE CAREER TREASURE MAP</span>
            </div>
            <span>CAREER & ACADEMIC COORDINATES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PORTFOLIO_DATA.journey.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#2a2a2a] border-3 border-neo-black dark:border-white shadow-neo rounded-xl p-5 space-y-4 hover:translate-y-[-2px] transition-transform"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs px-2 py-1 bg-neo-cyan text-neo-black border border-neo-black rounded">{item.flag}</span>
                  <span className="px-2.5 py-0.5 bg-neo-yellow text-neo-black font-mono text-xs font-bold border border-neo-black rounded">
                    {item.country}
                  </span>
                </div>

                <div>
                  <h4 className="font-display font-black text-lg uppercase text-neo-black dark:text-white">
                    {item.company}
                  </h4>
                  <p className="font-mono text-xs font-bold text-blue-600 dark:text-neo-yellow">
                    {item.role}
                  </p>
                </div>

                <div className="p-2.5 bg-gray-100 dark:bg-black border border-neo-black rounded-lg font-mono text-[11px] space-y-1">
                  <div className="text-gray-500">PERIOD: {item.period}</div>
                  <div className="text-gray-500">LOCATION: {item.location}</div>
                  <div className="text-neo-black dark:text-neo-mint font-bold">
                    COORDINATES: [{item.coords.join(", ")}]
                  </div>
                </div>

                <p className="text-xs font-sans text-neo-black/80 dark:text-gray-300 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      )}

    </section>
  );
}
