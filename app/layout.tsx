import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import CommandPalette from "@/components/CommandPalette";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "THE BUILD YARD // Full-Stack Systems & Engineering",
  description: "An original, louder-brutalist personal portfolio for a senior full-stack engineer. Builds, ships, deploys, and system architecture.",
  keywords: ["Full-Stack Engineer", "System Architecture", "Next.js", "TypeScript", "Brutalist Design", "React", "Node.js"],
  authors: [{ name: "Alex Mercer" }],
  openGraph: {
    title: "THE BUILD YARD // Full-Stack Systems & Engineering",
    description: "Personal site & project showcase for Alex Mercer — Full-Stack Engineer.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-concrete dark:bg-ink text-ink dark:text-concrete selection:bg-hazard selection:text-ink">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <CustomCursor />
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Footer />
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
