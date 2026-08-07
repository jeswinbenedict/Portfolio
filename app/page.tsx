import React from "react";
import HeroSection from "@/components/sections/Hero";
import AboutSection from "@/components/sections/About";
import JourneySection from "@/components/sections/Journey";
import SkillsSection from "@/components/sections/Skills";
import EducationAndLanguagesSection from "@/components/sections/EducationAndLanguages";
import ContactSection from "@/components/sections/Contact";
import SectionDivider from "@/components/SectionDivider";
import PaperTear from "@/components/PaperTear";
import ScrollFadeIn from "@/components/ScrollFadeIn";

export default function Home() {
  return (
    <div className="space-y-12">
      <HeroSection />
      
      <PaperTear />

      <ScrollFadeIn>
        <AboutSection />
      </ScrollFadeIn>

      <SectionDivider label="CAREER JOURNEY" />
      <ScrollFadeIn>
        <JourneySection />
      </ScrollFadeIn>

      <SectionDivider label="TECH MATRIX" />
      <ScrollFadeIn>
        <SkillsSection />
      </ScrollFadeIn>

      <SectionDivider label="ACADEMIC & LANGUAGES" />
      <ScrollFadeIn>
        <EducationAndLanguagesSection />
      </ScrollFadeIn>

      <SectionDivider label="GET IN TOUCH" />
      <ScrollFadeIn>
        <ContactSection />
      </ScrollFadeIn>
    </div>
  );
}
