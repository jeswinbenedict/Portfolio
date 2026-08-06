"use client";

import React, { useState, useEffect } from "react";
import { PORTFOLIO_DATA } from "@/content/data";
import { Search, X, Terminal, ArrowRight, ExternalLink } from "lucide-react";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const navItems = [
    { type: "SECTION", title: "Hero & Build Yard Canvas", href: "#hero" },
    { type: "SECTION", title: "Shipped Projects", href: "#projects" },
    { type: "SECTION", title: "Hardware Spec Sheet & About", href: "#about" },
    { type: "SECTION", title: "Build Log (Experience Timeline)", href: "#experience" },
    { type: "SECTION", title: "Manifest (Stack package.json)", href: "#stack" },
    { type: "SECTION", title: "Contact & Dispatch", href: "#contact" },
    ...PORTFOLIO_DATA.projects.map((p) => ({
      type: "PROJECT",
      title: `${p.name} (${p.version})`,
      subtitle: p.tagline,
      href: `#project-${p.id}`,
    })),
    ...PORTFOLIO_DATA.contact.socials.map((s) => ({
      type: "EXTERNAL",
      title: `Social: ${s.name}`,
      subtitle: s.handle,
      href: s.url,
      isExternal: true,
    })),
  ];

  const filtered = navItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (href: string, isExternal?: boolean) => {
    setIsOpen(false);
    if (isExternal) {
      window.open(href, "_blank");
    } else {
      window.location.href = href;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-ink/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-concrete dark:bg-ink border-4 border-ink dark:border-concrete shadow-hard-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        
        {/* Command Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-hazard text-ink border-b-4 border-ink font-mono font-bold text-sm">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 stroke-[2.5]" />
            <span>COMMAND_PALETTE // SEARCH SYSTEM</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-ink hover:text-hazard transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b-3 border-ink dark:border-concrete bg-white dark:bg-black/40">
          <Search className="w-5 h-5 text-rebar stroke-[2.5]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a section name, project, or command..."
            autoFocus
            className="w-full bg-transparent font-mono text-sm text-ink dark:text-concrete placeholder-rebar focus:outline-none"
          />
          <kbd className="px-2 py-0.5 bg-concrete dark:bg-ink border border-ink dark:border-concrete font-mono text-xs text-rebar">
            ESC
          </kbd>
        </div>

        {/* List Items */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-ink/10 dark:divide-concrete/10">
          {filtered.length === 0 ? (
            <div className="p-6 text-center font-mono text-xs text-rebar uppercase">
              NO MATCHING COMMANDS FOUND IN MANIFEST
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(item.href, item.isExternal)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-hazard hover:text-ink text-left font-mono transition-colors group cursor-pointer"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 text-[10px] bg-ink text-hazard group-hover:bg-ink group-hover:text-hazard font-extrabold border border-ink">
                      {item.type}
                    </span>
                    <span className="font-bold text-xs">{item.title}</span>
                  </div>
                  {item.subtitle && (
                    <span className="text-[11px] text-rebar group-hover:text-ink/80 mt-0.5">
                      {item.subtitle}
                    </span>
                  )}
                </div>
                {item.isExternal ? (
                  <ExternalLink className="w-4 h-4 stroke-[2]" />
                ) : (
                  <ArrowRight className="w-4 h-4 stroke-[2] opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-concrete dark:bg-ink border-t-3 border-ink dark:border-concrete font-mono text-[11px] text-rebar flex justify-between">
          <span>PRESS [ENTER] TO EXECUTE JUMP</span>
          <span>SYSTEM READY</span>
        </div>

      </div>
    </div>
  );
}
