import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Tawk from "@/components/Tawk";


const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata = {
  title: "ArroxChain",
  description: "Source grant and funding crypto-invesment holdings.",
  icons: {
    icon: [
      { url: "/logo.jpg", media: "(prefers-color-scheme: light)" },
      { url: "/logo.jpg", media: "(prefers-color-scheme: dark)" },
      { url: "/logo.jpg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (

    <html lang="en" className="dark">
      <body className={`${dmSans.className} antialiased bg-background text-foreground`} cz-shortcut-listen="true">
        {children}
        <Toaster richColors position="top-center" /> {/* ✅ Sonner Toaster here */}
        {/* <Tawk /> */}
        <Tawk />

      </body>
    </html>
  );
}
