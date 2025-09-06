// app/layout.tsx

import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import DynamicToaster from "@/app/components/dynamic-toaster";
import { Suspense } from "react";
import Spinner from "@/app/components/spinner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Suspense fallback={<Spinner />}>
            <DynamicToaster /> 
            {children}
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}