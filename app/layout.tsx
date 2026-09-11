import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SoundProvider } from "@/components/providers/SoundProvider";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DayDream — Make memories worth remembering",
  description:
    "A calm, modern, and personal application to track your life dreams, milestones, reflections, and achievements.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('daydream_theme')||'indigo';var d=['slate','aurora','forest','ocean','ruby','midnight-citrus'];var isDark=d.indexOf(t)!==-1;document.documentElement.setAttribute('data-theme',t);document.documentElement.setAttribute('data-theme-mode',isDark?'dark':'light');if(isDark){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${instrumentSerif.variable} min-h-screen bg-[var(--theme-bg,#FAFAF8)] text-[var(--theme-text,#20242C)] font-sans antialiased selection:bg-[var(--theme-primary,#4F5FD7)] selection:text-white relative`}>
        {/* Subtle Ambient Light Field for Liquid Glass Refraction */}
        <div className="ambient-light-field" aria-hidden="true">
          <div
            className="ambient-orb -top-24 -left-24 w-96 h-96"
            style={{ backgroundColor: "var(--theme-primary-soft-border, #D5D9FB)" }}
          />
          <div
            className="ambient-orb top-1/3 -right-28 w-[28rem] h-[28rem]"
            style={{ backgroundColor: "var(--theme-primary-soft, #EEF0FF)" }}
          />
          <div
            className="ambient-orb -bottom-24 left-1/4 w-[32rem] h-[32rem]"
            style={{ backgroundColor: "var(--theme-border-subtle, #F0F0EE)" }}
          />
        </div>

        <ThemeProvider>
          <SoundProvider>
            <ToastProvider>
              <AuthProvider>
                <div className="relative z-10 min-h-screen flex flex-col">
                  {children}
                </div>
              </AuthProvider>
            </ToastProvider>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
