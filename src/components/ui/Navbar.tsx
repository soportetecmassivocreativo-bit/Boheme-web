'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/lib/store';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { items, toggleCart } = useCartStore();

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20">
                    {/* Logo styled in #5F2142 -> Lleva al inicio del sitio web */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center group" title="Ir al inicio">
                            <img 
                                src="/logo-wine.png" 
                                alt="BOHEME" 
                                className="w-[108px] sm:w-[140px] lg:w-[150px] h-auto object-contain transition-transform group-hover:scale-105 drop-shadow-sm" 
                            />
                        </Link>
                    </div>

                    {/* Desktop & Tablet Navigation Links (Secciones de Productos) */}
                    <div className="hidden md:flex md:space-x-5 lg:space-x-8 items-center">
                        <Link href="/categorias/gorros" className="text-[#5F2142] hover:text-[#D86A33] transition-colors font-bold text-xs lg:text-base whitespace-nowrap">Gorros</Link>
                        <Link href="/categorias/lanyards" className="text-[#5F2142] hover:text-[#D86A33] transition-colors font-bold text-xs lg:text-base whitespace-nowrap">Lanyards</Link>
                        <Link href="/categorias/accesorios-medicos" className="text-[#5F2142] hover:text-[#D86A33] transition-colors font-bold text-xs lg:text-base whitespace-nowrap">Accesorios</Link>
                        <Link href="/categorias/equipos-medicos" className="text-[#5F2142] hover:text-[#D86A33] transition-colors font-bold text-xs lg:text-base whitespace-nowrap">Equipos</Link>
                        <Link href="/categorias/productos-personalizados" className="text-[#5F2142] hover:text-[#D86A33] transition-colors font-bold text-xs lg:text-base whitespace-nowrap">Personalizados</Link>
                    </div>

                    {/* Actions: Admin Access, Cart & Mobile Menu */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <Link
                            href="/admin/login"
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-[#FFF9F5] hover:bg-[#5F2142] text-[#5F2142] hover:text-white border border-[#FFC99C]/80 hover:border-[#5F2142] transition-all duration-200 text-[11px] sm:text-xs font-extrabold shadow-2xs whitespace-nowrap"
                            title="Acceso para administradores"
                        >
                            <ShieldCheck size={15} className="text-[#D86A33] flex-shrink-0" />
                            <span className="hidden sm:inline">Acceso para administradores</span>
                            <span className="inline sm:hidden">Acceso Admin</span>
                        </Link>
                        <button 
                            onClick={toggleCart} 
                            className="text-[#5F2142] hover:text-[#D86A33] transition-colors relative p-2.5 rounded-full hover:bg-[#FFF9F5] border border-transparent hover:border-[#FFC99C]/60"
                            aria-label="Ver Carrito de Compras"
                            title="Tu Carrito de Compras"
                        >
                            <ShoppingCart size={25} strokeWidth={2.3} />
                            <span className="absolute -top-1 -right-1 bg-[#D86A33] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md">
                                {items.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                        </button>
                        <button 
                            className="md:hidden text-[#5F2142] hover:text-[#D86A33] p-2 rounded-xl hover:bg-[#FFF9F5]" 
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Abrir Menú"
                        >
                            {isOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu (Secciones de Productos + Acceso Admin) */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 py-4 px-5 space-y-2 shadow-xl animate-fadeIn">
                    <Link href="/categorias/gorros" onClick={() => setIsOpen(false)} className="block text-[#5F2142] hover:text-[#D86A33] hover:bg-[#FFF9F5] font-bold py-2.5 px-3 rounded-xl transition-colors">Gorros</Link>
                    <Link href="/categorias/lanyards" onClick={() => setIsOpen(false)} className="block text-[#5F2142] hover:text-[#D86A33] hover:bg-[#FFF9F5] font-bold py-2.5 px-3 rounded-xl transition-colors">Lanyards</Link>
                    <Link href="/categorias/accesorios-medicos" onClick={() => setIsOpen(false)} className="block text-[#5F2142] hover:text-[#D86A33] hover:bg-[#FFF9F5] font-bold py-2.5 px-3 rounded-xl transition-colors">Accesorios</Link>
                    <Link href="/categorias/equipos-medicos" onClick={() => setIsOpen(false)} className="block text-[#5F2142] hover:text-[#D86A33] hover:bg-[#FFF9F5] font-bold py-2.5 px-3 rounded-xl transition-colors">Equipos</Link>
                    <Link href="/categorias/productos-personalizados" onClick={() => setIsOpen(false)} className="block text-[#5F2142] hover:text-[#D86A33] hover:bg-[#FFF9F5] font-bold py-2.5 px-3 rounded-xl transition-colors">Personalizados</Link>
                    <div className="pt-2 mt-2 border-t border-gray-100">
                        <Link
                            href="/admin/login"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#FFF9F5] hover:bg-[#5F2142] text-[#5F2142] hover:text-white border border-[#FFC99C] font-extrabold text-sm transition-colors"
                        >
                            <ShieldCheck size={17} className="text-[#D86A33]" />
                            Acceso para administradores
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
