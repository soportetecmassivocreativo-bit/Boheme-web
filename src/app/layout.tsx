import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CartDrawer from "@/components/ui/CartDrawer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "BOHEME | Equipos y Accesorios Médicos",
    description: "Gorros quirúrgicos, lanyards, accesorios y equipos médicos de alta calidad.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <head>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body className={`${inter.variable} font-sans antialiased bg-white text-gray-900 selection:bg-[#5F2142] selection:text-[#FFC99C]`}>
                {children}
                <CartDrawer />
                <WhatsAppButton />
            </body>
        </html>
    );
}