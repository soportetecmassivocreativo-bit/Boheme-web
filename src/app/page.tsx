import Navbar from '@/components/ui/Navbar';
import HeroSection from '@/components/ui/HeroSection';
import MarqueeTicker from '@/components/ui/MarqueeTicker';
import AboutSection from '@/components/ui/AboutSection';
import Footer from '@/components/ui/Footer';
import Link from 'next/link';
import { 
    Heart, 
    ArrowUpRight, 
    Sparkles, 
    ChevronLeft, 
    ChevronRight,
    Smile,
    Ribbon,
    Stethoscope,
    Activity,
    Palette
} from 'lucide-react';

const CATEGORIAS_FAVORITES = [
    {
        slug: 'gorros',
        title: 'Gorros Quirúrgicos',
        subtitle: '100% Algodón • Frescos',
        tag: '★ TOP VENTAS',
        tagColor: 'bg-[#D86A33] text-white',
        image: '/cat_gorros.png',
        bgCard: 'bg-[#FFF9F5]',
        priceNote: 'Desde $8'
    },
    {
        slug: 'lanyards',
        title: 'Lanyards & Cintas',
        subtitle: 'Sublimados • Con Broche',
        tag: '★ PERSONALIZADOS',
        tagColor: 'bg-[#5F2142] text-[#FFC99C]',
        image: '/cat_accesorios.png',
        bgCard: 'bg-[#FAF1F5]',
        priceNote: 'Desde $3'
    },
    {
        slug: 'accesorios-medicos',
        title: 'Accesorios Médicos',
        subtitle: 'Tijeras, pines & koalas',
        tag: '★ ESENCIALES',
        tagColor: 'bg-[#D86A33] text-white',
        image: '/cat_accesorios.png',
        bgCard: 'bg-[#FFF9F5]',
        priceNote: 'Desde $2'
    },
    {
        slug: 'equipos-medicos',
        title: 'Equipos Médicos',
        subtitle: 'Estetoscopios & tensión',
        tag: '★ PRECISIÓN',
        tagColor: 'bg-[#5F2142] text-[#FFC99C]',
        image: '/cat_equipos.png',
        bgCard: 'bg-[#FAF1F5]',
        priceNote: 'Garantizados'
    },
    {
        slug: 'productos-personalizados',
        title: 'Personalizados',
        subtitle: 'Con tu nombre & diseño',
        tag: '★ A TU MEDIDA',
        tagColor: 'bg-[#D86A33] text-white',
        image: '/cat_accesorios.png',
        bgCard: 'bg-[#FFF9F5]',
        priceNote: 'Exclusivos'
    }
];

const CIRCLE_CATEGORIES = [
    { name: 'Gorros', icon: Smile, href: '/categorias/gorros', note: 'Estilo & Confort' },
    { name: 'Lanyards', icon: Ribbon, href: '/categorias/lanyards', note: 'Portacarnets' },
    { name: 'Accesorios', icon: Stethoscope, href: '/categorias/accesorios-medicos', note: 'Esenciales' },
    { name: 'Equipos', icon: Activity, href: '/categorias/equipos-medicos', note: 'Diagnóstico' },
    { name: 'Personalizados', icon: Palette, href: '/categorias/productos-personalizados', note: 'A Tu Medida' },
];

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col bg-white text-gray-900">
            <Navbar />
            <HeroSection />

            {/* 1. Infinite Chic Marquee Ribbon in Terracotta */}
            <MarqueeTicker variant="terracotta" />

            {/* 2. Paper Sunshine Style Quick Category Circle Bar */}
            <section className="py-10 bg-[#FFFDFB] border-b border-[#FFC99C]/30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none sm:justify-center sm:gap-10">
                        {CIRCLE_CATEGORIES.map((cat) => {
                            const IconComponent = cat.icon;
                            return (
                                <Link 
                                    key={cat.name} 
                                    href={cat.href}
                                    className="flex flex-col items-center text-center group flex-shrink-0"
                                >
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFF4EB] border-2 border-dashed border-[#D86A33]/40 group-hover:border-[#D86A33] group-hover:bg-[#5F2142] flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-sm">
                                        <IconComponent size={26} className="text-[#5F2142] group-hover:text-[#FFC99C] transition-colors" />
                                    </div>
                                    <span className="mt-2.5 font-black text-xs sm:text-sm text-[#5F2142] group-hover:text-[#D86A33] transition-colors">
                                        {cat.name}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium hidden sm:block">
                                        {cat.note}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 3. MODOA "New Favorites" Proportional Grid Section */}
            <section className="py-16 md:py-20 bg-white relative overflow-hidden">
                {/* Background ambient accents */}
                <div className="absolute top-1/3 left-10 w-72 h-72 bg-[#FFC99C]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#D86A33]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Header inspired by MODOA: "✦ New Favorites" */}
                    <div className="flex items-center justify-between mb-10 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <span className="text-[#D86A33] text-xl sm:text-2xl animate-spin-slow">✦</span>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#5F2142] tracking-tight">
                                New Favorites
                            </h2>
                            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#FFF4EB] text-[#D86A33] text-xs font-black uppercase">
                                Colección Boheme
                            </span>
                        </div>

                        {/* MODOA style arrows and link */}
                        <div className="flex items-center gap-3">
                            <Link 
                                href="/categorias/gorros" 
                                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black text-[#5F2142] hover:text-[#D86A33] transition-colors underline decoration-[#FFC99C] underline-offset-4"
                            >
                                <span>Ver todo</span>
                                <span>→</span>
                            </Link>
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <span className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#D86A33] hover:text-[#D86A33] transition-colors cursor-pointer">
                                    <ChevronLeft size={16} />
                                </span>
                                <span className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#D86A33] hover:text-[#D86A33] transition-colors cursor-pointer">
                                    <ChevronRight size={16} />
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Proportional MODOA Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
                        {CATEGORIAS_FAVORITES.map((cat) => (
                            <Link 
                                key={cat.slug} 
                                href={`/categorias/${cat.slug}`}
                                className={`group relative rounded-3xl p-3 sm:p-4 ${cat.bgCard} border border-[#FFC99C]/40 hover:border-[#D86A33] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between`}
                            >
                                {/* Top Tag & Heart */}
                                <div className="flex items-center justify-between mb-2 z-10">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${cat.tagColor}`}>
                                        {cat.tag}
                                    </span>
                                    <span className="w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#5F2142]/60 group-hover:text-[#D86A33] transition-colors shadow-xs">
                                        <Heart size={12} className="group-hover:fill-[#D86A33]" />
                                    </span>
                                </div>

                                {/* Product / Category Image Container */}
                                <div className="aspect-[4/3] rounded-2xl bg-white/70 overflow-hidden relative mb-3 flex items-center justify-center border border-black/5">
                                    <img 
                                        src={cat.image} 
                                        alt={cat.title} 
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>

                                {/* Bottom Info Row with MODOA Circular Action Button */}
                                <div className="pt-1">
                                    <h3 className="font-black text-sm sm:text-base text-[#5F2142] group-hover:text-[#D86A33] transition-colors line-clamp-1">
                                        {cat.title}
                                    </h3>
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mb-2 font-medium">
                                        {cat.subtitle}
                                    </p>

                                    <div className="flex items-center justify-between pt-1 border-t border-black/5">
                                        <span className="text-xs font-black text-[#D86A33]">
                                            {cat.priceNote}
                                        </span>
                                        <div className="w-7 h-7 rounded-full bg-[#D86A33] text-white flex items-center justify-center group-hover:bg-[#5F2142] group-hover:scale-110 transition-all shadow-sm">
                                            <ArrowUpRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. MODOA "Made for Everyday" Editorial Banner */}
            <section className="py-12 bg-[#FFF8F3] border-y border-[#FFC99C]/30 relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        
                        {/* Left: Lifestyle Imagery Container */}
                        <div className="md:col-span-5 relative rounded-3xl overflow-hidden shadow-lg bg-[#5F2142] aspect-[4/3] border-2 border-white">
                            <img 
                                src="/hero_bg.png" 
                                alt="Boheme Estilo Médico" 
                                className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4 washi-tape px-3 py-1 text-xs font-black text-[#5F2142] rounded shadow-xs">
                                ★ 100% ARTESANAL
                            </div>
                        </div>

                        {/* Right: Editorial Message */}
                        <div className="md:col-span-7 space-y-4">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#FFC99C] text-[#5F2142] text-xs font-black uppercase tracking-wider">
                                <Sparkles size={13} className="text-[#D86A33]" />
                                <span>Diseñado para tu Jornada</span>
                            </div>

                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#5F2142] tracking-tight leading-tight">
                                Hecho para el Día a Día <span className="text-[#D86A33]">✦</span>
                            </h3>

                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal max-w-xl">
                                Diseños pensados para médicos, enfermeros, odontólogos y amantes del estilo. Prendas frescas, elásticos cómodos y acabados de primera para que trabajes con la mejor actitud.
                            </p>

                            <div className="pt-2 flex flex-wrap gap-3">
                                <Link 
                                    href="/categorias/gorros" 
                                    className="px-6 py-2.5 rounded-full bg-[#5F2142] hover:bg-[#D86A33] text-white text-xs sm:text-sm font-black transition-all hover:scale-105 shadow-md flex items-center gap-2"
                                >
                                    <span>Ver Colección</span>
                                    <span>→</span>
                                </Link>
                                <Link 
                                    href="/nosotros" 
                                    className="px-6 py-2.5 rounded-full bg-white border border-[#5F2142]/30 text-[#5F2142] hover:border-[#5F2142] text-xs sm:text-sm font-black transition-all hover:scale-105 shadow-xs"
                                >
                                    Conoce Nuestra Historia
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 5. Infinite Chic Reverse Marquee in Wine (#5F2142) */}
            <MarqueeTicker variant="wine" reverse={true} />

            {/* 6. Identidad / Sobre Nosotros Section (Compact & Proportional) */}
            <AboutSection />

            {/* 7. Footer */}
            <Footer />
        </main>
    );
}