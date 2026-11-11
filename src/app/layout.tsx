import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CartDrawer from "@/components/ui/CartDrawer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "BOHEME | Equipos y Accesorios",
    description: "Gorros quirúrgicos, lanyards, accesorios y equipos médicos de alta calidad.",
    icons: {
        icon: [
            { url: "/favicon-dev.svg?v=2", type: "image/svg+xml" },
            { url: "/icon?v=2", type: "image/png", sizes: "64x64" },
        ],
        shortcut: ["/favicon-dev.svg?v=2"],
        apple: [{ url: "/apple-icon?v=2", sizes: "180x180", type: "image/png" }],
    },
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
