import { 
    ShieldCheck, 
    Lock, 
    Sparkles, 
    Users, 
    Target, 
    Compass
} from 'lucide-react';

const VALORES = [
    {
        name: 'Responsabilidad',
        description: 'Compromiso total con la calidad, excelencia y cumplimiento en cada una de nuestras entregas.',
        icon: ShieldCheck,
        badgeColor: 'text-[#D86A33]',
        iconBg: 'bg-[#FFF4EB] border-[#D86A33]/30 text-[#D86A33]'
    },
    {
        name: 'Confianza',
        description: 'Relaciones sólidas respaldadas por nuestra puntualidad, compromiso y dedicación diaria.',
        icon: Lock,
        badgeColor: 'text-[#5F2142]',
        iconBg: 'bg-[#FAF1F5] border-[#5F2142]/20 text-[#5F2142]'
    },
    {
        name: 'Creatividad',
        description: 'Diseños innovadores, colores vivos y personalizaciones que reflejan tu propia esencia.',
        icon: Sparkles,
        badgeColor: 'text-[#D86A33]',
        iconBg: 'bg-[#FFF4EB] border-[#D86A33]/30 text-[#D86A33]'
    },
    {
        name: 'Cercanía',
        description: 'Un trato cálido, humano y amigable que te hace sentir siempre en confianza y entre amigos.',
        icon: Users,
        badgeColor: 'text-[#5F2142]',
        iconBg: 'bg-[#FAF1F5] border-[#5F2142]/20 text-[#5F2142]'
    }
];

export default function AboutSection() {
    return (
        <section className="relative py-16 md:py-20 bg-white text-gray-900 overflow-hidden" id="nosotros">
            {/* Ambient Background Decorative Accents */}
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#FFC99C]/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 -left-20 w-80 h-80 bg-[#5F2142]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
                
                {/* 1. Quiénes Somos Card - Proportional & Picturesque Boutique Card */}
                <div className="relative rounded-3xl p-6 sm:p-8 md:p-10 bg-gradient-to-br from-[#5F2142] to-[#43142e] text-white shadow-xl overflow-hidden border border-[#5F2142]/20">
                    {/* Background subtle texture */}
                    <div className="absolute inset-0 bg-checkered-peach opacity-5 pointer-events-none" />

                    {/* Washi Tape Badge */}
                    <div className="absolute top-4 right-6 washi-tape px-3 py-1 text-[11px] font-black text-[#5F2142] rounded shadow-sm hidden sm:block">
                        ★ HECHO CON AMOR
                    </div>

                    <div className="relative z-10 max-w-3xl">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D86A33]/30 border border-[#D86A33]/50 text-[#FFC99C] text-xs font-black tracking-wider uppercase mb-4">
                            <span>✦</span>
                            <span>Sobre Nosotros</span>
                            <span>✦</span>
                        </div>
                        
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                            ¿Quiénes <span className="text-[#FFC99C] underline decoration-[#D86A33] decoration-wavy decoration-2">Somos?</span>
                        </h2>
                        
                        <div className="space-y-3 text-white/90 text-sm sm:text-base leading-relaxed font-normal">
                            <p>
                                En <strong className="text-white font-black">Boheme</strong> le ponemos color, estilo y buena onda a tu rutina de trabajo. Diseñamos y fabricamos gorritos quirúrgicos y lanyards personalizados que combinan comodidad, excelente calidad y un toque único para tu día a día.
                            </p>
                            <p className="text-[#FFC99C]/90 font-light">
                                Nos apasiona acompañar al gremio de la salud y a profesionales de todo tipo con accesorios hechos a la medida, entregas súper puntuales y un trato cercano que te hace sentir entre amigos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Misión y Visión - Proportional Side-by-Side Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Misión Card */}
                    <div className="relative rounded-3xl p-6 sm:p-7 bg-[#FFF8F3] border-2 border-dashed border-[#D86A33]/40 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-3.5 right-5 washi-tape px-2.5 py-0.5 text-[10px] font-black text-[#5F2142]">
                            ★ PROPÓSITO
                        </div>
                        <div>
                            <div className="w-11 h-11 rounded-xl bg-[#D86A33] text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                                <Target size={22} />
                            </div>
                            <h3 className="text-xl font-black text-[#5F2142] tracking-tight mb-2.5 uppercase">
                                Misión
                            </h3>
                            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-normal">
                                Diseñar y fabricar gorritos quirúrgicos y lanyards personalizados de alta calidad que aporten comodidad, estilo y personalidad a la jornada diaria de nuestros clientes, haciendo más ameno su entorno profesional con productos únicos y la mejor energía.
                            </p>
                        </div>
                    </div>

                    {/* Visión Card */}
                    <div className="relative rounded-3xl p-6 sm:p-7 bg-[#FAF1F5] border-2 border-dashed border-[#5F2142]/30 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-3.5 right-5 washi-tape-alt px-2.5 py-0.5 text-[10px] font-black text-white">
                            ★ VISIÓN
                        </div>
                        <div>
                            <div className="w-11 h-11 rounded-xl bg-[#5F2142] text-[#FFC99C] flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                                <Compass size={22} />
                            </div>
                            <h3 className="text-xl font-black text-[#5F2142] tracking-tight mb-2.5 uppercase">
                                Visión
                            </h3>
                            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-normal">
                                Ser la marca favorita y más querida de gorritos y lanyards personalizados, destacando por nuestra creatividad, capacidad de respuesta y por transformar prendas de trabajo comunes en accesorios llenos de identidad y profesionalismo.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Valores Section - 4 Aligned Proportional Cards (Sin Respeto, Transparencia ni Eficiencia) */}
                <div className="space-y-6 pt-2">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFF4EB] border border-[#FFC99C] text-[#D86A33] text-[11px] font-black tracking-widest uppercase mb-1.5">
                            <span>✦</span>
                            <span>ADN BOHEME</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-[#5F2142] tracking-tight">
                            Nuestros <span className="text-[#D86A33]">Valores</span>
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        {VALORES.map((valor) => {
                            const IconComponent = valor.icon;
                            return (
                                <div 
                                    key={valor.name}
                                    className="relative rounded-2xl p-5 bg-white border border-gray-100 hover:border-[#D86A33]/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                                >
                                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${valor.iconBg}`}>
                                        <IconComponent size={19} />
                                    </div>
                                    <h4 className="text-base font-black text-[#5F2142] mb-1.5 group-hover:text-[#D86A33] transition-colors">
                                        {valor.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 leading-relaxed font-normal">
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
