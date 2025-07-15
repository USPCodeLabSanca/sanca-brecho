import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css"
import { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/context/AuthContext";
import ToastProvider from "../components/toast-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sanca Brechó",
  description: "Compre e venda entre universitários de São Carlos",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastProvider /> {/* Para notificações Toast */}
          {children}
        </AuthProvider>
      </body>
    </html>
 
  );
}
