import type { Metadata } from "next";
import { Poppins } from "next/font/google"; // Changed from Inter
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "Loan Super Admin",
  description: "Secure Loan Super Admin Dashboard",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased font-sans`} suppressHydrationWarning={true}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
