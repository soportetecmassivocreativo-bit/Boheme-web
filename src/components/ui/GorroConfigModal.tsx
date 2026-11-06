'use client';

import { useState, useEffect } from 'react';
import {
    Product,
    CATEGORIES,
    getSubcategoryName,
    GORROS_ADICIONALES_OPTIONS,
    GORROS_ESPECIALES_SUBCATEGORIES,
    normalizeCategorySlug
} from '@/lib/db';
import { useCartStore } from '@/lib/store';
import { parseImages } from '@/lib/utils';
import {
    X,
    Sparkles,
    Check,
    Plus,
    Minus,
    ZoomIn,
    ZoomOut,
    ShoppingBag,
    Zap,
    Scissors,
    Heart
} from 'lucide-react';

interface GorroConfigModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    initialQuantity?: number;
}

const DAMA_ESTILOS = [
    { id: 'Lazo', label: 'Lazo', desc: 'Ajuste delicado con lazo posterior' },
    { id: 'Elástica', label: 'Elástica', desc: 'Ajuste anatómico flexible y práctico' },
    { id: 'Tiras Abiertas', label: 'Tiras Abiertas', desc: 'Amarre clásico regulable a tu medida' }
] as const;

const CABALLERO_ESTILOS = [
    { id: 'Largo', label: 'Largo', desc: 'Cobertura extendida y ajuste cómodo' },
    { id: 'Corto', label: 'Corto', desc: 'Corte clásico quirúrgico despejado' }
] as const;

export default function GorroConfigModal({
    product,
    isOpen,
    onClose,
    initialQuantity = 1
}: GorroConfigModalProps) {
    const { addItem, toggleCart, setCheckoutOpen } = useCartStore();

    const images = parseImages(product.image_url);
    const gallery = images.length > 0 ? images : ['/cat_gorros.png'];

    const [activeImgIdx, setActiveImgIdx] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    // Determine category inside Gorros Quirúrgicos:
    // 70 = Stock, 73 = Básicos, 71 = Personalizados, 72 = Especiales
    const subcatId = Number(product.subcategoria_id) || 70;
    const isPersonalizadoCategory =
        subcatId === 71 ||
        product.name.toLowerCase().includes('personaliz');
    const isEspecialCategory = subcatId === 72;

    const categoryName = getSubcategoryName(normalizeCategorySlug(product.categoria_slug), subcatId);

    // 1. Género: Dama | Caballero
    const [genero, setGenero] = useState<'Dama' | 'Caballero'>(
        product.genero === 'Caballero' ? 'Caballero' : 'Dama'
    );

    // 2. Estilo según Género
    const [estilo, setEstilo] = useState<string>(
        product.genero === 'Caballero' ? 'Corto' : 'Lazo'
    );

    // Subcategoría especial (only if Especiales: Reversible, Cintillo, Ponytail, Coquette)
    const [subcategoriaEspecial, setSubcategoriaEspecial] = useState<string>(
        product.subcategoria_especial || 'Reversible'
    );

    // 3. Adicionales ($0.50 c/u)
    const [selectedAdicionales, setSelectedAdicionales] = useState<string[]>([]);

    // 4. Exclusivo para categoría Personalizados: "Nombre" y "Texto libre"
    const [nombrePersonalizado, setNombrePersonalizado] = useState('');
    const [textoLibre, setTextoLibre] = useState('');

    // 5. Cantidad
    const [quantity, setQuantity] = useState(initialQuantity);
    const [error, setError] = useState<string | null>(null);

    // Sync default style when switching gender
    const handleSelectGenero = (newGenero: 'Dama' | 'Caballero') => {
        setGenero(newGenero);
        if (newGenero === 'Dama') {
            if (!DAMA_ESTILOS.some(e => e.id === estilo)) {
                setEstilo('Lazo');
            }
        } else {
            if (!CABALLERO_ESTILOS.some(e => e.id === estilo)) {
                setEstilo('Corto');
            }
        }
    };

    useEffect(() => {
        if (isOpen) {
            setQuantity(initialQuantity);
            setError(null);
            setIsZoomed(false);
            if (product.subcategoria_especial) {
                setSubcategoriaEspecial(product.subcategoria_especial);
            }
        }
    }, [isOpen, initialQuantity, product.subcategoria_especial]);

    if (!isOpen) return null;

    const toggleAdicional = (label: string) => {
        setSelectedAdicionales(prev =>
            prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
        );
    };

    const adicionalesUnitCost = selectedAdicionales.length * 0.5;
    const unitPrice = Number((product.price + adicionalesUnitCost).toFixed(2));
    const totalPrice = Number((unitPrice * quantity).toFixed(2));

    const buildConfiguredCartItem = () => {
        const adicionalesSummary =
            selectedAdicionales.length > 0
                ? `Adicionales (+$${adicionalesUnitCost.toFixed(2)}): ${selectedAdicionales.join(', ')}`
                : undefined;

        const configSummaryParts = [
            `Género: ${genero}`,
            `Estilo: ${estilo}`,
            isEspecialCategory ? `Especial: ${subcategoriaEspecial}` : null,
            adicionalesSummary || null
        ].filter(Boolean);

        const detallesFinales = [
            configSummaryParts.join(' • '),
            isPersonalizadoCategory && textoLibre.trim() ? `Texto libre: ${textoLibre.trim()}` : null
        ]
            .filter(Boolean)
            .join(' | ');

        return {
            cart_item_id: `${product.id}-gorro-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            id: product.id,
            name: product.name,
            price: unitPrice,
            precio_base: product.price,
            quantity,
            image_url: product.image_url,
            categoria_slug: product.categoria_slug,
            subcategoria_id: subcatId,
            subcategoria_especial: isEspecialCategory ? subcategoriaEspecial : undefined,
            genero,
            modelo: estilo,
            adicionales: selectedAdicionales,
            recargo_adicionales: adicionalesUnitCost,
            type_color: `${genero} • ${estilo}${isEspecialCategory ? ` • ${subcategoriaEspecial}` : ''}`,
            is_personalizado: isPersonalizadoCategory,
            nombre_personalizado: isPersonalizadoCategory && nombrePersonalizado.trim() ? nombrePersonalizado.trim() : undefined,
            texto_personalizado: isPersonalizadoCategory && textoLibre.trim() ? textoLibre.trim() : undefined,
            detalles_personalizados: detallesFinales || undefined
        };
    };

    const validateForm = (): boolean => {
        setError(null);
        if (isPersonalizadoCategory && !nombrePersonalizado.trim() && !textoLibre.trim()) {
            setError('Por favor ingresa el Nombre o el Texto libre que deseas agregar a tu gorro personalizado.');
            return false;
        }
        return true;
    };

    const handleAddToCart = () => {
        if (!validateForm()) return;
        addItem(buildConfiguredCartItem());
        onClose();
        toggleCart();
    };

    const handleBuyNow = () => {
        if (!validateForm()) return;
        addItem(buildConfiguredCartItem());
        onClose();
        setCheckoutOpen(true);
    };

    const activeEstilos = genero === 'Dama' ? DAMA_ESTILOS : CABALLERO_ESTILOS;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-[#FFC99C]/60 relative my-auto max-h-[94vh] flex flex-col lg:flex-row overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button top-right */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/90 hover:bg-[#5F2142] text-[#5F2142] hover:text-white border border-gray-200 shadow-md flex items-center justify-center transition-all"
                    aria-label="Cerrar"
                >
                    <X size={18} />
                </button>

                {/* ============================================================= */}
                {/* LEFT COLUMN: PRODUCT GALLERY & LIVE VISUAL SUMMARY            */}
                {/* ============================================================= */}
                <div className="lg:w-[46%] bg-[#FFF9F5] p-5 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#FFC99C]/40 relative">
                    {/* Top Zoom Button (like reference image) */}
                    <div className="flex items-center justify-between mb-3">
                        <button
                            type="button"
                            onClick={() => setIsZoomed(prev => !prev)}
                            className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-gray-600 hover:text-[#D86A33] hover:border-[#D86A33] transition-all"
                            title={isZoomed ? 'Reducir zoom' : 'Ampliar imagen'}
                        >
                            {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
                        </button>

                        <span className="px-3 py-1 rounded-full bg-white border border-[#FFC99C] text-[11px] font-black uppercase tracking-wider text-[#5F2142] shadow-2xs">
                            ✦ Categoría: {categoryName}
                            {isEspecialCategory && subcategoriaEspecial ? ` • ${subcategoriaEspecial}` : ''}
                        </span>
                    </div>

                    {/* Main Product Image */}
                    <div
                        onClick={() => setIsZoomed(prev => !prev)}
                        className="relative aspect-square rounded-3xl bg-white border border-[#FFC99C]/40 shadow-inner overflow-hidden flex items-center justify-center cursor-zoom-in group"
                    >
                        <img
                            src={gallery[activeImgIdx] || '/cat_gorros.png'}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-500 ${
                                isZoomed ? 'scale-135 cursor-zoom-out' : 'group-hover:scale-105'
                            }`}
                        />

                        {/* Live Floating Configuration Summary Overlay */}
                        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-[#FFC99C]/80 rounded-2xl p-3 shadow-lg space-y-1.5 pointer-events-none">
                            <div className="flex items-center justify-between gap-2 text-xs">
                                <span className="font-black text-[#5F2142] flex items-center gap-1.5">
                                    <span>{genero === 'Dama' ? '👩 Dama' : '👨 Caballero'}</span>
                                    <span className="text-[#D86A33]">•</span>
                                    <span className="text-[#D86A33]">{estilo}</span>
                                </span>
                                {selectedAdicionales.length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-[#D86A33]/15 text-[#D86A33] font-black text-[10px]">
                                        +{selectedAdicionales.length} {selectedAdicionales.length === 1 ? 'adicional' : 'adicionales'} (+${adicionalesUnitCost.toFixed(2)})
                                    </span>
                                )}
                            </div>

                            {selectedAdicionales.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {selectedAdicionales.map(ad => (
                                        <span
                                            key={ad}
                                            className="px-2 py-0.5 rounded-md bg-[#FFF4EB] border border-[#FFC99C] text-[10px] font-bold text-[#5F2142]"
                                        >
                                            ✓ {ad}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {isPersonalizadoCategory && (nombrePersonalizado.trim() || textoLibre.trim()) && (
                                <div className="pt-1.5 border-t border-[#FFC99C]/40 text-[11px] space-y-0.5">
                                    {nombrePersonalizado.trim() && (
                                        <div className="truncate font-black text-[#5F2142]">
                                            ✨ Nombre: <span className="text-[#D86A33]">{nombrePersonalizado}</span>
                                        </div>
                                    )}
                                    {textoLibre.trim() && (
                                        <div className="line-clamp-1 text-gray-600 font-medium">
                                            📝 {textoLibre}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Thumbnails Strip (like reference image bottom left) */}
                    <div className="mt-4 flex items-center gap-2.5 overflow-x-auto pb-1">
                        {gallery.map((imgUrl, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveImgIdx(idx)}
                                className={`w-16 h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                                    activeImgIdx === idx
                                        ? 'border-[#5F2142] ring-2 ring-[#5F2142]/20 scale-105'
                                        : 'border-gray-200 opacity-70 hover:opacity-100'
                                }`}
                            >
                                <img src={imgUrl} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* ============================================================= */}
                {/* RIGHT COLUMN: DYNAMIC SELECTOR FORM                           */}
                {/* ============================================================= */}
                <div className="lg:w-[54%] p-5 sm:p-8 overflow-y-auto space-y-5">
                    {/* Brand & Product Header */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                            BOHEME • Gorros Quirúrgicos
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                            {product.name}
                        </h2>

                        {/* Price & NEW Starburst Badge */}
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span className="text-2xl sm:text-3xl font-black text-[#5F2142]">
                                ${unitPrice.toFixed(2)}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#D86A33] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                                ★ {categoryName}
                            </span>
                            {adicionalesUnitCost > 0 && (
                                <span className="text-xs font-bold text-[#D86A33] bg-[#FFF4EB] border border-[#FFC99C] px-2.5 py-1 rounded-xl">
                                    Base ${product.price.toFixed(2)} + ${adicionalesUnitCost.toFixed(2)} adicionales
                                </span>
                            )}
                        </div>

                        <p className="mt-1.5 text-xs text-gray-500">
                            Impuestos incluidos. Los <span className="underline decoration-[#D86A33] text-[#5F2142] font-semibold">gastos de envío</span> se calculan en la pantalla de pago.
                        </p>
                        {product.description && (
                            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                                {product.description}
                            </p>
                        )}
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* SUBCATEGORÍA DE ESPECIALES (Solo si es categoría Especiales = 72) */}
                    {isEspecialCategory && (
                        <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                                    Subcategoría Especial
                                </label>
                                <span className="text-[11px] font-bold text-[#D86A33]">
                                    Seleccionado: {subcategoriaEspecial}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {GORROS_ESPECIALES_SUBCATEGORIES.map(subEsp => {
                                    const active = subcategoriaEspecial === subEsp;
                                    return (
                                        <button
                                            key={subEsp}
                                            type="button"
                                            onClick={() => setSubcategoriaEspecial(subEsp)}
                                            className={`px-4 py-2 rounded-full text-xs font-black transition-all border ${
                                                active
                                                    ? 'bg-[#5F2142] text-white border-[#5F2142] shadow-md scale-105'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#5F2142]'
                                            }`}
                                        >
                                            {subEsp}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 1. SELECTOR DE GÉNERO (Dama y Caballero) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                                1. Género
                            </label>
                            <span className="text-[11px] font-bold text-[#5F2142]">
                                {genero === 'Dama' ? '👩 Dama' : '👨 Caballero'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {(['Dama', 'Caballero'] as const).map(gen => {
                                const isSelected = genero === gen;
                                return (
                                    <button
                                        key={gen}
                                        type="button"
                                        onClick={() => handleSelectGenero(gen)}
                                        className={`py-3 px-4 rounded-full text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 border-2 ${
                                            isSelected
                                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-md scale-[1.01]'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-neutral-900'
                                        }`}
                                    >
                                        <span>{gen === 'Dama' ? '👩' : '👨'}</span>
                                        <span>{gen}</span>
                                        {isSelected && <Check size={14} className="text-[#FFC99C]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. SELECTOR DINÁMICO DE ESTILO SEGÚN EL GÉNERO */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                                2. Estilo para {genero}
                            </label>
                            <span className="text-[11px] font-bold text-[#D86A33]">
                                {genero === 'Dama' ? 'Opciones: Lazo, Elástica o Tiras Abiertas' : 'Opciones: Largo o Corto'}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                            {activeEstilos.map(opt => {
                                const isSelected = estilo === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setEstilo(opt.id)}
                                        className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all border ${
                                            isSelected
                                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-md scale-105'
                                                : 'bg-white text-gray-800 border-gray-300 hover:border-neutral-900'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium">
                            {activeEstilos.find(e => e.id === estilo)?.desc}
                        </p>
                    </div>

                    {/* 3. ADICIONALES DESDE $0.50 POR ADICIONAL (Para todas las categorías) */}
                    <div className="space-y-2.5 pt-1">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                <Scissors size={14} className="text-[#D86A33]" />
                                <span>3. Adicionales ($0.50 USD c/u)</span>
                            </label>
                            <span className="text-[11px] font-black text-[#D86A33]">
                                {selectedAdicionales.length === 0
                                    ? 'Opcional'
                                    : `+${selectedAdicionales.length} ($${adicionalesUnitCost.toFixed(2)} USD)`}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {GORROS_ADICIONALES_OPTIONS.map(ad => {
                                const isChecked = selectedAdicionales.includes(ad.label);
                                return (
                                    <button
                                        key={ad.id}
                                        type="button"
                                        onClick={() => toggleAdicional(ad.label)}
                                        className={`p-3 rounded-2xl border text-left transition-all flex items-start justify-between gap-2 ${
                                            isChecked
                                                ? 'bg-[#FFF4EB] border-2 border-[#D86A33] shadow-xs'
                                                : 'bg-white border-gray-200 hover:border-[#D86A33]/60'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <div
                                                className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                                                    isChecked
                                                        ? 'bg-[#D86A33] border-[#D86A33] text-white'
                                                        : 'border-gray-300 bg-white'
                                                }`}
                                            >
                                                {isChecked && <Check size={12} />}
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-gray-900 leading-tight">
                                                    {ad.label}
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-0.5">
                                                    {ad.desc}
                                                </div>
                                            </div>
                                        </div>

                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                                                isChecked
                                                    ? 'bg-[#D86A33] text-white'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            +$0.50
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 4. APARTADO EXCLUSIVO ÚNICAMENTE PARA LA CATEGORÍA DE PERSONALIZADOS */}
                    {isPersonalizadoCategory && (
                        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#FFF9F5] to-[#FFF4EB] border-2 border-[#D86A33]/40 space-y-3.5 shadow-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-[#D86A33] text-white flex items-center justify-center shadow-xs">
                                    <Sparkles size={14} />
                                </span>
                                <div>
                                    <h4 className="text-xs sm:text-sm font-black text-[#5F2142] uppercase tracking-wider">
                                        Datos de tu Personalizado
                                    </h4>
                                    <p className="text-[11px] text-gray-500 font-medium">
                                        Exclusivo para gorros quirúrgicos personalizados
                                    </p>
                                </div>
                            </div>

                            {/* Campo Nombre */}
                            <div>
                                <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={nombrePersonalizado}
                                    onChange={(e) => setNombrePersonalizado(e.target.value)}
                                    placeholder="Ej: Dra. Valeria Gómez / Dr. Carlos Méndez"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#FFC99C] focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-xs sm:text-sm font-bold text-gray-900"
                                />
                            </div>

                            {/* Campo Texto libre */}
                            <div>
                                <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-1">
                                    Texto libre (Lo que desees agregar a tu personalizado)
                                </label>
                                <textarea
                                    rows={3}
                                    value={textoLibre}
                                    onChange={(e) => setTextoLibre(e.target.value)}
                                    placeholder="Escribe aquí cualquier frase, especialidad, colores, figuras o detalles que desees agregar a tu gorro personalizado..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#FFC99C] focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-xs sm:text-sm font-medium text-gray-900"
                                />
                            </div>
                        </div>
                    )}

                    {/* 5. CANTIDAD (Estilo píldora redondeada como en la imagen) */}
                    <div className="space-y-1.5 pt-1">
                        <label className="block text-xs font-bold text-gray-600">
                            Cantidad
                        </label>
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="inline-flex items-center border border-gray-300 rounded-full px-2 py-1 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                                    aria-label="Disminuir cantidad"
                                >
                                    <Minus size={15} />
                                </button>
                                <span className="w-12 text-center font-black text-sm text-gray-900">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                                    aria-label="Aumentar cantidad"
                                >
                                    <Plus size={15} />
                                </button>
                            </div>

                            <div className="text-right">
                                <span className="text-[11px] font-bold text-gray-400 uppercase block">
                                    Total Configurado
                                </span>
                                <span className="text-xl font-black text-[#D86A33]">
                                    ${totalPrice.toFixed(2)} USD
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 6. BOTONES DE ACCIÓN (Agregar al carrito + Comprar ahora, como en la imagen) */}
                    <div className="space-y-2.5 pt-2">
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            className="w-full py-3.5 px-6 rounded-2xl border-2 border-[#D86A33] bg-white hover:bg-[#FFF4EB] text-[#D86A33] font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <ShoppingBag size={17} />
                            <span>Agregar al carrito — ${totalPrice.toFixed(2)}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleBuyNow}
                            className="w-full py-3.5 px-6 rounded-2xl bg-[#D86A33] hover:bg-[#c25925] text-white font-black text-sm shadow-lg shadow-[#D86A33]/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Zap size={17} />
                            <span>Comprar ahora</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
