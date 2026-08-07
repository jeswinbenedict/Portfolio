"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import avatarImg from "@/public/jeswin-avatar.jpg";
import { PORTFOLIO_DATA } from "@/content/portfolioData";
import { Mail } from "lucide-react";
import {
  siReact,
  siPython,
  siTypescript,
  siDocker,
  siSpringboot,
  siKubernetes,
  siNodedotjs,
  siFlutter,
  siDart,
  siKotlin,
} from "simple-icons";

function MatrixText({ text, delay = 500 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  useEffect(() => {
    let iterations = 0;
    let intervalId: ReturnType<typeof setInterval>;

    const timer = setTimeout(() => {
      intervalId = setInterval(() => {
        setDisplayText(
          text
            .split("")
            .map((char, index) => {
              if (index < iterations) return text[index];
              if (char === " ") return char;
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );

        if (iterations >= text.length) {
          clearInterval(intervalId);
        }
        iterations += 1 / 3;
      }, 50);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, delay, chars]);

  return <>{displayText}</>;
}

export default function HeroSection() {
  const photoRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const [photoTilted, setPhotoTilted] = useState(false);
  const [terminalFallen, setTerminalFallen] = useState(false);
  const [fallDistance, setFallDistance] = useState(0);

  const calculateFallDistance = useCallback(() => {
    if (!heroContentRef.current || !terminalRef.current) return;
    const heroRect = heroContentRef.current.getBoundingClientRect();
    const terminalRect = terminalRef.current.getBoundingClientRect();
    const distance = Math.max(0, heroRect.bottom - terminalRect.bottom - 50);
    setFallDistance(distance);
  }, []);

  useEffect(() => {
    calculateFallDistance();
    window.addEventListener("resize", calculateFallDistance);

    const handleScroll = () => {
      if (window.scrollY > 5) {
        if (!photoTilted) setPhotoTilted(true);
        if (!terminalFallen) setTerminalFallen(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", calculateFallDistance);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [photoTilted, terminalFallen, calculateFallDistance]);

  return (
    <section id="hero" className="pt-12 pb-8 md:pt-20 md:pb-12 space-y-12">
      
      {/* Main Grid: Left Copy & CTAs, Right Illustrated Avatar Frame */}
      <div ref={heroContentRef} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Text & Action CTAs */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="space-y-3">
            {/* Greeting with Matrix Typing Effect */}
            <p className="font-sans text-3xl sm:text-4xl text-[#36c3e8] dark:text-neo-cyan font-bold tracking-tight font-mono">
              <MatrixText text={PORTFOLIO_DATA.profile.greeting} delay={800} />
            </p>

            {/* Main Headline */}
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-neo-black dark:text-white tracking-tight leading-[1.05]">
              I&apos;m {PORTFOLIO_DATA.profile.name}.
            </h1>
          </div>

          {/* Tagline & Short Description */}
          <div className="space-y-2">
            <p className="font-mono text-sm font-bold text-blue-600 dark:text-neo-yellow">
              {PORTFOLIO_DATA.profile.title} | {PORTFOLIO_DATA.profile.subtitle}
            </p>
            <p className="text-base sm:text-lg font-sans text-neo-black/85 dark:text-gray-200 leading-relaxed font-medium max-w-2xl">
              {PORTFOLIO_DATA.profile.shortDescription}
            </p>
          </div>

          {/* Social Icons Row: Official GitHub Octocat & LinkedIn 'in' Icons */}
          <div className="flex items-center gap-3 pt-1">
            {/* Official GitHub Icon */}
            <a
              href={PORTFOLIO_DATA.profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white dark:bg-[#2a2a2a] text-neo-black dark:text-white border-3 border-neo-black dark:border-white shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg hover:bg-neo-yellow transition-all rounded-xl cursor-pointer"
              title="GitHub Profile"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>

            {/* Official LinkedIn Icon */}
            <a
              href={PORTFOLIO_DATA.profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white dark:bg-[#2a2a2a] text-neo-black dark:text-white border-3 border-neo-black dark:border-white shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg hover:bg-neo-cyan transition-all rounded-xl cursor-pointer"
              title="LinkedIn Profile"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
              </svg>
            </a>

            {/* Mail Button */}
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${PORTFOLIO_DATA.profile.email}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white dark:bg-[#2a2a2a] text-neo-black dark:text-white border-3 border-neo-black dark:border-white shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg hover:bg-neo-mint transition-all rounded-xl cursor-pointer"
              title={`Send Email to ${PORTFOLIO_DATA.profile.email}`}
            >
              <Mail className="w-5 h-5 stroke-[2.5]" />
            </a>
          </div>

          {/* Action Row: Get in Touch Button */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <a
              href="#contact"
              className="px-8 py-4 bg-[#66d9ef] text-neo-black font-display font-extrabold text-base border-3 border-neo-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all rounded-xl cursor-pointer"
            >
              Get in Touch!
            </a>

            <a
              href={PORTFOLIO_DATA.profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#ffd93d] text-neo-black font-display font-extrabold text-base border-3 border-neo-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all rounded-xl cursor-pointer"
            >
              View Projects
            </a>
          </div>

        </div>

        {/* Right Column: Illustrated Avatar Photo & Floating Retro SVGs */}
        <div className="lg:col-span-5 flex justify-center pt-12 pb-6 px-8 sm:px-12">
          <div className="relative w-full max-w-[380px]">
            
            {/* Washi Tape Sticker at Top Right */}
            <div className="absolute -top-4 right-10 w-24 h-9 bg-[#ffd93d]/90 border border-black/20 rounded-xs transform rotate-[15deg] z-40 shadow-sm">
              <div className="absolute top-[30%] left-[10%] right-[10%] h-[1px] bg-black/10" />
              <div className="absolute top-[50%] left-[10%] right-[10%] h-[1px] bg-black/10" />
            </div>

            {/* Top-Left Floating Code SVG Icon */}
            <div className="absolute -top-8 -left-10 z-30 transform -rotate-6 animate-[floatSlow_4s_ease-in-out_infinite]">
              <svg width="80" height="80" viewBox="0 0 100 100" fill="none" className="drop-shadow-[5px_5px_0_#000]">
                <rect x="6" y="6" width="88" height="88" rx="8" fill="#66d9ef" stroke="#000" strokeWidth="4"/>
                <rect x="3" y="3" width="88" height="88" rx="8" fill="#66d9ef" stroke="#000" strokeWidth="4"/>
                <path d="M35 40 L20 50 L35 60" stroke="#000" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M65 40 L80 50 L65 60" stroke="#000" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="55" y1="35" x2="45" y2="65" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Bottom-Left Floating Floppy Disk SVG Icon */}
            <div className="absolute -bottom-6 -left-12 z-30 transform -rotate-12 animate-[popOut_3.5s_ease-in-out_infinite]">
              <svg width="80" height="80" viewBox="0 0 100 100" fill="none" className="drop-shadow-[5px_5px_0_#000]">
                <rect x="6" y="6" width="88" height="88" rx="8" fill="#a8e6cf" stroke="#000" strokeWidth="4"/>
                <rect x="3" y="3" width="88" height="88" rx="8" fill="#a8e6cf" stroke="#000" strokeWidth="4"/>
                <rect x="20" y="20" width="60" height="60" rx="3" fill="#ffd93d" stroke="#000" strokeWidth="4"/>
                <rect x="30" y="20" width="40" height="20" fill="#66d9ef" stroke="#000" strokeWidth="3"/>
                <rect x="35" y="55" width="30" height="15" rx="2" fill="#000"/>
                <circle cx="50" cy="35" r="3" fill="#000"/>
              </svg>
            </div>

            {/* Top-Right Floating Terminal SVG Icon — Falls on scroll */}
            <div
              ref={terminalRef}
              className={`absolute top-[18%] -right-10 z-30 ${
                terminalFallen ? "hero-terminal-falling" : "animate-[bounceGentle_2.8s_ease-in-out_infinite]"
              }`}
              style={{ "--fall-distance": `${fallDistance}px` } as React.CSSProperties}
            >
              <svg width="80" height="80" viewBox="0 0 100 100" fill="none" className="drop-shadow-[5px_5px_0_#000]">
                <rect x="6" y="6" width="88" height="88" rx="8" fill="#ffd93d" stroke="#000" strokeWidth="4"/>
                <rect x="3" y="3" width="88" height="88" rx="8" fill="#ffd93d" stroke="#000" strokeWidth="4"/>
                <path d="M25 35 L40 50 L25 65" stroke="#000" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="50" y1="65" x2="75" y2="65" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Main Avatar Card Photo Container */}
            <div
              ref={photoRef}
              className={`relative w-full aspect-square bg-[#a8e6cf] border-4 border-neo-black shadow-neo-lg rounded-3xl overflow-hidden transition-transform duration-300 origin-top-right ${
                photoTilted ? "rotate-[-3deg]" : "rotate-0"
              }`}
              onMouseEnter={() => {
                if (photoRef.current) {
                  photoRef.current.classList.remove("rotate-[-3deg]");
                  photoRef.current.classList.add("rotate-0");
                }
              }}
              onMouseLeave={() => {
                if (photoTilted && photoRef.current) {
                  photoRef.current.classList.remove("rotate-0");
                  photoRef.current.classList.add("rotate-[-3deg]");
                }
              }}
            >
              <Image
                src={avatarImg}
                alt="Jeswin Karunya Benedict - Full Stack Developer"
                fill
                sizes="(max-width: 768px) 100vw, 380px"
                className="object-cover object-center"
                priority
              />
            </div>

            {/* Full Stack Developer Overlapping Corner Sticker */}
            <div className="absolute -bottom-4 -right-6 z-30 px-5 py-2.5 bg-[#a8e6cf] text-neo-black font-display font-extrabold text-base border-3 border-neo-black shadow-neo rounded-xl">
              Full Stack Developer
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Tech Stack Pill Strip */}
      <div className="pt-6 border-t-2 border-neo-black/10 dark:border-white/10 space-y-3">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
          {[
            { name: "Flutter", icon: siFlutter },
            { name: "Dart", icon: siDart },
            { name: "Kotlin", icon: siKotlin },
            { name: "Spring Boot", icon: siSpringboot },
            { name: "React", icon: siReact },
            { name: "TypeScript", icon: siTypescript },
            { name: "Python", icon: siPython },
            { name: "Node.js", icon: siNodedotjs },
            { name: "Docker", icon: siDocker },
            { name: "Kubernetes", icon: siKubernetes },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#2a2a2a] text-neo-black dark:text-white border-2 border-neo-black dark:border-white shadow-neo rounded-lg font-mono text-xs sm:text-sm font-bold hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform cursor-pointer"
            >
              <svg
                role="img"
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-current text-neo-black dark:text-white shrink-0"
              >
                <path d={item.icon.path} />
              </svg>
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
