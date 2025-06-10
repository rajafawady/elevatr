import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { DataProvider } from "@/components/providers/DataProvider";
import { ErrorProvider } from "@/components/providers/ErrorProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elevatr - Career Success Tracker",
  description: "Track your career growth with 15-day and 30-day sprints. Plan, execute, and achieve your professional goals with Elevatr.",
  keywords: ["career", "productivity", "goal tracking", "sprints", "professional development"],
  authors: [{ name: "Elevatr Team" }],
  creator: "Elevatr",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Elevatr",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Elevatr - Career Success Tracker",
    description: "Track your career growth with structured sprints",
    siteName: "Elevatr",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elevatr - Career Success Tracker",
    description: "Track your career growth with structured sprints",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <ErrorProvider>
            <AuthProvider>
              <NotificationProvider>
                <DataProvider>
                  <LayoutWrapper>
                    {children}
                  </LayoutWrapper>
                </DataProvider>
              </NotificationProvider>
            </AuthProvider>
          </ErrorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
