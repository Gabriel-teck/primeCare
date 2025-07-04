import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import "../../globals.css";
import Providers from "../../providers";
import { ThemeProvider } from "@/context/ThemeContext";
import AdminDashboardHeader from "@/components/dashboard-component/AdminDashboardHeader";

const gabarito = Gabarito({
  subsets: ["latin"],
  variable: "--font-gabarito",
});

export const metadata: Metadata = {
  title: "PrimeCare",
  description: "An Online Medic-care",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${gabarito.variable} antialiased`}>
        <ThemeProvider>
          <div className="flex-1 flex flex-col">
            {/* Sidebar is now handled within the header component */}
            <AdminDashboardHeader />
            <main className="flex-1 pt-16 lg:ml-60">
              <Providers>{children}</Providers>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
