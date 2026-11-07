'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    RefreshCw,
    UploadCloud,
    Image as ImageIcon
} from 'lucide-react';

const WHATSAPP_NUMBER = "584121409976";

const VENEZUELAN_BANKS = [
    { code: '0102', name: '0102 - Banco de Venezuela' },
    { code: '0104', name: '0104 - Banco Venezolano de Crédito' },
    { code: '0105', name: '0105 - Banco Mercantil' },
    { code: '0108', name: '0108 - BBVA Provincial' },
    { code: '0114', name: '0114 - Bancaribe' },
    { code: '0115', name: '0115 - Banco Exterior' },
    { code: '0128', name: '0128 - Banco Caroní' },
    { code: '0134', name: '0134 - Banesco' },
    { code: '0137', name: '0137 - Banco Sofitasa' },
    { code: '0138', name: '0138 - Banco Plaza' },
    { code: '0146', name: '0146 - Bangente' },
    { code: '0151', name: '0151 - Banco Fondo Común' },
    { code: '0156', name: '0156 - 100% Banco' },
    { code: '0157', name: '0157 - DelSur Banco Universal' },
    { code: '0163', name: '0163 - Banco del Tesoro' },
    { code: '0166', name: '0166 - Banco Agrícola de Venezuela' },
    { code: '0168', name: '0168 - Bancrecer' },
    { code: '0169', name: '0169 - R4 Banco Microfinanciero' },
    { code: '0171', name: '0171 - Banco Activo' },
    { code: '0172', name: '0172 - Bancamiga' },
    { code: '0173', name: '0173 - Banco Internacional de Desarrollo' },
    { code: '0174', name: '0174 - Banplus' },
    { code: '0175', name: '0175 - Banco Digital de los Trabajadores' },
    { code: '0177', name: '0177 - BANFANB' },
    { code: '0178', name: '0178 - N58 Banco Digital' },
    { code: '0191', name: '0191 - Banco Nacional de Crédito' }
];

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
    const router = useRouter();
    const { items, isCheckoutOpen, setCheckoutOpen, clearCart } = useCartStore();

    // Steps: 1 = Datos & Entrega, 2 = Términos & Condiciones, 3 = Pago & Comprobante, 4 = Éxito
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

    // Terms validation checkbox & confirmation modal
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [showTerminosConfirmModal, setShowTerminosConfirmModal] = useState(false);

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
    const [tipoEntregaLocal, setTipoEntregaLocal] = useState<'fija' | 'delivery'>('fija');
    const [direccionDeliveryLocal, setDireccionDeliveryLocal] = useState('');
    const [direccionLocal, setDireccionLocal] = useState('');
    const [empresaEnvio, setEmpresaEnvio] = useState('MRW');
    const [estado, setEstado] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [direccionAgencia, setDireccionAgencia] = useState('');

    // Form: Payment Data
    const [metodoPago, setMetodoPago] = useState<'pago_movil' | 'binance' | string>('pago_movil');
    const [bancoEmisor, setBancoEmisor] = useState('0102 - Banco de Venezuela');
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

    const handleCopyAllPaymentData = () => {
        if (metodoPago === 'pago_movil') {
            const dataToCopy = `PAGO MÓVIL BOHEME
Banco: ${siteSettings.pagoMovil.banco}
Teléfono: ${siteSettings.pagoMovil.telefono}
Cédula: ${siteSettings.pagoMovil.cedula}
Monto: Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            handleCopy(dataToCopy, 'all_payment_data');
        } else if (metodoPago === 'binance') {
            const dataToCopy = `BINANCE PAY BOHEME
Correo / Pay ID: ${siteSettings.binance.email}
Monto: $${totalUSD.toFixed(2)} USDT`;
            handleCopy(dataToCopy, 'all_payment_data');
        } else {
            const extra = (siteSettings.cuentasAdicionales || []).find(c => c.id === metodoPago);
            if (extra) {
                const dataToCopy = `${extra.nombreMetodo.toUpperCase()}
Banco/Plataforma: ${extra.bancoOPlataforma}
Cuenta/Usuario: ${extra.numeroCuentaOCorreo}
${extra.telefono ? `Teléfono: ${extra.telefono}\n` : ''}${extra.cedulaORif ? `Cédula/RIF: ${extra.cedulaORif}\n` : ''}Monto: ${extra.moneda === 'BS' ? `Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${totalUSD.toFixed(2)} USD`}`;
                handleCopy(dataToCopy, 'all_payment_data');
            }
        }
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
            if (tipoEntregaLocal === 'delivery' && !direccionDeliveryLocal.trim()) {
                setFormError('Por favor indica tu dirección exacta de entrega para el delivery.');
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

    const handleAceptarTerminosClick = () => {
        setFormError(null);
        if (!aceptaTerminos) {
            setFormError('Debes marcar la casilla aceptando los términos y condiciones para continuar.');
            return;
        }
        setShowTerminosConfirmModal(true);
    };

    const handleConfirmarLecturaTerminos = () => {
        setShowTerminosConfirmModal(false);
        // Auto fill initial suggested amount for the selected method
        if (metodoPago === 'pago_movil') {
            setMontoPagado(`Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        } else {
            setMontoPagado(`$${totalUSD.toFixed(2)} USDT`);
        }
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            if (item.es_por_encargo) {
                msg += `   📦 *MODALIDAD: SOLICITADO POR ENCARGO*${item.stock_disponible !== undefined ? ` (Stock actual: ${item.stock_disponible} uds)` : ''}\n`;
            }

            if (item.genero) msg += `   ▫️ *Género:* ${item.genero}\n`;
            if (item.modelo) msg += `   ▫️ *Estilo / Ajuste:* ${item.modelo}\n`;
            if (item.subcategoria_especial) msg += `   ▫️ *Subcategoría Especial:* ${item.subcategoria_especial}\n`;
            if (item.adicionales && item.adicionales.length > 0) {
                msg += `   ▫️ *Adicionales (+$${(item.adicionales.length * 0.5).toFixed(2)}):* ${item.adicionales.join(', ')}\n`;
            }

            // Personalization details
            if (item.is_personalizado || item.nombre_personalizado || item.especialidad_personalizada || item.texto_personalizado) {
                msg += `   ✨ *Personalización:*\n`;
                if (item.nombre_personalizado) {
                    msg += `   ▫️ *Nombre:* ${item.nombre_personalizado}\n`;
                }
                if (item.texto_personalizado) {
                    msg += `   ▫️ *Texto libre:* ${item.texto_personalizado}\n`;
                }
                if (item.especialidad_personalizada) {
                    msg += `   ▫️ *Especialidad/Cargo:* ${item.especialidad_personalizada}\n`;
                }
                if (item.color_preferencia) {
                    msg += `   ▫️ *Color/Preferencia:* ${item.color_preferencia}\n`;
                }
                if (item.detalles_personalizados && !item.texto_personalizado && !item.genero) {
                    msg += `   ▫️ *Especificaciones:* ${item.detalles_personalizados}\n`;
                }
                if (item.imagenes_personalizadas && item.imagenes_personalizadas.length > 0) {
                    msg += `   📷 *Imágenes de referencia adjuntas:* ${item.imagenes_personalizadas.length} foto(s)\n`;
                }
            }

            if (item.type_color && !item.genero) msg += `   ▫️ *Color:* ${item.type_color}\n`;
        });

        const formattedBs = totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        msg += `\n💰 *TOTAL DEL PEDIDO:* $${totalUSD.toFixed(2)} USD  ≈  *Bs. ${formattedBs}* (Tasa BCV: ${bcvRate} Bs/$)\n\n`;

        msg += `🚚 *DATOS DE ENTREGA:*\n`;
        if (tipoEntrega === 'local') {
            msg += `• *Modalidad:* Entrega Local\n`;
            msg += `• *Municipio:* ${municipioLocal}\n`;
            if (municipioLocal === 'Municipio Miranda') {
                if (tipoEntregaLocal === 'fija') {
                    msg += `• *Tipo de Entrega Local:* Entrega Fija\n`;
                    msg += `• *Lugar Fijo de Entrega:* El Hospital Universitario Dr. Alfredo Van Grieken de Coro\n`;
                    msg += `• *Horario de Entrega:* Lunes en la mañana (hasta las 11:30 am) y Jueves (desde la 1:00 pm hasta las 4:30 pm)\n`;
                } else {
                    msg += `• *Tipo de Entrega Local:* Delivery (Cotizable desde WhatsApp)\n`;
                    msg += `• *Dirección de Destino Delivery:* ${direccionDeliveryLocal.trim()}\n`;
                    msg += `• *Costo de Delivery:* A cotizar y coordinar por WhatsApp\n`;
                }
            } else {
                // Municipio Colina
                if (tipoEntregaLocal === 'fija') {
                    msg += `• *Tipo de Entrega Local:* Entrega Fija\n`;
                    msg += `• *Lugar Fijo de Entrega:* Casa azul de 2 pisos en la esquina frente al ambulatorio Wilfredo Medina (La Vela)\n`;
                } else {
                    msg += `• *Tipo de Entrega Local:* Delivery (Cotizable desde WhatsApp)\n`;
                    msg += `• *Dirección de Destino Delivery:* ${direccionDeliveryLocal.trim()}\n`;
                    msg += `• *Costo de Delivery:* A cotizar y coordinar por WhatsApp\n`;
                }
            }
        } else {
            msg += `• *Modalidad:* Envío Nacional\n`;
            msg += `• *Empresa:* ${empresaEnvio}\n`;
            msg += `• *Destino:* ${ciudad.trim()}, ${estado.trim()}\n`;
            msg += `• *Dirección / Agencia de Retiro:* ${direccionAgencia.trim()}\n`;
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
        msg += `¡Quedo atento a la confirmación de mi pedido! Muchas gracias.`;

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
                    direccion_entrega: tipoEntrega === 'local' 
                        ? (municipioLocal === 'Municipio Miranda'
                            ? (tipoEntregaLocal === 'fija' 
                                ? 'Municipio Miranda - Entrega Fija: Hospital Universitario Dr. Alfredo Van Grieken (Lun hasta 11:30am / Jue 1pm a 4:30pm)'
                                : `Municipio Miranda - Delivery: ${direccionDeliveryLocal.trim()} (Cotizable por WhatsApp)`)
                            : (tipoEntregaLocal === 'fija'
                                ? 'Municipio Colina - Entrega Fija: Casa azul de 2 pisos en la esquina frente al ambulatorio Wilfredo Medina'
                                : `Municipio Colina - Delivery: ${direccionDeliveryLocal.trim()} (Cotizable por WhatsApp)`))
                        : direccionAgencia.trim(),
                    empresa_envio: tipoEntrega === 'nacional' ? empresaEnvio : undefined,
                    estado: tipoEntrega === 'nacional' ? estado.trim() : undefined,
                    ciudad: tipoEntrega === 'nacional' ? ciudad.trim() : undefined,
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
                        subcategoria_id: it.subcategoria_id,
                        subcategoria_especial: it.subcategoria_especial,
                        genero: it.genero,
                        modelo: it.modelo,
                        adicionales: it.adicionales,
                        recargo_adicionales: it.recargo_adicionales,
                        is_personalizado: it.is_personalizado,
                        nombre_personalizado: it.nombre_personalizado,
                        texto_personalizado: it.texto_personalizado,
                        especialidad_personalizada: it.especialidad_personalizada,
                        color_preferencia: it.color_preferencia,
                        detalles_personalizados: it.detalles_personalizados,
                        imagenes_personalizadas: it.imagenes_personalizadas,
                        es_por_encargo: it.es_por_encargo,
                        stock_disponible: it.stock_disponible
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

        // 4. Show success screen, refresh catalog stock and clear cart
        setIsSubmitting(false);
        setStep(4);
        clearCart();
        router.refresh();
    };

    const handleClose = () => {
        setCheckoutOpen(false);
        setStep(1);
        setAceptaTerminos(false);
        setShowTerminosConfirmModal(false);
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
                {step !== 4 && (
                    <div className="py-3 px-1 border-b border-gray-100 shrink-0 bg-[#FFF9F5]/40 -mx-5 sm:-mx-8 px-5 sm:px-8">
                        <div className="flex items-center justify-between max-w-xl mx-auto text-[11px] sm:text-xs">
                            <div className={`flex items-center gap-1.5 font-black ${step === 1 ? 'text-[#D86A33]' : 'text-gray-400'}`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? 'bg-[#D86A33] text-white shadow-xs' : 'bg-gray-200 text-gray-600'}`}>
                                    1
                                </span>
                                <span className="hidden sm:inline">Datos & Entrega</span>
                                <span className="sm:hidden">Datos</span>
                            </div>

                            <span className="h-0.5 w-6 sm:w-10 bg-gray-200" />

                            <div className={`flex items-center gap-1.5 font-black ${step === 2 ? 'text-[#D86A33]' : 'text-gray-400'}`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? 'bg-[#D86A33] text-white shadow-xs' : 'bg-gray-200 text-gray-600'}`}>
                                    2
                                </span>
                                <span className="hidden sm:inline">Términos & Condiciones</span>
                                <span className="sm:hidden">Términos</span>
                            </div>

                            <span className="h-0.5 w-6 sm:w-10 bg-gray-200" />

                            <div className={`flex items-center gap-1.5 font-black ${step === 3 ? 'text-[#D86A33]' : 'text-gray-400'}`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 3 ? 'bg-[#D86A33] text-white shadow-xs' : 'bg-gray-200 text-gray-600'}`}>
                                    3
                                </span>
                                <span className="hidden sm:inline">Pago & Comprobante</span>
                                <span className="sm:hidden">Pago</span>
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
                                                {it.es_por_encargo && (
                                                    <div className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md inline-block ml-1.5">
                                                        📦 POR ENCARGO
                                                    </div>
                                                )}
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
                                    <div className="space-y-4 p-4 rounded-2xl bg-[#FFF9F5]/70 border border-[#FFC99C]/40">
                                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-[#5F2142] font-bold flex items-center gap-2">
                                            <span>📍</span>
                                            <span>La entrega local aplica <strong>únicamente para Municipio Miranda y Municipio Colina</strong>.</span>
                                        </div>

                                        {/* Selector de Municipio */}
                                        <div>
                                            <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
                                                1. Selecciona tu Municipio *
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setMunicipioLocal('Municipio Miranda')}
                                                    className={`p-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
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
                                                    className={`p-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                                                        municipioLocal === 'Municipio Colina'
                                                            ? 'bg-[#5F2142] text-white border-[#5F2142] shadow-xs'
                                                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                                    }`}
                                                >
                                                    Municipio Colina (La Vela)
                                                </button>
                                            </div>
                                        </div>

                                        {/* Selector de Tipo de Entrega Local: Fija vs Delivery */}
                                        <div>
                                            <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
                                                2. Selecciona Tipo de Entrega en {municipioLocal} *
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setTipoEntregaLocal('fija')}
                                                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                        tipoEntregaLocal === 'fija'
                                                            ? 'bg-[#5F2142] text-white border-[#5F2142] shadow-xs'
                                                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="font-black text-xs">🏛️ Entrega Fija</div>
                                                    <div className={`text-[10px] mt-0.5 ${tipoEntregaLocal === 'fija' ? 'text-[#FFC99C]' : 'text-gray-500'}`}>
                                                        Punto establecido
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setTipoEntregaLocal('delivery')}
                                                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                        tipoEntregaLocal === 'delivery'
                                                            ? 'bg-[#5F2142] text-white border-[#5F2142] shadow-xs'
                                                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="font-black text-xs">🛵 Delivery</div>
                                                    <div className={`text-[10px] mt-0.5 ${tipoEntregaLocal === 'delivery' ? 'text-[#FFC99C]' : 'text-[#D86A33] font-bold'}`}>
                                                        Cotizable por WhatsApp
                                                    </div>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Detalles según Municipio y Tipo de Entrega */}
                                        {municipioLocal === 'Municipio Miranda' ? (
                                            tipoEntregaLocal === 'fija' ? (
                                                <div className="p-3.5 rounded-xl bg-white border border-[#FFC99C] space-y-1.5 text-xs text-gray-700">
                                                    <div className="flex items-center gap-2 font-black text-[#5F2142]">
                                                        <span>🏥</span>
                                                        <span>Punto Fijo de Entrega (Municipio Miranda):</span>
                                                    </div>
                                                    <div className="font-bold text-gray-900 bg-[#FFF9F5] p-2.5 rounded-lg border border-[#FFC99C]/60">
                                                        El Hospital Universitario Dr. Alfredo Van Grieken de Coro
                                                    </div>
                                                    <div className="text-[11px] text-gray-600 space-y-0.5 pt-1">
                                                        <span className="block font-black text-[#D86A33] uppercase text-[10px]">Horarios de Entrega Fija:</span>
                                                        <p>• <strong>Lunes:</strong> En la mañana hasta las <strong>11:30 am</strong>.</p>
                                                        <p>• <strong>Jueves:</strong> Desde la <strong>1:00 pm</strong> hasta las <strong>4:30 pm</strong>.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2 p-3.5 rounded-xl bg-white border border-[#D86A33]/40">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-black text-xs text-[#5F2142] flex items-center gap-1.5">
                                                            <span>🛵</span>
                                                            <span>Delivery en Municipio Miranda (Coro)</span>
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-full bg-[#FFF4EB] border border-[#D86A33]/50 text-[10px] font-black text-[#D86A33]">
                                                            Cotizable por WhatsApp
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 font-medium">
                                                        El costo del delivery se cotiza directamente por WhatsApp según tu zona en Coro.
                                                    </p>
                                                    <div>
                                                        <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                                            Dirección exacta para el delivery *
                                                        </label>
                                                        <textarea
                                                            rows={2}
                                                            required
                                                            value={direccionDeliveryLocal}
                                                            onChange={(e) => setDireccionDeliveryLocal(e.target.value)}
                                                            placeholder="Indica sector, calle, número de casa/edificio y punto de referencia en Coro..."
                                                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            tipoEntregaLocal === 'fija' ? (
                                                <div className="p-3.5 rounded-xl bg-white border border-[#FFC99C] space-y-1.5 text-xs text-gray-700">
                                                    <div className="flex items-center gap-2 font-black text-[#5F2142]">
                                                        <span>🏠</span>
                                                        <span>Punto Fijo de Entrega (Municipio Colina - La Vela):</span>
                                                    </div>
                                                    <div className="font-bold text-gray-900 bg-[#FFF9F5] p-2.5 rounded-lg border border-[#FFC99C]/60">
                                                        Casa azul de 2 pisos en la esquina frente al ambulatorio Wilfredo Medina
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 pt-1 font-medium">
                                                        Punto establecido de retiro para el Municipio Colina (La Vela).
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2 p-3.5 rounded-xl bg-white border border-[#D86A33]/40">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-black text-xs text-[#5F2142] flex items-center gap-1.5">
                                                            <span>🛵</span>
                                                            <span>Delivery en Municipio Colina (La Vela)</span>
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-full bg-[#FFF4EB] border border-[#D86A33]/50 text-[10px] font-black text-[#D86A33]">
                                                            Cotizable por WhatsApp
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 font-medium">
                                                        El costo del delivery se cotiza directamente por WhatsApp según tu zona en La Vela.
                                                    </p>
                                                    <div>
                                                        <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1">
                                                            Dirección exacta para el delivery *
                                                        </label>
                                                        <textarea
                                                            rows={2}
                                                            required
                                                            value={direccionDeliveryLocal}
                                                            onChange={(e) => setDireccionDeliveryLocal(e.target.value)}
                                                            placeholder="Indica sector, calle, número de casa/edificio y punto de referencia en La Vela..."
                                                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        )}
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
                                    </div>
                                )}
                            </div>
                        </form>
                    )}

                    {/* ================= STEP 2: TÉRMINOS & CONDICIONES ================= */}
                    {step === 2 && (
                        <div className="space-y-5 animate-fadeIn">
                            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF9F5] border border-[#FFC99C]/60 space-y-4">
                                <div className="border-b border-[#FFC99C]/50 pb-3">
                                    <h3 className="text-base sm:text-lg font-black text-[#5F2142] flex items-center gap-2">
                                        <span>📋</span>
                                        <span>Términos y Condiciones de Compra - BOHEME</span>
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium mt-1">
                                        Antes de procesar tu pago y confirmar tu pedido, por favor lee detenidamente las siguientes condiciones:
                                    </p>
                                </div>

                                <div className="text-xs text-gray-700 space-y-3.5 leading-relaxed">
                                    <div className="p-3 rounded-xl bg-white border border-gray-100">
                                        <strong className="text-[#5F2142] block mb-0.5 font-black">1. Confirmación y Procesamiento:</strong>
                                        Tu pedido ingresa a nuestra cola de producción e inicia su tiempo de confección únicamente a partir del momento en que se confirme el pago. Las solicitudes previas o carritos guardados no reservan cupo.
                                    </div>

                                    <div className="p-3 rounded-xl bg-white border border-gray-100">
                                        <strong className="text-[#5F2142] block mb-0.5 font-black">2. Tiempos de Confección:</strong>
                                        Los productos personalizados son elaborados con dedicación y detalle. El tiempo estimado de producción y despacho es de 7 a 10 días hábiles contados a partir del reporte del pago. (No incluye fines de semana ni feriados).
                                    </div>

                                    <div className="p-3 rounded-xl bg-white border border-gray-100">
                                        <strong className="text-[#5F2142] block mb-0.5 font-black">3. Pedidos Urgentes:</strong>
                                        Los tiempos de confección son obligatorios para garantizar la calidad de cada pieza, por lo que No aceptamos pedidos urgentes ni de emergencia (Sin excepción).
                                    </div>

                                    <div className="p-3 rounded-xl bg-white border border-gray-100">
                                        <strong className="text-[#5F2142] block mb-0.5 font-black">4. Política de Envíos:</strong>
                                        Todos los envíos nacionales se realizan bajo la modalidad Cobro a Destino a través de la empresa de encomiendas de tu preferencia (MRW, Zoom, Tealca, Domesa). El costo del envío corre por cuenta del cliente al recibir o retirar su paquete. 
                                        Así mismo, los días de envíos establecidos son Lunes y Jueves (en caso de ser feriado se modifica la fecha).
                                    </div>

                                    <div className="p-3 rounded-xl bg-white border border-gray-100">
                                        <strong className="text-[#5F2142] block mb-0.5 font-black">5. Garantía, Cambios y Devoluciones:</strong>
                                        Cuentas con un máximo de 48 horas contadas a partir de la recepción o entrega de tu producto para reportar cualquier falla o inconveniente. Pasado este lapso, no se aceptarán cambios ni devoluciones. 
                                        Si es un envío nacional con falla comprobable dentro del lapso de 48 horas, el cliente deberá cotizar y asumir el costo del envío de regreso al taller para su evaluación y respectivo cambio.
                                    </div>

                                    <div className="p-3 rounded-xl bg-white border border-gray-100 space-y-1.5">
                                        <strong className="text-[#5F2142] block font-black">6. Demoras Operativas/Logísticas (Fuerza Mayor):</strong>
                                        <p>
                                            <strong>• Agencias de Envíos:</strong> Una vez entregado el paquete a la empresa de encomiendas, BOHEME no se hace responsable por retrasos, pérdidas o inconvenientes operativos imputables propios a dichas agencias.
                                        </p>
                                        <p>
                                            <strong>• Situación País / Fluctuaciones:</strong> Debido a las circunstancias actuales (incluyendo imprevistos en el servicio eléctrico que afecten la producción), podrían presentarse retrasos ajenos a nuestra voluntad, los cuales serán informados oportunamente.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-[#FFC99C]/50">
                                    <label className="flex items-start gap-3 p-3 rounded-xl bg-white border-2 border-[#D86A33]/40 hover:border-[#D86A33] cursor-pointer transition-all select-none">
                                        <input
                                            type="checkbox"
                                            checked={aceptaTerminos}
                                            onChange={(e) => {
                                                setAceptaTerminos(e.target.checked);
                                                setFormError(null);
                                            }}
                                            className="mt-0.5 w-4 h-4 text-[#D86A33] rounded focus:ring-[#D86A33] cursor-pointer"
                                        />
                                        <span className="text-xs font-bold text-gray-800 leading-snug">
                                            He leído y acepto todos los términos de BOHEME, comprendiendo los plazos de confección establecidos, las condiciones de envío, los lineamientos de garantía y las cláusulas logísticas.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= STEP 3: PAGO Y COMPROBANTE CON TASA BCV ================= */}
                    {step === 3 && (
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
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100">
                                    <span className="text-xs font-black text-[#5F2142] uppercase tracking-wider">
                                        Datos para realizar tu pago:
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCopyAllPaymentData}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all inline-flex items-center gap-1.5 ${
                                            copiedField === 'all_payment_data'
                                                ? 'bg-green-600 text-white shadow-xs'
                                                : 'bg-[#5F2142] hover:bg-[#43142e] text-white shadow-xs'
                                        }`}
                                    >
                                        {copiedField === 'all_payment_data' ? <Check size={13} /> : <Copy size={13} />}
                                        <span>{copiedField === 'all_payment_data' ? '¡Todos los datos copiados!' : 'Copiar todos los datos con monto'}</span>
                                    </button>
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

                                        {/* Banco (sin nombre de persona) */}
                                        <div className="p-2.5 rounded-xl bg-gray-50 text-xs flex items-center justify-between">
                                            <div>
                                                <span className="text-gray-400 font-medium block text-[10px] uppercase">Banco</span>
                                                <span className="font-bold text-gray-900">{siteSettings.pagoMovil.banco}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(siteSettings.pagoMovil.banco, 'pm_banco')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                    copiedField === 'pm_banco'
                                                        ? 'bg-green-600 text-white shadow-xs'
                                                        : 'bg-white text-[#5F2142] border border-gray-300 hover:border-[#D86A33]'
                                                }`}
                                            >
                                                {copiedField === 'pm_banco' ? <Check size={13} /> : <Copy size={13} />}
                                                <span>{copiedField === 'pm_banco' ? '¡Copiado!' : 'Copiar Banco'}</span>
                                            </button>
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
                                                Banco de Origen (Emisor) *
                                            </label>
                                            <select
                                                required
                                                value={bancoEmisor}
                                                onChange={(e) => setBancoEmisor(e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium bg-white"
                                            >
                                                {VENEZUELAN_BANKS.map((b) => (
                                                    <option key={b.code} value={b.name}>
                                                        {b.name}
                                                    </option>
                                                ))}
                                            </select>
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
                                            Monto transferido * (Editable)
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
                            </div>
                        </form>
                    )}

                    {/* ================= STEP 4: PEDIDO ENVIADO CON ÉXITO ================= */}
                    {step === 4 && (
                        <div className="text-center py-6 sm:py-10 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-2xl shadow-sm">
                                ✓
                            </div>
                            <h3 className="text-2xl font-black text-[#5F2142] tracking-tight">
                                ¡Pedido Formalizado con Éxito!
                            </h3>
                            <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed font-normal">
                                Tu orden ha sido registrada en nuestro sistema y enviada a nuestro WhatsApp oficial. 
                                ¡Quedamos atentos para confirmar tu pedido y comenzar su preparación!
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
                {step !== 4 && (
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
                        {step === 1 ? (
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors cursor-pointer"
                            >
                                Regresar al carrito
                            </button>
                        ) : step === 2 ? (
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <ArrowLeft size={14} />
                                <span>Atrás</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <ArrowLeft size={14} />
                                <span>Atrás</span>
                            </button>
                        )}

                        {step === 1 ? (
                            <button
                                type="submit"
                                form="step1-form"
                                className="px-6 py-3 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white text-xs sm:text-sm font-black transition-all hover:scale-105 shadow-md shadow-[#D86A33]/25 flex items-center gap-2 cursor-pointer"
                            >
                                <span>Continuar a Términos</span>
                                <ArrowRight size={15} />
                            </button>
                        ) : step === 2 ? (
                            <button
                                type="button"
                                onClick={handleAceptarTerminosClick}
                                className="px-7 py-3 rounded-full bg-[#5F2142] hover:bg-[#43142e] text-white text-xs sm:text-sm font-black transition-all hover:scale-105 shadow-md shadow-[#5F2142]/25 flex items-center gap-2 cursor-pointer"
                            >
                                <span>Aceptar y Proceder al Pago</span>
                                <ArrowRight size={15} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                form="step2-form"
                                disabled={isSubmitting}
                                className="px-7 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-black transition-all hover:scale-105 shadow-lg shadow-[#25D366]/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                <span>{isSubmitting ? 'Registrando Pedido...' : 'Cerrar Pedido y Enviar a WhatsApp'}</span>
                                <span>💬</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Validation Modal for Confirmation of Terms */}
            {showTerminosConfirmModal && (
                <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-[#FFF4EB] border-2 border-[#D86A33] text-[#D86A33] flex items-center justify-center text-2xl mx-auto shadow-sm">
                            📋
                        </div>
                        <h4 className="text-lg font-black text-[#5F2142]">
                            ¿Confirmas que leíste y aceptas las condiciones?
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed font-normal">
                            Para avanzar al pago, por favor valida que has leído atentamente los plazos de confección (7 a 10 días hábiles), condiciones de envío Cobro a Destino y políticas de garantía de BOHEME.
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowTerminosConfirmModal(false)}
                                className="px-4 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold transition-all cursor-pointer"
                            >
                                Revisar de nuevo
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmarLecturaTerminos}
                                className="px-6 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white text-xs font-black shadow-md shadow-[#D86A33]/25 transition-all hover:scale-105 cursor-pointer"
                            >
                                Sí, he leído y acepto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
