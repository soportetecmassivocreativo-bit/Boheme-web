'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { Plus, Minus, ShoppingCart, Sparkles, Sliders, PackageCheck, Clock } from 'lucide-react';
import { parseImages } from '@/lib/utils';
import { Product, CATEGORIES, getSubcategoryName, normalizeCategorySlug } from '@/lib/db';
import PersonalizeModal from './PersonalizeModal';
import GorroConfigModal from './GorroConfigModal';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem, toggleCart } = useCartStore();
    const [quantity, setQuantity] = useState(1);
    const [quantityInput, setQuantityInput] = useState('1');
    const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
    const [isGorroModalOpen, setIsGorroModalOpen] = useState(false);

    const normalizedSlug = normalizeCategorySlug(product.categoria_slug);
    const isGorroProduct = normalizedSlug === 'gorros';
    const isLanyardProduct = normalizedSlug === 'lanyards';
    const isAccesoriosOrEquipos = normalizedSlug === 'accesorios-medicos' || normalizedSlug === 'equipos-medicos';
    const subcatId = Number(product.subcategoria_id) || (isGorroProduct ? 70 : isLanyardProduct ? 5 : 0);
    const isStockGorro = isGorroProduct && subcatId === 70;
    const isLanyardWithForm = isLanyardProduct && (subcatId === 6 || subcatId === 75);
    const usesGorroForm = (isGorroProduct && !isStockGorro) || isLanyardWithForm;

    const availableStock = product.stock !== undefined ? Math.max(0, Number(product.stock)) : 20;
    const isPorEncargo = isAccesoriosOrEquipos && (availableStock <= 0 || quantity > availableStock);

    const firstImage = parseImages(product.image_url)[0];
    const sectionTitle = CATEGORIES[normalizedSlug]?.title || product.categoria_slug;
    const categoryName = getSubcategoryName(normalizedSlug, product.subcategoria_id);

    const isPersonalizable = Boolean(
        !isStockGorro && (
            product.categoria_slug === 'productos-personalizados' ||
            subcatId === 71 ||
            subcatId === 74 ||
            subcatId === 75 ||
            (isGorroProduct && subcatId === 72) ||
            subcatId === 6 ||
            (!isLanyardProduct && !isAccesoriosOrEquipos && product.name.toLowerCase().includes('personaliz')) ||
            (!isLanyardProduct && !isAccesoriosOrEquipos && product.description && product.description.toLowerCase().includes('personaliz'))
        )
    );

    const handleQuantityDecrement = () => {
        const next = Math.max(1, quantity - 1);
        setQuantity(next);
        setQuantityInput(String(next));
    };

    const handleQuantityIncrement = () => {
        const next = quantity + 1;
        setQuantity(next);
        setQuantityInput(String(next));
    };

    const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
        setQuantityInput(digitsOnly);
        if (digitsOnly !== '') {
            const parsed = parseInt(digitsOnly, 10);
            if (!isNaN(parsed) && parsed >= 1) {
                setQuantity(parsed);
            }
        }
    };

    const handleQuantityInputBlur = () => {
        const parsed = parseInt(quantityInput, 10);
        if (!quantityInput || isNaN(parsed) || parsed < 1) {
            setQuantity(1);
            setQuantityInput('1');
        } else {
            setQuantity(parsed);
            setQuantityInput(String(parsed));
        }
    };

    const handleActionClick = () => {
        const finalQty = Math.max(1, parseInt(quantityInput, 10) || quantity || 1);
        if (usesGorroForm) {
            setIsGorroModalOpen(true);
        } else if (isPersonalizable) {
            setIsPersonalizeOpen(true);
        } else {
            const requiresEncargo = isAccesoriosOrEquipos && (availableStock <= 0 || finalQty > availableStock);
            addItem({
                cart_item_id: `${product.id}-${Date.now()}`,
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: finalQty,
                image_url: product.image_url,
                categoria_slug: product.categoria_slug,
                subcategoria_id: product.subcategoria_id,
                type_color: product.type_color,
                genero: product.genero,
                modelo: product.modelo,
                cinta: product.cinta,
                is_personalizado: false,
                es_por_encargo: requiresEncargo,
                stock_disponible: isAccesoriosOrEquipos ? availableStock : undefined
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
                        {subcatId === 74 || subcatId === 75
                            ? '★ DISEÑA TU IDEA'
                            : product.subcategoria_especial
                                ? `★ ${product.subcategoria_especial.toUpperCase()}`
                                : isPersonalizable
                                    ? '★ PERSONALIZABLE'
                                    : '★ BOHEME'}
                    </span>
                </div>

                {/* Image container */}
                <div
                    onClick={usesGorroForm ? () => setIsGorroModalOpen(true) : undefined}
                    className={`aspect-square bg-[#FFF9F5] relative overflow-hidden flex items-center justify-center border-b border-[#FFC99C]/30 m-2.5 rounded-2xl ${
                        usesGorroForm ? 'cursor-pointer' : ''
                    }`}
                >
                    {firstImage ? (
                        <img 
                            src={firstImage} 
                            alt={product.name} 
                            loading="lazy"
                            decoding="async"
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
                            {subcatId === 74 ? `Desde $10.50` : `$${product.price.toFixed(2)}`}
                        </span>
                    </div>
                </div>

                {/* Content container */}
                <div className="p-5 pt-2 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#5F2142]/10 text-[#5F2142]">
                                {sectionTitle}
                            </span>
                            {(normalizedSlug !== 'accesorios-medicos' || product.subcategoria_id !== undefined) && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFF9F5] border border-[#D86A33]/40 text-[#D86A33]">
                                    ✦ {categoryName}
                                </span>
                            )}
                            {product.subcategoria_especial && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#5F2142] text-[#FFC99C]">
                                    {product.subcategoria_especial}
                                </span>
                            )}
                        </div>
                        <h3
                            onClick={usesGorroForm ? () => setIsGorroModalOpen(true) : undefined}
                            className={`text-lg font-extrabold text-[#5F2142] mb-1.5 line-clamp-1 group-hover:text-[#D86A33] transition-colors ${
                                usesGorroForm ? 'cursor-pointer' : ''
                            }`}
                        >
                            {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed font-normal">
                            {product.description}
                        </p>

                        {/* Stock visibility for Accesorios & Equipos Médicos */}
                        {isAccesoriosOrEquipos && (
                            <div className="mb-3 flex flex-wrap items-center gap-1.5">
                                {availableStock > 0 ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 border border-emerald-200 text-emerald-700">
                                        <PackageCheck size={12} />
                                        <span>Stock disponible: {availableStock} {availableStock === 1 ? 'ud.' : 'uds.'}</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 border border-amber-300 text-amber-800">
                                        <Clock size={12} />
                                        <span>Stock: 0 uds. • Disponible por encargo</span>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-2 border-t border-gray-100/80 space-y-2">
                        {/* Dynamic Encargo Notice when requested quantity exceeds stock or stock is 0 */}
                        {isPorEncargo && (
                            <div className="px-2.5 py-1.5 rounded-xl bg-[#FFF4EB] border border-[#D86A33]/40 text-[10px] font-bold text-[#5F2142] flex items-center gap-1.5 leading-tight">
                                <Clock size={12} className="text-[#D86A33] shrink-0" />
                                <span>
                                    {availableStock <= 0
                                        ? `Sin stock inmediato (0 uds). Puedes solicitar ${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} por encargo.`
                                        : `Solicitas ${quantity} uds (hay ${availableStock} en stock). Se gestionará por encargo.`}
                                </span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2.5">
                            {/* Quantity Selector with numeric input (shown for Stock gorros, Accesorios, Equipos Médicos, and non-customized items) */}
                            {(!isPersonalizable && !usesGorroForm) && (
                                <div className="flex items-center border border-[#FFC99C]/60 rounded-full bg-[#FFF9F5] p-0.5">
                                    <button
                                        type="button"
                                        onClick={handleQuantityDecrement}
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#5F2142] hover:bg-[#FFC99C]/50 hover:text-[#D86A33] transition-colors"
                                        aria-label="Disminuir cantidad"
                                    >
                                        <Minus size={13} />
                                    </button>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={quantityInput}
                                        onChange={handleQuantityInputChange}
                                        onBlur={handleQuantityInputBlur}
                                        aria-label="Cantidad requerida"
                                        className="w-9 text-center font-black text-xs text-[#5F2142] bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-[#D86A33] rounded-md py-0.5"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleQuantityIncrement}
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#5F2142] hover:bg-[#FFC99C]/50 hover:text-[#D86A33] transition-colors"
                                        aria-label="Aumentar cantidad"
                                    >
                                        <Plus size={13} />
                                    </button>
                                </div>
                            )}

                            {/* Add / Configure / Personalize / Encargo button */}
                            <button
                                type="button"
                                onClick={handleActionClick}
                                className={`flex-1 text-white font-bold py-2.5 px-3.5 rounded-full flex items-center justify-center gap-1.5 text-xs transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                                    isPersonalizable || isPorEncargo
                                        ? 'bg-[#5F2142] hover:bg-[#43142e] shadow-[#5F2142]/20'
                                        : 'bg-[#D86A33] hover:bg-[#5F2142] shadow-[#D86A33]/20'
                                }`}
                            >
                                {usesGorroForm ? (
                                    <>
                                        {isPersonalizable ? (
                                            <Sparkles size={14} className="text-[#FFC99C]" />
                                        ) : (
                                            <Sliders size={14} />
                                        )}
                                        <span>
                                            {subcatId === 74 || subcatId === 75
                                                ? 'Diseñar mi Idea'
                                                : isLanyardProduct
                                                    ? 'Personalizar Lanyard'
                                                    : isPersonalizable
                                                        ? 'Personalizar Gorro'
                                                        : 'Elegir Opciones'}
                                        </span>
                                    </>
                                ) : isPersonalizable ? (
                                    <>
                                        <Sparkles size={14} className="text-[#FFC99C]" />
                                        <span>Personalizar</span>
                                    </>
                                ) : isPorEncargo ? (
                                    <>
                                        <Clock size={14} className="text-[#FFC99C]" />
                                        <span>Solicitar por Encargo</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={15} />
                                        <span>Añadir al Carrito</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gorro Quirúrgico Dynamic Selector Modal (only for non-Stock gorros) */}
            {usesGorroForm && (
                <GorroConfigModal
                    product={product}
                    isOpen={isGorroModalOpen}
                    onClose={() => setIsGorroModalOpen(false)}
                    initialQuantity={quantity}
                />
            )}

            {/* Personalization Modal for non-gorro custom products */}
            {!isGorroProduct && (
                <PersonalizeModal
                    product={product}
                    isOpen={isPersonalizeOpen}
                    onClose={() => setIsPersonalizeOpen(false)}
                />
            )}
        </>
    );
}
