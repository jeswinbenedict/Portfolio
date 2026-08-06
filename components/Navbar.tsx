"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { PORTFOLIO_DATA } from "@/content/data";
import { Sun, Moon, Command, Terminal, Cpu } from "lucide-react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openCmdK = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-concrete/95 dark:bg-ink/95 backdrop-blur border-b-3 border-ink dark:border-concrete transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Live Ticker */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="flex items-center gap-2 px-3 py-1.5 bg-hazard text-ink font-display font-extrabold text-lg tracking-tight border-2 border-ink shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              <Cpu className="w-5 h-5 stroke-[2.5]" />
              <span>THE BUILD YARD</span>
            </a>

            {/* Ticker - Desktop */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-ink/5 dark:bg-concrete/10 border-2 border-ink dark:border-concrete font-mono text-xs text-ink dark:text-concrete">
              <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
              <span className="text-rebar font-bold">NOW BUILDING:</span>
              <span className="font-bold text-circuit dark:text-hazard">
                {PORTFOLIO_DATA.hero.nowBuilding.commit}
              </span>
              <span className="hidden xl:inline text-rebar">
                ({PORTFOLIO_DATA.hero.nowBuilding.message})
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs font-bold">
            {[
              { label: "// PROJECTS", href: "#projects" },
              { label: "// ABOUT", href: "#about" },
              { label: "// BUILD_LOG", href: "#experience" },
              { label: "// MANIFEST", href: "#stack" },
              { label: "// CONTACT", href: "#contact" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-ink dark:text-concrete hover:bg-hazard hover:text-ink border border-transparent hover:border-ink transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Command Palette Button */}
            <button
              onClick={openCmdK}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-card-bg text-ink dark:text-concrete font-mono text-xs border-2 border-ink dark:border-concrete shadow-hard-sm hover:bg-circuit hover:text-white dark:hover:bg-circuit transition-all cursor-pointer"
              title="Command Palette (Cmd+K)"
            >
              <Command className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-bold">CMD+K</span>
            </button>

            {/* Dark / Light Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle Theme"
                className="p-1.5 bg-hazard text-ink border-2 border-ink shadow-hard-sm hover:bg-circuit hover:text-white transition-all cursor-pointer"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Moon className="w-4 h-4 stroke-[2.5]" />
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
