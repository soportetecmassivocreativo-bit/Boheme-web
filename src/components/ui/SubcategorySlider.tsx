'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Subcategory } from '@/lib/db';

interface SubcategorySliderProps {
    categoria: string;
    subcategories: Subcategory[];
    activeSubcategoriaId?: number;
    buscar?: string;
}

export default function SubcategorySlider({
    categoria,
    subcategories,
    activeSubcategoriaId,
    buscar,
}: SubcategorySliderProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollState = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 8);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };

    useEffect(() => {
        updateScrollState();
        const el = scrollRef.current;
        if (!el) return;

        // Center active pill if any
        const activeEl = el.querySelector('[data-active="true"]') as HTMLElement | null;
        if (activeEl) {
            const offset = activeEl.offsetLeft - el.clientWidth / 2 + activeEl.clientWidth / 2;
            el.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
        }

        el.addEventListener('scroll', updateScrollState, { passive: true });
        window.addEventListener('resize', updateScrollState);
        return () => {
            el.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [activeSubcategoriaId, subcategories.length]);

    const scrollByAmount = (direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = direction === 'left' ? -210 : 210;
        el.scrollBy({ left: amount, behavior: 'smooth' });
    };

    const allParams = new URLSearchParams();
    if (buscar && buscar.trim()) allParams.set('buscar', buscar.trim());
    const allQs = allParams.toString();

    return (
        <div className="mb-8 space-y-2">
            {/* Indicador superior en móvil para que el usuario sepa que puede deslizar */}
            <div className="flex items-center justify-between px-1 sm:hidden">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#5F2142]/80">
                    Explora por categoría:
                </span>
                <button
                    type="button"
                    onClick={() => scrollByAmount(canScrollRight ? 'right' : 'left')}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF4EB] border border-[#FFC99C] text-[11px] font-black text-[#D86A33] active:scale-95 transition-transform"
                >
                    <span>Desliza para ver más</span>
                    <ChevronRight size={13} className="animate-pulse" />
                </button>
            </div>

            <div className="relative flex items-center">
                {/* Botón Flecha Izquierda */}
                <button
                    type="button"
                    onClick={() => scrollByAmount('left')}
                    aria-label="Deslizar categorías a la izquierda"
                    className={`shrink-0 mr-1.5 w-9 h-9 rounded-full border flex items-center justify-center transition-all shadow-sm ${
                        canScrollLeft
                            ? 'bg-white border-[#D86A33] text-[#D86A33] hover:bg-[#D86A33] hover:text-white active:scale-95'
                            : 'bg-gray-50 border-gray-200 text-gray-300 opacity-60'
                    }`}
                >
                    <ChevronLeft size={18} strokeWidth={2.6} />
                </button>

                {/* Contenedor deslizable de categorías */}
                <div className="relative flex-1 min-w-0 overflow-hidden">
                    <div
                        ref={scrollRef}
                        className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-1.5 px-1 no-scrollbar scroll-smooth"
                    >
                        <Link
                            href={`/categorias/${categoria}${allQs ? `?${allQs}` : ''}`}
                            data-active={!activeSubcategoriaId ? 'true' : 'false'}
                            className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 border uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
                                !activeSubcategoriaId
                                    ? 'bg-[#5F2142] text-[#FFC99C] border-[#5F2142] shadow-md scale-[1.02]'
                                    : 'bg-white text-[#5F2142] border-[#FFC99C]/60 hover:border-[#D86A33] hover:text-[#D86A33]'
                            }`}
                        >
                            <span>✦ Todas las Categorías</span>
                        </Link>

                        {subcategories.map((sub) => {
                            const isActive = activeSubcategoriaId === sub.id;
                            const subParams = new URLSearchParams();
                            subParams.set('subcategoria', String(sub.id));
                            if (buscar && buscar.trim()) subParams.set('buscar', buscar.trim());

                            return (
                                <Link
                                    key={sub.id}
                                    href={`/categorias/${categoria}?${subParams.toString()}`}
                                    data-active={isActive ? 'true' : 'false'}
                                    className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 border uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
                                        isActive
                                            ? 'bg-[#D86A33] text-white border-[#D86A33] shadow-md scale-[1.02]'
                                            : 'bg-white text-[#5F2142] border-[#FFC99C]/60 hover:border-[#D86A33] hover:text-[#D86A33]'
                                    }`}
                                >
                                    <span>{sub.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Gradiente sutil a la derecha cuando hay más categorías por deslizar */}
                    {canScrollRight && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#FFF9F5] to-transparent" />
                    )}
                </div>

                {/* Botón Flecha Derecha */}
                <button
                    type="button"
                    onClick={() => scrollByAmount('right')}
                    aria-label="Deslizar categorías a la derecha"
                    className={`shrink-0 ml-1.5 w-9 h-9 rounded-full border flex items-center justify-center transition-all shadow-sm ${
                        canScrollRight
                            ? 'bg-[#D86A33] border-[#D86A33] text-white hover:bg-[#5F2142] hover:border-[#5F2142] active:scale-95 shadow-[#D86A33]/25'
                            : 'bg-gray-50 border-gray-200 text-gray-300 opacity-60'
                    }`}
                >
                    <ChevronRight size={18} strokeWidth={2.6} />
                </button>
            </div>
        </div>
    );
}
