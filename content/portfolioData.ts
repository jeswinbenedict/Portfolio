export interface Project {
  id: string;
  name: string;
  badge: string;
  badgeColor: "yellow" | "cyan" | "mint" | "pink" | "purple";
  tagline: string;
  description: string;
  tech: string[];
  githubUrl?: string;
  liveUrl?: string;
  highlights: string[];
  featured?: boolean;
}

export interface JourneyItem {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  country: string;
  flag: string;
  coords: [number, number];
  description: string;
  technologies: string[];
  highlights: string[];
}

export interface SkillCategory {
  category: string;
  color: string;
  highlighted?: boolean;
  skills: string[];
}

export interface LanguageRating {
  language: string;
  stars: number; // 1 to 3 stars
  level: string;
}

export const PORTFOLIO_DATA = {
  profile: {
    name: "Jeswin Karunya Benedict",
    title: "Full Stack Developer",
    subtitle: "Web & Mobile App Builder",
    pronouns: "He/Him",
    location: "Chennai, Tamil Nadu, India",
    company: "VIT-AP University / Semmozhi Tamil Mandram",
    experienceYears: "Full Stack & Cloud",
    bio: "Full Stack Developer and Web & Mobile App Builder passionate about building applications to solve real-world problems. Experienced in Java, Spring Boot, React, TypeScript, Python, REST APIs, JPA, Hibernate, Docker, Kubernetes, AWS, and Google Cloud.",
    greeting: "Hi there!",
    shortDescription: "Full Stack Developer | Web & Mobile App Builder | Building applications to solve real-world problems. Based in Chennai, Tamil Nadu.",
    email: "jeswinbenedict7@gmail.com",
    paypalCoffeeUrl: "https://github.com/jeswinbenedict",
    github: "https://github.com/jeswinbenedict",
    linkedin: "https://www.linkedin.com/in/jeswin-karunya-benedict",
  },

  heroTechBadges: [
    { name: "Java", bg: "bg-neo-cyan" },
    { name: "Spring Boot", bg: "bg-neo-yellow" },
    { name: "React", bg: "bg-neo-mint" },
    { name: "TypeScript", bg: "bg-neo-pink" },
    { name: "Python", bg: "bg-neo-purple" },
    { name: "Android XML", bg: "bg-neo-cyan" },
    { name: "Docker", bg: "bg-neo-yellow" },
    { name: "Kubernetes", bg: "bg-neo-mint" },
  ],

  terminalCommands: {
    help: `AVAILABLE COMMANDS:
  about      - Display background bio and current focus
  skills     - List technical skills (Java, Spring Boot, React, Python, Cloud)
  journey    - View academic timeline & organizational roles
  projects   - Show key projects (Full-Stack Apps, IoT Cybersecurity, WSN Protocols)
  contact    - Get email, LinkedIn, and GitHub links
  clear      - Clear terminal screen
  whoami     - Print current user session info`,

    about: `NAME: Jeswin Karunya Benedict (He/Him)
ROLE: Full Stack Developer | Web & Mobile App Builder
LOCATION: Chennai, Tamil Nadu, India
EDUCATION: VIT-AP University (Amaravati, AP)
ORGANIZATION: Semmozhi Tamil Mandram
SPECIALTIES: Java, Spring Boot, React, TypeScript, Python, REST APIs, Docker, Kubernetes, AWS, GCP`,

    skills: `=== TECHNICAL STACK ===
[LANGUAGES & FRAMEWORKS] Java, TypeScript, React, Python, Spring Boot, REST APIs, JPA, Hibernate, Android XML
[CLOUD & DEVOPS]         Docker, Kubernetes, AWS, Google Cloud
[CORE DOMAINS]          Web & Mobile App Development, IoT Cybersecurity, Distributed Systems, Routing Protocols`,

    journey: `=== ACADEMIC & ORGANIZATIONAL JOURNEY ===
• VIT-AP University | Integrated M.Tech CSE (in Collaboration with Virtusa)
• Semmozhi Tamil Mandram | Cultural Club — Core Member & Coordinator
• Full-Stack & IoT Research | Web, Mobile, IoT Cybersecurity & WSN Routing Protocols`,

    projects: `=== FEATURED PROJECTS & DOMAINS ===
1. FULL-STACK WEB & MOBILE APPS — Spring Boot, React, Android XML, REST APIs, JPA/Hibernate
2. HYBRID ML/DL IOT CYBERSECURITY PIPELINES — Machine Learning & Deep Learning IoT Threat Detection
3. WSN-IOT ROUTING PROTOCOLS — Distributed Systems & Wireless Sensor Network Routing Protocols`,

    contact: `DIRECT CONTACT:
Email:    jeswinbenedict7@gmail.com
GitHub:   github.com/jeswinbenedict
LinkedIn: linkedin.com/in/jeswin-karunya-benedict`,
  },

  journey: [
    {
      id: "vit-ap",
      role: "Full Stack Developer & Student",
      company: "VIT-AP University",
      period: "Academic Journey",
      location: "Amaravati, Andhra Pradesh",
      country: "India",
      flag: "IN",
      coords: [16.5062, 80.648],
      description: "Pursuing Integrated M.Tech CSE (in Collaboration with Virtusa). Developed web & mobile apps, research pipelines in hybrid ML/DL IoT cybersecurity, and distributed WSN routing protocols.",
      technologies: ["Java", "Spring Boot", "React", "TypeScript", "Python", "REST APIs", "Android XML"],
      highlights: [
        "Built full-stack web and native mobile applications with Spring Boot backend & React/Android frontend",
        "Researched and engineered hybrid ML/DL pipelines for IoT cybersecurity threat detection",
        "Implemented distributed systems and WSN-IoT routing protocols for efficient data transport",
      ],
    },
    {
      id: "semmozhi",
      role: "Core Member & Coordinator",
      company: "Semmozhi Tamil Mandram",
      period: "Organization Role",
      location: "VIT-AP University",
      country: "India",
      flag: "IN",
      coords: [16.5062, 80.648],
      description: "Active core member and coordinator at Semmozhi Tamil Mandram, a cultural and literary club at VIT-AP University dedicated to promoting Tamil language, arts, and heritage.",
      technologies: ["Event Coordination", "Cultural Programming", "Community Engagement", "Team Leadership"],
      highlights: [
        "Organized cultural events, literary discussions, and Tamil heritage celebrations on campus",
        "Coordinated team activities and contributed to community outreach initiatives",
      ],
    },
  ] as JourneyItem[],

  skillCategories: [
    {
      category: "Languages & Frameworks",
      color: "bg-neo-yellow text-neo-black border-neo-black",
      highlighted: true,
      skills: ["Java", "Spring Boot", "TypeScript", "React", "Python", "REST APIs", "JPA", "Hibernate", "Android XML"],
    },
    {
      category: "Cloud & DevOps",
      color: "bg-neo-cyan text-neo-black border-neo-black",
      highlighted: true,
      skills: ["Docker", "Kubernetes", "AWS", "Google Cloud", "Git", "CI/CD"],
    },
    {
      category: "Core Domains",
      color: "bg-neo-mint text-neo-black border-neo-black",
      highlighted: true,
      skills: ["Web App Development", "Mobile App Development", "IoT Cybersecurity", "Distributed Systems", "WSN Routing Protocols"],
    },
  ] as SkillCategory[],

  projects: [
    {
      id: "fullstack-app",
      name: "Full-Stack Web & Mobile Apps",
      badge: "Spring Boot + React",
      badgeColor: "yellow",
      tagline: "Building scalable web and mobile applications to solve real-world problems.",
      description: "End-to-end web & mobile applications engineered with Java Spring Boot REST APIs, JPA/Hibernate ORM, React frontend, and Android XML UI interfaces.",
      tech: ["Java", "Spring Boot", "React", "TypeScript", "REST APIs", "JPA", "Android XML"],
      githubUrl: "https://github.com/jeswinbenedict",
      liveUrl: "https://github.com/jeswinbenedict",
      highlights: [
        "Robust RESTful microservice architecture with Spring Boot & Hibernate Data Persistence",
        "Responsive React web frontend coupled with native Android XML interface designs",
      ],
      featured: true,
    },
    {
      id: "iot-cybersecurity",
      name: "Hybrid ML/DL IoT Cybersecurity Pipelines",
      badge: "Python + AI Security",
      badgeColor: "cyan",
      tagline: "Intelligent threat detection pipelines for Internet of Things ecosystems.",
      description: "Hybrid machine learning & deep learning detection pipeline designed to inspect IoT network traffic anomalies, identify intrusion patterns, and protect edge devices.",
      tech: ["Python", "Machine Learning", "Deep Learning", "IoT Cybersecurity", "Scikit-Learn", "TensorFlow"],
      githubUrl: "https://github.com/jeswinbenedict",
      liveUrl: "https://github.com/jeswinbenedict",
      highlights: [
        "Hybrid ML/DL classifier detecting anomalous packet signatures across IoT networks",
        "High-accuracy real-time threat mitigation pipeline for distributed edge sensors",
      ],
      featured: true,
    },
    {
      id: "wsn-routing",
      name: "WSN-IoT Routing Protocols",
      badge: "Distributed Systems",
      badgeColor: "mint",
      tagline: "Energy-efficient routing protocols for Wireless Sensor Networks & IoT.",
      description: "Performance-optimized routing protocols designed for Wireless Sensor Networks (WSN) to minimize energy consumption and guarantee fault-tolerant data transport.",
      tech: ["Wireless Sensor Networks", "IoT", "Routing Protocols", "Java", "Python", "Network Simulation"],
      githubUrl: "https://github.com/jeswinbenedict",
      liveUrl: "https://github.com/jeswinbenedict",
      highlights: [
        "Optimized packet routing algorithms reducing node energy depletion in dense WSNs",
        "Simulated fault-tolerant topologies with adaptive multi-hop packet forwarding",
      ],
      featured: true,
    },
  ] as Project[],

  education: {
    degree: "Integrated M.Tech CSE (Virtusa)",
    subtitle: "Five year integrated programme CSE in Collaboration with Virtusa",
    institution: "VIT-AP University",
    period: "Higher Education",
    location: "Amaravati, Andhra Pradesh",
  },

  languages: [
    { language: "English", stars: 3, level: "Professional / Fluent" },
    { language: "Tamil", stars: 3, level: "Native / Fluent" },
    { language: "Hindi", stars: 1, level: "Elementary / Basic" },
  ] as LanguageRating[],
};
