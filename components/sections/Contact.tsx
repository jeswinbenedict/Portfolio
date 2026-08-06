"use client";

import React, { useState } from "react";
import { PORTFOLIO_DATA } from "@/content/data";
import { Mail, Send, ExternalLink, Key, Copy, Check } from "lucide-react";

export default function ContactSection() {
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyPGP = () => {
    navigator.clipboard.writeText(PORTFOLIO_DATA.contact.pgpFingerprint);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <section id="contact" className="py-12 space-y-8">
      
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b-4 border-ink dark:border-concrete pb-4">
        <div className="p-2 bg-hazard text-ink border-2 border-ink shadow-hard-sm">
          <Mail className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <span className="font-mono text-xs text-rebar uppercase tracking-widest">// SECTION 07</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-ink dark:text-concrete">
            DISPATCH & CONTACT
          </h2>
        </div>
      </div>

      {/* Main Contact Crate */}
      <div className="bg-card-bg border-4 border-ink dark:border-concrete shadow-hard-lg p-6 sm:p-8 space-y-8">
        
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-hazard text-ink font-mono text-xs font-bold border-2 border-ink shadow-hard-sm">
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>DIRECT CHANNEL OPEN</span>
          </div>

          <h3 className="font-display font-black text-3xl sm:text-4xl uppercase text-ink dark:text-concrete leading-tight">
            NO CORPORATE FORMS. <br />
            JUST DIRECT DISPATCH.
          </h3>

          <p className="text-base font-sans text-ink/80 dark:text-concrete/80 leading-relaxed">
            Have a project, role, system advisory, or engineering inquiry? Reach out directly via mail or find my work across the dev network.
          </p>
        </div>

        {/* Direct Stamped Mail Button */}
        <div>
          <a
            href={`mailto:${PORTFOLIO_DATA.contact.email}`}
            className="inline-flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 bg-hazard text-ink font-mono font-extrabold border-4 border-ink shadow-hard hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-hard-sm transition-all group cursor-pointer"
          >
            <div className="p-3 bg-ink text-hazard border-2 border-ink group-hover:bg-circuit group-hover:text-white transition-colors">
              <Mail className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs uppercase text-ink/70">DISPATCH DIRECT EMAIL:</div>
              <div className="text-xl sm:text-2xl font-black tracking-tight underline decoration-3 underline-offset-4">
                {PORTFOLIO_DATA.contact.email}
              </div>
            </div>
          </a>
        </div>

        {/* Social Reticle Grid */}
        <div className="space-y-4 pt-4 border-t-3 border-ink/10 dark:border-concrete/10">
          <span className="font-mono text-xs font-bold text-rebar uppercase">
            // SOCIAL & CODE NETWORK:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PORTFOLIO_DATA.contact.socials.map((soc, idx) => (
              <a
                key={idx}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-concrete dark:bg-ink border-3 border-ink dark:border-concrete shadow-hard-sm hover:bg-circuit hover:text-white transition-all font-mono group"
              >
                <div>
                  <div className="font-extrabold text-xs">{soc.name}</div>
                  <div className="text-[11px] text-rebar group-hover:text-white/80">
                    {soc.handle}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 stroke-[2]" />
              </a>
            ))}
          </div>
        </div>

        {/* PGP Key Fingerprint */}
        <div className="p-4 bg-concrete dark:bg-black/50 border-3 border-ink dark:border-concrete space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-ink dark:text-concrete">
              <Key className="w-4 h-4 text-circuit stroke-[2.5]" />
              <span>PGP_FINGERPRINT // PUBLIC KEY</span>
            </div>

            <button
              onClick={handleCopyPGP}
              className="flex items-center gap-1 px-2 py-1 bg-hazard text-ink border border-ink text-[10px] font-bold shadow-hard-sm hover:bg-circuit hover:text-white transition-colors cursor-pointer"
            >
              {copiedKey ? (
                <>
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>COPY KEY</span>
                </>
              )}
            </button>
          </div>

          <div className="p-2.5 bg-white dark:bg-ink border border-ink/20 dark:border-concrete/20 text-rebar text-[11px] select-all break-all">
            {PORTFOLIO_DATA.contact.pgpFingerprint}
          </div>
        </div>

      </div>

    </section>
  );
}
