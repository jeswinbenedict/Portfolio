"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Send } from "lucide-react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(100, Math.max(0, (currentScrollY / (totalHeight || 1)) * 100));
      setScrollProgress(progress);

      // Smart navbar hide / show
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHidden(true);
      } else if (currentScrollY < lastScrollY.current) {
        setIsHidden(false);
      }
      lastScrollY.current = currentScrollY;

      // Active section calculation
      const sections = ["hero", "about", "experience", "skills", "contact"];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 220 && rect.bottom >= 220) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const checkpoints = [
    { id: "hero", label: "Home" },
    { id: "about", label: "About" },
    { id: "experience", label: "Journey" },
    { id: "skills", label: "Skills" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur border-b-3 border-neo-black dark:border-neo-mint transition-transform duration-300 ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* Scroll Progress Bar */}
      <div className="relative w-full h-2.5 bg-gray-200 dark:bg-gray-800 overflow-hidden border-b border-neo-black">
        <div
          className="h-full bg-neo-yellow transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3">
          
          {/* Logo JKB */}
          <a
            href="#hero"
            className="flex items-center justify-center px-3 py-1.5 bg-neo-yellow text-neo-black font-display font-black text-xl tracking-tight border-3 border-neo-black shadow-neo-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all rounded-lg"
          >
            <span>JKB</span>
          </a>

          {/* Checkpoint Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1 font-display font-bold text-sm">
            {checkpoints.map((cp) => (
              <a
                key={cp.id}
                href={`#${cp.id}`}
                className={`px-3 py-1.5 rounded-lg border-2 transition-all ${
                  activeSection === cp.id
                    ? "bg-neo-yellow text-neo-black border-neo-black shadow-neo-sm font-extrabold"
                    : "border-transparent text-neo-black dark:text-white hover:border-neo-black dark:hover:border-neo-mint"
                }`}
              >
                {cp.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            {/* Get in Touch CTA */}
            <a
              href="#contact"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neo-yellow text-neo-black font-display font-extrabold text-xs sm:text-sm border-2 border-neo-black shadow-neo-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all rounded-lg"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Get in Touch!</span>
            </a>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle Theme"
                className="p-2 bg-white dark:bg-[#2a2a2a] text-neo-black dark:text-white border-2 border-neo-black dark:border-neo-mint shadow-neo-sm hover:bg-neo-yellow hover:text-neo-black transition-all rounded-lg cursor-pointer"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-neo-yellow" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
