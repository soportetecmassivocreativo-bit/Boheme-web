'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';

export default function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            tl.from(titleRef.current, {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                delay: 0.2
            })
                .from(subtitleRef.current, {
                    y: 30,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power3.out"
                }, "-=0.6")
                .from(ctaRef.current, {
                    y: 20,
                    opacity: 0,
                    duration: 0.6,
                    ease: "power3.out"
                }, "-=0.4");
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative pt-28 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-white">
            {/* Background Checkered Subtle Texture */}
            <div className="absolute inset-0 bg-checkered-peach opacity-40 pointer-events-none" />

            {/* Ambient glowing blobs */}
            <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[#FFC99C]/40 opacity-70 blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-[#D86A33]/15 opacity-80 blur-3xl pointer-events-none" />

            {/* Floating Sticker 1: Daisy Flower Top Left */}
            <div className="hidden lg:flex absolute top-32 left-12 animate-float items-center justify-center pointer-events-none z-10">
                <div className="relative w-16 h-16">
                    {/* Flower Petals */}
                    <div className="absolute inset-0 bg-[#FFC99C] rounded-full opacity-90"></div>
                    <div className="absolute inset-0 bg-[#FFC99C] rounded-full rotate-45 opacity-90"></div>
                    {/* Flower Center */}
                    <div className="absolute inset-3 bg-[#D86A33] rounded-full shadow-inner flex items-center justify-center">
                        <span className="text-white text-[10px] font-black">❤</span>
                    </div>
                </div>
            </div>

            {/* Floating Sticker 2: Rotating Stamp Badge Top Right */}
            <div className="hidden lg:flex absolute top-36 right-16 animate-float-delayed items-center justify-center pointer-events-none z-10">
                <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-[#D86A33] bg-[#FFF4EB] p-2 flex items-center justify-center text-center shadow-lg -rotate-12 hover:rotate-0 transition-transform">
                    <div className="text-[10px] font-black text-[#5F2142] uppercase tracking-tighter leading-tight">
                        ✦ 100% ✦<br />
                        <span className="text-[#D86A33] font-extrabold text-xs">CALIDAD</span><br />
                        BOHEME
                    </div>
                </div>
            </div>

            {/* Floating Sticker 3: Washi Tape Note Bottom Left */}
            <div className="hidden md:block absolute bottom-12 left-16 animate-float-delayed pointer-events-none z-10">
                <div className="washi-tape px-4 py-2 rounded-sm text-xs font-black text-[#5F2142] shadow-md border-l-2 border-[#D86A33]">
                    ★ HECHO A LA MEDIDA ★
                </div>
            </div>

            {/* Floating Sticker 4: Starburst Bottom Right */}
            <div className="hidden md:flex absolute bottom-16 right-20 animate-float items-center gap-2 pointer-events-none z-10">
                <span className="text-[#D86A33] text-2xl animate-spin-slow">✦</span>
                <span className="px-3 py-1 bg-[#FFF9F5] border border-[#5F2142] text-[#5F2142] text-xs font-black rounded-full shadow-xs rotate-6">
                    NUEVA COLECCIÓN
                </span>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                
                {/* Badge with stitch border */}
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FFF4EB] border-2 border-dashed border-[#D86A33] text-[#5F2142] text-xs sm:text-sm font-black tracking-wider uppercase mb-6 shadow-sm hover:scale-105 transition-transform">
                    <span className="text-[#D86A33]">✦</span>
                    <span>Accesorios Médicos con Estilo</span>
                    <span className="text-[#D86A33]">✦</span>
                </div>

                <h1 ref={titleRef} className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#5F2142] mb-6 leading-[1.1]">
                    Ponle color & buena onda <br className="hidden sm:block" />
                    a tu jornada con <span className="relative inline-block text-[#D86A33] underline decoration-[#FFC99C] decoration-wavy decoration-2">BOHEME</span>
                </h1>

                <p ref={subtitleRef} className="mt-4 max-w-2xl text-lg sm:text-xl text-gray-600 mx-auto mb-10 leading-relaxed font-normal">
                    Gorritos quirúrgicos y lanyards personalizados con estilo único, comodidad absoluta y entregas personalizadas para acompañarte en cada turno.
                </p>

                <div ref={ctaRef} className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link 
                        href="/categorias/gorros" 
                        className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 text-base sm:text-lg font-black rounded-full shadow-xl shadow-[#D86A33]/30 text-white bg-[#D86A33] hover:bg-[#c25925] transition-all hover:scale-105 active:scale-95 hover:-rotate-1"
                    >
                        <span>Explorar Catálogo</span>
                        <span>✦</span>
                    </Link>
                    <Link 
                        href="/nosotros" 
                        className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 text-base sm:text-lg font-black rounded-full text-white bg-[#5F2142] hover:bg-[#43142e] transition-all hover:scale-105 active:scale-95 hover:rotate-1 shadow-xl shadow-[#5F2142]/20"
                    >
                        <span>Quiénes Somos</span>
                        <span>❤</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}