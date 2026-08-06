import React from "react";
import { PORTFOLIO_DATA, Project } from "@/content/data";
import { FolderGit2, ExternalLink, Github, Tag, Activity } from "lucide-react";

export default function ProjectsSection() {
  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "SHIPPED":
        return "bg-hazard text-ink border-ink";
      case "IN PROGRESS":
        return "bg-circuit text-white border-ink";
      case "ARCHIVED":
        return "bg-rebar text-white border-ink";
      default:
        return "bg-concrete text-ink border-ink";
    }
  };

  return (
    <section id="projects" className="py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-4 border-ink dark:border-concrete pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-hazard text-ink border-2 border-ink shadow-hard-sm">
            <FolderGit2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-mono text-xs text-rebar uppercase tracking-widest">// SECTION 03</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-ink dark:text-concrete">
              SHIPPED WORK & CRATES
            </h2>
          </div>
        </div>
        <div className="font-mono text-xs text-rebar">
          TOTAL_CRATES: <span className="font-bold text-ink dark:text-concrete">{PORTFOLIO_DATA.projects.length} UNITS</span>
        </div>
      </div>

      {/* Grid of Crate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PORTFOLIO_DATA.projects.map((project) => (
          <div
            key={project.id}
            id={`project-${project.id}`}
            className="group relative bg-card-bg border-4 border-ink dark:border-concrete shadow-hard-lg hover:shadow-hard transition-all flex flex-col justify-between overflow-hidden"
          >
            
            {/* Top Bar / Crate Stencil Header */}
            <div className="p-4 bg-concrete dark:bg-black/40 border-b-4 border-ink dark:border-concrete flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-rebar" />
                <span className="font-bold text-ink dark:text-concrete">{project.version}</span>
              </div>

              {/* Stamped Status Tag */}
              <span
                className={`px-2.5 py-0.5 font-mono text-xs font-black uppercase border-2 shadow-hard-sm ${getStatusBadge(
                  project.status
                )}`}
              >
                STAMP: {project.status}
              </span>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 flex-1">
              
              <div>
                <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-ink dark:text-concrete group-hover:text-circuit transition-colors">
                  {project.name}
                </h3>
                <p className="font-mono text-xs text-circuit dark:text-hazard font-bold mt-1">
                  {project.tagline}
                </p>
              </div>

              <p className="text-sm font-sans text-ink/80 dark:text-concrete/80 leading-relaxed">
                {project.description}
              </p>

              {/* Benchmark / Metric Tag */}
              <div className="p-2.5 bg-hazard/20 border-2 border-ink dark:border-concrete font-mono text-xs font-bold text-ink dark:text-concrete flex items-center gap-2">
                <Activity className="w-4 h-4 text-signal stroke-[2.5]" />
                <span>BENCHMARK: {project.metrics}</span>
              </div>

              {/* Tech Badges */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-concrete dark:bg-ink border border-ink dark:border-concrete font-mono text-[11px] font-bold text-ink dark:text-concrete"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-concrete dark:bg-black/40 border-t-3 border-ink dark:border-concrete flex items-center justify-between font-mono text-xs gap-3">
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-ink text-ink dark:text-concrete border-2 border-ink dark:border-concrete shadow-hard-sm hover:bg-hazard hover:text-ink transition-all"
                >
                  <Github className="w-4 h-4 stroke-[2]" />
                  <span>REPOSITORY</span>
                </a>
              ) : (
                <span className="text-rebar">PRIVATE REPO</span>
              )}

              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-hazard text-ink border-2 border-ink shadow-hard-sm hover:bg-circuit hover:text-white transition-all font-bold"
                >
                  <span>LIVE DEMO</span>
                  <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                </a>
              )}
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}
