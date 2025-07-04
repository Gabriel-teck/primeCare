import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import "../globals.css";
import Providers from "../providers";
import { ThemeProvider } from "@/context/ThemeContext";
import Header from "@/components/landing-component/Header";
import { Footer } from "@/components/landing-component/Footer";

const gabarito = Gabarito({
  subsets: ["latin"],
  variable: "--font-gabarito",
});

export const metadata: Metadata = {
  title: "PrimeCare",
  description: "An Online Medic-care",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${gabarito.variable} antialiased`}>
        <ThemeProvider>
          <Header />
          <Providers>{children}</Providers>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
