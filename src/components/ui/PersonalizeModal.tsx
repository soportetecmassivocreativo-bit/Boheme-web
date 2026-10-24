'use client';

import { useState } from 'react';
import { Product } from '@/lib/db';
import { useCartStore } from '@/lib/store';
import { X, Sparkles, ShoppingBag, Check } from 'lucide-react';

interface PersonalizeModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

export default function PersonalizeModal({ product, isOpen, onClose }: PersonalizeModalProps) {
    const { addItem, toggleCart } = useCartStore();

    const [nombreBordado, setNombreBordado] = useState('');
    const [especialidad, setEspecialidad] = useState('');
    const [colorPreferencia, setColorPreferencia] = useState('');
    const [especificaciones, setEspecificaciones] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!nombreBordado.trim() && !especialidad.trim()) {
            setError('Por favor indica al menos el nombre o la especialidad para personalizar tu prenda.');
            return;
        }

        // Add to cart with full personalization details
        addItem({
            cart_item_id: `${product.id}-custom-${Date.now()}`,
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image_url: product.image_url,
            categoria_slug: product.categoria_slug,
            is_personalizado: true,
            nombre_personalizado: nombreBordado.trim(),
            especialidad_personalizada: especialidad.trim(),
            color_preferencia: colorPreferencia.trim() || undefined,
            detalles_personalizados: especificaciones.trim() || undefined,
            texto_personalizado: `${nombreBordado.trim()} ${especialidad.trim() ? `- ${especialidad.trim()}` : ''}`
        });

        onClose();
        // Open cart drawer so customer sees their customized item
        toggleCart();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-gray-100 relative my-6 max-h-[92vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-[#FFF4EB] border border-[#D86A33]/40 text-[#D86A33] flex items-center justify-center text-xs font-bold">
                            ✦
                        </span>
                        <div>
                            <h3 className="text-lg sm:text-xl font-black text-[#5F2142] tracking-tight">
                                Personaliza tu {product.name}
                            </h3>
                            <p className="text-[11px] text-gray-500 font-medium">
                                Indícanos los datos para la confección a tu medida
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                        ⚠️ {error}
                    </div>
                )}

                {/* Form Fields */}
                <form id="personalize-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                    {/* Product Preview Card */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFF9F5] border border-[#FFC99C]/50">
                        <div className="w-14 h-14 rounded-xl bg-white border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-black text-sm text-[#5F2142] truncate">{product.name}</div>
                            <div className="text-xs text-gray-500 font-medium">${product.price.toFixed(2)} USD • Hecho a mano</div>
                        </div>
                    </div>

                    {/* Nombre a bordar / estampar */}
                    <div>
                        <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-1.5">
                            Nombre a bordar o estampar *
                        </label>
                        <input
                            type="text"
                            required
                            value={nombreBordado}
                            onChange={(e) => setNombreBordado(e.target.value)}
                            placeholder="Ej: Dra. Valeria Gómez / Dr. Carlos Méndez"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium"
                        />
                        <span className="text-[10px] text-gray-400 font-medium block mt-1">
                            Asegúrate de escribir los acentos y mayúsculas exactamente como deseas que se bordan.
                        </span>
                    </div>

                    {/* Especialidad o Cargo */}
                    <div>
                        <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-1.5">
                            Especialidad, Cargo o Profesión
                        </label>
                        <input
                            type="text"
                            value={especialidad}
                            onChange={(e) => setEspecialidad(e.target.value)}
                            placeholder="Ej: Pediatría, Odontología, Cirugía General, Enfermería..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium"
                        />
                    </div>

                    {/* Color / Preferencia de Tela o Hilo */}
                    <div>
                        <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-1.5">
                            Preferencia de Color (Tela e Hilo)
                        </label>
                        <input
                            type="text"
                            value={colorPreferencia}
                            onChange={(e) => setColorPreferencia(e.target.value)}
                            placeholder="Ej: Tela Azul Marino con letras en blanco / Rosa con bordado oro..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium"
                        />
                    </div>

                    {/* Notas o detalles para el taller */}
                    <div>
                        <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-1.5">
                            Notas o especificaciones para el taller
                        </label>
                        <textarea
                            rows={2}
                            value={especificaciones}
                            onChange={(e) => setEspecificaciones(e.target.value)}
                            placeholder="Ej: Para cabello abundante / Con botones laterales para tapabocas..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium"
                        />
                    </div>

                    {/* Cantidad */}
                    <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-black text-gray-700 uppercase tracking-wider">
                            Cantidad:
                        </span>
                        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl p-1">
                            <button
                                type="button"
                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-200 font-bold"
                            >
                                -
                            </button>
                            <span className="px-3 text-sm font-black text-[#5F2142]">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity(prev => prev + 1)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-200 font-bold"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer Controls */}
                <div className="pt-3.5 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="personalize-form"
                        className="px-6 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white text-xs sm:text-sm font-black transition-all hover:scale-105 shadow-md shadow-[#D86A33]/25 flex items-center gap-1.5"
                    >
                        <Sparkles size={14} />
                        <span>Añadir Personalizado (${(product.price * quantity).toFixed(2)})</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
