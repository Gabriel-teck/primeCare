import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import "../../globals.css";
import Providers from "../../providers";
import { ThemeProvider } from "@/context/ThemeContext";
import UserDashoardHeader from "@/components/dashboard-component/UserDashboardHeader";

const gabarito = Gabarito({
  subsets: ["latin"],
  variable: "--font-gabarito",
});

export const metadata: Metadata = {
  title: "PrimeCare",
  description: "An Online Medic-care",
};

export default function PatientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${gabarito.variable} antialiased`}>
        <ThemeProvider>
          <div className="flex h-screen bg-gray-50">
            {/* Sidebar is now handled within the header component */}
            <div className="flex-1 flex flex-col">
              <UserDashoardHeader />
              <main className="flex-1 pt-16 lg:pt-0 lg:ml-60">
                <Providers>{children}</Providers>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
