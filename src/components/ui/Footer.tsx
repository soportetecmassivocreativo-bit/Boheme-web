import Link from 'next/link';
import { 
    MapPin, 
    Phone, 
    Mail, 
    MessageCircle, 
    ShoppingBag, 
    Sparkles 
} from 'lucide-react';

const WHATSAPP_NUMBER = "584121409976";

export default function Footer() {
    return (
        <footer className="bg-[#3d0710] text-[#FFF5EE] pt-16 pb-12 border-t border-[#D86A33]/25 relative overflow-hidden">
            {/* Ambient glows with #D86A33 & #FFC99C */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D86A33]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#FFC99C]/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Giant Background Wordmark / Watermark for Awwwards chic style */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 select-none pointer-events-none text-white/[0.03] font-black text-[18vw] leading-none tracking-tighter whitespace-nowrap z-0">
                BOHEME
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Top Grid: 4 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-[#D86A33]/20">
                    
                    {/* Col 1: Brand info & Socials (Span 4) */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link href="/" className="inline-block group">
                            <img 
                                src="/logo-peach.png" 
                                alt="BOHEME" 
                                className="w-[150px] h-auto object-contain transition-transform group-hover:scale-105 drop-shadow-md"
                            />
                        </Link>
                        
                        <p className="text-[#FFF5EE]/80 text-sm md:text-base leading-relaxed max-w-sm font-light">
                            Le ponemos color, estilo y buena onda a tu rutina de trabajo. Gorritos quirúrgicos, lanyards y accesorios médicos con diseño único y máxima calidad.
                        </p>

                        {/* Social Buttons with alternating chic sticker badges */}
                        <div className="flex items-center gap-3 pt-2">
                            <a 
                                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola BOHEME! Quisiera hacer una consulta:`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-11 h-11 rounded-full bg-[#550C18] border border-[#D86A33]/40 flex items-center justify-center text-[#FFC99C] hover:text-white hover:bg-[#D86A33] hover:border-[#D86A33] hover:-rotate-6 transition-all duration-300 shadow-md hover:scale-110"
                                aria-label="WhatsApp"
                            >
                                <MessageCircle size={18} />
                            </a>
                            <a 
                                href="https://instagram.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-11 h-11 rounded-full bg-[#550C18] border border-[#FFC99C]/40 flex items-center justify-center text-[#D86A33] hover:text-[#550C18] hover:bg-[#FFC99C] hover:border-[#FFC99C] hover:rotate-6 transition-all duration-300 shadow-md hover:scale-110"
                                aria-label="Instagram"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                                </svg>
                            </a>
                            <Link 
                                href="/categorias/gorros" 
                                className="w-11 h-11 rounded-full bg-[#550C18] border border-[#D86A33]/40 flex items-center justify-center text-[#FFC99C] hover:text-white hover:bg-[#D86A33] hover:border-[#D86A33] hover:-rotate-3 transition-all duration-300 shadow-md hover:scale-110"
                                aria-label="Catálogo"
                            >
                                <ShoppingBag size={18} />
                            </Link>
                        </div>
                    </div>

                    {/* Col 2: Colecciones / Categorías (Span 3) */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="inline-block washi-tape-alt text-xs font-black text-white px-3 py-0.5 rounded -rotate-2 mb-2">
                            ★ CATÁLOGO
                        </div>
                        <ul className="space-y-2.5 text-sm text-[#FFF5EE]/80 font-medium">
                            <li>
                                <Link href="/categorias/gorros" className="hover:text-[#FFC99C] transition-colors inline-flex items-center gap-1.5 group">
                                    <span className="text-[#D86A33] text-xs transition-transform group-hover:translate-x-1">✦</span>
                                    Gorros Quirúrgicos
                                </Link>
                            </li>
                            <li>
                                <Link href="/categorias/lanyards" className="hover:text-[#FFC99C] transition-colors inline-flex items-center gap-1.5 group">
                                    <span className="text-[#D86A33] text-xs transition-transform group-hover:translate-x-1">✦</span>
                                    Lanyards & Portacarnets
                                </Link>
                            </li>
                            <li>
                                <Link href="/categorias/accesorios-medicos" className="hover:text-[#FFC99C] transition-colors inline-flex items-center gap-1.5 group">
                                    <span className="text-[#D86A33] text-xs transition-transform group-hover:translate-x-1">✦</span>
                                    Accesorios Médicos
                                </Link>
                            </li>
                            <li>
                                <Link href="/categorias/equipos-medicos" className="hover:text-[#FFC99C] transition-colors inline-flex items-center gap-1.5 group">
                                    <span className="text-[#D86A33] text-xs transition-transform group-hover:translate-x-1">✦</span>
                                    Equipos Médicos
                                </Link>
                            </li>
                            <li>
                                <Link href="/categorias/productos-personalizados" className="hover:text-[#FFC99C] transition-colors inline-flex items-center gap-1.5 group">
                                    <span className="text-[#D86A33] text-xs transition-transform group-hover:translate-x-1">✦</span>
                                    Productos Personalizados
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 3: Navegación & Empresa (Span 2) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="inline-block washi-tape text-xs font-black text-[#550C18] px-3 py-0.5 rounded rotate-1 mb-2">
                            ★ BOHEME
                        </div>
                        <ul className="space-y-2.5 text-sm text-[#FFF5EE]/80 font-medium">
                            <li>
                                <Link href="/" className="hover:text-[#FFC99C] transition-colors inline-flex items-center gap-1.5 group">
                                    <span className="text-[#FFC99C] text-xs transition-transform group-hover:translate-x-1">✦</span>
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link href="/nosotros" className="hover:text-[#FFC99C] transition-colors inline-flex items-center gap-1.5 group">
                                    <span className="text-[#FFC99C] text-xs transition-transform group-hover:translate-x-1">✦</span>
                                    Quiénes Somos
                                </Link>
                            </li>
                            <li>
                                <Link href="/nosotros#mision" className="hover:text-[#FFC99C] transition-colors inline-flex items-center gap-1.5 group">
                                    <span className="text-[#FFC99C] text-xs transition-transform group-hover:translate-x-1">✦</span>
                                    Misión & Visión
                                </Link>
                            </li>
                            <li>
                                <Link href="/nosotros#valores" className="hover:text-[#FFC99C] transition-colors inline-flex items-center gap-1.5 group">
                                    <span className="text-[#FFC99C] text-xs transition-transform group-hover:translate-x-1">✦</span>
                                    Nuestros Valores
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 4: Atención & Ubicación (Span 3) */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="inline-block bg-[#FFC99C] text-xs font-black text-[#550C18] px-3 py-0.5 rounded-full -rotate-1 mb-2">
                            ★ CONTACTO
                        </div>
                        
                        <div className="space-y-3 text-sm text-[#FFF5EE]/80 font-light">
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-[#D86A33] shrink-0 mt-0.5" />
                                <span>Venezuela • Envíos a Nivel Nacional</span>
                            </div>

                            <a 
                                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola BOHEME! Quisiera hacer una consulta:`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 hover:text-[#FFC99C] transition-colors group"
                            >
                                <Phone size={18} className="text-[#FFC99C] shrink-0 group-hover:scale-110 transition-transform" />
                                <span>WhatsApp: +58 412-1409976</span>
                            </a>

                            <div className="flex items-center gap-3">
                                <Mail size={18} className="text-[#D86A33] shrink-0" />
                                <span>Atención personalizada</span>
                            </div>
                        </div>

                        {/* Badge de confianza */}
                        <div className="pt-2">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#550C18] border border-[#FFC99C]/40 text-xs font-bold text-[#FFC99C] shadow-sm hover:scale-105 transition-transform">
                                <span>✦</span> 100% Calidad y Dedicación
                            </span>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar: Copyright (Centered) */}
                <div className="pt-8 flex flex-col items-center justify-center text-center gap-2 text-xs text-[#FFC99C]/80 font-light">
                    <p>© 2022 BOHEME. Todos los derechos reservados.</p>
                    <p className="flex items-center justify-center gap-1.5">
                        Diseñado con <span className="text-[#D86A33] font-bold animate-pulse">❤</span> para los Héroes de la Salud
                    </p>
                </div>
            </div>
        </footer>
    );
}
