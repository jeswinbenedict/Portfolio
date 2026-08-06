export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: "SHIPPED" | "IN PROGRESS" | "ARCHIVED";
  tags: string[];
  liveUrl?: string;
  repoUrl?: string;
  version: string;
  metrics: string;
}

export interface Experience {
  commitHash: string;
  role: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
  versionTag: string;
}

export interface SkillCategory {
  category: string;
  description: string;
  items: Array<{
    name: string;
    version: string;
    type: "dependency" | "devDependency" | "peerDependency" | "script";
    notes?: string;
  }>;
}

export const PORTFOLIO_DATA = {
  hero: {
    name: "ALEX MERCER",
    role: "FULL-STACK SYSTEMS & WEB ARCHITECTURE",
    tagline: "I engineer high-throughput web applications, distributed backend services, and interactive 3D interfaces.",
    nowBuilding: {
      commit: "a3f9c2",
      message: "optimizing Rapier3D physics collision bounds",
      version: "v2.4.0-release",
      status: "LIVE_STAGING",
    },
    location: "SAN FRANCISCO, CA",
    statusText: "AVAILABLE FOR SENIOR ROLES / ARCHITECTURE ADVISORY",
    resumeUrl: "#",
  },

  about: {
    bio: "Full-stack engineer with 7+ years of experience building software that scales cleanly and runs fast. I specialize in React/Next.js frontends paired with Rust, Go, and Node.js backends. I prefer clear system architecture, zero-bloat code, and physical-feeling web UI over generic corporate abstractions.",
    specSheet: [
      { label: "PRIMARY ROLE", value: "Senior Full-Stack Engineer" },
      { label: "CORE STACK", value: "Next.js, TypeScript, Go, Rust, PostgreSQL, R3F" },
      { label: "LOCATION", value: "San Francisco, CA (UTC-7) / Remote" },
      { label: "SYS_STATUS", value: "Open for Staff / Tech Lead opportunities" },
      { label: "THROUGHPUT", value: "10k+ QPS distributed systems built" },
      { label: "HARDWARE", value: "Apple M3 Max 64GB / Arch Linux ThinkPad" },
    ],
  },

  projects: [
    {
      id: "hyper-mesh",
      name: "HYPERMESH ENGINE",
      tagline: "Real-time collaborative web canvas with WebSockets & CRDTs",
      description: "A zero-latency collaborative canvas engine supporting 500+ concurrent multi-user cursor events per room using Yjs CRDTs and WebSockets.",
      status: "SHIPPED",
      version: "v3.1.0",
      tags: ["TypeScript", "Next.js", "WebSockets", "Yjs", "TailwindCSS", "Canvas API"],
      metrics: "500+ Concurrent Nodes / <12ms Latency",
      liveUrl: "https://example.com/hypermesh",
      repoUrl: "https://github.com/example/hypermesh",
    },
    {
      id: "forge-db",
      name: "FORGE KV STORE",
      tagline: "High-performance embeddable key-value store written in Rust",
      description: "LSM-tree based persistent storage engine built for microsecond read throughput and crash-resilient WAL write operations.",
      status: "SHIPPED",
      version: "v1.8.4",
      tags: ["Rust", "Systems Programming", "WAL", "Memory Mapping", "Benchmark CLI"],
      metrics: "1.2M QPS Read Throughput",
      liveUrl: "https://example.com/forge-kv",
      repoUrl: "https://github.com/example/forge-kv",
    },
    {
      id: "circuit-flow",
      name: "CIRCUIT FLOW IDE",
      tagline: "Browser-based visual pipeline editor for distributed DAGs",
      description: "Node-based visual editor allowing engineers to design, test, and deploy ETL workflows with instant WebAssembly code generation.",
      status: "SHIPPED",
      version: "v2.0.1",
      tags: ["React", "Wasm", "TypeScript", "TailwindCSS", "Zustand", "Go"],
      metrics: "-48% Workflow Deployment Time",
      liveUrl: "https://example.com/circuitflow",
      repoUrl: "https://github.com/example/circuitflow",
    },
    {
      id: "sentinel-telemetry",
      name: "SENTINEL AGENT",
      tagline: "Lightweight eBPF metric collector for Linux cluster nodes",
      description: "Kernel-level observability daemon monitoring socket latency, disk I/O bottlenecks, and container memory pressure with <1% CPU footprint.",
      status: "IN PROGRESS",
      version: "v0.9.2-beta",
      tags: ["Go", "eBPF", "Linux Kernel", "Prometheus", "Docker", "gRPC"],
      metrics: "<0.8% CPU Usage / 50MB RAM",
      liveUrl: "https://example.com/sentinel",
      repoUrl: "https://github.com/example/sentinel",
    },
    {
      id: "crate-pack",
      name: "CRATE-PACK BUNDLER",
      tagline: "Experimental Rust web asset bundler & tree-shaker",
      description: "Parallel AST parsing and CSS token generator designed to eliminate unused CSS classes and produce deterministic production output.",
      status: "ARCHIVED",
      version: "v0.4.0",
      tags: ["Rust", "SWC", "AST Parsing", "Compiler Construction"],
      metrics: "3.5x Faster than Webpack",
      liveUrl: "https://example.com/cratepack",
      repoUrl: "https://github.com/example/cratepack",
    },
  ] as Project[],

  experiences: [
    {
      commitHash: "a3f9c2",
      role: "Staff Full-Stack Engineer",
      company: "KINETIC LABS INC.",
      location: "San Francisco, CA",
      period: "2023 — PRESENT",
      versionTag: "v2024.1",
      highlights: [
        "Architected Next.js App Router & Go microservices backend handling 45M daily API requests with 99.99% uptime.",
        "Engineered real-time WebSocket state distribution layer reducing end-to-end user latency by 42%.",
        "Mentored team of 8 engineers and spearheaded adoption of Rust microservices for performance-critical path processing.",
      ],
    },
    {
      commitHash: "7e4b90",
      role: "Senior Full-Stack Engineer",
      company: "VORTEX SYSTEMS",
      location: "Remote",
      period: "2021 — 2023",
      versionTag: "v2022.3",
      highlights: [
        "Spearheaded redesign of core web dashboard using React, TailwindCSS, and Zustand, improving initial load time by 3.2 seconds.",
        "Built distributed event pipeline consuming 100k+ events/sec via Apache Kafka and ClickHouse storage.",
        "Cut monthly cloud infra spend by $18,000 through automated serverless scaling and caching strategy.",
      ],
    },
    {
      commitHash: "d190ea",
      role: "Software Engineer — Frontend & Core",
      company: "NEXUS ROBOTICS",
      location: "Boston, MA",
      period: "2019 — 2021",
      versionTag: "v2020.2",
      highlights: [
        "Created 3D WebGL telemetry interface visualizing real-time robot fleet sensor data using Three.js and WebSockets.",
        "Designed custom UI design system with strict accessibility compliance and hard brutalist component primitives.",
        "Reduced bundle size by 35% through dynamic code splitting and custom asset loaders.",
      ],
    },
  ] as Experience[],

  manifest: {
    packageName: "@buildyard/alex-mercer",
    version: "2026.8.0",
    description: "Production manifest of languages, frameworks, infrastructure, and tools.",
    categories: [
      {
        category: "LANGUAGES & RUNTIMES",
        description: "Primary programming languages for web, systems, and scripts",
        items: [
          { name: "TypeScript", version: "^5.4.0", type: "dependency", notes: "Primary language for frontend & Node backends" },
          { name: "Rust", version: "1.78.0", type: "dependency", notes: "Systems programming, CLI tools, Wasm modules" },
          { name: "Go", version: "1.22.0", type: "dependency", notes: "High-concurrency backend services & eBPF daemons" },
          { name: "SQL (PostgreSQL)", version: "^16.0", type: "dependency", notes: "Complex relational queries & indexing" },
        ],
      },
      {
        category: "FRAMEWORKS & UI",
        description: "Frontend & rendering architecture stack",
        items: [
          { name: "Next.js (App Router)", version: "^15.1.0", type: "dependency", notes: "SSR, React Server Components, API routes" },
          { name: "React 19", version: "^19.0.0", type: "dependency", notes: "UI components, Hooks, Suspense" },
          { name: "React Three Fiber (R3F)", version: "^8.16.0", type: "dependency", notes: "Interactive 3D scenes & shader materials" },
          { name: "Tailwind CSS", version: "^4.0.0", type: "dependency", notes: "Brutalist design tokens & CSS utility styling" },
          { name: "Framer Motion", version: "^11.0.0", type: "dependency", notes: "Micro-animations & magnetic UI interactions" },
        ],
      },
      {
        category: "INFRASTRUCTURE & CLOUD",
        description: "DevOps, databases, containerization, and monitoring",
        items: [
          { name: "PostgreSQL", version: "v16", type: "peerDependency", notes: "Primary relational storage with Prisma / Drizzle" },
          { name: "Redis", version: "v7.2", type: "peerDependency", notes: "High-speed caching & WebSocket pub/sub channel" },
          { name: "Docker / K8s", version: "latest", type: "devDependency", notes: "Containerized deployments & local orchestration" },
          { name: "Vercel / Cloudflare", version: "edge", type: "peerDependency", notes: "Global CDN, Edge Workers, static hosting" },
        ],
      },
      {
        category: "SCRIPTS & WORKFLOWS",
        description: "Automated developer tasks & verification pipelines",
        items: [
          { name: "npm run dev", version: "next dev --turbo", type: "script", notes: "Instant HMR local development" },
          { name: "npm run build", version: "next build", type: "script", notes: "Production bundling & static page generation" },
          { name: "npm run test", version: "vitest run --coverage", type: "script", notes: "Unit & integration test suite" },
          { name: "npm run lint", version: "eslint . --ext .ts,.tsx", type: "script", notes: "Strict typechecking & lint enforcement" },
        ],
      },
    ] as SkillCategory[],
  },

  education: [
    {
      degree: "B.S. in Computer Science",
      institution: "NORTHEASTERN UNIVERSITY",
      period: "2015 — 2019",
      details: "Concentration in Distributed Systems & Computer Graphics. Magna Cum Laude.",
      certifications: ["AWS Certified Solutions Architect", "CNCF Kubernetes Application Developer (CKAD)"],
    },
  ],

  contact: {
    email: "alex@buildyard.dev",
    location: "San Francisco, CA",
    socials: [
      { name: "GITHUB", url: "https://github.com", handle: "@alexmercer-dev" },
      { name: "LINKEDIN", url: "https://linkedin.com", handle: "in/alexmercer-dev" },
      { name: "X / TWITTER", url: "https://x.com", handle: "@alexmercer_dev" },
      { name: "BLUESKY", url: "https://bsky.app", handle: "@alexmercer.bsky.social" },
    ],
    pgpFingerprint: "4A9E 8B12 C34F 5678 9D01  E234 5678 9012 ABCD 3E4F",
  },
};
