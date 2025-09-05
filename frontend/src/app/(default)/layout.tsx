import { Navbar, Footer } from "@/app/components";
import { Suspense } from "react";
import Spinner from "../components/spinner";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<Spinner />}>
      <Navbar />
      <main>{children}</main> 
      <Footer />
    </Suspense>
  );
}