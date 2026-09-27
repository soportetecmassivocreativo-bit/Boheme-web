import Navbar from '@/components/ui/Navbar';
import HeroSection from '@/components/ui/HeroSection';
import MarqueeTicker from '@/components/ui/MarqueeTicker';
import AboutSection from '@/components/ui/AboutSection';
import Footer from '@/components/ui/Footer';
import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col bg-white text-gray-900">
            <Navbar />
            <HeroSection />

            {/* 1. Infinite Chic Marquee Ribbon in Terracotta */}
            <MarqueeTicker variant="terracotta" />

            {/* 2. Featured Categories Grid with Bento / Chic Styling */}
            <section className="py-24 bg-[#FFFDFB] relative overflow-hidden">
                {/* Background ambient accents */}
                <div className="absolute top-1/3 left-10 w-80 h-80 bg-[#FFC99C]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#D86A33]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Header with chic stamp */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF4EB] border border-[#FFC99C] text-[#D86A33] text-xs font-black tracking-widest uppercase mb-3">
                                <span>✦</span>
                                <span>Colecciones Boheme</span>
                                <span>✦</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#550C18] tracking-tight">
                                Explora Nuestras Categorías
                            </h2>
                        </div>
                        <Link 
                            href="/categorias/gorros" 
                            className="inline-flex items-center gap-2 text-sm font-black text-[#D86A33] hover:text-[#550C18] transition-colors underline decoration-[#FFC99C] decoration-2 underline-offset-4 group"
                        >
                            <span>Ver todo el catálogo</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>

                    {/* Bento Categories Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        
                        {/* Card 1: Gorros Quirúrgicos (Span 7 - Large Bento Card) */}
                        <Link 
                            href="/categorias/gorros" 
                            className="md:col-span-7 group relative rounded-3xl overflow-hidden min-h-[380px] md:min-h-[440px] bg-[#550C18] flex items-end p-8 border-2 border-transparent hover:border-[#D86A33] transition-all duration-500 hover:shadow-2xl hover:shadow-[#D86A33]/20 hover:-rotate-0.5"
                        >
                            <img src="/cat_gorros.png" alt="Gorros" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#550C18] via-[#550C18]/40 to-transparent z-10" />
                            
                            {/* Washi Tape top sticker */}
                            <div className="absolute top-6 left-6 z-20 washi-tape px-4 py-1.5 text-xs font-black text-[#550C18] rounded-sm">
                                ★ TOP VENTAS
                            </div>

                            <div className="relative z-20 w-full">
                                <span className="inline-block px-3.5 py-1 rounded-full bg-[#D86A33] text-white text-xs font-black mb-2 shadow-md">
                                    Estrella Boheme
                                </span>
                                <h3 className="text-3xl md:text-4xl font-black text-white group-hover:text-[#FFC99C] transition-colors">
                                    Gorros Quirúrgicos
                                </h3>
                                <p className="mt-2 text-sm text-[#FFC99C]/90 max-w-md font-normal">
                                    Confección artesanal, telas frescas, elásticos cómodos y estampados exclusivos hechos para ti.
                                </p>
                            </div>
                        </Link>

                        {/* Card 2: Lanyards & Portacarnets (Span 5) */}
                        <Link 
                            href="/categorias/lanyards" 
                            className="md:col-span-5 group relative rounded-3xl overflow-hidden min-h-[380px] md:min-h-[440px] bg-[#550C18] flex items-end p-8 border-2 border-transparent hover:border-[#FFC99C] transition-all duration-500 hover:shadow-2xl hover:shadow-[#FFC99C]/20 hover:rotate-0.5"
                        >
                            <img src="/cat_accesorios.png" alt="Lanyards" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#550C18] via-[#550C18]/40 to-transparent z-10" />
                            
                            {/* Stamp sticker */}
                            <div className="absolute top-6 right-6 z-20 w-16 h-16 rounded-full bg-[#FFF4EB] border-2 border-dashed border-[#D86A33] p-1 flex items-center justify-center text-center -rotate-12 group-hover:rotate-0 transition-transform">
                                <span className="text-[9px] font-black text-[#550C18] leading-tight">100%<br /><span className="text-[#D86A33]">CHIC</span></span>
                            </div>

                            <div className="relative z-20 w-full">
                                <span className="inline-block px-3.5 py-1 rounded-full bg-[#FFC99C] text-[#550C18] text-xs font-black mb-2 shadow-md">
                                    Personalizados
                                </span>
                                <h3 className="text-2xl md:text-3xl font-black text-white group-hover:text-[#FFC99C] transition-colors">
                                    Lanyards & Cintas
                                </h3>
                                <p className="mt-2 text-sm text-[#FFC99C]/90 font-normal">
                                    Cintas sublimadas de alta resistencia con broches seguros.
                                </p>
                            </div>
                        </Link>

                        {/* Card 3: Accesorios Médicos (Span 4) */}
                        <Link 
                            href="/categorias/accesorios-medicos" 
                            className="md:col-span-4 group relative rounded-3xl overflow-hidden min-h-[320px] bg-[#550C18] flex items-end p-6 border-2 border-transparent hover:border-[#D86A33] transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                        >
                            <img src="/cat_accesorios.png" alt="Accesorios" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#550C18] via-[#550C18]/40 to-transparent z-10" />
                            
                            <div className="relative z-20 w-full">
                                <span className="inline-block px-3 py-0.5 rounded-full bg-[#D86A33] text-white text-[11px] font-black mb-1.5 shadow-sm">
                                    Esenciales
                                </span>
                                <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-[#FFC99C] transition-colors">
                                    Accesorios Médicos
                                </h3>
                            </div>
                        </Link>

                        {/* Card 4: Equipos Médicos (Span 4) */}
                        <Link 
                            href="/categorias/equipos-medicos" 
                            className="md:col-span-4 group relative rounded-3xl overflow-hidden min-h-[320px] bg-[#550C18] flex items-end p-6 border-2 border-transparent hover:border-[#FFC99C] transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                        >
                            <img src="/cat_equipos.png" alt="Equipos" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#550C18] via-[#550C18]/40 to-transparent z-10" />
                            
                            <div className="relative z-20 w-full">
                                <span className="inline-block px-3 py-0.5 rounded-full bg-[#FFC99C] text-[#550C18] text-[11px] font-black mb-1.5 shadow-sm">
                                    Alta Precisión
                                </span>
                                <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-[#FFC99C] transition-colors">
                                    Equipos Médicos
                                </h3>
                            </div>
                        </Link>

                        {/* Card 5: Personalizados (Span 4) */}
                        <Link 
                            href="/categorias/productos-personalizados" 
                            className="md:col-span-4 group relative rounded-3xl overflow-hidden min-h-[320px] bg-gradient-to-br from-[#550C18] to-[#3d0710] flex items-end p-6 border-2 border-dashed border-[#D86A33]/50 hover:border-[#D86A33] transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 bg-checkered-peach opacity-10 pointer-events-none" />
                            <div className="absolute top-4 right-4 text-2xl animate-spin-slow">✦</div>
                            
                            <div className="relative z-20 w-full">
                                <span className="inline-block px-3 py-0.5 rounded-full bg-[#D86A33] text-white text-[11px] font-black mb-1.5 shadow-sm">
                                    A Tu Medida
                                </span>
                                <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-[#FFC99C] transition-colors">
                                    Personalizados
                                </h3>
                                <p className="mt-1 text-xs text-[#FFC99C]/90 font-light">
                                    Gorritos y lanyards con tu nombre, logo o especialidad.
                                </p>
                            </div>
                        </Link>

                    </div>
                </div>
            </section>

            {/* 3. Infinite Chic Reverse Marquee in Wine */}
            <MarqueeTicker variant="wine" reverse={true} />

            {/* 4. Identidad / Sobre Nosotros Section */}
            <AboutSection />

            {/* 5. Footer */}
            <Footer />
        </main>
    );
}