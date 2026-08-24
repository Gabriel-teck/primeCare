import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import "../../globals.css";
import Providers from "../../providers";
import { ChatProvider } from "@/context/ChatContext";
import { SocketProvider } from "@/context/SocketContext";
import { AuthProvider } from "@/context/AuthContext";
import AdminDashboardHeader from "@/components/dashboard-component/AdminDashboardHeader";
import { AdminGuard } from "@/components/admin";
import { Toaster } from "@/components/ui/sonner";

const gabarito = Gabarito({
  subsets: ["latin"],
  variable: "--font-gabarito",
});

export const metadata: Metadata = {
  title: "PrimeCare Admin",
  description: "PrimeCare platform super-admin console",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${gabarito.variable} antialiased`}>
        <AuthProvider>
          <SocketProvider>
            <ChatProvider>
              <AdminGuard>
                <Providers>
                  <div className="min-h-screen bg-[#f8f9fa]">
                    <AdminDashboardHeader />
                    <main className="min-w-0 overflow-x-hidden px-3 pb-10 pt-20 sm:px-6 lg:ml-60 lg:px-8">
                      {children}
                    </main>
                    <Toaster />
                  </div>
                </Providers>
              </AdminGuard>
            </ChatProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
