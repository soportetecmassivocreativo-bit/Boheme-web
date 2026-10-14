import Navbar from '@/components/ui/Navbar';
import AboutSection from '@/components/ui/AboutSection';
import Footer from '@/components/ui/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quiénes Somos | BOHEME',
    description: 'Conoce la historia, misión, visión y valores de Boheme. Gorritos quirúrgicos y lanyards personalizados con estilo, comodidad y dedicación.',
};

export default function NosotrosPage() {
    return (
        <main className="min-h-screen flex flex-col bg-white pt-20">
            <Navbar />

            {/* About / Identity Component matching Colibri structure */}
            <AboutSection />

            {/* Bottom CTA Box */}
            <section className="pb-24 bg-white relative">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-[#FFF9F5] border-2 border-dashed border-[#5F2142]/30 text-gray-900 rounded-3xl p-8 md:p-12 text-center shadow-sm relative overflow-hidden">
                        {/* Washi Tape Header Pin */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                            <span className="washi-tape text-xs font-black text-[#5F2142] px-5 py-1 tracking-widest uppercase inline-block -rotate-1 shadow-xs">
                                ★ ÚNETE AL ESTILO BOHEME ★
                            </span>
                        </div>

                        {/* Background subtle glow */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D86A33]/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#FFC99C]/20 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <span className="text-[#D86A33] text-xs font-black tracking-widest uppercase mb-3 inline-block">
                                ✦ PERSONALIZA TU LOOK ✦
                            </span>
                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 text-[#5F2142] tracking-tight">
                                ¿Listo para destacar en cada turno?
                            </h3>
                            <p className="text-gray-600 max-w-xl mx-auto mb-8 text-sm sm:text-base font-normal leading-relaxed">
                                Descubre nuestra colección de gorritos, lanyards y accesorios médicos diseñados para combinar máxima comodidad y estilo único.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link 
                                    href="/categorias/gorros" 
                                    className="px-8 py-3.5 bg-[#D86A33] hover:bg-[#c25925] text-white font-black rounded-full transition-all hover:scale-105 shadow-md shadow-[#D86A33]/25 flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    <span>Ver Gorros</span>
                                    <span>→</span>
                                </Link>
                                <Link 
                                    href="/categorias/lanyards" 
                                    className="px-8 py-3.5 bg-[#5F2142] hover:bg-[#43142e] text-white font-black rounded-full transition-all hover:scale-105 shadow-md shadow-[#5F2142]/20 flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    <span>Ver Lanyards</span>
                                    <span>→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </main>
    );
}
