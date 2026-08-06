import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import "../../globals.css";
import Providers from "../../providers";
import { ChatProvider } from "@/context/ChatContext";
import { SocketProvider } from "@/context/SocketContext";
import { AuthProvider } from "@/context/AuthContext";
import { CallSocketProvider } from "@/context/CallSocketContext";
import { CallProvider } from "@/context/CallProvider";
import DoctorDashboardHeader from "@/components/dashboard-component/DoctorDashboardHeader";
import { DoctorGuard } from "@/components/doctor";
import { Toaster } from "@/components/ui/sonner";

const gabarito = Gabarito({
  subsets: ["latin"],
  variable: "--font-gabarito",
});

export const metadata: Metadata = {
  title: "PrimeCare Doctor",
  description: "PrimeCare doctor clinical console",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function DoctorLayout({
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
              <CallSocketProvider>
                <CallProvider>
                  <DoctorGuard>
                    <Providers>
                      <div className="min-h-screen bg-[#f8f9fa]">
                        <DoctorDashboardHeader />
                        <main className="min-w-0 overflow-x-hidden px-3 pb-10 pt-20 sm:px-6 lg:ml-60 lg:px-8">
                          {children}
                        </main>
                        <Toaster />
                      </div>
                    </Providers>
                  </DoctorGuard>
                </CallProvider>
              </CallSocketProvider>
            </ChatProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
