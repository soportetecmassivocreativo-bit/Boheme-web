'use client';

import { useCartStore } from '@/lib/store';
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { parseImages } from '@/lib/utils';
import CheckoutModal from './CheckoutModal';

export default function CartDrawer() {
    const { 
        items, 
        isOpen, 
        toggleCart, 
        removeItem, 
        updateQuantity, 
        clearCart,
        setCheckoutOpen 
    } = useCartStore();

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleStartCheckout = () => {
        if (items.length === 0) return;
        toggleCart(); // Close cart drawer
        setCheckoutOpen(true); // Open checkout modal
    };

    return (
        <>
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity" 
                        onClick={toggleCart} 
                    />

                    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white text-gray-900 border-l border-gray-100 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <ShoppingBag size={22} className="text-[#D86A33]" />
                                <h2 className="text-2xl font-black text-[#5F2142] tracking-tight">Tu Carrito</h2>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFF4EB] text-[#D86A33] font-bold">
                                    {items.reduce((acc, it) => acc + it.quantity, 0)}
                                </span>
                            </div>
                            <button 
                                onClick={toggleCart} 
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4 text-center">
                                    <div className="w-16 h-16 rounded-full bg-[#FFF9F5] border-2 border-dashed border-[#FFC99C] flex items-center justify-center text-3xl">
                                        🛍️
                                    </div>
                                    <p className="font-bold text-gray-700 text-base">Tu carrito está vacío.</p>
                                    <p className="text-xs text-gray-400 max-w-xs">
                                        Explora nuestra colección y añade gorros o accesorios a tu pedido.
                                    </p>
                                    <button
                                        onClick={toggleCart}
                                        className="mt-2 py-2.5 px-6 bg-[#D86A33] text-white rounded-full font-black text-xs hover:bg-[#c25925] transition-all shadow-md shadow-[#D86A33]/20"
                                    >
                                        Explorar Catálogo
                                    </button>
                                </div>
                            ) : (
                                items.map(item => {
                                    const firstImage = parseImages(item.image_url)[0];
                                    return (
                                        <div key={item.cart_item_id} className="flex gap-4 border-b border-gray-100 pb-5">
                                            <div className="w-20 h-20 bg-[#FFF9F5] border border-gray-100 rounded-2xl overflow-hidden relative shrink-0 flex items-center justify-center">
                                                {firstImage ? (
                                                    <img src={firstImage} alt={item.name} className="object-cover w-full h-full" />
                                                ) : (
                                                    <div className="w-full h-full bg-[#FFF4EB] flex items-center justify-center text-xs text-[#5F2142] font-bold">Foto</div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-1">
                                                    <h3 className="font-black text-sm text-[#5F2142] truncate">{item.name}</h3>
                                                    <span className="font-black text-sm text-[#D86A33]">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>

                                                {/* Gorro Quirúrgico Selector Info (Género, Estilo, Especial, Adicionales) */}
                                                {(item.genero || item.modelo || (item.adicionales && item.adicionales.length > 0) || item.subcategoria_especial) && (
                                                    <div className="mt-1.5 p-2 rounded-xl bg-[#FFF9F5] border border-[#FFC99C]/60 text-[11px] text-gray-700 space-y-1">
                                                        <div className="flex flex-wrap items-center gap-1.5 font-black text-[#5F2142]">
                                                            {item.genero && <span>{item.genero === 'Dama' ? '👩 Dama' : '👨 Caballero'}</span>}
                                                            {item.modelo && (
                                                                <span className="px-1.5 py-0.5 rounded-md bg-white border border-[#FFC99C] text-[#D86A33]">
                                                                    {item.modelo}
                                                                </span>
                                                            )}
                                                            {item.subcategoria_especial && (
                                                                <span className="px-1.5 py-0.5 rounded-md bg-[#5F2142] text-[#FFC99C]">
                                                                    {item.subcategoria_especial}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.adicionales && item.adicionales.length > 0 && (
                                                            <div className="text-[10px] text-gray-600">
                                                                <strong className="text-[#D86A33]">Adicionales (+${(item.adicionales.length * 0.5).toFixed(2)}):</strong>{' '}
                                                                {item.adicionales.join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Personalization Info Card */}
                                                {item.is_personalizado && (
                                                    <div className="mt-1.5 p-2 rounded-xl bg-[#FFF9F5] border border-[#FFC99C]/50 text-[11px] text-gray-700 space-y-0.5">
                                                        <div className="flex items-center gap-1 font-black text-[#D86A33]">
                                                            <Sparkles size={11} />
                                                            <span>Personalizado:</span>
                                                        </div>
                                                        {item.nombre_personalizado && (
                                                            <div><strong>Nombre:</strong> {item.nombre_personalizado}</div>
                                                        )}
                                                        {item.texto_personalizado && (
                                                            <div><strong>Texto libre:</strong> {item.texto_personalizado}</div>
                                                        )}
                                                        {item.especialidad_personalizada && (
                                                            <div><strong>Especialidad:</strong> {item.especialidad_personalizada}</div>
                                                        )}
                                                        {item.color_preferencia && (
                                                            <div><strong>Color/Preferencia:</strong> {item.color_preferencia}</div>
                                                        )}
                                                        {item.detalles_personalizados && !item.texto_personalizado && (
                                                            <div><strong>Notas:</strong> {item.detalles_personalizados}</div>
                                                        )}
                                                        {item.imagenes_personalizadas && item.imagenes_personalizadas.length > 0 && (
                                                            <div className="pt-1.5">
                                                                <div className="font-bold text-[#5F2142] mb-1">
                                                                    📷 Imágenes de referencia ({item.imagenes_personalizadas.length}):
                                                                </div>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {item.imagenes_personalizadas.map((imgSrc, idx) => (
                                                                        <img
                                                                            key={idx}
                                                                            src={imgSrc}
                                                                            alt={`Referencia ${idx + 1}`}
                                                                            className="w-10 h-10 rounded-lg object-cover border border-[#FFC99C]"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {item.type_color && !item.genero && (
                                                    <p className="text-xs text-[#D86A33] font-medium mt-1">{item.type_color}</p>
                                                )}

                                                {/* Stock / Encargo Status Badge */}
                                                {item.es_por_encargo ? (
                                                    <div className="mt-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300 text-[10px] font-black text-amber-800 inline-flex items-center gap-1">
                                                        <span>📦 SOLICITADO POR ENCARGO</span>
                                                        {item.stock_disponible !== undefined && (
                                                            <span className="font-bold text-amber-700">
                                                                (Stock actual: {item.stock_disponible} uds)
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : item.stock_disponible !== undefined ? (
                                                    <div className="mt-1 text-[10px] font-bold text-emerald-700">
                                                        ✓ En stock ({item.stock_disponible} uds disponibles)
                                                    </div>
                                                ) : null}

                                                {/* Quantity & Delete Controls */}
                                                <div className="flex items-center justify-between mt-3">
                                                    {((item.categoria_slug === 'gorros' && Number(item.subcategoria_id) === 70) ||
                                                      (item.categoria_slug === 'lanyards' && Number(item.subcategoria_id) === 5)) ? (
                                                        <span className="text-[11px] font-black text-[#5F2142] bg-[#FFF4EB] border border-[#FFC99C]/70 px-2.5 py-1 rounded-xl">
                                                            Pieza única
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl p-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.cart_item_id, Math.max(1, item.quantity - 1))}
                                                                className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#D86A33]"
                                                            >
                                                                <Minus size={14} />
                                                            </button>
                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                value={item.quantity}
                                                                onChange={(e) => {
                                                                    const digits = e.target.value.replace(/[^0-9]/g, '');
                                                                    const parsed = parseInt(digits, 10);
                                                                    if (!isNaN(parsed) && parsed >= 1) {
                                                                        updateQuantity(item.cart_item_id, parsed);
                                                                    }
                                                                }}
                                                                aria-label="Cantidad"
                                                                className="w-9 text-center text-xs font-black text-[#5F2142] bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-[#D86A33] rounded-md py-0.5"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                                                                className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#D86A33]"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => removeItem(item.cart_item_id)}
                                                        className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                                                        title="Eliminar del carrito"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Drawer Footer with Checkout Button */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-gray-100 bg-[#FFF9F5]/60 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subtotal:</span>
                                    <span className="text-2xl font-black text-[#5F2142]">${total.toFixed(2)}</span>
                                </div>

                                <button
                                    onClick={handleStartCheckout}
                                    className="w-full py-3.5 bg-[#D86A33] hover:bg-[#c25925] text-white rounded-full font-black text-sm sm:text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#D86A33]/25 flex items-center justify-center gap-2"
                                >
                                    <span>Formalizar Compra y Pagar</span>
                                    <ArrowRight size={17} />
                                </button>

                                <button 
                                    onClick={clearCart} 
                                    className="w-full text-center text-xs text-gray-400 hover:text-red-500 transition-colors pt-1"
                                >
                                    Vaciar carrito
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Global Checkout Modal */}
            <CheckoutModal />
        </>
    );
}
