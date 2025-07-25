import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Header from "./Header";

export const metadata: Metadata = {
  title: "Employee Knowledge Agent - Jagannatha Group B.Ed Colleges",
  description: "Student fee management and employee knowledge agent for Jagannatha Group of Institutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
