'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { 
    X, 
    Check, 
    Copy, 
    CreditCard, 
    Truck, 
    User, 
    ArrowRight, 
    ArrowLeft, 
    ShoppingBag, 
    Sparkles, 
    AlertCircle, 
    ExternalLink,
    Building2,
    Phone,
    FileText
} from 'lucide-react';

const WHATSAPP_NUMBER = "584121409976";

// Payment details specified by BOHEME
const PAYMENT_INFO = {
    pagoMovil: {
        banco: "Banco de Venezuela (0102)",
        telefono: "0412-1409976",
        telefonoRaw: "04121409976",
        cedula: "V-24.354.847",
        cedulaRaw: "24354847",
        titular: "BOHEME"
    },
    binance: {
        email: "worldglobalweb724@gmail.com"
    }
};

export default function CheckoutModal() {
    const { items, isCheckoutOpen, setCheckoutOpen, clearCart } = useCartStore();

    // Steps: 1 = Datos & Envío, 2 = Pago & Comprobante, 3 = Éxito
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // Copy feedback state
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Form: Customer & Delivery Data
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [cedula, setCedula] = useState('');
    const [telefono, setTelefono] = useState('');
    const [tipoEntrega, setTipoEntrega] = useState<'local' | 'nacional'>('local');
    const [direccionLocal, setDireccionLocal] = useState('');
    const [empresaEnvio, setEmpresaEnvio] = useState('MRW');
    const [estado, setEstado] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [direccionAgencia, setDireccionAgencia] = useState('');
    const [personaRetira, setPersonaRetira] = useState('');
    const [cedulaRetira, setCedulaRetira] = useState('');

    // Form: Payment Data
    const [metodoPago, setMetodoPago] = useState<'pago_movil' | 'binance'>('pago_movil');
    const [bancoEmisor, setBancoEmisor] = useState('');
    const [telefonoOEmailEmisor, setTelefonoOEmailEmisor] = useState('');
    const [referenciaPago, setReferenciaPago] = useState('');
    const [montoPagado, setMontoPagado] = useState('');

    // Validation errors
    const [formError, setFormError] = useState<string | null>(null);

    if (!isCheckoutOpen) return null;

    const totalUSD = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCopy = (text: string, fieldId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const validateStep1 = () => {
        setFormError(null);
        if (!nombre.trim() || !apellido.trim()) {
            setFormError('Por favor ingresa tu nombre y apellido.');
            return false;
        }
        if (!cedula.trim()) {
            setFormError('Por favor ingresa tu número de cédula.');
            return false;
        }
        if (!telefono.trim()) {
            setFormError('Por favor ingresa tu número de teléfono / WhatsApp.');
            return false;
        }

        if (tipoEntrega === 'local') {
            if (!direccionLocal.trim()) {
                setFormError('Por favor indica tu dirección o zona para la entrega local.');
                return false;
            }
        } else {
            if (!estado.trim() || !ciudad.trim()) {
                setFormError('Por favor indica el estado y ciudad de destino para el envío.');
                return false;
            }
            if (!direccionAgencia.trim()) {
                setFormError('Por favor indica la dirección completa o nombre/código de la agencia de encomienda.');
                return false;
            }
        }

        return true;
    };

    const validateStep2 = () => {
        setFormError(null);
        if (!telefonoOEmailEmisor.trim()) {
            setFormError(
                metodoPago === 'pago_movil' 
                    ? 'Por favor indica el número de teléfono desde donde realizaste el Pago Móvil.' 
                    : 'Por favor indica tu correo o usuario de Binance desde donde pagaste.'
            );
            return false;
        }
        if (!referenciaPago.trim()) {
            setFormError('Por favor ingresa el número de referencia bancaria o ID de transacción.');
            return false;
        }
        if (!montoPagado.trim()) {
            setFormError('Por favor confirma el monto exacto transferido.');
            return false;
        }
        return true;
    };

    const handleNextToPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep1()) {
            setStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleCerrarPedido = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep2()) return;

        // Build WhatsApp Message
        let msg = `🌸 *NUEVO PEDIDO FORMALIZADO - BOHEME* 🌸\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        msg += `👤 *DATOS DEL CLIENTE:*\n`;
        msg += `• *Nombre:* ${nombre.trim()} ${apellido.trim()}\n`;
        msg += `• *Cédula:* ${cedula.trim()}\n`;
        msg += `• *Teléfono:* ${telefono.trim()}\n\n`;

        msg += `📦 *DETALLE DEL PEDIDO:*\n`;
        items.forEach((item, idx) => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            msg += `*${idx + 1}. ${item.quantity}x ${item.name}* — $${itemTotal}\n`;
            
            // Personalization details
            if (item.is_personalizado || item.nombre_personalizado || item.especialidad_personalizada || item.texto_personalizado) {
                msg += `   ✨ *Personalización:*\n`;
                if (item.nombre_personalizado) {
                    msg += `   ▫️ *Nombre a bordar/estampar:* ${item.nombre_personalizado}\n`;
                }
                if (item.especialidad_personalizada) {
                    msg += `   ▫️ *Especialidad/Cargo:* ${item.especialidad_personalizada}\n`;
                }
                if (item.color_preferencia) {
                    msg += `   ▫️ *Color/Preferencia:* ${item.color_preferencia}\n`;
                }
                if (item.detalles_personalizados) {
                    msg += `   ▫️ *Especificaciones:* ${item.detalles_personalizados}\n`;
                }
                if (item.texto_personalizado && !item.nombre_personalizado) {
                    msg += `   ▫️ *Texto:* ${item.texto_personalizado}\n`;
                }
            }

            if (item.type_color) msg += `   ▫️ *Color:* ${item.type_color}\n`;
            if (item.genero) msg += `   ▫️ *Género:* ${item.genero}\n`;
            if (item.modelo) msg += `   ▫️ *Modelo:* ${item.modelo}\n`;
        });

        msg += `\n💰 *TOTAL DEL PEDIDO:* $${totalUSD.toFixed(2)}\n\n`;

        msg += `🚚 *DATOS DE ENTREGA:*\n`;
        if (tipoEntrega === 'local') {
            msg += `• *Modalidad:* Entrega Local / Retiro Personal\n`;
            msg += `• *Dirección / Punto de Entrega:* ${direccionLocal.trim()}\n`;
        } else {
            msg += `• *Modalidad:* Envío Nacional\n`;
            msg += `• *Empresa:* ${empresaEnvio}\n`;
            msg += `• *Destino:* ${ciudad.trim()}, ${estado.trim()}\n`;
            msg += `• *Dirección / Agencia de Retiro:* ${direccionAgencia.trim()}\n`;
            const receptor = personaRetira.trim() || `${nombre.trim()} ${apellido.trim()}`;
            const ciReceptor = cedulaRetira.trim() || cedula.trim();
            msg += `• *Quién retira:* ${receptor} (C.I: ${ciReceptor})\n`;
        }
        msg += `\n`;

        msg += `💳 *DATOS DEL PAGO REALIZADO:*\n`;
        if (metodoPago === 'pago_movil') {
            msg += `• *Método:* Pago Móvil (Banco de Venezuela)\n`;
            if (bancoEmisor.trim()) msg += `• *Banco Emisor:* ${bancoEmisor.trim()}\n`;
            msg += `• *Teléfono Emisor:* ${telefonoOEmailEmisor.trim()}\n`;
            msg += `• *Nro. de Referencia:* ${referenciaPago.trim()}\n`;
            msg += `• *Monto Transferido:* ${montoPagado.trim()}\n`;
        } else {
            msg += `• *Método:* Binance Pay (USDT)\n`;
            msg += `• *Usuario / Correo Binance:* ${telefonoOEmailEmisor.trim()}\n`;
            msg += `• *ID / TxID de Transacción:* ${referenciaPago.trim()}\n`;
            msg += `• *Monto Transferido:* ${montoPagado.trim()} USDT\n`;
        }
        msg += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `📎 *Adjunto a continuación la captura del comprobante de pago.* ¡Quedo atento a la confirmación!`;

        const encodedMessage = encodeURIComponent(msg);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');

        // Transition to success view and clear cart
        setStep(3);
        clearCart();
    };

    const handleClose = () => {
        setCheckoutOpen(false);
        setStep(1);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-gray-100 relative my-6 max-h-[92vh] flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#FFF4EB] border border-[#D86A33]/30 text-[#D86A33] flex items-center justify-center font-bold">
                            ✦
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-[#5F2142] tracking-tight">
                                Formalizar Pedido
                            </h2>
                            <p className="text-[11px] text-gray-500 font-medium">
                                Proceso de compra y validación directa
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Step Indicator */}
                {step !== 3 && (
                    <div className="py-3 px-1 border-b border-gray-100 shrink-0 bg-[#FFF9F5]/40 -mx-5 sm:-mx-8 px-5 sm:px-8">
                        <div className="flex items-center justify-between max-w-md mx-auto text-xs">
                            <div className={`flex items-center gap-1.5 font-black ${step === 1 ? 'text-[#D86A33]' : 'text-gray-400'}`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? 'bg-[#D86A33] text-white shadow-xs' : 'bg-gray-200 text-gray-600'}`}>
                                    1
                                </span>
                                <span>Datos & Entrega</span>
                            </div>

                            <span className="h-0.5 w-12 bg-gray-200" />

                            <div className={`flex items-center gap-1.5 font-black ${step === 2 ? 'text-[#D86A33]' : 'text-gray-400'}`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? 'bg-[#D86A33] text-white shadow-xs' : 'bg-gray-200 text-gray-600'}`}>
                                    2
                                </span>
                                <span>Pago & Comprobante</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Banner */}
                {formError && (
                    <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 shrink-0">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{formError}</span>
                    </div>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-6">

                    {/* ================= STEP 1: DATOS Y ENTREGA ================= */}
                    {step === 1 && (
                        <form id="step1-form" onSubmit={handleNextToPayment} className="space-y-6">
                            {/* Order Summary Mini-Card */}
                            <div className="bg-[#FFF9F5] p-4 rounded-2xl border border-[#FFC99C]/50 space-y-2">
                                <div className="flex items-center justify-between text-xs font-black text-[#5F2142] uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5">
                                        <ShoppingBag size={14} className="text-[#D86A33]" />
                                        <span>Resumen de tu Carrito ({items.length} productos)</span>
                                    </span>
                                    <span className="text-[#D86A33] text-sm">Total: ${totalUSD.toFixed(2)}</span>
                                </div>
                                <div className="text-xs text-gray-600 divide-y divide-gray-200/50 pt-1">
                                    {items.map((it) => (
                                        <div key={it.cart_item_id} className="py-1.5 flex justify-between items-start gap-2">
                                            <div>
                                                <span className="font-bold text-gray-800">{it.quantity}x {it.name}</span>
                                                {it.is_personalizado && (
                                                    <div className="text-[11px] text-[#D86A33] font-medium mt-0.5">
                                                        ✦ Personalizado: {it.nombre_personalizado || it.texto_personalizado || 'A la medida'}
                                                        {it.especialidad_personalizada && ` (${it.especialidad_personalizada})`}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-bold text-[#5F2142] shrink-0">${(it.price * it.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section: Customer Data */}
                            <div>
                                <h3 className="text-sm font-black text-[#5F2142] uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <User size={15} className="text-[#D86A33]" />
                                    <span>Tus Datos de Contacto</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Ej: Valeria"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                            Apellido *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={apellido}
                                            onChange={(e) => setApellido(e.target.value)}
                                            placeholder="Ej: Gómez"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                            Cédula de Identidad *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={cedula}
                                            onChange={(e) => setCedula(e.target.value)}
                                            placeholder="Ej: V-25.123.456"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                            Teléfono / WhatsApp *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={telefono}
                                            onChange={(e) => setTelefono(e.target.value)}
                                            placeholder="Ej: 0412-1234567"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Delivery Option */}
                            <div>
                                <h3 className="text-sm font-black text-[#5F2142] uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Truck size={15} className="text-[#D86A33]" />
                                    <span>Modalidad de Entrega</span>
                                </h3>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setTipoEntrega('local')}
                                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                                            tipoEntrega === 'local'
                                                ? 'bg-[#FFF4EB] border-[#D86A33] text-[#5F2142] shadow-xs'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="font-black text-xs sm:text-sm">📍 Entrega Local / Retiro</div>
                                        <div className="text-[11px] text-gray-500 mt-0.5">En la ciudad o entrega personal</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setTipoEntrega('nacional')}
                                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                                            tipoEntrega === 'nacional'
                                                ? 'bg-[#FFF4EB] border-[#D86A33] text-[#5F2142] shadow-xs'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="font-black text-xs sm:text-sm">🚚 Envío Nacional</div>
                                        <div className="text-[11px] text-gray-500 mt-0.5">MRW, Zoom, Tealca, Domesa</div>
                                    </button>
                                </div>

                                {tipoEntrega === 'local' ? (
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                            Dirección o Zona de Entrega Acordada *
                                        </label>
                                        <textarea
                                            rows={2}
                                            required
                                            value={direccionLocal}
                                            onChange={(e) => setDireccionLocal(e.target.value)}
                                            placeholder="Indica tu dirección o punto de encuentro preferido..."
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-3.5 p-4 rounded-2xl bg-[#FFF9F5]/70 border border-[#FFC99C]/40">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                                    Empresa de Encomienda *
                                                </label>
                                                <select
                                                    value={empresaEnvio}
                                                    onChange={(e) => setEmpresaEnvio(e.target.value)}
                                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium bg-white"
                                                >
                                                    <option value="MRW">MRW</option>
                                                    <option value="ZOOM">ZOOM</option>
                                                    <option value="Tealca">Tealca</option>
                                                    <option value="Domesa">Domesa</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                                    Estado *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={estado}
                                                    onChange={(e) => setEstado(e.target.value)}
                                                    placeholder="Ej: Carabobo"
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium bg-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                                    Ciudad / Municipio *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={ciudad}
                                                    onChange={(e) => setCiudad(e.target.value)}
                                                    placeholder="Ej: Valencia"
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium bg-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                                Dirección Exacta o Nombre / Código de la Agencia de Retiro *
                                            </label>
                                            <textarea
                                                rows={2}
                                                required
                                                value={direccionAgencia}
                                                onChange={(e) => setDireccionAgencia(e.target.value)}
                                                placeholder="Ej: Agencia MRW San Diego - Código 0204, o dirección detallada con puntos de referencia..."
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium bg-white"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                            <div>
                                                <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                                    Nombre de quien retira (si es otra persona)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={personaRetira}
                                                    onChange={(e) => setPersonaRetira(e.target.value)}
                                                    placeholder="Dejar vacío si retiras tú"
                                                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                                    Cédula de quien retira
                                                </label>
                                                <input
                                                    type="text"
                                                    value={cedulaRetira}
                                                    onChange={(e) => setCedulaRetira(e.target.value)}
                                                    placeholder="Dejar vacío si retiras tú"
                                                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    )}

                    {/* ================= STEP 2: PAGO Y COMPROBANTE ================= */}
                    {step === 2 && (
                        <form id="step2-form" onSubmit={handleCerrarPedido} className="space-y-6">
                            {/* Total To Pay Banner */}
                            <div className="bg-[#FFF4EB] p-4 sm:p-5 rounded-2xl border-2 border-dashed border-[#D86A33] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div>
                                    <div className="text-xs font-black text-[#5F2142] uppercase tracking-wider">
                                        Monto Total a Transferir
                                    </div>
                                    <div className="text-3xl font-black text-[#D86A33]">
                                        ${totalUSD.toFixed(2)} USD
                                    </div>
                                </div>
                                <div className="text-xs text-gray-600 bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-[#FFC99C] font-medium">
                                    Pago en Bolívares a tasa oficial o Binance USDT
                                </div>
                            </div>

                            {/* Payment Method Selector */}
                            <div>
                                <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <CreditCard size={15} className="text-[#D86A33]" />
                                    <span>Selecciona tu Método de Pago</span>
                                </label>

                                <div className="grid grid-cols-2 gap-3.5">
                                    {/* Pago Movil Option */}
                                    <button
                                        type="button"
                                        onClick={() => { setMetodoPago('pago_movil'); setMontoPagado(`$${totalUSD.toFixed(2)}`); }}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                            metodoPago === 'pago_movil'
                                                ? 'bg-[#FFF9F5] border-[#D86A33] shadow-md shadow-[#D86A33]/15'
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-black text-sm text-[#5F2142]">Pago Móvil</span>
                                            {metodoPago === 'pago_movil' && (
                                                <span className="w-5 h-5 rounded-full bg-[#D86A33] text-white flex items-center justify-center text-[10px] font-bold">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 font-medium">Banco de Venezuela (0102)</div>
                                    </button>

                                    {/* Binance Option */}
                                    <button
                                        type="button"
                                        onClick={() => { setMetodoPago('binance'); setMontoPagado(`${totalUSD.toFixed(2)}`); }}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                            metodoPago === 'binance'
                                                ? 'bg-[#FFF9F5] border-[#D86A33] shadow-md shadow-[#D86A33]/15'
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-black text-sm text-[#5F2142]">Binance Pay</span>
                                            {metodoPago === 'binance' && (
                                                <span className="w-5 h-5 rounded-full bg-[#D86A33] text-white flex items-center justify-center text-[10px] font-bold">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 font-medium">USDT / Correo Binance</div>
                                    </button>
                                </div>
                            </div>

                            {/* Bank Details Box with 1-Click Copy */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
                                <div className="flex items-center justify-between text-xs font-black text-[#5F2142] uppercase tracking-wider pb-2 border-b border-gray-100">
                                    <span>Datos para realizar tu pago:</span>
                                    <span className="text-[11px] text-[#D86A33] font-bold">Toca para copiar</span>
                                </div>

                                {metodoPago === 'pago_movil' ? (
                                    <div className="space-y-2.5">
                                        {/* Banco */}
                                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
                                            <div>
                                                <span className="text-gray-400 font-medium block text-[10px] uppercase">Banco</span>
                                                <span className="font-bold text-gray-900">{PAYMENT_INFO.pagoMovil.banco}</span>
                                            </div>
                                            <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-[10px] font-bold">0102</span>
                                        </div>

                                        {/* Teléfono with Copy */}
                                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
                                            <div>
                                                <span className="text-gray-400 font-medium block text-[10px] uppercase">Teléfono</span>
                                                <span className="font-black text-[#5F2142] text-sm">{PAYMENT_INFO.pagoMovil.telefono}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(PAYMENT_INFO.pagoMovil.telefonoRaw, 'pm_tel')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                    copiedField === 'pm_tel'
                                                        ? 'bg-green-600 text-white shadow-xs'
                                                        : 'bg-white text-[#5F2142] border border-gray-300 hover:border-[#D86A33]'
                                                }`}
                                            >
                                                {copiedField === 'pm_tel' ? <Check size={13} /> : <Copy size={13} />}
                                                <span>{copiedField === 'pm_tel' ? '¡Copiado!' : 'Copiar'}</span>
                                            </button>
                                        </div>

                                        {/* Cédula with Copy */}
                                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
                                            <div>
                                                <span className="text-gray-400 font-medium block text-[10px] uppercase">Cédula de Identidad</span>
                                                <span className="font-black text-[#5F2142] text-sm">{PAYMENT_INFO.pagoMovil.cedula}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(PAYMENT_INFO.pagoMovil.cedulaRaw, 'pm_ci')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                    copiedField === 'pm_ci'
                                                        ? 'bg-green-600 text-white shadow-xs'
                                                        : 'bg-white text-[#5F2142] border border-gray-300 hover:border-[#D86A33]'
                                                }`}
                                            >
                                                {copiedField === 'pm_ci' ? <Check size={13} /> : <Copy size={13} />}
                                                <span>{copiedField === 'pm_ci' ? '¡Copiado!' : 'Copiar'}</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {/* Binance Email with Copy */}
                                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
                                            <div>
                                                <span className="text-gray-400 font-medium block text-[10px] uppercase">Correo / Pay ID</span>
                                                <span className="font-black text-[#5F2142] text-sm break-all">{PAYMENT_INFO.binance.email}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(PAYMENT_INFO.binance.email, 'bin_email')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ml-2 ${
                                                    copiedField === 'bin_email'
                                                        ? 'bg-green-600 text-white shadow-xs'
                                                        : 'bg-white text-[#5F2142] border border-gray-300 hover:border-[#D86A33]'
                                                }`}
                                            >
                                                {copiedField === 'bin_email' ? <Check size={13} /> : <Copy size={13} />}
                                                <span>{copiedField === 'bin_email' ? '¡Copiado!' : 'Copiar'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Form to Register the Payment */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF9F5] border border-[#FFC99C]/50 space-y-4">
                                <h4 className="text-xs font-black text-[#5F2142] uppercase tracking-wider flex items-center gap-2">
                                    <FileText size={15} className="text-[#D86A33]" />
                                    <span>Registra los datos de tu comprobante de pago</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                            {metodoPago === 'pago_movil' ? 'Teléfono emisor del pago *' : 'Tu Usuario o Correo Binance *'}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={telefonoOEmailEmisor}
                                            onChange={(e) => setTelefonoOEmailEmisor(e.target.value)}
                                            placeholder={metodoPago === 'pago_movil' ? 'Ej: 0414-1234567' : 'Ej: micorreo@gmail.com'}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium bg-white"
                                        />
                                    </div>

                                    {metodoPago === 'pago_movil' && (
                                        <div>
                                            <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                                Banco de Origen (Emisor)
                                            </label>
                                            <input
                                                type="text"
                                                value={bancoEmisor}
                                                onChange={(e) => setBancoEmisor(e.target.value)}
                                                placeholder="Ej: Banesco, Mercantil, BDV..."
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium bg-white"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                            {metodoPago === 'pago_movil' ? 'Nro. de Referencia *' : 'ID / TxID de Transacción *'}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={referenciaPago}
                                            onChange={(e) => setReferenciaPago(e.target.value)}
                                            placeholder="Ej: 123456"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                            Monto exacto transferido *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={montoPagado}
                                            onChange={(e) => setMontoPagado(e.target.value)}
                                            placeholder={`Ej: $${totalUSD.toFixed(2)} o en Bs.`}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Capture Reminder Note */}
                                <div className="p-3 rounded-xl bg-white border border-[#D86A33]/30 text-xs text-gray-700 flex items-start gap-2.5 font-normal">
                                    <span className="text-base">📷</span>
                                    <div>
                                        <strong className="text-[#5F2142] block font-bold">Importante: Comprobante / Capture de Pago</strong>
                                        Al pulsar el botón a continuación, se abrirá WhatsApp con el mensaje estructurado de tu compra. 
                                        Allí deberás <strong>adjuntar la captura del comprobante</strong> para que el equipo de BOHEME valide tu pago de inmediato.
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* ================= STEP 3: PEDIDO ENVIADO CON ÉXITO ================= */}
                    {step === 3 && (
                        <div className="text-center py-6 sm:py-10 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-2xl shadow-sm">
                                ✓
                            </div>
                            <h3 className="text-2xl font-black text-[#5F2142] tracking-tight">
                                ¡Pedido Formalizado con Éxito!
                            </h3>
                            <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed font-normal">
                                Tu orden ha sido generada y el mensaje fue enviado a nuestro WhatsApp oficial. 
                                Recuerda enviar la <strong>captura del comprobante</strong> en el chat para iniciar la preparación de tus prendas.
                            </p>

                            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                                <button
                                    onClick={handleClose}
                                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#5F2142] hover:bg-[#43142e] text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-[#5F2142]/20 hover:scale-105"
                                >
                                    Volver a la Tienda
                                </button>
                                <a
                                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto px-6 py-3 rounded-full border-2 border-[#D86A33] text-[#D86A33] hover:bg-[#D86A33] hover:text-white text-xs sm:text-sm font-black transition-all inline-flex items-center justify-center gap-1.5"
                                >
                                    <span>Abrir Chat de WhatsApp</span>
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                {step !== 3 && (
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
                        {step === 1 ? (
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors"
                            >
                                Regresar al carrito
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors flex items-center gap-1.5"
                            >
                                <ArrowLeft size={14} />
                                <span>Atrás</span>
                            </button>
                        )}

                        {step === 1 ? (
                            <button
                                type="submit"
                                form="step1-form"
                                className="px-6 py-3 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white text-xs sm:text-sm font-black transition-all hover:scale-105 shadow-md shadow-[#D86A33]/25 flex items-center gap-2"
                            >
                                <span>Continuar al Pago</span>
                                <ArrowRight size={15} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                form="step2-form"
                                className="px-7 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-black transition-all hover:scale-105 shadow-lg shadow-[#25D366]/30 flex items-center gap-2"
                            >
                                <span>Cerrar Pedido y Enviar a WhatsApp</span>
                                <span>💬</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
