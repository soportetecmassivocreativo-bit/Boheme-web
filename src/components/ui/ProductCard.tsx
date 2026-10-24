'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { Plus, Minus, ShoppingCart, Sparkles } from 'lucide-react';
import { parseImages } from '@/lib/utils';
import { Product } from '@/lib/db';
import PersonalizeModal from './PersonalizeModal';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem, toggleCart } = useCartStore();
    const [quantity, setQuantity] = useState(1);
    const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);

    const firstImage = parseImages(product.image_url)[0];

    const isPersonalizable = Boolean(
        product.categoria_slug === 'productos-personalizados' ||
        product.subcategoria_id === 71 ||
        product.subcategoria_id === 6 ||
        product.name.toLowerCase().includes('personaliz') ||
        (product.description && product.description.toLowerCase().includes('personaliz'))
    );

    const handleActionClick = () => {
        if (isPersonalizable) {
            setIsPersonalizeOpen(true);
        } else {
            addItem({
                cart_item_id: `${product.id}-${Date.now()}`,
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image_url: product.image_url,
                type_color: product.type_color,
                genero: product.genero,
                modelo: product.modelo,
                cinta: product.cinta,
                is_personalizado: false
            });
            toggleCart();
        }
    };

    return (
        <>
            <div className="group bg-white rounded-3xl border border-[#FFC99C]/40 hover:border-[#D86A33]/50 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden relative">
                {/* Top Corner Accent */}
                <div className="absolute top-2 left-4 z-20 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className={`washi-tape text-[10px] font-black px-2.5 py-0.5 tracking-wider uppercase inline-block -rotate-3 ${
                        isPersonalizable ? 'text-[#D86A33] border border-[#D86A33]/40' : 'text-[#5F2142]'
                    }`}>
                        {isPersonalizable ? '★ PERSONALIZABLE' : '★ BOHEME'}
                    </span>
                </div>

                {/* Image container */}
                <div className="aspect-square bg-[#FFF9F5] relative overflow-hidden flex items-center justify-center border-b border-[#FFC99C]/30 m-2.5 rounded-2xl">
                    {firstImage ? (
                        <img 
                            src={firstImage} 
                            alt={product.name} 
                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-[#FFF4EB] flex items-center justify-center text-[#5F2142] font-bold text-lg">
                            BOHEME
                        </div>
                    )}

                    {/* Floating Quick Price Tag */}
                    <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-sm border border-[#FFC99C]/80 px-3 py-1 rounded-full shadow-sm group-hover:scale-105 transition-transform">
                        <span className="text-sm font-black text-[#D86A33]">
                            ${product.price.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Content container */}
                <div className="p-5 pt-2 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-extrabold text-[#5F2142] mb-1.5 line-clamp-1 group-hover:text-[#D86A33] transition-colors">
                            {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed font-normal">
                            {product.description}
                        </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100/80">
                        {/* Actions */}
                        <div className="flex items-center gap-2.5">
                            {/* Quantity Selector (only if not customized directly via modal) */}
                            {!isPersonalizable && (
                                <div className="flex items-center border border-[#FFC99C]/60 rounded-full bg-[#FFF9F5] p-0.5">
                                    <button
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#5F2142] hover:bg-[#FFC99C]/50 hover:text-[#D86A33] transition-colors"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={13} />
                                    </button>
                                    <span className="px-1.5 font-black text-xs text-[#5F2142] w-6 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(prev => prev + 1)}
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#5F2142] hover:bg-[#FFC99C]/50 hover:text-[#D86A33] transition-colors"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={13} />
                                    </button>
                                </div>
                            )}

                            {/* Add / Personalize button */}
                            <button
                                onClick={handleActionClick}
                                className={`flex-1 text-white font-bold py-2.5 px-3.5 rounded-full flex items-center justify-center gap-1.5 text-xs transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                                    isPersonalizable
                                        ? 'bg-[#5F2142] hover:bg-[#43142e] shadow-[#5F2142]/20'
                                        : 'bg-[#D86A33] hover:bg-[#5F2142] shadow-[#D86A33]/20'
                                }`}
                            >
                                {isPersonalizable ? (
                                    <>
                                        <Sparkles size={14} className="text-[#FFC99C]" />
                                        <span>Personalizar</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={15} />
                                        <span>Añadir</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Personalization Modal for this product */}
            <PersonalizeModal
                product={product}
                isOpen={isPersonalizeOpen}
                onClose={() => setIsPersonalizeOpen(false)}
            />
        </>
    );
}
