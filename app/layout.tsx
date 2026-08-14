import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnalyticsProvider from "@/components/AnalyticsProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://github.com/jeswinbenedict"),
  title: "Jeswin Karunya Benedict - Portfolio | Full Stack Developer & Mobile App Builder",
  description:
    "Jeswin Karunya Benedict - Full Stack Developer | Web & Mobile App Builder | Building applications to solve real-world problems. Based in Chennai, Tamil Nadu. Student at VIT-AP University, Amaravati, Andhra Pradesh.",
  keywords: [
    "Jeswin Karunya Benedict",
    "Jeswin Benedict",
    "Full Stack Developer",
    "Web & Mobile App Builder",
    "Java",
    "Spring Boot",
    "React",
    "TypeScript",
    "Python",
    "Android XML",
    "IoT Cybersecurity",
    "WSN Routing Protocols",
    "Distributed Systems",
    "VIT-AP University",
    "Semmozhi Tamil Mandram",
    "Chennai",
    "Tamil Nadu",
    "Amaravati",
    "Andhra Pradesh",
  ],
  openGraph: {
    title: "Jeswin Karunya Benedict - Portfolio",
    description:
      "Full Stack Developer | Web & Mobile App Builder | Building applications to solve real-world problems.",
    images: [
      {
        url: "/jeswin-avatar.jpg",
        width: 1200,
        height: 630,
        alt: "Jeswin Karunya Benedict - Portfolio",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jeswin Karunya Benedict - Portfolio",
    description:
      "Full Stack Developer | Web & Mobile App Builder | Building applications to solve real-world problems.",
    images: ["/jeswin-avatar.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning className="min-h-screen flex flex-col font-sans bg-white dark:bg-[#1a1a1a] text-neo-black dark:text-white selection:bg-neo-yellow selection:text-neo-black">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Footer />
          <AnalyticsProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
