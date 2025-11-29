import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Flood Support Dashboard | Sri Lanka Flood Relief Analytics",
  description: "Real-time district-wise SOS data visualization and analytics for Sri Lanka flood relief coordination. Track rescue operations, emergency cases, and affected populations.",
  keywords: ["flood support", "Sri Lanka", "disaster relief", "SOS", "emergency", "rescue operations", "analytics dashboard"],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "Flood Support Dashboard",
    description: "Real-time SOS data visualization for Sri Lanka flood relief",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
