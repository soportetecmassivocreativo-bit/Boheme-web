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
                                        Explora nuestra colección y añade gorros o accesorios médicos a tu pedido.
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
                                                        {item.especialidad_personalizada && (
                                                            <div><strong>Especialidad:</strong> {item.especialidad_personalizada}</div>
                                                        )}
                                                        {item.color_preferencia && (
                                                            <div><strong>Color/Preferencia:</strong> {item.color_preferencia}</div>
                                                        )}
                                                        {item.detalles_personalizados && (
                                                            <div><strong>Notas:</strong> {item.detalles_personalizados}</div>
                                                        )}
                                                    </div>
                                                )}

                                                {item.type_color && (
                                                    <p className="text-xs text-[#D86A33] font-medium mt-1">{item.type_color}</p>
                                                )}

                                                {/* Quantity & Delete Controls */}
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl p-0.5">
                                                        <button
                                                            onClick={() => updateQuantity(item.cart_item_id, Math.max(1, item.quantity - 1))}
                                                            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#D86A33]"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="px-2 text-xs font-black text-[#5F2142]">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                                                            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#D86A33]"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>

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
