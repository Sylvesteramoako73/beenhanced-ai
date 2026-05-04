import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeEnhanced AI",
  description: "Internal AI assistant for BeEnhanced",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
