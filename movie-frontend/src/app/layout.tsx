// RootLayout.tsx
"use client";
// import { Metadata } from "next";
import { Toaster } from "sonner";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "@/components/base/Navbar";
import Footer from "@/components/base/Footer";
import "@smastrom/react-rating/style.css";
import Categories from "@/components/base/Categories";
import { usePathname } from "next/navigation"; // Import the hook

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

// export const metadata: Metadata = {
//   title: "Movie Rating App",
//   description: "Rate a Movie",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Get the current pathname

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        <AuthProvider>
          <Navbar />
          {/* Conditionally render Categories only on the '/movies' route */}
          {pathname === "/movies" && <Categories />}
          <Toaster position="top-right" />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
