'use client';

import { useCartStore } from '@/lib/store';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { parseImages } from '@/lib/utils';

const WHATSAPP_NUMBER = "584121409976";

export default function CartDrawer() {
    const { items, isOpen, toggleCart, removeItem, updateQuantity, clearCart } = useCartStore();

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCheckout = () => {
        if (items.length === 0) return;

        let message = "Hola BOHEME! Quiero hacer el siguiente pedido:%0A%0A";
        items.forEach(item => {
            message += `- ${item.quantity}x ${item.name} ${item.type_color ? `(${item.type_color})` : ''}%0A`;
            if (item.genero) message += `  Género: ${item.genero}%0A`;
            if (item.modelo) message += `  Modelo: ${item.modelo}%0A`;
            if (item.cinta) message += `  Cinta: ${item.cinta}%0A`;
            if (item.texto_personalizado) message += `  Texto/Nombre: ${item.texto_personalizado}%0A`;
            if (item.imagenes_personalizadas && item.imagenes_personalizadas.length > 0) {
                message += `  Imágenes enviadas: ${item.imagenes_personalizadas.map(url => `${window.location.origin}${url}`).join(', ')}%0A`;
            }
        });

        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" onClick={toggleCart} />

            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white text-gray-900 border-l border-gray-100 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-[#5F2142]">Tu Carrito</h2>
                    <button onClick={toggleCart} className="text-gray-500 hover:text-[#5F2142] transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                            <p>Tu carrito está vacío.</p>
                            <a
                                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola BOHEME! Quisiera hacer una consulta:`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 py-3 px-6 bg-[#D86A33] text-white rounded-xl font-bold hover:bg-[#c25925] transition-all shadow-md shadow-[#D86A33]/20 inline-block text-center"
                            >
                                Escríbenos al WhatsApp
                            </a>
                        </div>
                    ) : (
                        items.map(item => {
                            const firstImage = parseImages(item.image_url)[0];
                            return (
                                <div key={item.cart_item_id} className="flex gap-4 border-b border-gray-100 pb-6">
                                    <div className="w-20 h-20 bg-[#FFF9F5] border border-gray-100 rounded-xl overflow-hidden relative flex-shrink-0">
                                        {firstImage ? (
                                            <img src={firstImage} alt={item.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="w-full h-full bg-[#FFF4EB] flex items-center justify-center text-xs text-[#5F2142] font-bold">Foto</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-[#5F2142]">{item.name}</h3>
                                        {item.type_color && <p className="text-sm text-[#D86A33] font-medium">{item.type_color}</p>}

                                        {/* Custom options display */}
                                        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                            {item.genero && <p>Género: {item.genero}</p>}
                                            {item.modelo && <p>Modelo: {item.modelo}</p>}
                                            {item.cinta && <p>Cinta: {item.cinta}</p>}
                                            {item.texto_personalizado && <p>Texto: {item.texto_personalizado}</p>}
                                            {item.imagenes_personalizadas && item.imagenes_personalizadas.length > 0 && <p className="text-[#D86A33] font-medium">{item.imagenes_personalizadas.length} imagen(es) adjunta(s)</p>}
                                        </div>


                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center border border-gray-200 bg-gray-50 rounded-lg">
                                                <button
                                                    onClick={() => updateQuantity(item.cart_item_id, Math.max(1, item.quantity - 1))}
                                                    className="px-2 py-1 text-gray-500 hover:text-[#D86A33]"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="px-2 text-sm font-semibold text-[#5F2142]">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                                                    className="px-2 py-1 text-gray-500 hover:text-[#D86A33]"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.cart_item_id)}
                                                className="text-red-400 hover:text-red-600 p-1"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-700 font-medium">Total estimado:</span>
                            <span className="text-2xl font-extrabold text-[#5F2142]">${total.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full py-4 bg-[#D86A33] text-white rounded-xl font-bold text-lg hover:bg-[#c25925] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#D86A33]/25"
                        >
                            Finalizar Compra por WhatsApp
                        </button>
                        <button onClick={clearCart} className="w-full mt-4 py-2 text-gray-500 text-sm hover:text-gray-900">
                            Vaciar carrito
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}