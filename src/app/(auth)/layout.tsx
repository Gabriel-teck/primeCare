import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import "../globals.css";
import Header from "@/components/landing-component/Header";
import { AuthProvider } from "@/context/AuthContext";
import { NavigationProgress } from "@/components/NavigationProgress";
import { Toaster } from "@/components/ui/sonner";

const gabarito = Gabarito({
  subsets: ["latin"],
  variable: "--font-gabarito",
});

export const metadata: Metadata = {
  title: "PrimeCare",
  description: "An Online Medic-care",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${gabarito.variable} antialiased`}>
        <AuthProvider>
          <NavigationProgress />
          <Header />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
