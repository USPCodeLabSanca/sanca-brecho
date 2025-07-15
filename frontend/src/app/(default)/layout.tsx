import { Navbar, Footer } from "@/app/components";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main>{children}</main> 
      <Footer />
    </>
  );
}