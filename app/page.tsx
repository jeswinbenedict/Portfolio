import React from "react";
import HeroSection from "@/components/sections/Hero";
import AboutSection from "@/components/sections/About";
import ProjectsSection from "@/components/sections/Projects";
import ExperienceSection from "@/components/sections/Experience";
import StackSection from "@/components/sections/Stack";
import EducationSection from "@/components/sections/Education";
import ContactSection from "@/components/sections/Contact";
import HazardDivider from "@/components/HazardDivider";

export default function Home() {
  return (
    <div className="space-y-16">
      <HeroSection />
      <HazardDivider />
      <AboutSection />
      <HazardDivider />
      <ProjectsSection />
      <HazardDivider />
      <ExperienceSection />
      <HazardDivider />
      <StackSection />
      <HazardDivider />
      <EducationSection />
      <HazardDivider />
      <ContactSection />
    </div>
  );
}
