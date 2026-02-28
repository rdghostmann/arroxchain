import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Tawk from "@/components/Tawk";
import Head from "next/head";


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
    icon: "/logo.jpg",
  },
};

export default function RootLayout({ children }) {
  return (

    <html lang="en" className="dark">
       <Head>
        <link rel="icon" href="/logo.jpg" />
      </Head>
      <body className={`${dmSans.className} antialiased bg-background text-foreground`} cz-shortcut-listen="true">
        {children}
        <Toaster richColors position="top-center" /> {/* ✅ Sonner Toaster here */}
        <Tawk />
      </body>
    </html>
  );
}
