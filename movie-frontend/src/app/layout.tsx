"use client";
import { Toaster } from "sonner";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Navbar } from "@/components/base/Navbar";
import Footer from "@/components/base/Footer";
import "@smastrom/react-rating/style.css";
import Categories from "@/components/base/Categories";
import { usePathname } from "next/navigation";

// Importing custom fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Main RootLayout component with AuthProvider wrapping the content
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        {/* AuthProvider wrapping the entire layout */}
        <AuthProvider>
          <Navbar />
          {pathname === "/movies" && <Categories />}
          <Toaster position="top-right" richColors />
          <div className="min-h-[500px]">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
