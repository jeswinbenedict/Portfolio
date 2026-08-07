"use client";

import React from "react";
import { PORTFOLIO_DATA } from "@/content/portfolioData";
import { ArrowUp, FolderGit2 } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/icons/SocialIcons";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-16 bg-white dark:bg-[#1a1a1a] border-t-4 border-neo-black dark:border-neo-mint py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b-2 border-neo-black/10 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-neo-yellow text-neo-black font-display font-black text-xl border-2 border-neo-black shadow-neo-sm rounded-lg">
                JKB
              </span>
              <span className="font-display font-black text-xl uppercase tracking-tight text-neo-black dark:text-white">
                JESWIN KARUNYA BENEDICT
              </span>
            </div>
            <p className="font-mono text-xs text-gray-600 dark:text-gray-400 mt-1">
              Full Stack Developer — Web & Mobile App Builder
            </p>
          </div>

          {/* Quick Footer Links */}
          <div className="flex flex-wrap items-center gap-4 font-mono text-xs font-bold">
            <a href="#hero" className="hover:underline text-neo-black dark:text-gray-200">Home</a>
            <a href="#about" className="hover:underline text-neo-black dark:text-gray-200">About</a>
            <a href="#experience" className="hover:underline text-neo-black dark:text-gray-200">Experience</a>
            <a href="#skills" className="hover:underline text-neo-black dark:text-gray-200">Skills</a>
            <a href="#contact" className="hover:underline text-neo-black dark:text-gray-200">Contact</a>
            <a
              href={PORTFOLIO_DATA.profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-neo-cyan text-neo-black border border-neo-black shadow-neo-sm rounded hover:bg-neo-yellow transition-colors cursor-pointer flex items-center gap-1 font-bold"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Projects</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-gray-600 dark:text-gray-400">
          <div>
            © 2026 Jeswin Karunya Benedict. All rights reserved.
          </div>

          <div className="flex items-center gap-3">
            <a
              href={PORTFOLIO_DATA.profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-100 dark:bg-black border border-neo-black dark:border-white rounded hover:bg-neo-yellow transition-colors"
              title="GitHub"
            >
              <GitHubIcon className="w-4 h-4 text-neo-black dark:text-white" />
            </a>

            <a
              href={PORTFOLIO_DATA.profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-100 dark:bg-black border border-neo-black dark:border-white rounded hover:bg-neo-cyan transition-colors"
              title="LinkedIn"
            >
              <LinkedInIcon className="w-4 h-4 text-neo-black dark:text-white" />
            </a>

            <button
              onClick={scrollToTop}
              className="p-2 bg-neo-yellow text-neo-black border-2 border-neo-black shadow-neo-sm rounded hover:translate-y-[-2px] transition-transform cursor-pointer"
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
