'use client';

import { useState } from 'react';
import { 
    Check, 
    ShieldCheck, 
    Lock, 
    Sparkles, 
    Users
} from 'lucide-react';

type TabType = 'quienes-somos' | 'mision' | 'vision' | 'valores';

const TABS: { id: TabType; label: string }[] = [
    { id: 'quienes-somos', label: 'Quiénes Somos' },
    { id: 'mision', label: 'Misión' },
    { id: 'vision', label: 'Visión' },
    { id: 'valores', label: 'Valores' },
];

const VALORES_LIST = [
    {
        name: 'Responsabilidad',
        description: 'Compromiso total con la calidad, excelencia y cumplimiento en cada una de nuestras entregas.',
        icon: ShieldCheck,
        color: 'text-[#D86A33]',
        border: 'border-[#D86A33]/30',
        bg: 'bg-[#FFF9F5]'
    },
    {
        name: 'Confianza',
        description: 'Relaciones sólidas respaldadas por nuestras entregas personalizadas, compromiso y dedicación diaria.',
        icon: Lock,
        color: 'text-[#5F2142]',
        border: 'border-[#5F2142]/30',
        bg: 'bg-[#FAF4F7]'
    },
    {
        name: 'Creatividad',
        description: 'Diseños innovadores, colores vivos y personalizaciones que reflejan tu propia esencia.',
        icon: Sparkles,
        color: 'text-[#D86A33]',
        border: 'border-[#D86A33]/30',
        bg: 'bg-[#FFF9F5]'
    },
    {
        name: 'Cercanía',
        description: 'Un trato cálido, humano y amigable que te hace sentir siempre en confianza y entre amigos.',
        icon: Users,
        color: 'text-[#5F2142]',
        border: 'border-[#5F2142]/30',
        bg: 'bg-[#FAF4F7]'
    }
];

export default function AboutSection() {
    const [activeTab, setActiveTab] = useState<TabType>('quienes-somos');

    return (
        <section className="relative py-16 md:py-24 bg-white text-gray-900" id="nosotros">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* 1. Header with Badge & Title matching reference layout */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase text-[#D86A33] mb-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D86A33]" />
                        <span>NOSOTROS</span>
                    </div>
                    
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#5F2142] tracking-tight">
                        ¿Quiénes Somos?
                    </h2>
                </div>

                {/* 2. Interactive Navigation Tabs Bar with Active Line */}
                <div className="border-b border-gray-200 mb-8 overflow-x-auto scrollbar-none">
                    <div className="flex gap-8 sm:gap-12 whitespace-nowrap min-w-max">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-3 text-base sm:text-lg font-bold transition-all relative ${
                                        isActive 
                                            ? 'text-[#D86A33]' 
                                            : 'text-gray-500 hover:text-[#5F2142]'
                                    }`}
                                >
                                    {tab.label}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D86A33] rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Tab Content Area */}
                <div className="min-h-[280px]">
                    
                    {/* TAB: Quiénes Somos */}
                    {activeTab === 'quienes-somos' && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-xl sm:text-2xl font-bold text-[#5F2142] tracking-tight">
                                Le ponemos color, estilo y buena onda a tu rutina diaria
                            </h3>
                            
                            <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-normal">
                                En <strong className="text-[#5F2142] font-black">Boheme</strong> diseñamos y fabricamos gorritos quirúrgicos, lanyards y accesorios médicos personalizados que combinan comodidad, excelente calidad y un toque único para tu día a día.
                            </p>
                            
                            <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-normal">
                                Nos apasiona acompañar al gremio de la salud y a profesionales de todo tipo con accesorios hechos a la medida, entregas personalizadas y un trato cercano que te hace sentir siempre en confianza.
                            </p>

                            <ul className="space-y-3.5 pt-2">
                                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                                    <span className="w-5 h-5 rounded-full bg-[#FFF4EB] border border-[#D86A33]/40 text-[#D86A33] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                        <Check size={13} strokeWidth={3} />
                                    </span>
                                    <span>Confección 100% artesanal con atención al más mínimo detalle.</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                                    <span className="w-5 h-5 rounded-full bg-[#FFF4EB] border border-[#D86A33]/40 text-[#D86A33] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                        <Check size={13} strokeWidth={3} />
                                    </span>
                                    <span>Telas transpirables, frescas y elásticos suaves para largas guardias y turnos.</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                                    <span className="w-5 h-5 rounded-full bg-[#FFF4EB] border border-[#D86A33]/40 text-[#D86A33] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                        <Check size={13} strokeWidth={3} />
                                    </span>
                                    <span>Personalización completa con tu nombre, logo o especialidad médica.</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                                    <span className="w-5 h-5 rounded-full bg-[#FFF4EB] border border-[#D86A33]/40 text-[#D86A33] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                        <Check size={13} strokeWidth={3} />
                                    </span>
                                    <span>Envíos garantizados a toda Venezuela con entregas personalizadas.</span>
                                </li>
                            </ul>
                        </div>
                    )}

                    {/* TAB: Misión */}
                    {activeTab === 'mision' && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-xl sm:text-2xl font-bold text-[#5F2142] tracking-tight">
                                Nuestro Propósito: Confort, estilo y personalidad en cada turno
                            </h3>
                            
                            <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-normal">
                                Diseñar y fabricar gorritos quirúrgicos y lanyards personalizados de alta calidad que aporten comodidad, estilo y personalidad a la jornada diaria de nuestros clientes.
                            </p>
                            
                            <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-normal">
                                Buscamos hacer más ameno el entorno profesional entregando productos únicos, hechos con dedicación, responsabilidad y la mejor energía.
                            </p>

                            <ul className="space-y-3.5 pt-2">
                                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                                    <span className="w-5 h-5 rounded-full bg-[#FFF4EB] border border-[#D86A33]/40 text-[#D86A33] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                        <Check size={13} strokeWidth={3} />
                                    </span>
                                    <span>Prendas diseñadas para acompañar la vocación de los profesionales de la salud.</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                                    <span className="w-5 h-5 rounded-full bg-[#FFF4EB] border border-[#D86A33]/40 text-[#D86A33] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                        <Check size={13} strokeWidth={3} />
                                    </span>
                                    <span>Materiales duraderos que resisten lavados continuos sin perder su brillo y color.</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                                    <span className="w-5 h-5 rounded-full bg-[#FFF4EB] border border-[#D86A33]/40 text-[#D86A33] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                        <Check size={13} strokeWidth={3} />
                                    </span>
                                    <span>Compromiso ético, atención empática y máxima dedicación en cada detalle.</span>
                                </li>
                            </ul>
                        </div>
                    )}

                    {/* TAB: Visión */}
                    {activeTab === 'vision' && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-xl sm:text-2xl font-bold text-[#5F2142] tracking-tight">
                                Nuestra Meta: Ser la marca referente y más querida de accesorios médicos
                            </h3>
                            
                            <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-normal">
                                Ser la marca favorita y más querida de gorritos y lanyards personalizados, destacando por nuestra creatividad, capacidad de respuesta y por transformar prendas de trabajo comunes en accesorios llenos de identidad y profesionalismo.
                            </p>
                            
                            <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-normal">
                                Aspiramos a seguir creciendo junto a nuestra comunidad médica, vistiendo con orgullo cada turno y cada historia en hospitales y clínicas de todo el país.
                            </p>

                            <ul className="space-y-3.5 pt-2">
                                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                                    <span className="w-5 h-5 rounded-full bg-[#FFF4EB] border border-[#D86A33]/40 text-[#D86A33] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                        <Check size={13} strokeWidth={3} />
                                    </span>
                                    <span>Liderazgo en diseño, ergonomía y personalización de indumentaria clínica.</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                                    <span className="w-5 h-5 rounded-full bg-[#FFF4EB] border border-[#D86A33]/40 text-[#D86A33] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                        <Check size={13} strokeWidth={3} />
                                    </span>
                                    <span>Ampliación continua de nuestro catálogo con herramientas y accesorios esenciales.</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                                    <span className="w-5 h-5 rounded-full bg-[#FFF4EB] border border-[#D86A33]/40 text-[#D86A33] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                        <Check size={13} strokeWidth={3} />
                                    </span>
                                    <span>Crear una comunidad médica que celebre el bienestar, el color y el optimismo.</span>
                                </li>
                            </ul>
                        </div>
                    )}

                    {/* TAB: Valores */}
                    {activeTab === 'valores' && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-xl sm:text-2xl font-bold text-[#5F2142] tracking-tight">
                                Los 4 pilares fundamentales que inspiran cada puntada
                            </h3>
                            
                            <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-normal mb-4">
                                Guiamos cada confección, proceso y entrega bajo principios sólidos que garantizan confianza y excelencia:
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                {VALORES_LIST.map((val) => {
                                    const IconComponent = val.icon;
                                    return (
                                        <div 
                                            key={val.name}
                                            className={`p-5 rounded-2xl ${val.bg} border ${val.border} shadow-2xs flex gap-4 items-start`}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-2xs">
                                                <IconComponent size={20} className={val.color} />
                                            </div>
                                            <div>
                                                <h4 className={`text-base font-black ${val.color} mb-1`}>
                                                    {val.name}
                                                </h4>
                                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                                                    {val.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </div>

            </div>
        </section>
    );
}
