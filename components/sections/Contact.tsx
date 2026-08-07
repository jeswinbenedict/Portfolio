"use client";

import React, { useState } from "react";
import { PORTFOLIO_DATA } from "@/content/portfolioData";
import { Mail, Send, Check, Copy, MapPin } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/icons/SocialIcons";

export default function ContactSection() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PORTFOLIO_DATA.profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="py-12 space-y-8">
      
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b-3 border-neo-black dark:border-neo-mint pb-4">
        <div className="p-2 bg-neo-yellow text-neo-black border-2 border-neo-black shadow-neo-sm rounded-lg">
          <Mail className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-neo-black dark:text-white">
            GET IN TOUCH
          </h2>
        </div>
      </div>

      {/* Main Contact Card */}
      <div className="bg-white dark:bg-[#2a2a2a] border-3 border-neo-black dark:border-white shadow-neo-lg rounded-xl p-6 sm:p-8 space-y-8">
        
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neo-yellow text-neo-black font-mono text-xs font-bold border-2 border-neo-black rounded-md shadow-neo-sm">
            <Send className="w-4 h-4" />
            <span>LET&apos;S BUILD SOMETHING AMAZING TOGETHER</span>
          </div>

          <h3 className="font-display font-black text-3xl sm:text-4xl uppercase text-neo-black dark:text-white leading-tight">
            SAY HELLO OR START A CONVERSATION
          </h3>

          <p className="text-base font-sans font-medium text-neo-black/85 dark:text-gray-200 leading-relaxed">
            Have a web/mobile app project, Spring Boot microservices question, IoT cybersecurity advisory, or just want to connect? Drop an email or connect on LinkedIn and GitHub.
          </p>
        </div>

        {/* Action Bar: Email & Copy */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${PORTFOLIO_DATA.profile.email}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-6 py-4 bg-neo-yellow text-neo-black font-display font-extrabold text-lg sm:text-xl border-3 border-neo-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all rounded-xl cursor-pointer"
          >
            <Mail className="w-6 h-6 stroke-[2.5]" />
            <span>{PORTFOLIO_DATA.profile.email}</span>
          </a>

          <button
            onClick={handleCopyEmail}
            className="flex items-center justify-center gap-2 px-4 py-4 bg-neo-cyan text-neo-black font-mono text-sm font-bold border-3 border-neo-black shadow-neo hover:bg-neo-mint transition-all rounded-xl cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>COPY EMAIL</span>
              </>
            )}
          </button>
        </div>

        {/* Social Cards Grid */}
        <div className="space-y-3 pt-4 border-t-2 border-neo-black/10 dark:border-white/10">
          <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
            NETWORK & SOCIAL CHANNELS:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "LinkedIn", handle: "jeswin-karunya-benedict", url: PORTFOLIO_DATA.profile.linkedin, icon: LinkedInIcon, color: "bg-neo-cyan" },
              { label: "GitHub", handle: "@jeswinbenedict", url: PORTFOLIO_DATA.profile.github, icon: GitHubIcon, color: "bg-neo-yellow" },
            ].map((soc, idx) => {
              const IconComp = soc.icon;
              return (
                <a
                  key={idx}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black border-2 border-neo-black dark:border-white shadow-neo-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all rounded-xl font-mono group"
                >
                  <div>
                    <div className="font-extrabold text-sm text-neo-black dark:text-white">{soc.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-sans">{soc.handle}</div>
                  </div>
                  <IconComp className="w-5 h-5 text-neo-black dark:text-white group-hover:text-blue-600 transition-colors" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Location Badge */}
        <div className="p-4 bg-neo-mint/30 border-2 border-neo-black dark:border-white rounded-xl flex items-center justify-between font-mono text-xs text-neo-black dark:text-gray-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="font-bold">LOCATION: CHENNAI, TAMIL NADU, INDIA</span>
          </div>
          <span className="hidden sm:inline">STUDENT AT VIT-AP UNIVERSITY (AMARAVATI, AP)</span>
        </div>

      </div>

    </section>
  );
}
