import { 
    ShieldCheck, 
    HeartHandshake, 
    Eye, 
    Lock, 
    Sparkles, 
    Users, 
    Zap, 
    Target, 
    Compass,
    Sparkle
} from 'lucide-react';

const VALORES = [
    {
        name: 'Responsabilidad',
        description: 'Compromiso total con la calidad, excelencia y cumplimiento en cada una de nuestras entregas.',
        icon: ShieldCheck,
        cardBorder: 'border-[#D86A33]/40 hover:border-[#D86A33]',
        iconStyle: 'text-[#D86A33] bg-[#D86A33]/15 border-[#D86A33]/30',
        badgeColor: 'text-[#D86A33]'
    },
    {
        name: 'Respeto',
        description: 'Cuidamos y valoramos a cada cliente, profesional de la salud y miembro de nuestro equipo.',
        icon: HeartHandshake,
        cardBorder: 'border-[#FFC99C]/40 hover:border-[#FFC99C]',
        iconStyle: 'text-[#FFC99C] bg-[#FFC99C]/15 border-[#FFC99C]/30',
        badgeColor: 'text-[#FFC99C]'
    },
    {
        name: 'Transparencia',
        description: 'Comunicación clara, honesta y directa en cada proceso, prenda y servicio.',
        icon: Eye,
        cardBorder: 'border-[#D86A33]/40 hover:border-[#D86A33]',
        iconStyle: 'text-[#D86A33] bg-[#D86A33]/15 border-[#D86A33]/30',
        badgeColor: 'text-[#D86A33]'
    },
    {
        name: 'Confianza',
        description: 'Relaciones sólidas respaldadas por nuestra puntualidad, compromiso y dedicación.',
        icon: Lock,
        cardBorder: 'border-[#FFC99C]/40 hover:border-[#FFC99C]',
        iconStyle: 'text-[#FFC99C] bg-[#FFC99C]/15 border-[#FFC99C]/30',
        badgeColor: 'text-[#FFC99C]'
    },
    {
        name: 'Creatividad',
        description: 'Diseños innovadores, colores vivos y personalizaciones que reflejan tu propia esencia.',
        icon: Sparkles,
        cardBorder: 'border-[#D86A33]/40 hover:border-[#D86A33]',
        iconStyle: 'text-[#D86A33] bg-[#D86A33]/15 border-[#D86A33]/30',
        badgeColor: 'text-[#D86A33]'
    },
    {
        name: 'Cercanía',
        description: 'Un trato cálido, humano y amigable que te hace sentir siempre en confianza y entre amigos.',
        icon: Users,
        cardBorder: 'border-[#FFC99C]/40 hover:border-[#FFC99C]',
        iconStyle: 'text-[#FFC99C] bg-[#FFC99C]/15 border-[#FFC99C]/30',
        badgeColor: 'text-[#FFC99C]'
    },
    {
        name: 'Eficiencia',
        description: 'Entregas súper puntuales y máxima agilidad en la atención y confección.',
        icon: Zap,
        cardBorder: 'border-[#D86A33]/40 hover:border-[#D86A33]',
        iconStyle: 'text-[#D86A33] bg-[#D86A33]/15 border-[#D86A33]/30',
        badgeColor: 'text-[#D86A33]'
    }
];

export default function AboutSection() {
    return (
        <section className="relative py-24 bg-white text-gray-900 overflow-hidden" id="nosotros">
            {/* Ambient Background Decorative Curves */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M-100,150 C300,100 500,500 720,400 C940,300 1100,100 1540,150" stroke="#D86A33" strokeWidth="2.5" strokeDasharray="6 6" />
                    <path d="M-80,180 C320,130 520,530 740,430 C960,330 1120,130 1560,180" stroke="#550C18" strokeWidth="1.5" />
                    <path d="M-50,220 C350,170 550,570 770,470 C990,370 1150,170 1590,220" stroke="#D86A33" strokeWidth="2" />
                </svg>
            </div>
            
            <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#FFC99C]/30 opacity-60 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 -left-32 w-96 h-96 bg-[#D86A33]/10 opacity-70 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
                
                {/* 1. Intro Card (Scrapbook / Chic Intro Card) */}
                <div className="relative rounded-3xl p-8 md:p-14 bg-[#550C18] text-white shadow-2xl shadow-black/20 transition-all duration-300 overflow-hidden">
                    {/* Background subtle checkered pattern */}
                    <div className="absolute inset-0 bg-checkered-peach opacity-5 pointer-events-none" />

                    {/* Washi Tape top right */}
                    <div className="absolute top-6 right-8 washi-tape px-4 py-1.5 text-xs font-black text-[#550C18] rounded-sm shadow-md hidden sm:block">
                        ★ HECHO CON AMOR
                    </div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D86A33]/30 border border-[#D86A33]/50 text-[#FFC99C] text-xs md:text-sm font-black tracking-wider uppercase mb-6">
                            <span>✦</span>
                            <span>Sobre Nosotros</span>
                            <span>✦</span>
                        </div>
                        
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
                            ¿Quiénes <span className="text-[#FFC99C] underline decoration-[#D86A33] decoration-wavy decoration-2">Somos?</span>
                        </h2>
                        
                        <div className="space-y-4 text-white/90 text-lg md:text-xl leading-relaxed max-w-4xl font-normal">
                            <p className="font-semibold text-white">
                                En Boheme le ponemos color, estilo y buena onda a tu rutina de trabajo. Diseñamos y fabricamos gorritos quirúrgicos y lanyards personalizados que combinan comodidad, excelente calidad y un toque único para tu día a día.
                            </p>
                            <p className="text-[#FFC99C]/90 font-light">
                                Nos apasiona acompañar al gremio de la salud y a profesionales de todo tipo con accesorios hechos a la medida, entregas súper puntuales y un trato cercano que te hace sentir entre amigos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Mission & Vision Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Misión Card (Warm Card with washi tape) */}
                    <div className="relative rounded-3xl p-8 md:p-10 bg-[#FFF4EB] border-2 border-dashed border-[#D86A33]/40 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col justify-between overflow-hidden hover:-rotate-0.5">
                        <div className="absolute top-4 right-6 washi-tape px-3 py-1 text-[11px] font-black text-[#550C18]">
                            ★ PROPÓSITO
                        </div>
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-[#D86A33] text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                                <Target size={28} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-[#550C18] tracking-tight mb-4 uppercase">
                                MISIÓN
                            </h3>
                            <p className="text-gray-700 text-base md:text-lg leading-relaxed font-normal">
                                Diseñar y fabricar gorritos quirúrgicos y lanyards personalizados de alta calidad que aporten comodidad, estilo y personalidad a la jornada diaria de nuestros clientes. Buscamos hacer más ameno el entorno profesional entregando productos únicos, hechos con dedicación, responsabilidad y la mejor energía.
                            </p>
                        </div>
                    </div>

                    {/* Visión Card (Wine Card with washi tape) */}
                    <div className="relative rounded-3xl p-8 md:p-10 bg-[#550C18] text-white shadow-xl hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between overflow-hidden hover:rotate-0.5">
                        <div className="absolute top-4 right-6 washi-tape-alt px-3 py-1 text-[11px] font-black text-white">
                            ★ VISIÓN 2025
                        </div>
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-[#FFC99C] text-[#550C18] flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                                <Compass size={28} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-[#FFC99C] tracking-tight mb-4 uppercase">
                                VISIÓN
                            </h3>
                            <p className="text-white/90 text-base md:text-lg leading-relaxed font-light">
                                Ser la marca favorita y más querida de gorritos y lanyards personalizados, destacando por nuestra creatividad, capacidad de respuesta y por transformar prendas de trabajo comunes en accesorios llenos de identidad y profesionalismo.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Values Section */}
                <div className="space-y-8 pt-6">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF4EB] border border-[#FFC99C] text-[#D86A33] text-xs font-black tracking-widest uppercase mb-2">
                            <span>✦</span>
                            <span>ADN BOHEME</span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black text-[#550C18] tracking-tight">
                            Nuestros <span className="text-[#D86A33]">Valores</span>
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {VALORES.map((valor) => {
                            const IconComponent = valor.icon;
                            return (
                                <div 
                                    key={valor.name}
                                    className="relative rounded-2xl p-6 bg-white border border-gray-100 hover:border-[#D86A33] shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#FFF4EB] border border-[#FFC99C] text-[#D86A33] flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-6 shadow-sm">
                                        <IconComponent size={22} />
                                    </div>
                                    <h4 className="text-lg font-black text-[#550C18] mb-2 group-hover:text-[#D86A33] transition-colors">
                                        {valor.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed font-normal">
                                        {valor.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </section>
    );
}
