import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import "../globals.css";
import Header from "@/components/landing-component/Header";
import { ThemeProvider } from "@/context/ThemeContext";

const gabarito = Gabarito({
  subsets: ["latin"],
  variable: "--font-gabarito",
});

export const metadata: Metadata = {
  title: "PrimeCare",
  description: "An Online Medic-care",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${gabarito.variable} antialiased`}>
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
