# Jeswin Karunya Benedict — Portfolio & Personal Website

> Modern, Neo-Brutalist portfolio built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and TypeScript. Featuring subtle interactive micro-animations, theme switching, and automated deployment to GitHub Pages.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Deploy to GitHub Pages](https://github.com/jeswinbenedict/Portfolio/actions/workflows/deploy.yml/badge.svg)](https://github.com/jeswinbenedict/Portfolio/actions/workflows/deploy.yml)

---

## 🚀 Live Demo

- **GitHub Pages**: [https://jeswinbenedict.github.io/Portfolio](https://jeswinbenedict.github.io/Portfolio)

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Static Export & Hybrid Edge API support)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with Neo-Brutalist tokens & hard offset shadows
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes) (Light / Dark mode toggle)
- **Icons**: [Lucide React](https://lucide.dev/) & [Simple Icons](https://simpleicons.org/)
- **Animation**: Native CSS keyframes & IntersectionObserver-driven viewport transitions
- **Deployment**: Automated CI/CD via GitHub Actions to GitHub Pages (`gh-pages` branch)

---

## 📂 Project Structure

```text
├── app/
│   ├── api/analytics/        # Stealth analytics API routes (track & digest)
│   ├── globals.css           # Design tokens, theme variables & animations
│   ├── layout.tsx            # Global metadata, SEO tags, theme provider
│   └── page.tsx              # Single-page assembled portfolio sections
├── components/
│   ├── icons/                # High-fidelity SVG icons (Social & brand)
│   ├── sections/
│   │   ├── Hero.tsx          # Dynamic greeting, avatar card & tech badges
│   │   ├── About.tsx         # Bio card, highlights & club coordinates
│   │   ├── Journey.tsx       # Timeline & interactive coordinate map flip
│   │   ├── Skills.tsx        # Technical skills & verified domain matrix
│   │   ├── EducationAndLanguages.tsx # Academic degrees & proficiency stars
│   │   └── Contact.tsx       # Direct outreach, email copying & social links
│   ├── Navbar.tsx            # Smart hiding header & reading progress indicator
│   ├── Footer.tsx            # Quick navigation, back-to-top & copyright
│   ├── PaperTear.tsx         # Responsive interactive paper tear effect
│   ├── ScrollFadeIn.tsx      # Viewport fade-in wrapper
│   └── ScrollHighlight.tsx   # Viewport marker highlight animation
├── content/
│   └── portfolioData.ts      # Centralized source of truth for portfolio data
├── public/
│   ├── .nojekyll             # Prevents Jekyll processing on GitHub Pages
│   └── jeswin-avatar.jpg     # Avatar asset
├── .github/workflows/
│   └── deploy.yml            # GitHub Pages deployment pipeline
└── next.config.ts            # Next.js static export & asset basePath config
```

---

## 💻 Local Development

### Prerequisites
- Node.js 20+
- npm

### Installation & Run
```bash
# 1. Clone repository
git clone https://github.com/jeswinbenedict/Portfolio.git
cd Portfolio

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000/Portfolio](http://localhost:3000/Portfolio) in your browser.

### Quality Checks & Build
```bash
# Run ESLint check
npm run lint

# Build production bundle
npm run build
```

---

## 🔒 Security & Privacy

- All sensitive environment variables are strictly defined in `.env.local.example` and omitted from version control via `.gitignore`.
- Zero credentials or tokens are committed to source files.
- GitHub Actions uses `secrets.GITHUB_TOKEN` scoped to minimal deployment permissions.
