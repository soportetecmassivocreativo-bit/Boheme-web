'use client';

import { useState, useEffect } from 'react';
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
    FileText,
    TrendingUp,
    RefreshCw
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

    // BCV Rate state
    const [bcvRate, setBcvRate] = useState<number>(887.30);
    const [bcvFechaValor, setBcvFechaValor] = useState<string>('');
    const [isRefreshingBcv, setIsRefreshingBcv] = useState(false);

    // Dynamic Site & Payment Settings
    const [siteSettings, setSiteSettings] = useState<{
        pagoMovil: typeof PAYMENT_INFO.pagoMovil & { activo?: boolean };
        binance: typeof PAYMENT_INFO.binance & { payId?: string; titular?: string; activo?: boolean };
        cuentasAdicionales?: Array<{
            id: string;
            tipo: string;
            nombreMetodo: string;
            bancoOPlataforma: string;
            titular: string;
            cedulaORif?: string;
            telefono?: string;
            numeroCuentaOCorreo: string;
            tipoCuenta?: string;
            moneda: 'BS' | 'USD';
            instrucciones?: string;
            activo: boolean;
        }>;
        tienda: {
            telefonoWhatsapp: string;
        };
    }>({
        pagoMovil: PAYMENT_INFO.pagoMovil,
        binance: PAYMENT_INFO.binance,
        cuentasAdicionales: [],
        tienda: {
            telefonoWhatsapp: WHATSAPP_NUMBER
        }
    });

    // Copy feedback state
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Form: Customer & Delivery Data
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [cedula, setCedula] = useState('');
    const [telefono, setTelefono] = useState('');
    const [tipoEntrega, setTipoEntrega] = useState<'local' | 'nacional'>('local');
    const [municipioLocal, setMunicipioLocal] = useState<'Municipio Miranda' | 'Municipio Colina'>('Municipio Miranda');
    const [direccionLocal, setDireccionLocal] = useState('');
    const [empresaEnvio, setEmpresaEnvio] = useState('MRW');
    const [estado, setEstado] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [direccionAgencia, setDireccionAgencia] = useState('');
    const [personaRetira, setPersonaRetira] = useState('');
    const [cedulaRetira, setCedulaRetira] = useState('');

    // Form: Payment Data
    const [metodoPago, setMetodoPago] = useState<'pago_movil' | 'binance' | string>('pago_movil');
    const [bancoEmisor, setBancoEmisor] = useState('');
    const [telefonoOEmailEmisor, setTelefonoOEmailEmisor] = useState('');
    const [referenciaPago, setReferenciaPago] = useState('');
    const [montoPagado, setMontoPagado] = useState('');

    // Validation errors
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch official BCV rate function
    const fetchBcvRate = async (force = false) => {
        setIsRefreshingBcv(true);
        try {
            const res = await fetch(`/api/bcv${force ? '?refresh=true' : ''}`);
            const data = await res.json();
            if (data && typeof data.rate === 'number' && data.rate > 0) {
                setBcvRate(data.rate);
                if (data.fechaValor) setBcvFechaValor(data.fechaValor);
            }
        } catch {
            // Keep current rate
        } finally {
            setIsRefreshingBcv(false);
        }
    };

    // Fetch official BCV rate and dynamic settings on mount
    useEffect(() => {
        fetchBcvRate(false);
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data && data.settings) {
                    setSiteSettings(prev => ({
                        ...prev,
                        ...data.settings
                    }));
                }
            })
            .catch(() => {});
    }, []);

    if (!isCheckoutOpen) return null;

    const totalUSD = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalBs = totalUSD * bcvRate;

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
            // Auto fill initial suggested amount for the selected method
            if (metodoPago === 'pago_movil') {
                setMontoPagado(`Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            } else {
                setMontoPagado(`$${totalUSD.toFixed(2)} USDT`);
            }
            setStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleCerrarPedido = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep2()) return;
        setIsSubmitting(true);

        // 1. Build WhatsApp Message
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

        const formattedBs = totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        msg += `\n💰 *TOTAL DEL PEDIDO:* $${totalUSD.toFixed(2)} USD  ≈  *Bs. ${formattedBs}* (Tasa BCV: ${bcvRate} Bs/$)\n\n`;

        msg += `🚚 *DATOS DE ENTREGA:*\n`;
        if (tipoEntrega === 'local') {
            msg += `• *Modalidad:* Entrega Local (${municipioLocal})\n`;
            msg += `• *Municipio:* ${municipioLocal}\n`;
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

        const activeExtraAccount = (siteSettings.cuentasAdicionales || []).find(c => c.id === metodoPago);

        msg += `💳 *DATOS DEL PAGO REALIZADO:*\n`;
        if (metodoPago === 'pago_movil') {
            msg += `• *Método:* Pago Móvil (${siteSettings.pagoMovil.banco})\n`;
            if (bancoEmisor.trim()) msg += `• *Banco Emisor:* ${bancoEmisor.trim()}\n`;
            msg += `• *Teléfono Emisor:* ${telefonoOEmailEmisor.trim()}\n`;
            msg += `• *Nro. de Referencia:* ${referenciaPago.trim()}\n`;
            msg += `• *Monto Transferido:* ${montoPagado.trim()}\n`;
        } else if (metodoPago === 'binance') {
            msg += `• *Método:* Binance Pay (USDT)\n`;
            msg += `• *Usuario / Correo Binance:* ${telefonoOEmailEmisor.trim()}\n`;
            msg += `• *ID / TxID de Transacción:* ${referenciaPago.trim()}\n`;
            msg += `• *Monto Transferido:* ${montoPagado.trim()}\n`;
        } else if (activeExtraAccount) {
            msg += `• *Método:* ${activeExtraAccount.nombreMetodo} (${activeExtraAccount.bancoOPlataforma})\n`;
            if (bancoEmisor.trim()) msg += `• *Banco / Plataforma Emisor:* ${bancoEmisor.trim()}\n`;
            msg += `• *Emisor (Teléfono / Correo / Titular):* ${telefonoOEmailEmisor.trim()}\n`;
            msg += `• *Nro. de Referencia / Comprobante:* ${referenciaPago.trim()}\n`;
            msg += `• *Monto Transferido:* ${montoPagado.trim()}\n`;
        }
        msg += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `📎 *Adjunto a continuación la captura del comprobante de pago.* ¡Quedo atento a la confirmación!`;

        // 2. Register Order in Admin Billing Module (Facturado)
        try {
            await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cliente_nombre: nombre.trim(),
                    cliente_apellido: apellido.trim(),
                    cliente_cedula: cedula.trim(),
                    cliente_telefono: telefono.trim(),
                    tipo_entrega: tipoEntrega,
                    direccion_entrega: tipoEntrega === 'local' ? `${municipioLocal} - ${direccionLocal.trim()}` : direccionAgencia.trim(),
                    empresa_envio: tipoEntrega === 'nacional' ? empresaEnvio : undefined,
                    estado: tipoEntrega === 'nacional' ? estado.trim() : undefined,
                    ciudad: tipoEntrega === 'nacional' ? ciudad.trim() : undefined,
                    persona_retira: personaRetira.trim() || undefined,
                    cedula_retira: cedulaRetira.trim() || undefined,
                    metodo_pago: activeExtraAccount ? activeExtraAccount.tipo : metodoPago,
                    nombre_metodo_pago: activeExtraAccount ? `${activeExtraAccount.nombreMetodo} (${activeExtraAccount.bancoOPlataforma})` : (metodoPago === 'pago_movil' ? `Pago Móvil (${siteSettings.pagoMovil.banco})` : 'Binance Pay (USDT)'),
                    banco_emisor: bancoEmisor.trim() || undefined,
                    telefono_o_email_emisor: telefonoOEmailEmisor.trim(),
                    referencia_pago: referenciaPago.trim(),
                    monto_usd: totalUSD,
                    tasa_bcv: bcvRate,
                    monto_bs: totalBs,
                    estado_pago: 'pendiente',
                    items: items.map(it => ({
                        id: it.id,
                        name: it.name,
                        price: it.price,
                        quantity: it.quantity,
                        image_url: it.image_url,
                        categoria_slug: it.categoria_slug,
                        is_personalizado: it.is_personalizado,
                        nombre_personalizado: it.nombre_personalizado,
                        especialidad_personalizada: it.especialidad_personalizada,
                        color_preferencia: it.color_preferencia,
                        detalles_personalizados: it.detalles_personalizados
                    }))
                })
            });
        } catch (err) {
            console.error('Error saving order into admin billing module:', err);
        }

        // 3. Open WhatsApp with formatted text
        const encodedMessage = encodeURIComponent(msg);
        const targetWhatsapp = siteSettings.tienda.telefonoWhatsapp || WHATSAPP_NUMBER;
        window.open(`https://wa.me/${targetWhatsapp}?text=${encodedMessage}`, '_blank');

        // 4. Show success screen and clear cart
        setIsSubmitting(false);
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
                                    <span className="text-[#D86A33] text-sm">Total: ${totalUSD.toFixed(2)} USD</span>
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

                                {/* BCV Rate Preview Pill */}
                                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] flex-wrap gap-1">
                                    <div className="text-gray-500 font-medium flex items-center gap-1.5">
                                        <TrendingUp size={12} className="text-[#D86A33]" />
                                        <span>Tasa BCV: <strong>{bcvRate} Bs/$</strong></span>
                                        <button
                                            type="button"
                                            onClick={() => fetchBcvRate(true)}
                                            disabled={isRefreshingBcv}
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-[#D86A33] hover:bg-[#FFF4EB] transition-colors"
                                            title="Actualizar tasa oficial en vivo desde bcv.org.ve"
                                        >
                                            <RefreshCw size={10} className={isRefreshingBcv ? 'animate-spin' : ''} />
                                            <span>{isRefreshingBcv ? 'Sincronizando...' : 'Actualizar'}</span>
                                        </button>
                                    </div>
                                    <span className="font-black text-[#5F2142]">
                                        ≈ Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
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
                                        <div className="font-black text-xs sm:text-sm">📍 Entrega Local</div>
                                        <div className="text-[11px] text-gray-500 mt-0.5">Mcpio. Miranda y Mcpio. Colina</div>
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
                                    <div className="space-y-3 p-4 rounded-2xl bg-[#FFF9F5]/70 border border-[#FFC99C]/40">
                                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-[#5F2142] font-bold flex items-center gap-2">
                                            <span>📍</span>
                                            <span>La entrega local aplica <strong>únicamente para Municipio Miranda y Municipio Colina</strong>.</span>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
                                                Selecciona tu Municipio *
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setMunicipioLocal('Municipio Miranda')}
                                                    className={`p-2.5 rounded-xl border text-xs font-black transition-all ${
                                                        municipioLocal === 'Municipio Miranda'
                                                            ? 'bg-[#5F2142] text-white border-[#5F2142] shadow-xs'
                                                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                                    }`}
                                                >
                                                    Municipio Miranda (Coro)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setMunicipioLocal('Municipio Colina')}
                                                    className={`p-2.5 rounded-xl border text-xs font-black transition-all ${
                                                        municipioLocal === 'Municipio Colina'
                                                            ? 'bg-[#5F2142] text-white border-[#5F2142] shadow-xs'
                                                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                                    }`}
                                                >
                                                    Municipio Colina (La Vela)
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                                Dirección o Punto de Encuentro ({municipioLocal}) *
                                            </label>
                                            <textarea
                                                rows={2}
                                                required
                                                value={direccionLocal}
                                                onChange={(e) => setDireccionLocal(e.target.value)}
                                                placeholder={`Indica sector, calle o punto de referencia en ${municipioLocal}...`}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium bg-white"
                                            />
                                        </div>
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

                    {/* ================= STEP 2: PAGO Y COMPROBANTE CON TASA BCV ================= */}
                    {step === 2 && (
                        <form id="step2-form" onSubmit={handleCerrarPedido} className="space-y-6">
                            {/* Total To Pay Banner with BCV Conversion */}
                            <div className="bg-[#FFF4EB] p-4 sm:p-5 rounded-2xl border-2 border-dashed border-[#D86A33] space-y-2">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                    <div>
                                        <div className="text-xs font-black text-[#5F2142] uppercase tracking-wider">
                                            Monto Total a Pagar
                                        </div>
                                        <div className="text-3xl font-black text-[#D86A33]">
                                            ${totalUSD.toFixed(2)} USD
                                        </div>
                                    </div>

                                    <div className="text-right sm:text-right">
                                        <span className="text-[11px] text-gray-500 uppercase tracking-wider font-bold block">
                                            Equivalente en Bolívares
                                        </span>
                                        <span className="text-xl sm:text-2xl font-black text-[#5F2142]">
                                            Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-600 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-[#FFC99C] gap-2">
                                    <div className="flex items-center gap-2">
                                        <span>Tasa oficial BCV: <strong>{bcvRate} Bs/$</strong> {bcvFechaValor ? <span className="text-gray-400">({bcvFechaValor})</span> : ''}</span>
                                        <button
                                            type="button"
                                            onClick={() => fetchBcvRate(true)}
                                            disabled={isRefreshingBcv}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white bg-[#D86A33] hover:bg-[#c25925] transition-all shadow-xs"
                                            title="Actualizar tasa en tiempo real desde bcv.org.ve"
                                        >
                                            <RefreshCw size={10} className={isRefreshingBcv ? 'animate-spin' : ''} />
                                            <span>{isRefreshingBcv ? 'Sincronizando...' : 'Actualizar'}</span>
                                        </button>
                                    </div>
                                    <span className="text-emerald-700 font-bold flex items-center gap-1.5 text-[10px]">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                                        Oficial bcv.org.ve
                                    </span>
                                </div>
                            </div>

                            {/* Payment Method Selector */}
                            <div>
                                <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <CreditCard size={15} className="text-[#D86A33]" />
                                    <span>Selecciona tu Método de Pago</span>
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    {/* Pago Movil Option */}
                                    {siteSettings.pagoMovil.activo !== false && (
                                        <button
                                            type="button"
                                            onClick={() => { 
                                                setMetodoPago('pago_movil'); 
                                                setMontoPagado(`Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`); 
                                            }}
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
                                            <div className="text-xs text-gray-500 font-medium">{siteSettings.pagoMovil.banco}</div>
                                        </button>
                                    )}

                                    {/* Binance Option */}
                                    {siteSettings.binance.activo !== false && (
                                        <button
                                            type="button"
                                            onClick={() => { 
                                                setMetodoPago('binance'); 
                                                setMontoPagado(`$${totalUSD.toFixed(2)} USDT`); 
                                            }}
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
                                    )}

                                    {/* Additional Payment Accounts configured by Admin */}
                                    {(siteSettings.cuentasAdicionales || []).filter(c => c.activo).map((cuenta) => (
                                        <button
                                            key={cuenta.id}
                                            type="button"
                                            onClick={() => {
                                                setMetodoPago(cuenta.id);
                                                if (cuenta.moneda === 'BS') {
                                                    setMontoPagado(`Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
                                                } else {
                                                    setMontoPagado(`$${totalUSD.toFixed(2)} USD`);
                                                }
                                            }}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                                metodoPago === cuenta.id
                                                    ? 'bg-[#FFF9F5] border-[#D86A33] shadow-md shadow-[#D86A33]/15'
                                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-black text-sm text-[#5F2142]">{cuenta.nombreMetodo}</span>
                                                {metodoPago === cuenta.id && (
                                                    <span className="w-5 h-5 rounded-full bg-[#D86A33] text-white flex items-center justify-center text-[10px] font-bold">
                                                        ✓
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 font-medium">
                                                {cuenta.bancoOPlataforma} • {cuenta.moneda === 'BS' ? 'Bolívares (Bs.)' : 'Dólares ($)'}
                                            </div>
                                        </button>
                                    ))}
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
                                        {/* Monto exacto en Bs with Copy */}
                                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF4EB] border border-[#D86A33]/30 text-xs">
                                            <div>
                                                <span className="text-[#D86A33] font-black block text-[10px] uppercase">Monto a Transferir en Bs.</span>
                                                <span className="font-black text-[#5F2142] text-sm sm:text-base">
                                                    Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(totalBs.toFixed(2), 'pm_monto')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                    copiedField === 'pm_monto'
                                                        ? 'bg-green-600 text-white shadow-xs'
                                                        : 'bg-white text-[#5F2142] border border-gray-300 hover:border-[#D86A33]'
                                                }`}
                                            >
                                                {copiedField === 'pm_monto' ? <Check size={13} /> : <Copy size={13} />}
                                                <span>{copiedField === 'pm_monto' ? '¡Copiado!' : 'Copiar Bs.'}</span>
                                            </button>
                                        </div>

                                        {/* Banco */}
                                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
                                            <div>
                                                <span className="text-gray-400 font-medium block text-[10px] uppercase">Banco</span>
                                                <span className="font-bold text-gray-900">{siteSettings.pagoMovil.banco}</span>
                                            </div>
                                            <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-[10px] font-bold">
                                                {siteSettings.pagoMovil.titular || 'BOHEME'}
                                            </span>
                                        </div>

                                        {/* Teléfono with Copy */}
                                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
                                            <div>
                                                <span className="text-gray-400 font-medium block text-[10px] uppercase">Teléfono</span>
                                                <span className="font-black text-[#5F2142] text-sm">{siteSettings.pagoMovil.telefono}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(siteSettings.pagoMovil.telefonoRaw || siteSettings.pagoMovil.telefono.replace(/\D/g, ''), 'pm_tel')}
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
                                                <span className="text-gray-400 font-medium block text-[10px] uppercase">Cédula de Identidad / RIF</span>
                                                <span className="font-black text-[#5F2142] text-sm">{siteSettings.pagoMovil.cedula}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(siteSettings.pagoMovil.cedulaRaw || siteSettings.pagoMovil.cedula.replace(/\D/g, ''), 'pm_ci')}
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
                                ) : metodoPago === 'binance' ? (
                                    <div className="space-y-2.5">
                                        {/* Monto exacto USDT */}
                                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF4EB] border border-[#D86A33]/30 text-xs">
                                            <div>
                                                <span className="text-[#D86A33] font-black block text-[10px] uppercase">Monto a Transferir</span>
                                                <span className="font-black text-[#5F2142] text-sm sm:text-base">
                                                    ${totalUSD.toFixed(2)} USDT
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(totalUSD.toFixed(2), 'bin_monto')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                    copiedField === 'bin_monto'
                                                        ? 'bg-green-600 text-white shadow-xs'
                                                        : 'bg-white text-[#5F2142] border border-gray-300 hover:border-[#D86A33]'
                                                }`}
                                            >
                                                {copiedField === 'bin_monto' ? <Check size={13} /> : <Copy size={13} />}
                                                <span>{copiedField === 'bin_monto' ? '¡Copiado!' : 'Copiar Monto'}</span>
                                            </button>
                                        </div>

                                        {/* Binance Email with Copy */}
                                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
                                            <div>
                                                <span className="text-gray-400 font-medium block text-[10px] uppercase">Correo / Pay ID</span>
                                                <span className="font-black text-[#5F2142] text-sm break-all">{siteSettings.binance.email}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(siteSettings.binance.email, 'bin_email')}
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
                                ) : (() => {
                                    const extra = (siteSettings.cuentasAdicionales || []).find(c => c.id === metodoPago);
                                    if (!extra) return null;
                                    return (
                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF4EB] border border-[#D86A33]/30 text-xs">
                                                <div>
                                                    <span className="text-[#D86A33] font-black block text-[10px] uppercase">Monto a Transferir ({extra.moneda})</span>
                                                    <span className="font-black text-[#5F2142] text-sm sm:text-base">
                                                        {extra.moneda === 'BS'
                                                            ? `Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                            : `$${totalUSD.toFixed(2)} USD`}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(extra.moneda === 'BS' ? totalBs.toFixed(2) : totalUSD.toFixed(2), 'extra_monto')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                        copiedField === 'extra_monto'
                                                            ? 'bg-green-600 text-white shadow-xs'
                                                            : 'bg-white text-[#5F2142] border border-gray-300 hover:border-[#D86A33]'
                                                    }`}
                                                >
                                                    {copiedField === 'extra_monto' ? <Check size={13} /> : <Copy size={13} />}
                                                    <span>{copiedField === 'extra_monto' ? '¡Copiado!' : 'Copiar Monto'}</span>
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
                                                <div>
                                                    <span className="text-gray-400 font-medium block text-[10px] uppercase">Banco / Plataforma</span>
                                                    <span className="font-bold text-gray-900">{extra.bancoOPlataforma} {extra.tipoCuenta ? `(${extra.tipoCuenta})` : ''}</span>
                                                </div>
                                                <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-[10px] font-bold">
                                                    {extra.titular}
                                                </span>
                                            </div>

                                            {extra.numeroCuentaOCorreo && (
                                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
                                                    <div>
                                                        <span className="text-gray-400 font-medium block text-[10px] uppercase">Nro. de Cuenta / Correo / Usuario</span>
                                                        <span className="font-black text-[#5F2142] text-sm break-all">{extra.numeroCuentaOCorreo}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(extra.numeroCuentaOCorreo, 'extra_acc')}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ml-2 ${
                                                            copiedField === 'extra_acc'
                                                                ? 'bg-green-600 text-white shadow-xs'
                                                                : 'bg-white text-[#5F2142] border border-gray-300 hover:border-[#D86A33]'
                                                        }`}
                                                    >
                                                        {copiedField === 'extra_acc' ? <Check size={13} /> : <Copy size={13} />}
                                                        <span>{copiedField === 'extra_acc' ? '¡Copiado!' : 'Copiar'}</span>
                                                    </button>
                                                </div>
                                            )}

                                            {extra.telefono && (
                                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
                                                    <div>
                                                        <span className="text-gray-400 font-medium block text-[10px] uppercase">Teléfono Afiliado</span>
                                                        <span className="font-black text-[#5F2142] text-sm">{extra.telefono}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(extra.telefono!.replace(/\D/g, ''), 'extra_tel')}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ml-2 ${
                                                            copiedField === 'extra_tel'
                                                                ? 'bg-green-600 text-white shadow-xs'
                                                                : 'bg-white text-[#5F2142] border border-gray-300 hover:border-[#D86A33]'
                                                        }`}
                                                    >
                                                        {copiedField === 'extra_tel' ? <Check size={13} /> : <Copy size={13} />}
                                                        <span>{copiedField === 'extra_tel' ? '¡Copiado!' : 'Copiar'}</span>
                                                    </button>
                                                </div>
                                            )}

                                            {extra.cedulaORif && (
                                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-xs">
                                                    <div>
                                                        <span className="text-gray-400 font-medium block text-[10px] uppercase">Cédula / RIF</span>
                                                        <span className="font-black text-[#5F2142] text-sm">{extra.cedulaORif}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(extra.cedulaORif!.replace(/\D/g, ''), 'extra_ci')}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ml-2 ${
                                                            copiedField === 'extra_ci'
                                                                ? 'bg-green-600 text-white shadow-xs'
                                                                : 'bg-white text-[#5F2142] border border-gray-300 hover:border-[#D86A33]'
                                                        }`}
                                                    >
                                                        {copiedField === 'extra_ci' ? <Check size={13} /> : <Copy size={13} />}
                                                        <span>{copiedField === 'extra_ci' ? '¡Copiado!' : 'Copiar'}</span>
                                                    </button>
                                                </div>
                                            )}

                                            {extra.instrucciones && (
                                                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium">
                                                    <strong>Nota:</strong> {extra.instrucciones}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
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
                                            placeholder={`Ej: Bs. ${totalBs.toFixed(2)} o $${totalUSD.toFixed(2)}`}
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
                                Tu orden ha sido registrada en nuestro sistema y enviada a nuestro WhatsApp oficial. 
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
                                    href={`https://wa.me/${siteSettings.tienda.telefonoWhatsapp || WHATSAPP_NUMBER}`}
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
                                disabled={isSubmitting}
                                className="px-7 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-black transition-all hover:scale-105 shadow-lg shadow-[#25D366]/30 flex items-center gap-2 disabled:opacity-50"
                            >
                                <span>{isSubmitting ? 'Registrando Pedido...' : 'Cerrar Pedido y Enviar a WhatsApp'}</span>
                                <span>💬</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
