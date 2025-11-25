import type { Metadata } from "next";
import { Fraunces, Jost } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  // Fraunces is a variable font, so we can just use it. 
  // If we want specific settings, we can use axes, but let's simplify to fix the build first.
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-futura", // Mapping to existing variable name for compatibility
  display: "swap",
});

export const metadata: Metadata = {
  title: "Friez n Burgz",
  description: "Smashed patties, crispy chix, and shakes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${jost.variable} antialiased bg-fb-bg text-fb-text font-fbBody`}
      >
        {children}
      </body>
    </html>
  );
}
