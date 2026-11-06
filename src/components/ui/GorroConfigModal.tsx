'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Product,
    getSubcategoryName,
    GORROS_ADICIONALES_OPTIONS,
    GORROS_DISENA_TU_IDEA_MODELS,
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
    Image as ImageIcon,
    UploadCloud,
    RefreshCw
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

const FEMALE_ONLY_ESPECIALES = ['cintillo', 'ponytail', 'coquette'];

function compressImageFileToDataUrl(file: File, maxDim = 900, quality = 0.78): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            const img = new window.Image();
            img.onload = () => {
                let { width, height } = img;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(dataUrl);
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

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

    const normalizedCategorySlug = normalizeCategorySlug(product.categoria_slug);
    const isLanyard = normalizedCategorySlug === 'lanyards';
    const isProductoPersonalizado = normalizedCategorySlug === 'productos-personalizados';
    const isGenderless = isLanyard || isProductoPersonalizado;
    const subcatId = Number(product.subcategoria_id) || (isLanyard ? 5 : isProductoPersonalizado ? 0 : 70);
    const isDisenaTuIdea = subcatId === 74 || subcatId === 75;
    const allowsReferenceImages = isDisenaTuIdea || isProductoPersonalizado;
    const isPersonalizadoCategory = isProductoPersonalizado || subcatId === 71 || subcatId === 6 || product.name.toLowerCase().includes('personaliz');
    const isEspecialCategory = !isGenderless && subcatId === 72;

    // Model selector for "Diseña tu idea" in Gorros (adapts price and whether Gender/Style is shown)
    const [disenaModelId, setDisenaModelId] = useState<string>(GORROS_DISENA_TU_IDEA_MODELS[0].id);

    const activeDisenaModel = GORROS_DISENA_TU_IDEA_MODELS.find(m => m.id === disenaModelId) || GORROS_DISENA_TU_IDEA_MODELS[0];

    // Check if this specific Gorro Especial is exclusively for women (Cintillo, Ponytail, Coquette)
    const effectiveEspecialSubcat = isGenderless
        ? undefined
        : isDisenaTuIdea
            ? (activeDisenaModel.id !== 'Personalizado Clásico' ? activeDisenaModel.id : undefined)
            : product.subcategoria_especial;

    const isExclusivoDamaEspecial = Boolean(
        !isGenderless && (
            (isEspecialCategory &&
                effectiveEspecialSubcat &&
                FEMALE_ONLY_ESPECIALES.includes(effectiveEspecialSubcat.toLowerCase())) ||
            (isEspecialCategory &&
                FEMALE_ONLY_ESPECIALES.some(k => product.name.toLowerCase().includes(k))) ||
            (isDisenaTuIdea && !activeDisenaModel.allowsGenderAndStyle)
        )
    );

    // Has personalization fields (Nombre, Texto libre & in Diseña tu idea / Productos personalizados up to 5 reference images):
    const hasPersonalizationCapability = Boolean(
        isGenderless || isPersonalizadoCategory || isEspecialCategory || isDisenaTuIdea
    );

    const categoryName = isProductoPersonalizado
        ? (product.subcategoria_nombre || 'Personalizado')
        : getSubcategoryName(normalizedCategorySlug, subcatId);

    // 1. Género: Dama | Caballero
    const [genero, setGenero] = useState<'Dama' | 'Caballero'>(
        product.genero === 'Caballero' ? 'Caballero' : 'Dama'
    );

    // 2. Estilo según Género
    const [estilo, setEstilo] = useState<string>(
        product.genero === 'Caballero' ? 'Corto' : 'Lazo'
    );

    // 3. Adicionales ($0.50 c/u)
    const [selectedAdicionales, setSelectedAdicionales] = useState<string[]>([]);

    // 4. Nombre y Texto libre
    const [nombrePersonalizado, setNombrePersonalizado] = useState('');
    const [textoLibre, setTextoLibre] = useState('');

    // 5. Hasta 5 imágenes de referencia del cliente
    const [referenceImages, setReferenceImages] = useState<string[]>([]);
    const [isUploadingRefs, setIsUploadingRefs] = useState(false);
    const [isDraggingRefs, setIsDraggingRefs] = useState(false);
    const refInputRef = useRef<HTMLInputElement>(null);

    // 6. Cantidad
    const [quantity, setQuantity] = useState(initialQuantity);
    const [error, setError] = useState<string | null>(null);

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
        }
    }, [isOpen, initialQuantity]);

    if (!isOpen) return null;

    const toggleAdicional = (label: string) => {
        setSelectedAdicionales(prev =>
            prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
        );
    };

    const handleReferenceFilesSelected = async (fileList: FileList | File[]) => {
        const rawFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
        if (rawFiles.length === 0) return;

        const remainingSlots = 5 - referenceImages.length;
        if (remainingSlots <= 0) {
            setError('Puedes adjuntar un máximo de 5 imágenes de referencia.');
            return;
        }

        const filesToProcess = rawFiles.slice(0, remainingSlots);
        setIsUploadingRefs(true);
        setError(null);

        try {
            const formData = new FormData();
            filesToProcess.forEach(f => formData.append('files', f));

            const res = await fetch('/api/upload-reference', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                if (data.urls && Array.isArray(data.urls) && data.urls.length > 0) {
                    setReferenceImages(prev => [...prev, ...data.urls].slice(0, 5));
                    setIsUploadingRefs(false);
                    return;
                }
            }
            throw new Error('Fallback to local compression');
        } catch {
            try {
                const compressedList = await Promise.all(
                    filesToProcess.map(f => compressImageFileToDataUrl(f))
                );
                setReferenceImages(prev => [...prev, ...compressedList].slice(0, 5));
            } catch {
                setError('No se pudieron procesar las imágenes seleccionadas.');
            }
        } finally {
            setIsUploadingRefs(false);
        }
    };

    const removeReferenceImage = (idxToRemove: number) => {
        setReferenceImages(prev => prev.filter((_, idx) => idx !== idxToRemove));
    };

    // Base price adapts dynamically if in Gorros "Diseña tu idea"
    const effectiveBasePrice = (!isGenderless && isDisenaTuIdea) ? activeDisenaModel.price : product.price;
    const adicionalesUnitCost = isGenderless ? 0 : selectedAdicionales.length * 0.5;
    const unitPrice = Number((effectiveBasePrice + adicionalesUnitCost).toFixed(2));
    const totalPrice = Number((unitPrice * quantity).toFixed(2));

    const effectiveGenero = isGenderless ? undefined : (isExclusivoDamaEspecial ? 'Dama' : genero);
    const effectiveEstilo = isGenderless
        ? undefined
        : isExclusivoDamaEspecial
            ? `Modelo ${effectiveEspecialSubcat || 'Especial'}`
            : estilo;

    const buildConfiguredCartItem = () => {
        const adicionalesSummary =
            !isGenderless && selectedAdicionales.length > 0
                ? `Adicionales (+$${adicionalesUnitCost.toFixed(2)}): ${selectedAdicionales.join(', ')}`
                : undefined;

        const configSummaryParts = isProductoPersonalizado
            ? ['Producto Personalizado a medida']
            : isLanyard
                ? [
                      isDisenaTuIdea ? 'Diseño a medida (Diseña tu idea)' : 'Lanyard Personalizado'
                  ]
                : [
                      isDisenaTuIdea ? `Diseño: ${activeDisenaModel.label}` : null,
                      isExclusivoDamaEspecial
                          ? `Exclusivo Dama (${effectiveEspecialSubcat || product.name})`
                          : `Género: ${effectiveGenero} • Estilo: ${effectiveEstilo}`,
                      !isExclusivoDamaEspecial && effectiveEspecialSubcat ? `Especial: ${effectiveEspecialSubcat}` : null,
                      adicionalesSummary || null
                  ].filter(Boolean);

        const detallesFinales = [
            configSummaryParts.join(' • '),
            hasPersonalizationCapability && textoLibre.trim() ? `Texto libre: ${textoLibre.trim()}` : null
        ]
            .filter(Boolean)
            .join(' | ');

        const itemDisplayName = isDisenaTuIdea
            ? (isLanyard ? 'Diseña tu idea (Lanyard)' : `Diseña tu idea (${activeDisenaModel.label})`)
            : product.name;

        return {
            cart_item_id: `${product.id}-${isProductoPersonalizado ? 'pers' : isLanyard ? 'lanyard' : 'gorro'}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            id: product.id,
            name: itemDisplayName,
            price: unitPrice,
            precio_base: effectiveBasePrice,
            quantity,
            image_url: product.image_url,
            categoria_slug: product.categoria_slug,
            subcategoria_id: subcatId || undefined,
            subcategoria_especial: effectiveEspecialSubcat,
            genero: effectiveGenero,
            modelo: effectiveEstilo,
            adicionales: isGenderless ? undefined : selectedAdicionales,
            recargo_adicionales: isGenderless ? undefined : adicionalesUnitCost,
            type_color: isGenderless
                ? '✨ Diseño Personalizado'
                : isExclusivoDamaEspecial
                    ? `👩 Exclusivo Dama • ${effectiveEspecialSubcat || 'Especial'}`
                    : `${effectiveGenero} • ${effectiveEstilo}${effectiveEspecialSubcat ? ` • ${effectiveEspecialSubcat}` : ''}`,
            is_personalizado: Boolean(
                hasPersonalizationCapability &&
                (isDisenaTuIdea || isPersonalizadoCategory || nombrePersonalizado.trim() || textoLibre.trim() || (allowsReferenceImages && referenceImages.length > 0))
            ),
            nombre_personalizado: hasPersonalizationCapability && nombrePersonalizado.trim() ? nombrePersonalizado.trim() : undefined,
            texto_personalizado: hasPersonalizationCapability && textoLibre.trim() ? textoLibre.trim() : undefined,
            detalles_personalizados: detallesFinales || undefined,
            imagenes_personalizadas: allowsReferenceImages && referenceImages.length > 0 ? referenceImages : undefined
        };
    };

    const handleAddToCart = () => {
        setError(null);
        addItem(buildConfiguredCartItem());
        onClose();
        toggleCart();
    };

    const handleBuyNow = () => {
        setError(null);
        addItem(buildConfiguredCartItem());
        onClose();
        setCheckoutOpen(true);
    };

    const activeEstilos = genero === 'Dama' ? DAMA_ESTILOS : CABALLERO_ESTILOS;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 overflow-y-auto animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-[#FFC99C]/60 relative my-auto max-h-[92dvh] flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden"
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
                <div className="lg:w-[45%] bg-[#FFF9F5] p-5 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#FFC99C]/40 relative">
                    {/* Top Zoom Button */}
                    <div className="flex items-center justify-between mb-3">
                        <button
                            type="button"
                            onClick={() => setIsZoomed(prev => !prev)}
                            className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-gray-600 hover:text-[#D86A33] hover:border-[#D86A33] transition-all"
                            title={isZoomed ? 'Reducir zoom' : 'Ampliar imagen'}
                        >
                            {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
                        </button>

                        {(!isProductoPersonalizado || product.subcategoria_nombre) && (
                            <span className="px-3 py-1 rounded-full bg-white border border-[#FFC99C] text-[11px] font-black uppercase tracking-wider text-[#5F2142] shadow-2xs">
                                ✦ {categoryName}
                                {effectiveEspecialSubcat ? ` • ${effectiveEspecialSubcat}` : ''}
                            </span>
                        )}
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
                                {isGenderless ? (
                                    <span className="font-black text-[#5F2142] flex items-center gap-1.5">
                                        <span>✨ {isProductoPersonalizado ? 'Producto Personalizado' : 'Lanyard Personalizado'}</span>
                                        <span className="text-[#D86A33]">•</span>
                                        <span className="text-[#D86A33]">Se trabaja con tu diseño</span>
                                    </span>
                                ) : isExclusivoDamaEspecial ? (
                                    <span className="font-black text-[#5F2142] flex items-center gap-1.5">
                                        <span>👩 Exclusivo Dama</span>
                                        <span className="text-[#D86A33]">•</span>
                                        <span className="text-[#D86A33]">{effectiveEspecialSubcat || 'Especial'}</span>
                                    </span>
                                ) : (
                                    <span className="font-black text-[#5F2142] flex items-center gap-1.5">
                                        <span>{genero === 'Dama' ? '👩 Dama' : '👨 Caballero'}</span>
                                        <span className="text-[#D86A33]">•</span>
                                        <span className="text-[#D86A33]">{estilo}</span>
                                        {effectiveEspecialSubcat && (
                                            <>
                                                <span className="text-[#D86A33]">•</span>
                                                <span className="text-[#5F2142]">{effectiveEspecialSubcat}</span>
                                            </>
                                        )}
                                    </span>
                                )}

                                {!isGenderless && selectedAdicionales.length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-[#D86A33]/15 text-[#D86A33] font-black text-[10px]">
                                        +{selectedAdicionales.length} (+${adicionalesUnitCost.toFixed(2)})
                                    </span>
                                )}
                            </div>

                            {!isGenderless && selectedAdicionales.length > 0 && (
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

                            {hasPersonalizationCapability && (nombrePersonalizado.trim() || textoLibre.trim() || (allowsReferenceImages && referenceImages.length > 0)) && (
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
                                    {allowsReferenceImages && referenceImages.length > 0 && (
                                        <div className="text-[10px] font-black text-emerald-700">
                                            📷 {referenceImages.length} {referenceImages.length === 1 ? 'imagen de referencia adjunta' : 'imágenes de referencia adjuntas'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Thumbnails Strip */}
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
                <div className="lg:w-[55%] p-5 sm:p-8 overflow-y-auto space-y-5">
                    {/* Brand & Product Header */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                            BOHEME • {isProductoPersonalizado ? 'Productos Personalizados' : isLanyard ? 'Lanyards' : 'Gorros Quirúrgicos'}
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                            {isDisenaTuIdea ? 'Diseña tu idea' : product.name}
                        </h2>

                        {/* Price & Category Badge */}
                        <div className="mt-3 flex flex-wrap items-center gap-2.5">
                            <span className="text-2xl sm:text-3xl font-black text-[#5F2142]">
                                ${unitPrice.toFixed(2)}
                            </span>
                            {(!isProductoPersonalizado || product.subcategoria_nombre) && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#D86A33] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                                    ★ {categoryName}
                                </span>
                            )}
                            {effectiveEspecialSubcat && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#5F2142] text-[#FFC99C] text-[10px] font-black uppercase tracking-wider shadow-xs">
                                    {effectiveEspecialSubcat}
                                </span>
                            )}
                            {adicionalesUnitCost > 0 && (
                                <span className="text-xs font-bold text-[#D86A33] bg-[#FFF4EB] border border-[#FFC99C] px-2.5 py-1 rounded-xl">
                                    Base ${effectiveBasePrice.toFixed(2)} + ${adicionalesUnitCost.toFixed(2)} adicionales
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

                    {/* ========================================================= */}
                    {/* SELECTOR DE MODELO EN "DISEÑA TU IDEA" (SOLO EN GORROS)   */}
                    {/* ========================================================= */}
                    {!isGenderless && isDisenaTuIdea && (
                        <div className="p-4 rounded-3xl bg-[#FFF9F5] border-2 border-[#FFC99C] space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-black uppercase tracking-wider text-[#5F2142]">
                                    1. Elige el Modelo Base a Diseñar (Precio se adapta)
                                </label>
                                <span className="text-xs font-black text-[#D86A33]">
                                    Base: ${activeDisenaModel.price.toFixed(2)} USD
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {GORROS_DISENA_TU_IDEA_MODELS.map(mod => {
                                    const selected = disenaModelId === mod.id;
                                    return (
                                        <button
                                            key={mod.id}
                                            type="button"
                                            onClick={() => setDisenaModelId(mod.id)}
                                            className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${
                                                selected
                                                    ? 'bg-[#5F2142] text-white border-[#5F2142] shadow-md scale-[1.01]'
                                                    : 'bg-white text-gray-800 border-gray-200 hover:border-[#D86A33]'
                                            }`}
                                        >
                                            <div>
                                                <div className="text-xs font-black leading-tight">
                                                    {mod.label}
                                                </div>
                                                <div className={`text-[10px] mt-0.5 ${selected ? 'text-[#FFC99C]' : 'text-gray-500'}`}>
                                                    {mod.desc}
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-black shrink-0 ${
                                                selected ? 'bg-[#D86A33] text-white' : 'bg-[#FFF4EB] text-[#D86A33]'
                                            }`}>
                                                ${mod.price.toFixed(2)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* GÉNERO Y ESTILO (No aplica en Lanyards, Productos Personalizados ni en Cintillo/Ponytail/Coquette) */}
                    {/* ========================================================= */}
                    {isGenderless ? null : isExclusivoDamaEspecial ? (
                        <div className="p-3.5 rounded-2xl bg-[#FFF9F5] border border-[#FFC99C] flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">👩</span>
                                <div>
                                    <div className="text-xs font-black text-[#5F2142] uppercase tracking-wider">
                                        Modelo Exclusivo Dama • {effectiveEspecialSubcat || 'Especial'}
                                    </div>
                                    <div className="text-[11px] text-gray-500 font-medium">
                                        Confección femenina con el corte propio del modelo {effectiveEspecialSubcat || 'Especial'}.
                                    </div>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-[#5F2142] text-[#FFC99C] text-[10px] font-black uppercase shrink-0">
                                Dama
                            </span>
                        </div>
                    ) : (
                        <>
                            {/* 1. SELECTOR DE GÉNERO (Dama y Caballero) */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                                        Género
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
                                        Estilo para {genero}
                                    </label>
                                    <span className="text-[11px] font-bold text-[#D86A33]">
                                        {genero === 'Dama' ? 'Lazo, Elástica o Tiras Abiertas' : 'Largo o Corto'}
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
                        </>
                    )}

                    {/* ========================================================= */}
                    {/* ADICIONALES DESDE $0.50 POR ADICIONAL (SOLO EN GORROS)    */}
                    {/* ========================================================= */}
                    {!isGenderless && (
                        <div className="space-y-2.5 pt-1">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                    <Scissors size={14} className="text-[#D86A33]" />
                                    <span>Adicionales ($0.50 USD c/u)</span>
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
                    )}

                    {/* ========================================================= */}
                    {/* NOMBRE, TEXTO LIBRE Y (SOLO EN DISEÑA TU IDEA) IMÁGENES   */}
                    {/* ========================================================= */}
                    {hasPersonalizationCapability && (
                        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#FFF9F5] to-[#FFF4EB] border-2 border-[#D86A33]/40 space-y-4 shadow-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-[#D86A33] text-white flex items-center justify-center shadow-xs">
                                    <Sparkles size={14} />
                                </span>
                                <div>
                                    <h4 className="text-xs sm:text-sm font-black text-[#5F2142] uppercase tracking-wider">
                                        {isProductoPersonalizado
                                            ? 'Personalización de tu Producto'
                                            : isLanyard
                                                ? 'Personalización de tu Lanyard'
                                                : 'Personalización de tu Gorro'}
                                    </h4>
                                    <p className="text-[11px] text-gray-500 font-medium">
                                        {allowsReferenceImages
                                            ? 'Indica el nombre, texto libre de tu diseño y adjunta hasta 5 imágenes de referencia'
                                            : 'Indica el nombre y texto libre para el diseño de tu personalizado'}
                                    </p>
                                </div>
                            </div>

                            {/* Campo Nombre */}
                            <div>
                                <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-1">
                                    Nombre
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
                                    placeholder="Escribe aquí cualquier frase, especialidad, colores, figuras o detalles que desees agregar a tu personalizado..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#FFC99C] focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-xs sm:text-sm font-medium text-gray-900"
                                />
                            </div>

                            {/* HASTA 5 IMÁGENES DE REFERENCIA EN "DISEÑA TU IDEA" Y "PRODUCTOS PERSONALIZADOS" */}
                            {allowsReferenceImages && (
                                <div className="pt-2 border-t border-[#FFC99C]/60 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black text-[#5F2142] uppercase tracking-wider flex items-center gap-1.5">
                                            <ImageIcon size={14} className="text-[#D86A33]" />
                                            <span>Imágenes de Referencia ({referenceImages.length} de 5)</span>
                                        </label>
                                        <span className="text-[10px] font-bold text-[#D86A33]">
                                            Hasta 5 fotos de tu idea
                                        </span>
                                    </div>

                                    <input
                                        ref={refInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                handleReferenceFilesSelected(e.target.files);
                                            }
                                            e.target.value = '';
                                        }}
                                    />

                                    {referenceImages.length < 5 && (
                                        <div
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setIsDraggingRefs(true);
                                            }}
                                            onDragLeave={(e) => {
                                                e.preventDefault();
                                                setIsDraggingRefs(false);
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                setIsDraggingRefs(false);
                                                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                                    handleReferenceFilesSelected(e.dataTransfer.files);
                                                }
                                            }}
                                            onClick={() => refInputRef.current?.click()}
                                            className={`p-3.5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                                                isDraggingRefs
                                                    ? 'border-[#D86A33] bg-[#D86A33]/10'
                                                    : 'border-[#D86A33]/50 bg-white/80 hover:bg-white hover:border-[#D86A33]'
                                            }`}
                                        >
                                            {isUploadingRefs ? (
                                                <div className="flex items-center justify-center gap-2 py-1 text-xs font-black text-[#5F2142]">
                                                    <RefreshCw size={15} className="animate-spin text-[#D86A33]" />
                                                    <span>Cargando imágenes de referencia...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1">
                                                    <UploadCloud size={20} className="text-[#D86A33]" />
                                                    <span className="text-xs font-black text-[#5F2142]">
                                                        + Subir o arrastrar imágenes de referencia ({5 - referenceImages.length} disponibles)
                                                    </span>
                                                    <span className="text-[10px] text-gray-500">
                                                        Muestra logos, fotos, colores, dibujos o ejemplos de cómo deseas tu personalizado
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {referenceImages.length > 0 && (
                                        <div className="grid grid-cols-5 gap-2 pt-1">
                                            {referenceImages.map((imgSrc, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative aspect-square rounded-xl overflow-hidden border-2 border-[#D86A33] bg-white shadow-2xs group"
                                                >
                                                    <img
                                                        src={imgSrc}
                                                        alt={`Referencia ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeReferenceImage(idx)}
                                                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs hover:bg-red-700"
                                                        title="Quitar imagen"
                                                    >
                                                        <X size={11} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* CANTIDAD */}
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
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={quantity}
                                    onChange={(e) => {
                                        const digits = e.target.value.replace(/[^0-9]/g, '');
                                        const parsed = parseInt(digits, 10);
                                        if (!isNaN(parsed) && parsed >= 1) {
                                            setQuantity(parsed);
                                        }
                                    }}
                                    aria-label="Cantidad requerida"
                                    className="w-12 text-center font-black text-sm text-gray-900 bg-transparent outline-none focus:bg-[#FFF9F5] focus:ring-1 focus:ring-[#D86A33] rounded-md py-0.5"
                                />
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

                    {/* BOTONES DE ACCIÓN (Agregar al carrito + Comprar ahora) */}
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
