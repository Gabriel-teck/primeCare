import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import "../../globals.css";
import Providers from "../../providers";
import UserDashoardHeader from "@/components/dashboard-component/UserDashboardHeader";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { ChatProvider } from "@/context/ChatContext";
import { PatientGuard } from "@/components/patient";
import { Toaster } from "@/components/ui/sonner";

const gabarito = Gabarito({
  subsets: ["latin"],
  variable: "--font-gabarito",
});

export const metadata: Metadata = {
  title: "PrimeCare Patient",
  description: "PrimeCare patient care dashboard",
};

export default function PatientLayout({
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
              <PatientGuard>
                <Providers>
                  <div className="min-h-screen bg-[#f8f9fa]">
                    <UserDashoardHeader />
                    <main className="min-w-0 overflow-x-hidden px-3 pb-10 pt-20 sm:px-6 lg:ml-60 lg:px-8">
                      {children}
                    </main>
                    <Toaster />
                  </div>
                </Providers>
              </PatientGuard>
            </ChatProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
