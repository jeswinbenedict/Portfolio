"use client";

import React from "react";
import { User, Cpu, ShieldCheck, Code2 } from "lucide-react";
import ScrollHighlight from "@/components/ScrollHighlight";

export default function AboutSection() {
  return (
    <section id="about" className="py-12 space-y-8">
      
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b-3 border-neo-black dark:border-neo-mint pb-4">
        <div className="p-2 bg-neo-yellow text-neo-black border-2 border-neo-black shadow-neo-sm rounded-lg">
          <User className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-neo-black dark:text-white">
            ABOUT JESWIN KARUNYA BENEDICT
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Bio Card with Scroll-Animated Marker Highlights */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="relative p-6 sm:p-8 bg-white dark:bg-[#2a2a2a] border-3 border-neo-black dark:border-white shadow-neo-lg rounded-xl space-y-5">
            
            {/* Sticky Note Badge */}
            <div className="absolute -top-4 right-6 px-3 py-1 bg-neo-pink text-neo-black font-mono text-sm font-extrabold border-2 border-neo-black transform rotate-2 shadow-neo-sm">
              Full Stack & Cloud
            </div>

            <h3 className="font-display font-extrabold text-2xl uppercase text-neo-black dark:text-white">
              PERSONAL & PROFESSIONAL BACKGROUND
            </h3>

            <p className="text-base sm:text-lg font-sans text-neo-black/90 dark:text-gray-200 leading-relaxed font-medium">
              I am a <ScrollHighlight color="yellow">Full Stack Developer</ScrollHighlight> and <ScrollHighlight color="cyan" direction="right">Web & Mobile App Builder</ScrollHighlight> driven by a passion for building applications to solve real-world problems. Based in <ScrollHighlight color="mint">Chennai, Tamil Nadu</ScrollHighlight>, my expertise spans across Java, Spring Boot, React, TypeScript, Python, REST APIs, JPA, Hibernate, and Android XML.
            </p>

            <p className="text-base sm:text-lg font-sans text-neo-black/90 dark:text-gray-200 leading-relaxed font-medium">
              Beyond core software engineering, I specialize in <ScrollHighlight color="pink">Hybrid ML/DL IoT Cybersecurity Pipelines</ScrollHighlight> and distributed <ScrollHighlight color="yellow" direction="right">WSN-IoT Routing Protocols</ScrollHighlight>. My work blends robust backend microservices with responsive user interfaces and cloud deployment on Docker, Kubernetes, AWS, and Google Cloud.
            </p>

            <p className="text-base sm:text-lg font-sans text-neo-black/90 dark:text-gray-200 leading-relaxed font-medium">
              Academic student at <ScrollHighlight color="mint">VIT-AP University (Amaravati, Andhra Pradesh)</ScrollHighlight> and core member at <ScrollHighlight color="cyan" direction="right">Semmozhi Tamil Mandram</ScrollHighlight>, a cultural and literary club dedicated to promoting Tamil language, arts, and heritage.
            </p>

            <div className="pt-4 border-t-2 border-neo-black/10 dark:border-white/10 flex flex-wrap items-center justify-between font-mono text-xs text-gray-500 dark:text-gray-400">
              <span>SPECIALIZED IN WEB, MOBILE & IOT CYBERSECURITY</span>
              <span>CHENNAI, TAMIL NADU, INDIA</span>
            </div>
          </div>

        </div>

        {/* Right Column: Highlights & Core Domains */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="p-5 bg-neo-yellow/30 border-3 border-neo-black dark:border-white shadow-neo rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-display font-bold text-base text-neo-black dark:text-white">
              <Code2 className="w-5 h-5 text-amber-700" />
              <span>WEB & MOBILE APP BUILDER</span>
            </div>
            <p className="text-xs font-sans text-neo-black/80 dark:text-gray-300 leading-relaxed font-medium">
              Spring Boot microservices, REST APIs, JPA/Hibernate persistence, React web frontends, and native Android XML interfaces.
            </p>
          </div>

          <div className="p-5 bg-neo-cyan/30 border-3 border-neo-black dark:border-white shadow-neo rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-display font-bold text-base text-neo-black dark:text-white">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
              <span>HYBRID ML/DL IOT CYBERSECURITY</span>
            </div>
            <p className="text-xs font-sans text-neo-black/80 dark:text-gray-300 leading-relaxed font-medium">
              Machine learning and deep learning anomaly detection pipelines for Wireless Sensor Networks & IoT device traffic.
            </p>
          </div>

          <div className="p-5 bg-neo-mint/30 border-3 border-neo-black dark:border-white shadow-neo rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-display font-bold text-base text-neo-black dark:text-white">
              <Cpu className="w-5 h-5 text-emerald-700" />
              <span>SEMMOZHI TAMIL MANDRAM</span>
            </div>
            <p className="text-xs font-sans text-neo-black/80 dark:text-gray-300 leading-relaxed font-medium">
              Core member &amp; coordinator at VIT-AP University&apos;s cultural and literary club, organizing Tamil heritage events, literary discussions, and community outreach.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}
