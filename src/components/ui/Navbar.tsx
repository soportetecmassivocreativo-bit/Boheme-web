'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/lib/store';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { items, toggleCart } = useCartStore();

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo styled in #5F2142 (150px) */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center group">
                            <img 
                                src="/logo-wine.png" 
                                alt="BOHEME" 
                                className="w-[150px] h-auto object-contain transition-transform group-hover:scale-105 drop-shadow-sm" 
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <Link href="/categorias/gorros" className="text-[#5F2142] hover:text-[#D86A33] transition-colors font-bold text-sm lg:text-base">Gorros</Link>
                        <Link href="/categorias/lanyards" className="text-[#5F2142] hover:text-[#D86A33] transition-colors font-bold text-sm lg:text-base">Lanyards</Link>
                        <Link href="/categorias/accesorios-medicos" className="text-[#5F2142] hover:text-[#D86A33] transition-colors font-bold text-sm lg:text-base">Accesorios</Link>
                        <Link href="/categorias/equipos-medicos" className="text-[#5F2142] hover:text-[#D86A33] transition-colors font-bold text-sm lg:text-base">Equipos</Link>
                        <Link href="/categorias/productos-personalizados" className="text-[#5F2142] hover:text-[#D86A33] transition-colors font-bold text-sm lg:text-base">Personalizados</Link>
                        <Link href="/nosotros" className="px-4 py-1.5 rounded-full border-2 border-[#5F2142] text-[#5F2142] hover:bg-[#5F2142] hover:text-white transition-all font-bold text-sm lg:text-base">Nosotros</Link>
                    </div>

                    {/* Actions: Cart & Mobile Menu */}
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={toggleCart} 
                            className="text-[#5F2142] hover:text-[#D86A33] transition-colors relative p-2 rounded-full hover:bg-gray-100"
                            aria-label="Ver Carrito"
                        >
                            <ShoppingBag size={24} />
                            <span className="absolute -top-1 -right-1 bg-[#D86A33] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md">
                                {items.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                        </button>
                        <button 
                            className="md:hidden text-[#5F2142] hover:text-[#D86A33] p-2" 
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Abrir Menú"
                        >
                            {isOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6 space-y-3 shadow-xl">
                    <Link href="/categorias/gorros" onClick={() => setIsOpen(false)} className="block text-[#5F2142] hover:text-[#D86A33] font-bold py-1">Gorros</Link>
                    <Link href="/categorias/lanyards" onClick={() => setIsOpen(false)} className="block text-[#5F2142] hover:text-[#D86A33] font-bold py-1">Lanyards</Link>
                    <Link href="/categorias/accesorios-medicos" onClick={() => setIsOpen(false)} className="block text-[#5F2142] hover:text-[#D86A33] font-bold py-1">Accesorios</Link>
                    <Link href="/categorias/equipos-medicos" onClick={() => setIsOpen(false)} className="block text-[#5F2142] hover:text-[#D86A33] font-bold py-1">Equipos</Link>
                    <Link href="/categorias/productos-personalizados" onClick={() => setIsOpen(false)} className="block text-[#5F2142] hover:text-[#D86A33] font-bold py-1">Personalizados</Link>
                    <Link href="/nosotros" onClick={() => setIsOpen(false)} className="block text-[#D86A33] font-black py-1">Nosotros</Link>
                </div>
            )}
        </nav>
    );
}