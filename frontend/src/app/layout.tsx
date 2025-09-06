// app/layout.tsx

import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import DynamicToaster from "@/app/components/dynamic-toaster";
import { Suspense } from "react";
import Spinner from "@/app/components/spinner";
import { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Sanca Brechó',
    template: '%s | Sanca Brechó',
  },
  description: 'Compre e venda produtos usados entre universitários de São Carlos.',
};

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