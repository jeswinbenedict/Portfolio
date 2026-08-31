# Jeswin Karunya Benedict — Portfolio

A high-performance, neo-brutalist personal developer portfolio built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **TypeScript**. Features light/dark theme switching, interactive micro-animations, and a built-in stealth analytics system with automated daily email digests powered by Upstash Redis and Resend.

---

## 🚀 Key Features

- **🎨 Neo-Brutalist Aesthetic**: Crisp black borders, hard-offset box shadows (`shadow-neo`), vibrant pastel highlights, and retro graph-paper grid backdrops.
- **🌓 Dark Mode**: Built with `next-themes` and CSS custom properties for instant light/dark toggle.
- **⚡ Next.js 16 & React 19**: Modern Server Components, optimized client transitions, and instant static generation.
- **📊 Stealth Analytics Engine**:
  - Completely invisible client tracker (no cookies, respect for Do-Not-Track, bot filtering).
  - Tracks visitor sessions, scroll depth, section viewports, and interaction clicks.
  - Vercel geo-header resolution (Country, City, Region).
  - Storage backed by **Upstash Redis** (with in-memory fallback for local development).
  - Automated daily HTML email digest dispatched via **Resend** triggered by **Vercel Cron**.
- **📱 Fully Responsive**: Tailored fluid layouts from mobile screens up to ultrawide monitors.
- **🔍 SEO & Social Share Ready**: Complete OpenGraph, Twitter Cards, structured metadata, and custom favicon/vector icons.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + Vanilla CSS Variables
- **Icons**: Lucide React & Simple Icons
- **Database**: Upstash Redis (`@upstash/redis`)
- **Email Delivery**: Resend (`resend`)
- **Theme**: `next-themes`
- **Hosting / Deployment**: Vercel

---

## 📁 Project Structure

```
├── app/
│   ├── api/analytics/
│   │   ├── digest/route.ts      # Vercel Cron daily digest endpoint
│   │   └── track/route.ts       # Visitor event tracking endpoint
│   ├── globals.css              # Neo-brutalist design tokens & animations
│   ├── icon.svg / favicon.ico   # Vector and raster favicons
│   ├── layout.tsx               # Root layout, ThemeProvider & SEO metadata
│   └── page.tsx                 # Single-page portfolio assembly
├── components/
│   ├── icons/SocialIcons.tsx    # Custom branded SVG icons
│   ├── sections/
│   │   ├── About.tsx            # Personal background & domain specialties
│   │   ├── Contact.tsx          # Direct contact & social link cards
│   │   ├── EducationAndLanguages.tsx # Academics & language proficiencies
│   │   ├── Hero.tsx             # Interactive headline, matrix text & avatars
│   │   ├── Journey.tsx          # Interactive timeline & treasure map view
│   │   └── Skills.tsx           # Categorized tech stack & skill chips
│   ├── AnalyticsProvider.tsx    # Headless client tracker initializer
│   ├── Footer.tsx               # Site footer with back-to-top button
│   ├── LogoMark.tsx             # Animated brand monogram
│   ├── Navbar.tsx               # Sticky smart-hiding navigation bar
│   ├── PaperTear.tsx            # Parallax paper-tear transition divider
│   ├── ScrollFadeIn.tsx         # Viewport intersection animation wrapper
│   ├── ScrollHighlight.tsx      # Marker highlighter scroll animation
│   └── SectionDivider.tsx       # Neo-brutalist section pill separators
├── content/
│   └── portfolioData.ts         # Centralized portfolio content & metadata
├── lib/
│   └── analytics/               # Analytics tracker, Redis store & email builder
├── vercel.json                  # Vercel cron configuration for daily digest
└── next.config.ts               # Next.js production configuration
```

---

## ⚙️ Environment Variables Setup

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Configure the following environment variables:

```env
# Upstash Redis (Get from console.upstash.com or Vercel Marketplace)
UPSTASH_REDIS_REST_URL=https://your-upstash-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Resend API Key (Get from resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev

# Vercel Cron Secret (Protects /api/analytics/digest)
CRON_SECRET=your_random_secret_token
```

> **Note**: For local development, all environment variables are optional. When omitted, analytics data falls back to in-memory storage and digests are logged to the terminal.

---

## 💻 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local development server:**
   ```bash
   npm run dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

4. **Run TypeScript check & production build:**
   ```bash
   npm run build
   ```

5. **Lint the codebase:**
   ```bash
   npm run lint
   ```

---

## 🚀 Deploying to Vercel

1. Push your repository to GitHub.
2. Import the project into [Vercel Dashboard](https://vercel.com/new).
3. Add the Environment Variables (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RESEND_API_KEY`, `CRON_SECRET`) in **Project Settings → Environment Variables**.
4. Click **Deploy**. Vercel will automatically configure builds, serverless routes, and cron schedules defined in `vercel.json`.

---

## 📄 License

This project is personal portfolio software created by [Jeswin Karunya Benedict](https://github.com/jeswinbenedict).
