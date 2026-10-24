'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    LogOut, 
    Store, 
    Package, 
    Layers, 
    Check, 
    X, 
    ExternalLink,
    AlertCircle,
    Sparkles,
    Image as ImageIcon,
    FileText,
    TrendingUp,
    Sun,
    Moon,
    CreditCard,
    Calendar,
    Clock,
    Filter,
    CheckCircle2,
    Clock3,
    XCircle,
    User,
    Truck,
    Eye,
    Menu,
    ChevronRight,
    Settings,
    DollarSign,
    RefreshCw,
    Sliders,
    Wallet,
    Save
} from 'lucide-react';
import { Product, CATEGORIES, Order, OrderItem } from '@/lib/db';
import { parseImages } from '@/lib/utils';
import { SiteSettings } from '@/lib/settings';

// Sections without "TODOS"
const SECTIONS = [
    { slug: 'gorros', label: 'Gorros Quirúrgicos', icon: '🧢' },
    { slug: 'lanyards', label: 'Lanyards & Cintas', icon: '🎀' },
    { slug: 'accesorios-medicos', label: 'Accesorios Médicos', icon: '🩺' },
    { slug: 'equipos-medicos', label: 'Equipos Médicos', icon: '⚡' },
    { slug: 'productos-personalizados', label: 'Productos Personalizados', icon: '✨' }
];

const PRESET_IMAGES = [
    { label: 'Gorro Quirúrgico', url: '/cat_gorros.png' },
    { label: 'Accesorios & Lanyards', url: '/cat_accesorios.png' },
    { label: 'Equipos Médicos', url: '/cat_equipos.png' },
    { label: 'Banner Lifestyle', url: '/hero_bg.png' }
];

type AdminTab = 'dashboard' | 'facturado' | 'productos' | 'configuracion';

export default function AdminPage() {
    const router = useRouter();

    // Dark Mode state
    const [isDark, setIsDark] = useState<boolean>(false);

    // Active Sidebar Tab
    const [activeTab, setActiveTab] = useState<AdminTab>('facturado');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Products State
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [activeSection, setActiveSection] = useState<string>('gorros');
    const [productSearch, setProductSearch] = useState('');

    // Orders / Invoices State (Módulo Facturado)
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Orders Filter State (Múltiples filtros)
    const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
    const [filterMethod, setFilterMethod] = useState<'all' | 'pago_movil' | 'binance'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'por_verificar' | 'verificada' | 'rechazada'>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [orderSearch, setOrderSearch] = useState('');

    // BCV Rate
    const [bcvRate, setBcvRate] = useState<number>(887.30);
    const [bcvData, setBcvData] = useState<{
        rate: number;
        exactRate?: number;
        rawRate?: string;
        fechaValor?: string;
        source?: string;
        lastUpdated?: string;
        formattedRate?: string;
        isManual?: boolean;
    }>({
        rate: 887.30,
        exactRate: 887.302,
        rawRate: '887,30200000',
        fechaValor: 'Martes, 27 Octubre 2026',
        source: 'Banco Central de Venezuela (bcv.org.ve)'
    });
    const [manualRateInput, setManualRateInput] = useState<string>('887.30');
    const [isUpdatingRate, setIsUpdatingRate] = useState(false);
    const [isSyncingBcv, setIsSyncingBcv] = useState(false);

    // Product Modal State (Máximo 10 imágenes)
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formPrice, setFormPrice] = useState<number | string>(8);
    const [formCategory, setFormCategory] = useState('gorros');
    const [formSubcategory, setFormSubcategory] = useState<number | undefined>(70);
    const [formImages, setFormImages] = useState<string[]>([]);
    const [newImageUrl, setNewImageUrl] = useState('');

    // Order View & Manual Invoice Modals
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    const [isManualInvoiceOpen, setIsManualInvoiceOpen] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [deleteOrderConfirmId, setDeleteOrderConfirmId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Edit Order Modal State (Manipulación sin código)
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [editOrderData, setEditOrderData] = useState<{
        cliente_nombre: string;
        cliente_apellido: string;
        cliente_cedula: string;
        cliente_telefono: string;
        tipo_entrega: 'local' | 'nacional';
        empresa_envio: string;
        direccion_entrega: string;
        metodo_pago: 'pago_movil' | 'binance';
        banco_emisor: string;
        telefono_o_email_emisor: string;
        referencia_pago: string;
        monto_usd: number | string;
        monto_bs: number | string;
        estado_pago: 'por_verificar' | 'verificada' | 'rechazada';
        notas_admin: string;
    }>({
        cliente_nombre: '',
        cliente_apellido: '',
        cliente_cedula: '',
        cliente_telefono: '',
        tipo_entrega: 'local',
        empresa_envio: 'MRW',
        direccion_entrega: '',
        metodo_pago: 'pago_movil',
        banco_emisor: '',
        telefono_o_email_emisor: '',
        referencia_pago: '',
        monto_usd: 0,
        monto_bs: 0,
        estado_pago: 'por_verificar',
        notas_admin: ''
    });

    // Configuration Area Sub-Tabs
    const [configSubTab, setConfigSubTab] = useState<'pagos' | 'facturas' | 'productos' | 'bcv' | 'tienda'>('pagos');

    // Site & Payment Settings (Manipulación de Cuentas y Tienda sin código)
    const [settings, setSettings] = useState<SiteSettings>({
        pagoMovil: {
            id: 'pm-principal',
            banco: 'Banco de Venezuela (0102)',
            telefono: '0412-1409976',
            telefonoRaw: '04121409976',
            cedula: 'V-24.354.847',
            cedulaRaw: '24354847',
            titular: 'BOHEME',
            activo: true
        },
        binance: {
            id: 'binance-principal',
            email: 'worldglobalweb724@gmail.com',
            payId: '',
            titular: 'BOHEME',
            activo: true
        },
        tienda: {
            nombreTienda: 'BOHEME',
            telefonoWhatsapp: '584121409976',
            mensajeWhatsappIntro: '¡Hola! He formalizado mi pedido en la web de BOHEME.',
            instagram: '@boheme_ve',
            direccionFisica: 'Valencia, Estado Carabobo, Venezuela',
            monedaPrincipal: 'USD'
        },
        lastUpdated: new Date().toISOString()
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // Form Manual Invoice Fields
    const [manualClienteNombre, setManualClienteNombre] = useState('');
    const [manualClienteApellido, setManualClienteApellido] = useState('');
    const [manualClienteCedula, setManualClienteCedula] = useState('');
    const [manualClienteTelefono, setManualClienteTelefono] = useState('');
    const [manualTipoEntrega, setManualTipoEntrega] = useState<'local' | 'nacional'>('local');
    const [manualDireccion, setManualDireccion] = useState('');
    const [manualMetodoPago, setManualMetodoPago] = useState<'pago_movil' | 'binance'>('pago_movil');
    const [manualReferencia, setManualReferencia] = useState('');
    const [manualMontoUsd, setManualMontoUsd] = useState<number | string>(20);
    const [manualEstadoPago, setManualEstadoPago] = useState<'por_verificar' | 'verificada' | 'rechazada'>('por_verificar');
    const [manualItemName, setManualItemName] = useState('');
    const [manualItemCategory, setManualItemCategory] = useState('gorros');

    // Theme initialization
    useEffect(() => {
        const savedTheme = localStorage.getItem('boheme_admin_dark_mode');
        if (savedTheme === 'true') {
            setIsDark(true);
        }
    }, []);

    const toggleDarkMode = () => {
        setIsDark(prev => {
            const next = !prev;
            localStorage.setItem('boheme_admin_dark_mode', String(next));
            return next;
        });
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Load Initial Data
    const loadData = async (forceRefresh = false) => {
        // Load BCV Rate
        try {
            const resBcv = await fetch(`/api/bcv${forceRefresh ? '?refresh=true' : ''}`);
            const dataBcv = await resBcv.json();
            if (dataBcv && dataBcv.rate) {
                setBcvRate(dataBcv.rate);
                setManualRateInput(String(dataBcv.rate));
                setBcvData(dataBcv);
            }
        } catch {}

        // Load Products
        try {
            setLoadingProducts(true);
            const resP = await fetch('/api/admin/products');
            const dataP = await resP.json();
            if (dataP.products) setProducts(dataP.products);
        } catch {} finally {
            setLoadingProducts(false);
        }

        // Load Orders
        try {
            setLoadingOrders(true);
            const resO = await fetch('/api/orders');
            const dataO = await resO.json();
            if (dataO.orders) setOrders(dataO.orders);
        } catch {} finally {
            setLoadingOrders(false);
        }

        // Load Settings (Cuentas de pago y tienda)
        try {
            const resS = await fetch('/api/settings');
            const dataS = await resS.json();
            if (dataS && dataS.settings) setSettings(dataS.settings);
        } catch {}
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/logout', { method: 'POST' });
            router.push('/admin/login');
            router.refresh();
        } catch {
            router.push('/admin/login');
        }
    };

    // On-demand BCV scraping sync from official bcv.org.ve
    const handleSyncBcv = async () => {
        setIsSyncingBcv(true);
        try {
            const res = await fetch('/api/bcv?refresh=true');
            const data = await res.json();
            if (data && data.rate) {
                setBcvRate(data.rate);
                setManualRateInput(String(data.rate));
                setBcvData(data);
                showToast(`✓ Tasa BCV sincronizada: ${data.rate} Bs/$ (${data.fechaValor || 'Oficial'})`);
            } else {
                showToast('⚠️ No se pudo obtener la tasa actualizada de BCV');
            }
        } catch {
            showToast('⚠️ Error de conexión con bcv.org.ve');
        } finally {
            setIsSyncingBcv(false);
        }
    };

    // BCV Manual Rate Update (for overrides)
    const handleUpdateRate = async (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseFloat(manualRateInput);
        if (!num || num <= 0) return alert('Tasa inválida');
        setIsUpdatingRate(true);
        try {
            const res = await fetch('/api/bcv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rate: num })
            });
            const data = await res.json();
            if (res.ok) {
                setBcvRate(data.rate);
                setBcvData(prev => ({
                    ...prev,
                    rate: data.rate,
                    formattedRate: data.formattedRate,
                    source: data.source || 'Ajuste Manual Admin',
                    lastUpdated: data.lastUpdated || new Date().toISOString()
                }));
                showToast(`✓ Tasa BCV actualizada a ${data.rate} Bs/$`);
            }
        } catch {
            alert('Error de conexión al actualizar tasa.');
        } finally {
            setIsUpdatingRate(false);
        }
    };

    // ==========================================
    // PRODUCT ACTIONS (Máximo 10 imágenes)
    // ==========================================
    const openCreateProductModal = () => {
        setEditingProduct(null);
        setFormName('');
        setFormDescription('');
        setFormPrice(8);
        setFormCategory(activeSection);
        const catInfo = CATEGORIES[activeSection];
        setFormSubcategory(catInfo?.subcategories[0]?.id);
        
        // Default cover image for this section
        const defaultImg = activeSection === 'gorros' ? '/cat_gorros.png' : activeSection === 'equipos-medicos' ? '/cat_equipos.png' : '/cat_accesorios.png';
        setFormImages([defaultImg]);
        setNewImageUrl('');
        setIsProductModalOpen(true);
    };

    const openEditProductModal = (product: Product) => {
        setEditingProduct(product);
        setFormName(product.name);
        setFormDescription(product.description || '');
        setFormPrice(product.price);
        setFormCategory(product.categoria_slug);
        setFormSubcategory(product.subcategoria_id);
        const imgs = parseImages(product.image_url);
        setFormImages(imgs.length > 0 ? imgs.slice(0, 10) : ['/cat_gorros.png']);
        setNewImageUrl('');
        setIsProductModalOpen(true);
    };

    const handleAddImage = (urlToAdd: string) => {
        const clean = urlToAdd.trim();
        if (!clean) return;
        if (formImages.length >= 10) {
            alert('Has alcanzado el límite máximo de 10 imágenes para este producto.');
            return;
        }
        setFormImages(prev => [...prev, clean]);
        setNewImageUrl('');
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setFormImages(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formImages.length === 0) {
            alert('Debes incluir al menos una imagen para el producto.');
            return;
        }

        setActionLoading(true);
        const payload = {
            name: formName.trim(),
            description: formDescription.trim(),
            price: Number(formPrice),
            categoria_slug: formCategory,
            subcategoria_id: formSubcategory ? Number(formSubcategory) : undefined,
            // Store as array or JSON string if multiple
            image_url: formImages.length === 1 ? formImages[0] : JSON.stringify(formImages)
        };

        try {
            if (editingProduct) {
                const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    showToast('✓ Producto actualizado correctamente');
                    setIsProductModalOpen(false);
                    loadData();
                } else {
                    alert('Error al actualizar');
                }
            } else {
                const res = await fetch('/api/admin/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    showToast('✓ Nuevo producto creado con éxito');
                    setIsProductModalOpen(false);
                    loadData();
                } else {
                    alert('Error al crear producto');
                }
            }
        } catch {
            alert('Error de conexión.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('✓ Producto eliminado con éxito');
                setDeleteConfirmId(null);
                loadData();
            }
        } catch {
            alert('Error al eliminar');
        } finally {
            setActionLoading(false);
        }
    };

    // ==========================================
    // BILLING & INVOICE ACTIONS (Manipulación sin código)
    // ==========================================
    const normalizeStatus = (status: string): 'por_verificar' | 'verificada' | 'rechazada' => {
        if (status === 'verificada' || status === 'verificado') return 'verificada';
        if (status === 'rechazada' || status === 'rechazado') return 'rechazada';
        return 'por_verificar';
    };

    const handleUpdateOrderStatus = async (id: string, newStatus: 'por_verificar' | 'verificada' | 'rechazada') => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado_pago: newStatus })
            });
            if (res.ok) {
                const label = newStatus === 'verificada' ? 'VERIFICADA' : newStatus === 'rechazada' ? 'RECHAZADA' : 'POR VERIFICAR';
                showToast(`✓ Factura actualizada a: ${label}`);
                if (viewingOrder && viewingOrder.id === id) {
                    setViewingOrder(prev => prev ? { ...prev, estado_pago: newStatus } : null);
                }
                loadData();
            }
        } catch {
            alert('Error al actualizar estatus');
        }
    };

    const openEditOrderModal = (order: Order) => {
        setEditingOrder(order);
        setEditOrderData({
            cliente_nombre: order.cliente_nombre || '',
            cliente_apellido: order.cliente_apellido || '',
            cliente_cedula: order.cliente_cedula || '',
            cliente_telefono: order.cliente_telefono || '',
            tipo_entrega: order.tipo_entrega || 'local',
            empresa_envio: order.empresa_envio || 'MRW',
            direccion_entrega: order.direccion_entrega || '',
            metodo_pago: order.metodo_pago || 'pago_movil',
            banco_emisor: order.banco_emisor || '',
            telefono_o_email_emisor: order.telefono_o_email_emisor || '',
            referencia_pago: order.referencia_pago || '',
            monto_usd: order.monto_usd,
            monto_bs: order.monto_bs,
            estado_pago: normalizeStatus(order.estado_pago),
            notas_admin: order.notas_admin || ''
        });
    };

    const handleSaveOrderEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOrder) return;
        setActionLoading(true);
        const mUsd = Number(editOrderData.monto_usd) || 0;
        const mBs = mUsd * bcvRate;
        try {
            const res = await fetch(`/api/orders/${editingOrder.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editOrderData,
                    monto_usd: mUsd,
                    monto_bs: mBs
                })
            });
            if (res.ok) {
                showToast(`✓ Factura ${editingOrder.numero_factura} actualizada con éxito`);
                setEditingOrder(null);
                loadData();
            } else {
                alert('Error al guardar cambios de la factura');
            }
        } catch {
            alert('Error de conexión');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteOrder = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('✓ Factura eliminada correctamente');
                setDeleteOrderConfirmId(null);
                if (viewingOrder?.id === id) setViewingOrder(null);
                loadData();
            } else {
                alert('No se pudo eliminar la factura');
            }
        } catch {
            alert('Error al eliminar factura');
        } finally {
            setActionLoading(false);
        }
    };

    // ==========================================
    // SETTINGS ACTIONS (Cuentas de pago y tienda)
    // ==========================================
    const handleSaveSettings = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSavingSettings(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                const data = await res.json();
                if (data.settings) setSettings(data.settings);
                showToast('✓ Cuentas de pago y configuraciones guardadas con éxito');
            } else {
                alert('Error al guardar configuraciones');
            }
        } catch {
            alert('Error de conexión al guardar configuraciones');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleCreateManualInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        const amountUsd = Number(manualMontoUsd) || 0;
        const amountBs = amountUsd * bcvRate;

        const payload = {
            cliente_nombre: manualClienteNombre.trim(),
            cliente_apellido: manualClienteApellido.trim(),
            cliente_cedula: manualClienteCedula.trim(),
            cliente_telefono: manualClienteTelefono.trim(),
            tipo_entrega: manualTipoEntrega,
            direccion_entrega: manualDireccion.trim() || 'Entrega en tienda / Directa',
            metodo_pago: manualMetodoPago,
            telefono_o_email_emisor: manualClienteTelefono.trim() || 'Manual',
            referencia_pago: manualReferencia.trim() || 'VENTA-DIRECTA',
            monto_usd: amountUsd,
            tasa_bcv: bcvRate,
            monto_bs: amountBs,
            estado_pago: manualEstadoPago,
            es_manual: true,
            items: [
                {
                    name: manualItemName.trim() || 'Venta Manual en Tienda',
                    price: amountUsd,
                    quantity: 1,
                    categoria_slug: manualItemCategory
                }
            ]
        };

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showToast('✓ Factura manual registrada con éxito');
                setIsManualInvoiceOpen(false);
                // Reset manual form
                setManualClienteNombre('');
                setManualClienteApellido('');
                setManualClienteCedula('');
                setManualClienteTelefono('');
                setManualReferencia('');
                loadData();
            }
        } catch {
            alert('Error al registrar factura manual');
        } finally {
            setActionLoading(false);
        }
    };

    // ==========================================
    // FILTER LOGIC FOR BILLING (Facturado)
    // ==========================================
    const filteredOrders = orders.filter(order => {
        // 1. Period filter
        const orderDate = new Date(order.created_at);
        const now = new Date();
        if (filterPeriod === 'today') {
            const isToday = orderDate.toDateString() === now.toDateString();
            if (!isToday) return false;
        } else if (filterPeriod === 'week') {
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (orderDate < oneWeekAgo) return false;
        } else if (filterPeriod === 'month') {
            const isThisMonth = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
            if (!isThisMonth) return false;
        }

        // 2. Method filter (Pago Movil vs Binance)
        if (filterMethod !== 'all' && order.metodo_pago !== filterMethod) {
            return false;
        }

        // 3. Status filter (por_verificar, verificada, rechazada)
        if (filterStatus !== 'all') {
            const norm = normalizeStatus(order.estado_pago);
            if (norm !== filterStatus) return false;
        }

        // 4. Section / Category filter
        if (filterCategory !== 'all') {
            const hasCat = order.items.some(it => it.categoria_slug === filterCategory);
            if (!hasCat) return false;
        }

        // 5. Search text (Name, Cedula, Invoice, Reference)
        if (orderSearch.trim()) {
            const q = orderSearch.toLowerCase();
            const matchesText = 
                order.numero_factura.toLowerCase().includes(q) ||
                order.cliente_nombre.toLowerCase().includes(q) ||
                order.cliente_apellido.toLowerCase().includes(q) ||
                order.cliente_cedula.toLowerCase().includes(q) ||
                order.referencia_pago.toLowerCase().includes(q);
            if (!matchesText) return false;
        }

        return true;
    });

    // Billing metrics discrimination
    const totalVentasUSD = filteredOrders.reduce((acc, o) => acc + o.monto_usd, 0);
    const totalVentasBs = filteredOrders.reduce((acc, o) => acc + o.monto_bs, 0);

    const ordersPagoMovil = filteredOrders.filter(o => o.metodo_pago === 'pago_movil');
    const totalPagoMovilUSD = ordersPagoMovil.reduce((acc, o) => acc + o.monto_usd, 0);
    const totalPagoMovilBs = ordersPagoMovil.reduce((acc, o) => acc + o.monto_bs, 0);

    const ordersBinance = filteredOrders.filter(o => o.metodo_pago === 'binance');
    const totalBinanceUSDT = ordersBinance.reduce((acc, o) => acc + o.monto_usd, 0);

    const pendingOrdersCount = orders.filter(o => normalizeStatus(o.estado_pago) === 'por_verificar').length;
    const verifiedOrdersCount = orders.filter(o => normalizeStatus(o.estado_pago) === 'verificada').length;
    const rejectedOrdersCount = orders.filter(o => normalizeStatus(o.estado_pago) === 'rechazada').length;

    // Filter products by active section only (NO "TODOS")
    const sectionProducts = products.filter(p => {
        const matchesSection = p.categoria_slug === activeSection;
        const matchesSearch = !productSearch.trim() || 
            p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
            (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()));
        return matchesSection && matchesSearch;
    });

    // Theme Classes
    const bgMain = isDark ? 'bg-[#130d13] text-[#f5edf4]' : 'bg-[#FFF9F5] text-gray-900';
    const bgSidebar = isDark ? 'bg-[#1b121b] border-[#362132]' : 'bg-white border-gray-200';
    const bgCard = isDark ? 'bg-[#201520] border-[#3e273b]' : 'bg-white border-gray-200';
    const bgSubCard = isDark ? 'bg-[#170e17] border-[#382234]' : 'bg-[#FFF9F5] border-[#FFC99C]/50';
    const borderDefault = isDark ? 'border-[#382234]' : 'border-gray-200';
    const inputStyle = isDark 
        ? 'bg-[#170e17] border-[#382234] text-white focus:border-[#D86A33] placeholder-gray-500' 
        : 'bg-white border-gray-200 text-gray-900 focus:border-[#D86A33]';

    return (
        <div className={`min-h-screen flex flex-col md:flex-row ${bgMain} transition-colors duration-200 font-sans`}>
            
            {/* Toast Notifications */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-50 bg-[#D86A33] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-black animate-bounce">
                    <Sparkles size={16} className="text-[#FFC99C]" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Mobile Header Bar */}
            <div className={`md:hidden flex items-center justify-between p-4 border-b ${bgSidebar} sticky top-0 z-30`}>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-xl border border-gray-300 dark:border-white/10"
                    >
                        <Menu size={20} />
                    </button>
                    <img src="/logo-wine.png" alt="BOHEME" className="h-8 w-auto object-contain" />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-xl border border-gray-200 dark:border-white/10"
                    >
                        {isDark ? <Sun size={17} className="text-[#FFC99C]" /> : <Moon size={17} className="text-[#5F2142]" />}
                    </button>
                </div>
            </div>

            {/* Sidebar Navigation */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 md:static md:translate-x-0 transform transition-transform duration-300
                flex flex-col justify-between p-5 border-r ${bgSidebar} shadow-sm
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="space-y-6">
                    {/* Brand Logo & Admin Badge */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
                        <Link href="/admin" className="flex items-center gap-2">
                            <img src="/logo-wine.png" alt="BOHEME" className="h-9 w-auto object-contain" />
                        </Link>
                        <button 
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden p-1.5 rounded-lg text-gray-500"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="px-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#D86A33]">
                            ✦ Panel de Control
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-1.5">
                        <button
                            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                                activeTab === 'dashboard'
                                    ? 'bg-[#5F2142] text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-[#FFF4EB] dark:hover:bg-white/5'
                            }`}
                        >
                            <TrendingUp size={16} />
                            <span>Resumen</span>
                        </button>

                        <button
                            onClick={() => { setActiveTab('facturado'); setSidebarOpen(false); }}
                            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                                activeTab === 'facturado'
                                    ? 'bg-[#5F2142] text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-[#FFF4EB] dark:hover:bg-white/5'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <FileText size={16} />
                                <span>Facturado</span>
                            </div>
                            {pendingOrdersCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-[#D86A33] text-white text-[10px] font-bold">
                                    {pendingOrdersCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => { setActiveTab('productos'); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                                activeTab === 'productos'
                                    ? 'bg-[#5F2142] text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-[#FFF4EB] dark:hover:bg-white/5'
                            }`}
                        >
                            <Package size={16} />
                            <span>Agregar Productos</span>
                        </button>

                        <button
                            onClick={() => { setActiveTab('configuracion'); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                                activeTab === 'configuracion'
                                    ? 'bg-[#5F2142] text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-[#FFF4EB] dark:hover:bg-white/5'
                            }`}
                        >
                            <Settings size={16} />
                            <span>Tasa BCV & Ajustes</span>
                        </button>
                    </nav>

                    {/* Live BCV Quick Pill in Sidebar */}
                    <div className={`p-3.5 rounded-2xl ${bgSubCard} border ${borderDefault} space-y-1.5`}>
                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                            <span className="flex items-center gap-1">
                                <TrendingUp size={12} className="text-[#D86A33]" />
                                <span>Tasa Oficial BCV</span>
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Sincronizado con bcv.org.ve" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-lg font-black text-[#5F2142] dark:text-[#FFC99C]">
                                {bcvRate} <span className="text-xs text-gray-500 font-bold">Bs/$</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleSyncBcv}
                                disabled={isSyncingBcv}
                                className="p-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#D86A33] text-[#D86A33] hover:bg-[#FFF4EB] dark:hover:bg-white/5 transition-all"
                                title="Actualizar tasa en vivo desde bcv.org.ve"
                            >
                                <RefreshCw size={13} className={isSyncingBcv ? 'animate-spin' : ''} />
                            </button>
                        </div>
                        {bcvData.fechaValor && (
                            <div className="text-[10px] text-gray-400 font-medium truncate" title={bcvData.fechaValor}>
                                {bcvData.fechaValor}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Bottom Actions */}
                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-white/10">
                    {/* Dark / Light Mode Switch */}
                    <button
                        onClick={toggleDarkMode}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${borderDefault} text-xs font-bold transition-all hover:scale-[1.02]`}
                    >
                        <span className="flex items-center gap-2">
                            {isDark ? <Moon size={15} className="text-[#FFC99C]" /> : <Sun size={15} className="text-[#D86A33]" />}
                            <span>Modo {isDark ? 'Oscuro' : 'Claro'}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 uppercase font-black">
                            {isDark ? 'ON' : 'OFF'}
                        </span>
                    </button>

                    {/* Store Link */}
                    <Link
                        href="/"
                        target="_blank"
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-[#5F2142] dark:hover:text-white transition-all"
                    >
                        <span className="flex items-center gap-2">
                            <Store size={15} className="text-[#D86A33]" />
                            <span>Ver Tienda</span>
                        </span>
                        <ExternalLink size={12} className="text-gray-400" />
                    </Link>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 text-xs font-bold transition-colors"
                    >
                        <LogOut size={15} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Backdrop overlay on mobile */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                />
            )}

            {/* Main Workspace Area */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full">
                
                {/* ========================================================= */}
                {/* TAB 1: FACTURADO & PEDIDOS (Módulo Facturado Solicitado) */}
                {/* ========================================================= */}
                {activeTab === 'facturado' && (
                    <div className="space-y-6">
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-[#5F2142] dark:text-[#FFC99C] tracking-tight">
                                    Módulo de Facturado
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    Gestión de ventas, verificación de pagos en Pago Móvil y Binance, y emisión de facturas.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                {/* BCV Rate Pill with Live Refresh */}
                                <div className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl ${bgCard} border ${borderDefault} text-xs font-bold shadow-xs`}>
                                    <TrendingUp size={14} className="text-[#D86A33]" />
                                    <span>Tasa BCV: <strong className="text-[#5F2142] dark:text-[#FFC99C]">{bcvRate} Bs/$</strong></span>
                                    <button
                                        type="button"
                                        onClick={handleSyncBcv}
                                        disabled={isSyncingBcv}
                                        className="p-1 rounded-lg text-[#D86A33] hover:bg-[#FFF4EB] dark:hover:bg-white/10 transition-colors"
                                        title="Actualizar tasa desde bcv.org.ve"
                                    >
                                        <RefreshCw size={12} className={isSyncingBcv ? 'animate-spin' : ''} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => setIsManualInvoiceOpen(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white text-xs sm:text-sm font-black transition-all hover:scale-105 shadow-md shadow-[#D86A33]/25"
                                >
                                    <Plus size={16} />
                                    <span>+ Facturar Manual</span>
                                </button>
                            </div>
                        </div>

                        {/* Discrimination KPI Cards (Pago Movil vs Binance) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Total Ventas */}
                            <div className={`p-5 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Total Facturado</span>
                                    <div className="w-8 h-8 rounded-full bg-[#FFF4EB] text-[#D86A33] flex items-center justify-center font-bold">
                                        $
                                    </div>
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-[#5F2142] dark:text-[#FFC99C]">
                                    ${totalVentasUSD.toFixed(2)}
                                </div>
                                <div className="text-[11px] text-gray-500 font-medium mt-1">
                                    ≈ Bs. {totalVentasBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>

                            {/* Pago Móvil Discrimination */}
                            <div className={`p-5 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Ventas Pago Móvil</span>
                                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                                        BDV 0102
                                    </span>
                                </div>
                                <div className="text-2xl font-black text-[#5F2142] dark:text-white">
                                    ${totalPagoMovilUSD.toFixed(2)} USD
                                </div>
                                <div className="text-[11px] text-[#D86A33] font-bold mt-1">
                                    Bs. {totalPagoMovilBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({ordersPagoMovil.length} pedidos)
                                </div>
                            </div>

                            {/* Binance Discrimination */}
                            <div className={`p-5 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Ventas Binance</span>
                                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                                        USDT
                                    </span>
                                </div>
                                <div className="text-2xl font-black text-[#5F2142] dark:text-white">
                                    ${totalBinanceUSDT.toFixed(2)} USDT
                                </div>
                                <div className="text-[11px] text-gray-500 font-medium mt-1">
                                    {ordersBinance.length} transacciones registradas
                                </div>
                            </div>

                            {/* Verification Status */}
                            <div className={`p-5 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Estatus de Pagos</span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                </div>
                                <div className="text-2xl font-black text-amber-600">
                                    {pendingOrdersCount} <span className="text-xs text-gray-500 font-medium">por verificar</span>
                                </div>
                                <div className="text-[11px] text-green-600 font-bold mt-1">
                                    {orders.filter(o => o.estado_pago === 'verificado').length} pagos verificados ✓
                                </div>
                            </div>
                        </div>

                        {/* Multiple Filters Bar */}
                        <div className={`p-4 sm:p-6 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs space-y-4`}>
                            {/* Search bar & Period Pills */}
                            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                                <div className="relative flex-1">
                                    <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por cliente, cédula, factura (BHM-...) o referencia..."
                                        value={orderSearch}
                                        onChange={(e) => setOrderSearch(e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-sm outline-none transition-all ${inputStyle}`}
                                    />
                                </div>

                                {/* Period Filter */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 hidden sm:inline">
                                        Período:
                                    </span>
                                    {[
                                        { key: 'all', label: 'Todo' },
                                        { key: 'today', label: 'Hoy' },
                                        { key: 'week', label: 'Esta Semana' },
                                        { key: 'month', label: 'Este Mes' }
                                    ].map((p) => (
                                        <button
                                            key={p.key}
                                            onClick={() => setFilterPeriod(p.key as any)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                                                filterPeriod === p.key
                                                    ? 'bg-[#D86A33] text-white shadow-xs'
                                                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dropdowns Row: Method, Status, Category */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-white/10">
                                {/* Método de Pago */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                                        Método de Pago:
                                    </label>
                                    <select
                                        value={filterMethod}
                                        onChange={(e) => setFilterMethod(e.target.value as any)}
                                        className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${inputStyle}`}
                                    >
                                        <option value="all">Todos los Métodos</option>
                                        <option value="pago_movil">Pago Móvil (BDV)</option>
                                        <option value="binance">Binance Pay (USDT)</option>
                                    </select>
                                </div>

                                {/* Estatus del Pago */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                                        Estatus del Pago:
                                    </label>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value as any)}
                                        className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${inputStyle}`}
                                    >
                                        <option value="all">Todos los Estatus ({orders.length})</option>
                                        <option value="por_verificar">Por Verificar ({pendingOrdersCount})</option>
                                        <option value="verificada">Verificadas ({verifiedOrdersCount})</option>
                                        <option value="rechazada">Rechazadas ({rejectedOrdersCount})</option>
                                    </select>
                                </div>

                                {/* Sección / Categoría */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                                        Categoría de Producto:
                                    </label>
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${inputStyle}`}
                                    >
                                        <option value="all">Todas las Categorías</option>
                                        <option value="gorros">Gorros Quirúrgicos</option>
                                        <option value="lanyards">Lanyards & Cintas</option>
                                        <option value="accesorios-medicos">Accesorios Médicos</option>
                                        <option value="equipos-medicos">Equipos Médicos</option>
                                        <option value="productos-personalizados">Personalizados</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Invoices List / Table */}
                        <div className={`rounded-3xl ${bgCard} border ${borderDefault} shadow-xs overflow-hidden`}>
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                                <h3 className="font-black text-base text-[#5F2142] dark:text-[#FFC99C]">
                                    Facturas Registradas ({filteredOrders.length})
                                </h3>
                                <span className="text-xs text-gray-500 font-medium">
                                    Tasa aplicada: {bcvRate} Bs/$
                                </span>
                            </div>

                            {loadingOrders ? (
                                <div className="p-16 text-center text-gray-500">Cargando facturas...</div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="p-16 text-center text-gray-500">
                                    <AlertCircle size={28} className="mx-auto mb-2 text-[#D86A33]" />
                                    <p className="font-bold">No se encontraron facturas con estos filtros.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto divide-y divide-gray-100 dark:divide-white/10">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-white/5">
                                                <th className="py-3 px-5">Factura / Fecha</th>
                                                <th className="py-3 px-5">Cliente</th>
                                                <th className="py-3 px-5">Método & Ref</th>
                                                <th className="py-3 px-5">Monto Total</th>
                                                <th className="py-3 px-5">Estatus del Pago</th>
                                                <th className="py-3 px-5 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {filteredOrders.map(order => {
                                                const dateStr = new Date(order.created_at).toLocaleString('es-VE', {
                                                    dateStyle: 'short',
                                                    timeStyle: 'short'
                                                });
                                                return (
                                                    <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                                        {/* Factura & Fecha */}
                                                        <td className="py-3.5 px-5 whitespace-nowrap">
                                                            <div className="font-black text-sm text-[#5F2142] dark:text-[#FFC99C]">
                                                                {order.numero_factura}
                                                            </div>
                                                            <div className="text-[11px] text-gray-400">{dateStr}</div>
                                                            {order.es_manual && (
                                                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-bold uppercase">
                                                                    Manual
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Cliente */}
                                                        <td className="py-3.5 px-5">
                                                            <div className="font-bold text-gray-900 dark:text-white">
                                                                {order.cliente_nombre} {order.cliente_apellido}
                                                            </div>
                                                            <div className="text-[11px] text-gray-400 font-mono">
                                                                {order.cliente_cedula} • {order.cliente_telefono}
                                                            </div>
                                                        </td>

                                                        {/* Método y Ref */}
                                                        <td className="py-3.5 px-5 whitespace-nowrap">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                                order.metodo_pago === 'pago_movil'
                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                            }`}>
                                                                {order.metodo_pago === 'pago_movil' ? 'Pago Móvil' : 'Binance Pay'}
                                                            </span>
                                                            <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                                                                Ref: {order.referencia_pago}
                                                            </div>
                                                        </td>

                                                        {/* Monto */}
                                                        <td className="py-3.5 px-5 whitespace-nowrap">
                                                            <div className="font-black text-sm text-[#5F2142] dark:text-[#FFC99C]">
                                                                ${order.monto_usd.toFixed(2)} USD
                                                            </div>
                                                            <div className="text-[11px] text-gray-500 font-medium">
                                                                Bs. {order.monto_bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </div>
                                                        </td>

                                                        {/* Estatus del Pago (Modificable en 1 clic entre por verificar, verificada y rechazada) */}
                                                        <td className="py-3.5 px-5 whitespace-nowrap">
                                                            {(() => {
                                                                const st = normalizeStatus(order.estado_pago);
                                                                return (
                                                                    <div className="flex flex-col gap-1.5">
                                                                        <div>
                                                                            {st === 'verificada' && (
                                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-black text-[10px] uppercase border border-emerald-300 dark:border-emerald-700/50">
                                                                                    <CheckCircle2 size={12} className="text-emerald-600" />
                                                                                    <span>Verificada ✓</span>
                                                                                </span>
                                                                            )}
                                                                            {st === 'rechazada' && (
                                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 font-black text-[10px] uppercase border border-red-300 dark:border-red-700/50">
                                                                                    <XCircle size={12} className="text-red-600" />
                                                                                    <span>Rechazada ✕</span>
                                                                                </span>
                                                                            )}
                                                                            {st === 'por_verificar' && (
                                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 font-black text-[10px] uppercase border border-amber-300 dark:border-amber-700/50">
                                                                                    <Clock3 size={12} className="text-amber-600 animate-pulse" />
                                                                                    <span>Por Verificar</span>
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {/* 1-Click Status Quick Switcher */}
                                                                        <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-0.5 rounded-lg border border-gray-200 dark:border-white/10 w-fit">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleUpdateOrderStatus(order.id, 'por_verificar')}
                                                                                className={`px-1.5 py-0.5 rounded text-[9px] font-black transition-all ${
                                                                                    st === 'por_verificar'
                                                                                        ? 'bg-amber-500 text-white shadow-2xs'
                                                                                        : 'text-gray-500 hover:text-amber-600'
                                                                                }`}
                                                                                title="Cambiar estatus a: Por Verificar"
                                                                            >
                                                                                Por Verificar
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleUpdateOrderStatus(order.id, 'verificada')}
                                                                                className={`px-1.5 py-0.5 rounded text-[9px] font-black transition-all ${
                                                                                    st === 'verificada'
                                                                                        ? 'bg-emerald-600 text-white shadow-2xs'
                                                                                        : 'text-gray-500 hover:text-emerald-600'
                                                                                }`}
                                                                                title="Cambiar estatus a: Verificada"
                                                                            >
                                                                                ✓ Verificada
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleUpdateOrderStatus(order.id, 'rechazada')}
                                                                                className={`px-1.5 py-0.5 rounded text-[9px] font-black transition-all ${
                                                                                    st === 'rechazada'
                                                                                        ? 'bg-red-600 text-white shadow-2xs'
                                                                                        : 'text-gray-500 hover:text-red-600'
                                                                                }`}
                                                                                title="Cambiar estatus a: Rechazada"
                                                                            >
                                                                                ✕ Rechazada
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </td>

                                                        {/* Acciones: Ver, Editar, Eliminar */}
                                                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                                            <div className="inline-flex items-center gap-1.5">
                                                                <button
                                                                    onClick={() => setViewingOrder(order)}
                                                                    className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#D86A33] text-gray-700 dark:text-gray-300 font-bold transition-all text-xs inline-flex items-center gap-1"
                                                                    title="Ver factura completa"
                                                                >
                                                                    <Eye size={12} />
                                                                    <span>Ver</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => openEditOrderModal(order)}
                                                                    className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#5F2142] text-[#5F2142] dark:text-[#FFC99C] font-bold transition-all text-xs inline-flex items-center gap-1"
                                                                    title="Editar datos de la factura"
                                                                >
                                                                    <Edit2 size={12} />
                                                                    <span>Editar</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeleteOrderConfirmId(order.id)}
                                                                    className="p-1.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                                                                    title="Eliminar factura"
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 2: AGREGAR PRODUCTOS (Por Sección, Sin "TODOS")       */}
                {/* ========================================================= */}
                {activeTab === 'productos' && (
                    <div className="space-y-6">
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-[#5F2142] dark:text-[#FFC99C] tracking-tight">
                                    Agregar Productos
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    Organizado por sección. Permite hasta 10 imágenes por producto.
                                </p>
                            </div>

                            <button
                                onClick={openCreateProductModal}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white font-black text-xs sm:text-sm transition-all hover:scale-105 shadow-md shadow-[#D86A33]/25"
                            >
                                <Plus size={16} />
                                <span>+ Nuevo Producto en {CATEGORIES[activeSection]?.title}</span>
                            </button>
                        </div>

                        {/* Section Selector Buttons (NO "TODOS") */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {SECTIONS.map((sec) => {
                                const isSelected = activeSection === sec.slug;
                                const count = products.filter(p => p.categoria_slug === sec.slug).length;
                                return (
                                    <button
                                        key={sec.slug}
                                        onClick={() => setActiveSection(sec.slug)}
                                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                                            isSelected
                                                ? 'bg-[#5F2142] text-white border-[#5F2142] shadow-md scale-105'
                                                : `${bgCard} ${borderDefault} text-gray-700 dark:text-gray-300 hover:border-[#D86A33]`
                                        }`}
                                    >
                                        <div className="text-lg mb-1">{sec.icon}</div>
                                        <div className="font-black text-xs leading-tight line-clamp-1">{sec.label}</div>
                                        <div className={`text-[10px] mt-0.5 font-bold ${isSelected ? 'text-[#FFC99C]' : 'text-gray-400'}`}>
                                            {count} productos
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search in active section */}
                        <div className={`p-4 rounded-2xl ${bgCard} border ${borderDefault} shadow-xs flex items-center gap-3`}>
                            <Search size={17} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Buscar en ${CATEGORIES[activeSection]?.title}...`}
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className={`w-full outline-none text-xs sm:text-sm font-medium ${isDark ? 'bg-transparent text-white' : 'bg-transparent text-gray-900'}`}
                            />
                        </div>

                        {/* Products Table in Active Section */}
                        <div className={`rounded-3xl ${bgCard} border ${borderDefault} shadow-xs overflow-hidden`}>
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                                <h3 className="font-black text-base text-[#5F2142] dark:text-[#FFC99C]">
                                    {CATEGORIES[activeSection]?.title} ({sectionProducts.length})
                                </h3>
                                <span className="text-xs text-gray-500 font-medium">Precios en Dólares ($)</span>
                            </div>

                            {sectionProducts.length === 0 ? (
                                <div className="p-16 text-center text-gray-500">
                                    <p className="font-bold">No hay productos en esta sección.</p>
                                    <button
                                        onClick={openCreateProductModal}
                                        className="mt-3 px-4 py-2 rounded-full bg-[#D86A33] text-white font-bold text-xs"
                                    >
                                        + Agregar Primer Producto
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto divide-y divide-gray-100 dark:divide-white/10">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-white/5">
                                                <th className="py-3 px-5">Producto & Fotos</th>
                                                <th className="py-3 px-5">Subcategoría</th>
                                                <th className="py-3 px-5">Precio</th>
                                                <th className="py-3 px-5 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {sectionProducts.map(p => {
                                                const imgs = parseImages(p.image_url);
                                                const firstImg = imgs[0] || '/cat_gorros.png';
                                                const subcat = CATEGORIES[p.categoria_slug]?.subcategories.find(s => s.id === p.subcategoria_id);
                                                return (
                                                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                                        <td className="py-3.5 px-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden shrink-0 relative flex items-center justify-center">
                                                                    <img src={firstImg} alt={p.name} className="w-full h-full object-cover" />
                                                                    {imgs.length > 1 && (
                                                                        <span className="absolute bottom-0 right-0 bg-[#5F2142] text-white text-[9px] font-black px-1 rounded-tl">
                                                                            +{imgs.length}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-gray-900 dark:text-white">{p.name}</div>
                                                                    <div className="text-[11px] text-gray-500 line-clamp-1">{p.description}</div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="py-3.5 px-5 whitespace-nowrap">
                                                            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                                                {subcat?.name || 'General'}
                                                            </span>
                                                        </td>

                                                        <td className="py-3.5 px-5 whitespace-nowrap">
                                                            <span className="font-black text-sm text-[#5F2142] dark:text-[#FFC99C]">
                                                                ${p.price.toFixed(2)}
                                                            </span>
                                                        </td>

                                                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                                            <div className="inline-flex items-center gap-2">
                                                                <button
                                                                    onClick={() => openEditProductModal(p)}
                                                                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 hover:border-[#D86A33] hover:text-[#D86A33] flex items-center justify-center transition-all bg-white dark:bg-transparent"
                                                                >
                                                                    <Edit2 size={13} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeleteConfirmId(p.id)}
                                                                    className="w-8 h-8 rounded-full border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 flex items-center justify-center transition-all bg-white dark:bg-transparent"
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 3: RESUMEN / DASHBOARD GENERAL                        */}
                {/* ========================================================= */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-[#5F2142] dark:text-[#FFC99C] tracking-tight">
                                Resumen General BOHEME
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Vista global del rendimiento de ventas e inventario.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className={`p-5 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs`}>
                                <span className="text-xs font-bold text-gray-500 uppercase">Productos Activos</span>
                                <div className="text-3xl font-black text-[#5F2142] dark:text-white mt-2">{products.length}</div>
                            </div>
                            <div className={`p-5 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs`}>
                                <span className="text-xs font-bold text-gray-500 uppercase">Total Pedidos</span>
                                <div className="text-3xl font-black text-[#D86A33] mt-2">{orders.length}</div>
                            </div>
                            <div className={`p-5 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs relative`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Tasa Oficial BCV</span>
                                    <button
                                        type="button"
                                        onClick={handleSyncBcv}
                                        disabled={isSyncingBcv}
                                        className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:border-[#D86A33] text-[#D86A33] transition-all"
                                        title="Sincronizar ahora con bcv.org.ve"
                                    >
                                        <RefreshCw size={13} className={isSyncingBcv ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                                <div className="text-3xl font-black text-[#5F2142] dark:text-[#FFC99C] mt-2">
                                    {bcvRate} <span className="text-xs text-gray-500 font-bold">Bs/$</span>
                                </div>
                                {bcvData.fechaValor && (
                                    <div className="text-[10px] text-gray-400 mt-1 truncate" title={bcvData.fechaValor}>
                                        {bcvData.fechaValor}
                                    </div>
                                )}
                            </div>
                            <div className={`p-5 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs`}>
                                <span className="text-xs font-bold text-gray-500 uppercase">Pagos por Verificar</span>
                                <div className="text-3xl font-black text-amber-600 mt-2">{pendingOrdersCount}</div>
                            </div>
                        </div>

                        {/* Quick switch to other modules */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setActiveTab('facturado')}
                                className={`p-6 rounded-3xl ${bgCard} border ${borderDefault} text-left hover:scale-[1.01] transition-all flex items-center justify-between`}
                            >
                                <div>
                                    <h4 className="font-black text-lg text-[#5F2142] dark:text-[#FFC99C]">Ir a Facturado</h4>
                                    <p className="text-xs text-gray-500 mt-1">Verifica pagos recibidos y consulta reportes detallados.</p>
                                </div>
                                <ChevronRight size={20} className="text-[#D86A33]" />
                            </button>

                            <button
                                onClick={() => setActiveTab('productos')}
                                className={`p-6 rounded-3xl ${bgCard} border ${borderDefault} text-left hover:scale-[1.01] transition-all flex items-center justify-between`}
                            >
                                <div>
                                    <h4 className="font-black text-lg text-[#5F2142] dark:text-[#FFC99C]">Agregar Productos</h4>
                                    <p className="text-xs text-gray-500 mt-1">Sube hasta 10 imágenes y gestiona tus colecciones por sección.</p>
                                </div>
                                <ChevronRight size={20} className="text-[#D86A33]" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 4: ÁREA DE CONFIGURACIONES DEL SISTEMA (SIN CÓDIGO)   */}
                {/* ========================================================= */}
                {activeTab === 'configuracion' && (
                    <div className="space-y-6 max-w-5xl">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-[#5F2142] dark:text-[#FFC99C] tracking-tight">
                                    Área de Configuraciones del Sistema
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    Control total sin código: Cuentas de pago, facturas, estatus, productos, tasa cambiaria y tienda.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleSaveSettings()}
                                disabled={isSavingSettings}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5F2142] hover:bg-[#43142e] text-white text-xs font-black shadow-md shadow-[#5F2142]/20 transition-all hover:scale-105"
                            >
                                <Save size={15} className={isSavingSettings ? 'animate-spin' : ''} />
                                <span>{isSavingSettings ? 'Guardando...' : 'Guardar Todo'}</span>
                            </button>
                        </div>

                        {/* Navigation Sub-Tabs */}
                        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-gray-100 dark:border-white/10">
                            {[
                                { key: 'pagos', label: 'Cuentas de Pago', icon: CreditCard },
                                { key: 'facturas', label: 'Gestión de Facturas', icon: FileText, badge: pendingOrdersCount },
                                { key: 'productos', label: 'Catálogo de Productos', icon: Package, badge: products.length },
                                { key: 'bcv', label: 'Tasa BCV Oficial', icon: TrendingUp },
                                { key: 'tienda', label: 'Tienda & WhatsApp', icon: Store }
                            ].map(tab => {
                                const Icon = tab.icon;
                                const isActive = configSubTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setConfigSubTab(tab.key as any)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                                            isActive
                                                ? 'bg-[#5F2142] text-white shadow-md shadow-[#5F2142]/20 scale-102'
                                                : `${bgCard} ${borderDefault} border text-gray-600 dark:text-gray-300 hover:border-[#D86A33]`
                                        }`}
                                    >
                                        <Icon size={14} className={isActive ? 'text-[#FFC99C]' : 'text-[#D86A33]'} />
                                        <span>{tab.label}</span>
                                        {tab.badge !== undefined && tab.badge > 0 && (
                                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                                                isActive ? 'bg-[#D86A33] text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-200'
                                            }`}>
                                                {tab.badge}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* ========================================================= */}
                        {/* SUB-TAB 1: CUENTAS DE PAGO (Pago Móvil & Binance)         */}
                        {/* ========================================================= */}
                        {configSubTab === 'pagos' && (
                            <div className="space-y-6">
                                <form onSubmit={handleSaveSettings} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Card Pago Móvil BDV */}
                                        <div className={`p-6 sm:p-7 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs space-y-4`}>
                                            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold">
                                                        <CreditCard size={18} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-sm text-[#5F2142] dark:text-[#FFC99C]">
                                                            Cuenta Pago Móvil
                                                        </h3>
                                                        <span className="text-[11px] text-gray-500 font-medium">Transferencias en Bolívares (Bs.)</span>
                                                    </div>
                                                </div>
                                                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600 dark:text-gray-300">
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.pagoMovil.activo}
                                                        onChange={(e) => setSettings(prev => ({
                                                            ...prev,
                                                            pagoMovil: { ...prev.pagoMovil, activo: e.target.checked }
                                                        }))}
                                                        className="w-4 h-4 rounded text-[#D86A33] focus:ring-[#D86A33]"
                                                    />
                                                    <span>Activo</span>
                                                </label>
                                            </div>

                                            <div className="space-y-3.5 text-xs">
                                                <div>
                                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                        Banco Destino *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={settings.pagoMovil.banco}
                                                        onChange={(e) => setSettings(prev => ({
                                                            ...prev,
                                                            pagoMovil: { ...prev.pagoMovil, banco: e.target.value }
                                                        }))}
                                                        placeholder="Ej: Banco de Venezuela (0102)"
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                            Teléfono Afiliado *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={settings.pagoMovil.telefono}
                                                            onChange={(e) => setSettings(prev => ({
                                                                ...prev,
                                                                pagoMovil: { ...prev.pagoMovil, telefono: e.target.value }
                                                            }))}
                                                            placeholder="0412-1409976"
                                                            className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                            Cédula / RIF *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={settings.pagoMovil.cedula}
                                                            onChange={(e) => setSettings(prev => ({
                                                                ...prev,
                                                                pagoMovil: { ...prev.pagoMovil, cedula: e.target.value }
                                                            }))}
                                                            placeholder="V-24.354.847"
                                                            className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                        Nombre del Titular *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={settings.pagoMovil.titular}
                                                        onChange={(e) => setSettings(prev => ({
                                                            ...prev,
                                                            pagoMovil: { ...prev.pagoMovil, titular: e.target.value }
                                                        }))}
                                                        placeholder="BOHEME"
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Binance Pay */}
                                        <div className={`p-6 sm:p-7 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs space-y-4`}>
                                            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
                                                        <Wallet size={18} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-sm text-[#5F2142] dark:text-[#FFC99C]">
                                                            Cuenta Binance Pay
                                                        </h3>
                                                        <span className="text-[11px] text-gray-500 font-medium">Pagos en USDT / Cripto</span>
                                                    </div>
                                                </div>
                                                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600 dark:text-gray-300">
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.binance.activo}
                                                        onChange={(e) => setSettings(prev => ({
                                                            ...prev,
                                                            binance: { ...prev.binance, activo: e.target.checked }
                                                        }))}
                                                        className="w-4 h-4 rounded text-[#D86A33] focus:ring-[#D86A33]"
                                                    />
                                                    <span>Activo</span>
                                                </label>
                                            </div>

                                            <div className="space-y-3.5 text-xs">
                                                <div>
                                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                        Correo Registrado en Binance Pay *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        required
                                                        value={settings.binance.email}
                                                        onChange={(e) => setSettings(prev => ({
                                                            ...prev,
                                                            binance: { ...prev.binance, email: e.target.value }
                                                        }))}
                                                        placeholder="worldglobalweb724@gmail.com"
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                        Binance Pay ID / Nickname (Opcional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={settings.binance.payId || ''}
                                                        onChange={(e) => setSettings(prev => ({
                                                            ...prev,
                                                            binance: { ...prev.binance, payId: e.target.value }
                                                        }))}
                                                        placeholder="Ej: 198472910"
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                        Titular / Identificador de la Cuenta
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={settings.binance.titular || ''}
                                                        onChange={(e) => setSettings(prev => ({
                                                            ...prev,
                                                            binance: { ...prev.binance, titular: e.target.value }
                                                        }))}
                                                        placeholder="BOHEME OFICIAL"
                                                        className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex items-center justify-between p-5 rounded-2xl bg-[#FFF4EB] dark:bg-white/5 border border-[#D86A33]/20">
                                        <div className="text-xs text-gray-600 dark:text-gray-300">
                                            <p className="font-bold text-[#5F2142] dark:text-[#FFC99C]">✓ Sincronización Inmediata con la Tienda:</p>
                                            <p className="text-[11px]">Cualquier modificación en estos datos se refleja automáticamente en la pantalla de pago de los clientes.</p>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSavingSettings}
                                            className="px-6 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white text-xs font-black shadow-md shadow-[#D86A33]/20 transition-all hover:scale-105"
                                        >
                                            {isSavingSettings ? 'Guardando...' : 'Guardar Cuentas de Pago'}
                                        </button>
                                    </div>
                                </form>

                                {/* Live Customer Preview Card */}
                                <div className={`p-6 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs space-y-3`}>
                                    <h4 className="text-xs font-black text-[#5F2142] dark:text-[#FFC99C] uppercase tracking-wider">
                                        Vista Previa en Vivo (Lo que ve el cliente en Checkout)
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                        <div className={`p-4 rounded-2xl ${bgSubCard} border ${borderDefault} space-y-1.5`}>
                                            <div className="font-bold text-blue-700 dark:text-blue-300">Pago Móvil Activo:</div>
                                            <div><strong>Banco:</strong> {settings.pagoMovil.banco}</div>
                                            <div><strong>Teléfono:</strong> {settings.pagoMovil.telefono}</div>
                                            <div><strong>Cédula:</strong> {settings.pagoMovil.cedula}</div>
                                            <div><strong>Titular:</strong> {settings.pagoMovil.titular}</div>
                                        </div>
                                        <div className={`p-4 rounded-2xl ${bgSubCard} border ${borderDefault} space-y-1.5`}>
                                            <div className="font-bold text-amber-700 dark:text-amber-300">Binance Pay Activo:</div>
                                            <div><strong>Correo:</strong> {settings.binance.email}</div>
                                            {settings.binance.payId && <div><strong>Pay ID:</strong> {settings.binance.payId}</div>}
                                            <div><strong>Titular:</strong> {settings.binance.titular || 'BOHEME'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* SUB-TAB 2: GESTIÓN DE FACTURAS (Modificar sin código)     */}
                        {/* ========================================================= */}
                        {configSubTab === 'facturas' && (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                    <div className="relative flex-1">
                                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar facturas por cliente, cédula o ref..."
                                            value={orderSearch}
                                            onChange={(e) => setOrderSearch(e.target.value)}
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs outline-none ${inputStyle}`}
                                        />
                                    </div>
                                    <button
                                        onClick={() => setIsManualInvoiceOpen(true)}
                                        className="px-5 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white text-xs font-black shadow-xs whitespace-nowrap"
                                    >
                                        + Facturar Manual
                                    </button>
                                </div>

                                <div className={`rounded-3xl ${bgCard} border ${borderDefault} shadow-xs overflow-hidden`}>
                                    <div className="overflow-x-auto divide-y divide-gray-100 dark:divide-white/10">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-white/5">
                                                    <th className="py-3 px-5">Factura</th>
                                                    <th className="py-3 px-5">Cliente</th>
                                                    <th className="py-3 px-5">Monto</th>
                                                    <th className="py-3 px-5">Cambiar Estatus (1-Click)</th>
                                                    <th className="py-3 px-5 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                {filteredOrders.map(order => {
                                                    const st = normalizeStatus(order.estado_pago);
                                                    return (
                                                        <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                                            <td className="py-3.5 px-5 whitespace-nowrap">
                                                                <div className="font-black text-sm text-[#5F2142] dark:text-[#FFC99C]">{order.numero_factura}</div>
                                                                <div className="text-[11px] text-gray-400 font-mono">Ref: {order.referencia_pago}</div>
                                                            </td>
                                                            <td className="py-3.5 px-5">
                                                                <div className="font-bold text-gray-900 dark:text-white">{order.cliente_nombre} {order.cliente_apellido}</div>
                                                                <div className="text-[11px] text-gray-400">{order.cliente_telefono}</div>
                                                            </td>
                                                            <td className="py-3.5 px-5 whitespace-nowrap">
                                                                <div className="font-black text-sm text-[#5F2142] dark:text-[#FFC99C]">${order.monto_usd.toFixed(2)} USD</div>
                                                                <div className="text-[11px] text-gray-500 font-medium">Bs. {order.monto_bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                            </td>
                                                            <td className="py-3.5 px-5 whitespace-nowrap">
                                                                <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleUpdateOrderStatus(order.id, 'por_verificar')}
                                                                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                                                                            st === 'por_verificar'
                                                                                ? 'bg-amber-500 text-white shadow-xs'
                                                                                : 'text-gray-500 hover:text-amber-600'
                                                                        }`}
                                                                    >
                                                                        ⏳ Por Verificar
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleUpdateOrderStatus(order.id, 'verificada')}
                                                                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                                                                            st === 'verificada'
                                                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                                                : 'text-gray-500 hover:text-emerald-600'
                                                                        }`}
                                                                    >
                                                                        ✓ Verificada
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleUpdateOrderStatus(order.id, 'rechazada')}
                                                                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                                                                            st === 'rechazada'
                                                                                ? 'bg-red-600 text-white shadow-xs'
                                                                                : 'text-gray-500 hover:text-red-600'
                                                                        }`}
                                                                    >
                                                                        ✕ Rechazada
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                                                <div className="inline-flex items-center gap-1.5">
                                                                    <button
                                                                        onClick={() => setViewingOrder(order)}
                                                                        className="p-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#D86A33] text-gray-700 dark:text-gray-300 font-bold"
                                                                        title="Ver detalle"
                                                                    >
                                                                        <Eye size={13} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => openEditOrderModal(order)}
                                                                        className="p-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#5F2142] text-[#5F2142] dark:text-[#FFC99C] font-bold"
                                                                        title="Editar datos de factura"
                                                                    >
                                                                        <Edit2 size={13} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setDeleteOrderConfirmId(order.id)}
                                                                        className="p-1.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50"
                                                                        title="Eliminar factura"
                                                                    >
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* SUB-TAB 3: GESTIÓN DE PRODUCTOS (Editar / Eliminar)        */}
                        {/* ========================================================= */}
                        {configSubTab === 'productos' && (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                        {SECTIONS.map(s => (
                                            <button
                                                key={s.slug}
                                                onClick={() => setActiveSection(s.slug)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                                    activeSection === s.slug
                                                        ? 'bg-[#5F2142] text-white shadow-xs'
                                                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'
                                                }`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={openCreateProductModal}
                                        className="px-5 py-2 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white text-xs font-black shadow-xs shrink-0"
                                    >
                                        + Agregar Producto
                                    </button>
                                </div>

                                <div className={`rounded-3xl ${bgCard} border ${borderDefault} shadow-xs overflow-hidden`}>
                                    <div className="overflow-x-auto divide-y divide-gray-100 dark:divide-white/10">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-white/5">
                                                    <th className="py-3 px-5">Producto</th>
                                                    <th className="py-3 px-5">Precio</th>
                                                    <th className="py-3 px-5 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                {sectionProducts.map(p => {
                                                    const imgs = parseImages(p.image_url);
                                                    return (
                                                        <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                                                            <td className="py-3 px-5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden shrink-0">
                                                                        <img src={imgs[0] || '/cat_gorros.png'} alt={p.name} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-gray-900 dark:text-white">{p.name}</div>
                                                                        <div className="text-[10px] text-gray-400 font-bold">{imgs.length} fotos cargadas</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-5 font-black text-sm text-[#5F2142] dark:text-[#FFC99C]">
                                                                ${p.price.toFixed(2)} USD
                                                            </td>
                                                            <td className="py-3 px-5 text-right whitespace-nowrap">
                                                                <div className="inline-flex items-center gap-1.5">
                                                                    <button
                                                                        onClick={() => openEditProductModal(p)}
                                                                        className="p-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#D86A33] text-[#D86A33]"
                                                                        title="Editar producto"
                                                                    >
                                                                        <Edit2 size={13} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setDeleteConfirmId(p.id)}
                                                                        className="p-1.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50"
                                                                        title="Eliminar producto"
                                                                    >
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* SUB-TAB 4: TASA BCV OFICIAL                               */}
                        {/* ========================================================= */}
                        {configSubTab === 'bcv' && (
                            <div className="space-y-6">
                                <div className={`p-6 sm:p-8 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs space-y-6`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100 dark:border-white/10">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black mb-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span>Conexión Oficial en Vivo • bcv.org.ve</span>
                                            </div>
                                            <h3 className="font-black text-lg text-[#5F2142] dark:text-[#FFC99C]">
                                                Tasa de Cambio Oficial (Banco Central de Venezuela)
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Se extrae directamente de la página oficial del BCV y se aplica automáticamente a todos los pagos.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleSyncBcv}
                                            disabled={isSyncingBcv}
                                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#D86A33] hover:bg-[#c25925] text-white text-xs font-black shadow-md shadow-[#D86A33]/25 transition-all hover:scale-105 shrink-0"
                                        >
                                            <RefreshCw size={15} className={isSyncingBcv ? 'animate-spin' : ''} />
                                            <span>{isSyncingBcv ? 'Consultando BCV...' : 'Sincronizar Ahora con BCV'}</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className={`p-5 rounded-2xl ${bgSubCard} border ${borderDefault} space-y-1`}>
                                            <span className="text-[11px] font-black uppercase text-gray-500 tracking-wider">Tasa Aplicada</span>
                                            <div className="text-3xl font-black text-[#5F2142] dark:text-[#FFC99C]">
                                                {bcvRate} <span className="text-sm font-bold text-gray-500">Bs/$</span>
                                            </div>
                                            <span className="text-[11px] text-gray-500 font-medium">Equivalente por $1.00 USD</span>
                                        </div>

                                        <div className={`p-5 rounded-2xl ${bgSubCard} border ${borderDefault} space-y-1`}>
                                            <span className="text-[11px] font-black uppercase text-gray-500 tracking-wider">Fecha Valor Oficial</span>
                                            <div className="text-base font-black text-gray-800 dark:text-gray-200 mt-1">
                                                {bcvData.fechaValor || 'Martes, 27 Octubre 2026'}
                                            </div>
                                            <span className="text-[11px] text-gray-500 font-medium">Publicada por el BCV</span>
                                        </div>

                                        <div className={`p-5 rounded-2xl ${bgSubCard} border ${borderDefault} space-y-1`}>
                                            <span className="text-[11px] font-black uppercase text-gray-500 tracking-wider">Lectura Exacta BCV</span>
                                            <div className="text-base font-mono font-bold text-[#D86A33] mt-1">
                                                {bcvData.rawRate ? `${bcvData.rawRate} Bs.` : `${bcvRate} Bs.`}
                                            </div>
                                            <span className="text-[11px] text-gray-500 font-medium">Fuente: {bcvData.source || 'bcv.org.ve'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-6 sm:p-8 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs space-y-4`}>
                                    <div className="pb-3 border-b border-gray-100 dark:border-white/10">
                                        <h3 className="font-black text-sm text-[#5F2142] dark:text-[#FFC99C] uppercase tracking-wider">
                                            Ajuste Manual Personalizado (Opcional)
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Fija una tasa distinta en caso de acuerdos comerciales especiales o contingencias.
                                        </p>
                                    </div>

                                    <form onSubmit={handleUpdateRate} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase text-gray-500 mb-1.5">
                                                Tasa Manual en Bs por Dólar:
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="1"
                                                    required
                                                    value={manualRateInput}
                                                    onChange={(e) => setManualRateInput(e.target.value)}
                                                    placeholder="Ej: 887.30"
                                                    className={`px-4 py-2.5 rounded-2xl border text-sm font-black outline-none flex-1 ${inputStyle}`}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isUpdatingRate}
                                                    className="px-6 py-2.5 rounded-2xl bg-[#5F2142] hover:bg-[#481831] text-white text-xs font-black shadow-md shadow-[#5F2142]/20 transition-all hover:scale-105"
                                                >
                                                    {isUpdatingRate ? 'Guardando...' : 'Aplicar Tasa Manual'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* SUB-TAB 5: DATOS DE TIENDA & WHATSAPP                     */}
                        {/* ========================================================= */}
                        {configSubTab === 'tienda' && (
                            <form onSubmit={handleSaveSettings} className={`p-6 sm:p-8 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs space-y-4`}>
                                <div className="pb-3 border-b border-gray-100 dark:border-white/10">
                                    <h3 className="font-black text-base text-[#5F2142] dark:text-[#FFC99C]">
                                        Datos Generales de la Tienda & WhatsApp
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Configura el número oficial de WhatsApp que recibe las órdenes al formalizar compras.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                            Número Oficial de WhatsApp para Pedidos *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={settings.tienda.telefonoWhatsapp}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                tienda: { ...prev.tienda, telefonoWhatsapp: e.target.value.replace(/\D/g, '') }
                                            }))}
                                            placeholder="Ej: 584121409976"
                                            className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                        />
                                        <span className="text-[10px] text-gray-400 mt-1 block">Incluye código de país (Ej: 58 para Venezuela) sin signo +</span>
                                    </div>

                                    <div>
                                        <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                            Nombre Comercial de la Marca *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={settings.tienda.nombreTienda}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                tienda: { ...prev.tienda, nombreTienda: e.target.value }
                                            }))}
                                            placeholder="BOHEME"
                                            className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                            Instagram / Red Social
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.tienda.instagram || ''}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                tienda: { ...prev.tienda, instagram: e.target.value }
                                            }))}
                                            placeholder="@boheme_ve"
                                            className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                            Dirección o Ciudad Principal
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.tienda.direccionFisica || ''}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                tienda: { ...prev.tienda, direccionFisica: e.target.value }
                                            }))}
                                            placeholder="Valencia, Carabobo"
                                            className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Mensaje de Saludo para WhatsApp
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={settings.tienda.mensajeWhatsappIntro || ''}
                                        onChange={(e) => setSettings(prev => ({
                                            ...prev,
                                            tienda: { ...prev.tienda, mensajeWhatsappIntro: e.target.value }
                                        }))}
                                        placeholder="¡Hola! He formalizado mi pedido en la web de BOHEME."
                                        className={`w-full px-3.5 py-2.5 rounded-xl border font-medium ${inputStyle}`}
                                    />
                                </div>

                                <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSavingSettings}
                                        className="px-6 py-2.5 rounded-full bg-[#5F2142] hover:bg-[#43142e] text-white text-xs font-black shadow-md shadow-[#5F2142]/20"
                                    >
                                        {isSavingSettings ? 'Guardando...' : 'Guardar Ajustes de Tienda'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </main>

            {/* ========================================================= */}
            {/* MODAL 1: AGREGAR / EDITAR PRODUCTO (Hasta 10 imágenes)    */}
            {/* ========================================================= */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <div className={`rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border ${bgCard} ${borderDefault} relative my-6 max-h-[92vh] flex flex-col overflow-hidden`}>
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10 shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-[#5F2142] dark:text-[#FFC99C]">
                                    {editingProduct ? 'Editar Producto' : `Nuevo Producto en ${CATEGORIES[formCategory]?.title}`}
                                </h3>
                                <p className="text-[11px] text-gray-500 font-medium">Permite hasta 10 imágenes por producto.</p>
                            </div>
                            <button
                                onClick={() => setIsProductModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleProductSubmit} className="flex-1 overflow-y-auto py-4 pr-1 space-y-4 text-xs">
                            {/* Product Name */}
                            <div>
                                <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                    Nombre del Producto *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Ej: Gorro Quirúrgico Flores Boheme"
                                    className={`w-full px-3.5 py-2.5 rounded-2xl border font-medium ${inputStyle}`}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    rows={2}
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="Detalles de materiales, diseño, ajuste..."
                                    className={`w-full px-3.5 py-2.5 rounded-2xl border font-medium ${inputStyle}`}
                                />
                            </div>

                            {/* Price & Category in 2 columns */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Precio (USD $) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        required
                                        value={formPrice}
                                        onChange={(e) => setFormPrice(e.target.value)}
                                        className={`w-full px-3.5 py-2.5 rounded-2xl border font-medium ${inputStyle}`}
                                    />
                                </div>

                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Sección *
                                    </label>
                                    <select
                                        value={formCategory}
                                        onChange={(e) => {
                                            setFormCategory(e.target.value);
                                            const sub = CATEGORIES[e.target.value]?.subcategories[0]?.id;
                                            setFormSubcategory(sub);
                                        }}
                                        className={`w-full px-3 py-2.5 rounded-2xl border font-bold ${inputStyle}`}
                                    >
                                        {SECTIONS.map(s => (
                                            <option key={s.slug} value={s.slug}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Dynamic Subcategory */}
                            {CATEGORIES[formCategory] && CATEGORIES[formCategory].subcategories.length > 0 && (
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Subcategoría
                                    </label>
                                    <select
                                        value={formSubcategory || ''}
                                        onChange={(e) => setFormSubcategory(e.target.value ? Number(e.target.value) : undefined)}
                                        className={`w-full px-3 py-2.5 rounded-2xl border font-bold ${inputStyle}`}
                                    >
                                        {CATEGORIES[formCategory].subcategories.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Image Manager: UP TO 10 IMAGES */}
                            <div className={`p-4 rounded-2xl ${bgSubCard} border ${borderDefault} space-y-3`}>
                                <div className="flex items-center justify-between">
                                    <label className="block font-black text-[#5F2142] dark:text-[#FFC99C] uppercase tracking-wider">
                                        Galería de Imágenes ({formImages.length} / 10)
                                    </label>
                                    <span className="text-[10px] text-gray-400 font-bold">Máximo 10 fotos</span>
                                </div>

                                {/* Add image URL input */}
                                {formImages.length < 10 ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newImageUrl}
                                            onChange={(e) => setNewImageUrl(e.target.value)}
                                            placeholder="/cat_gorros.png o URL externa..."
                                            className={`flex-1 px-3 py-2 rounded-xl border text-xs font-medium ${inputStyle}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAddImage(newImageUrl)}
                                            className="px-4 py-2 rounded-xl bg-[#5F2142] text-white font-bold text-xs"
                                        >
                                            + Añadir
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-amber-600 font-bold">
                                        ✓ Límite de 10 imágenes alcanzado. Elimina una para añadir otra.
                                    </p>
                                )}

                                {/* Preset Image buttons */}
                                {formImages.length < 10 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        <span className="text-[10px] text-gray-400 font-bold self-center">Añadir rápida:</span>
                                        {PRESET_IMAGES.map((img) => (
                                            <button
                                                type="button"
                                                key={img.url}
                                                onClick={() => handleAddImage(img.url)}
                                                className="text-[10px] px-2 py-0.5 rounded-lg border border-gray-300 dark:border-white/10 hover:border-[#D86A33]"
                                            >
                                                + {img.label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Thumbnails Gallery */}
                                <div className="grid grid-cols-5 gap-2 pt-2">
                                    {formImages.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/5 group">
                                            <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                            {idx === 0 && (
                                                <span className="absolute top-1 left-1 bg-[#D86A33] text-white text-[8px] font-black px-1 rounded">
                                                    Portada
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(idx)}
                                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Eliminar imagen"
                                            >
                                                <X size={11} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsProductModalOpen(false)}
                                    className="px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-6 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white font-black shadow-md shadow-[#D86A33]/25"
                                >
                                    {actionLoading ? 'Guardando...' : editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 2: FACTURAR MANUALMENTE (Emitir factura interna)    */}
            {/* ========================================================= */}
            {isManualInvoiceOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <div className={`rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border ${bgCard} ${borderDefault} relative my-6 max-h-[92vh] flex flex-col overflow-hidden`}>
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10 shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-[#5F2142] dark:text-[#FFC99C]">
                                    + Facturar Venta Manual
                                </h3>
                                <p className="text-[11px] text-gray-500 font-medium">Registra compras presenciales o por chat directamente.</p>
                            </div>
                            <button
                                onClick={() => setIsManualInvoiceOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateManualInvoice} className="flex-1 overflow-y-auto py-4 pr-1 space-y-4 text-xs">
                            {/* Cliente */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">Nombre *</label>
                                    <input
                                        type="text"
                                        required
                                        value={manualClienteNombre}
                                        onChange={(e) => setManualClienteNombre(e.target.value)}
                                        placeholder="Ej: Carlos"
                                        className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`}
                                    />
                                </div>
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">Apellido *</label>
                                    <input
                                        type="text"
                                        required
                                        value={manualClienteApellido}
                                        onChange={(e) => setManualClienteApellido(e.target.value)}
                                        placeholder="Ej: Silva"
                                        className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">Cédula *</label>
                                    <input
                                        type="text"
                                        required
                                        value={manualClienteCedula}
                                        onChange={(e) => setManualClienteCedula(e.target.value)}
                                        placeholder="V-20.123.456"
                                        className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`}
                                    />
                                </div>
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">Teléfono</label>
                                    <input
                                        type="text"
                                        value={manualClienteTelefono}
                                        onChange={(e) => setManualClienteTelefono(e.target.value)}
                                        placeholder="0412-1234567"
                                        className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`}
                                    />
                                </div>
                            </div>

                            {/* Item description */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">Concepto / Producto</label>
                                    <input
                                        type="text"
                                        required
                                        value={manualItemName}
                                        onChange={(e) => setManualItemName(e.target.value)}
                                        placeholder="Ej: 2x Gorros Quirúrgicos"
                                        className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`}
                                    />
                                </div>
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">Categoría</label>
                                    <select
                                        value={manualItemCategory}
                                        onChange={(e) => setManualItemCategory(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                    >
                                        {SECTIONS.map(s => (
                                            <option key={s.slug} value={s.slug}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Pago y Monto */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">Método</label>
                                    <select
                                        value={manualMetodoPago}
                                        onChange={(e) => setManualMetodoPago(e.target.value as any)}
                                        className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                    >
                                        <option value="pago_movil">Pago Móvil</option>
                                        <option value="binance">Binance Pay</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">Monto ($ USD) *</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        required
                                        value={manualMontoUsd}
                                        onChange={(e) => setManualMontoUsd(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`}
                                    />
                                </div>
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">Equivalente Bs.</label>
                                    <div className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/10 font-bold text-gray-700 dark:text-gray-200">
                                        Bs. {((Number(manualMontoUsd) || 0) * bcvRate).toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">Referencia</label>
                                    <input
                                        type="text"
                                        value={manualReferencia}
                                        onChange={(e) => setManualReferencia(e.target.value)}
                                        placeholder="Ej: 994821"
                                        className={`w-full px-3 py-2 rounded-xl border ${inputStyle}`}
                                    />
                                </div>
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">Estatus Inicial</label>
                                    <select
                                        value={manualEstadoPago}
                                        onChange={(e) => setManualEstadoPago(e.target.value as any)}
                                        className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                    >
                                        <option value="verificado">Verificado / Pagado</option>
                                        <option value="pendiente">Pendiente por Verificar</option>
                                    </select>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsManualInvoiceOpen(false)}
                                    className="px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-6 py-2.5 rounded-full bg-[#5F2142] text-white font-black shadow-md shadow-[#5F2142]/20"
                                >
                                    {actionLoading ? 'Registrando...' : 'Emitir Factura Manual'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 3: VER DETALLE DE FACTURA & VERIFICAR PAGO          */}
            {/* ========================================================= */}
            {viewingOrder && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <div className={`rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border ${bgCard} ${borderDefault} relative my-6 max-h-[92vh] flex flex-col overflow-hidden text-xs`}>
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10 shrink-0">
                            <div>
                                <span className="font-mono text-xs font-bold text-[#D86A33]">
                                    {viewingOrder.numero_factura}
                                </span>
                                <h3 className="text-xl font-black text-[#5F2142] dark:text-[#FFC99C]">
                                    Detalle de la Factura
                                </h3>
                            </div>
                            <button
                                onClick={() => setViewingOrder(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-4">
                            {/* Verification action bar with the 3 statuses requested */}
                            <div className={`p-4 rounded-2xl ${bgSubCard} border ${borderDefault} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Estatus del Pago:</span>
                                    <span className="font-black text-sm capitalize">
                                        {normalizeStatus(viewingOrder.estado_pago) === 'verificada' ? 'Verificada ✓' : normalizeStatus(viewingOrder.estado_pago) === 'rechazada' ? 'Rechazada ✕' : 'Por Verificar ⏳'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => handleUpdateOrderStatus(viewingOrder.id, 'por_verificar')}
                                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                                            normalizeStatus(viewingOrder.estado_pago) === 'por_verificar'
                                                ? 'bg-amber-500 text-white shadow-xs'
                                                : 'bg-amber-100 text-amber-900 hover:bg-amber-500 hover:text-white'
                                        }`}
                                    >
                                        ⏳ Por Verificar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleUpdateOrderStatus(viewingOrder.id, 'verificada')}
                                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                                            normalizeStatus(viewingOrder.estado_pago) === 'verificada'
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-600 hover:text-white'
                                        }`}
                                    >
                                        ✓ Verificada
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleUpdateOrderStatus(viewingOrder.id, 'rechazada')}
                                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                                            normalizeStatus(viewingOrder.estado_pago) === 'rechazada'
                                                ? 'bg-red-600 text-white shadow-xs'
                                                : 'bg-red-100 text-red-900 hover:bg-red-600 hover:text-white'
                                        }`}
                                    >
                                        ✕ Rechazada
                                    </button>
                                </div>
                            </div>

                            {/* Client & Delivery */}
                            <div className={`p-4 rounded-2xl ${bgSubCard} border ${borderDefault} space-y-1.5`}>
                                <div className="font-black text-[#5F2142] dark:text-[#FFC99C] uppercase tracking-wider text-[11px]">
                                    Datos del Cliente y Envío
                                </div>
                                <div><strong>Cliente:</strong> {viewingOrder.cliente_nombre} {viewingOrder.cliente_apellido}</div>
                                <div><strong>Cédula:</strong> {viewingOrder.cliente_cedula}</div>
                                <div><strong>Teléfono:</strong> {viewingOrder.cliente_telefono}</div>
                                <div><strong>Modalidad:</strong> {viewingOrder.tipo_entrega === 'local' ? 'Entrega Local' : `Envío Nacional (${viewingOrder.empresa_envio || 'MRW'})`}</div>
                                <div><strong>Dirección / Destino:</strong> {viewingOrder.direccion_entrega}</div>
                            </div>

                            {/* Payment data */}
                            <div className={`p-4 rounded-2xl ${bgSubCard} border ${borderDefault} space-y-1.5`}>
                                <div className="font-black text-[#5F2142] dark:text-[#FFC99C] uppercase tracking-wider text-[11px]">
                                    Datos del Pago
                                </div>
                                <div><strong>Método:</strong> {viewingOrder.metodo_pago === 'pago_movil' ? 'Pago Móvil BDV' : 'Binance Pay'}</div>
                                {viewingOrder.banco_emisor && <div><strong>Banco Emisor:</strong> {viewingOrder.banco_emisor}</div>}
                                <div><strong>Emisor:</strong> {viewingOrder.telefono_o_email_emisor}</div>
                                <div><strong>Referencia / TxID:</strong> <span className="font-mono font-bold text-[#D86A33]">{viewingOrder.referencia_pago}</span></div>
                                <div className="pt-1 text-sm font-black text-[#5F2142] dark:text-[#FFC99C]">
                                    Total: ${viewingOrder.monto_usd.toFixed(2)} USD  ≈  Bs. {viewingOrder.monto_bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>

                            {/* Items breakdown with personalizations */}
                            <div className={`p-4 rounded-2xl ${bgSubCard} border ${borderDefault} space-y-2`}>
                                <div className="font-black text-[#5F2142] dark:text-[#FFC99C] uppercase tracking-wider text-[11px]">
                                    Artículos en la Factura
                                </div>
                                <div className="divide-y divide-gray-200/50 dark:divide-white/10 space-y-2 pt-1">
                                    {viewingOrder.items.map((it, idx) => (
                                        <div key={idx} className="pt-2">
                                            <div className="flex justify-between font-bold">
                                                <span>{it.quantity}x {it.name}</span>
                                                <span className="text-[#D86A33]">${(it.price * it.quantity).toFixed(2)}</span>
                                            </div>
                                            {it.is_personalizado && (
                                                <div className="mt-1 p-2 rounded-xl bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-[11px] text-gray-600 dark:text-gray-300 space-y-0.5">
                                                    <div className="text-[#D86A33] font-bold">✦ Personalizado:</div>
                                                    {it.nombre_personalizado && <div>• Nombre bordado: {it.nombre_personalizado}</div>}
                                                    {it.especialidad_personalizada && <div>• Especialidad: {it.especialidad_personalizada}</div>}
                                                    {it.color_preferencia && <div>• Color: {it.color_preferencia}</div>}
                                                    {it.detalles_personalizados && <div>• Notas: {it.detalles_personalizados}</div>}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const ord = viewingOrder;
                                    setViewingOrder(null);
                                    setDeleteOrderConfirmId(ord.id);
                                }}
                                className="px-3.5 py-2 rounded-full border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 text-xs font-bold inline-flex items-center gap-1"
                            >
                                <Trash2 size={13} />
                                <span>Eliminar Factura</span>
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const ord = viewingOrder;
                                        setViewingOrder(null);
                                        openEditOrderModal(ord);
                                    }}
                                    className="px-4 py-2 rounded-full bg-[#5F2142] hover:bg-[#43142e] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                                >
                                    <Edit2 size={13} />
                                    <span>Editar Datos</span>
                                </button>
                                <button
                                    onClick={() => setViewingOrder(null)}
                                    className="px-5 py-2 rounded-full bg-gray-200 dark:bg-white/10 font-bold text-xs"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 4: EDITAR FACTURA / PEDIDO (Manipulación sin código)*/}
            {/* ========================================================= */}
            {editingOrder && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <div className={`rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border ${bgCard} ${borderDefault} relative my-6 max-h-[92vh] flex flex-col overflow-hidden text-xs`}>
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10 shrink-0">
                            <div>
                                <span className="font-mono text-xs font-bold text-[#D86A33]">
                                    {editingOrder.numero_factura}
                                </span>
                                <h3 className="text-xl font-black text-[#5F2142] dark:text-[#FFC99C]">
                                    Editar Factura sin Código
                                </h3>
                                <p className="text-[11px] text-gray-500 font-medium">Modifica datos del cliente, entrega, montos y estatus de pago.</p>
                            </div>
                            <button
                                onClick={() => setEditingOrder(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveOrderEdit} className="flex-1 overflow-y-auto py-4 pr-1 space-y-4">
                            {/* Estatus del Pago Principal */}
                            <div className={`p-4 rounded-2xl ${bgSubCard} border ${borderDefault} space-y-2`}>
                                <label className="block font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[11px]">
                                    Estatus del Pago (Selecciona uno) *
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { val: 'por_verificar', label: '⏳ Por Verificar', color: 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200' },
                                        { val: 'verificada', label: '✓ Verificada', color: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200' },
                                        { val: 'rechazada', label: '✕ Rechazada', color: 'border-red-400 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200' }
                                    ].map(st => (
                                        <button
                                            key={st.val}
                                            type="button"
                                            onClick={() => setEditOrderData(prev => ({ ...prev, estado_pago: st.val as any }))}
                                            className={`p-2.5 rounded-xl border text-center font-black transition-all ${
                                                editOrderData.estado_pago === st.val
                                                    ? `${st.color} ring-2 ring-[#D86A33] shadow-xs`
                                                    : 'border-gray-200 dark:border-white/10 text-gray-500 bg-white dark:bg-transparent'
                                            }`}
                                        >
                                            {st.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Datos del Cliente */}
                            <div className="space-y-3">
                                <span className="font-black text-[#5F2142] dark:text-[#FFC99C] uppercase tracking-wider block text-[11px]">
                                    1. Datos del Cliente
                                </span>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            required
                                            value={editOrderData.cliente_nombre}
                                            onChange={(e) => setEditOrderData(prev => ({ ...prev, cliente_nombre: e.target.value }))}
                                            className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Apellido</label>
                                        <input
                                            type="text"
                                            required
                                            value={editOrderData.cliente_apellido}
                                            onChange={(e) => setEditOrderData(prev => ({ ...prev, cliente_apellido: e.target.value }))}
                                            className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Cédula</label>
                                        <input
                                            type="text"
                                            required
                                            value={editOrderData.cliente_cedula}
                                            onChange={(e) => setEditOrderData(prev => ({ ...prev, cliente_cedula: e.target.value }))}
                                            className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Teléfono</label>
                                        <input
                                            type="text"
                                            required
                                            value={editOrderData.cliente_telefono}
                                            onChange={(e) => setEditOrderData(prev => ({ ...prev, cliente_telefono: e.target.value }))}
                                            className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Entrega */}
                            <div className="space-y-3">
                                <span className="font-black text-[#5F2142] dark:text-[#FFC99C] uppercase tracking-wider block text-[11px]">
                                    2. Dirección y Modalidad de Entrega
                                </span>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Modalidad</label>
                                        <select
                                            value={editOrderData.tipo_entrega}
                                            onChange={(e) => setEditOrderData(prev => ({ ...prev, tipo_entrega: e.target.value as any }))}
                                            className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                        >
                                            <option value="local">Entrega Local</option>
                                            <option value="nacional">Envío Nacional</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Empresa Encomienda</label>
                                        <input
                                            type="text"
                                            value={editOrderData.empresa_envio}
                                            onChange={(e) => setEditOrderData(prev => ({ ...prev, empresa_envio: e.target.value }))}
                                            placeholder="MRW, ZOOM, Tealca..."
                                            className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Dirección / Destino</label>
                                    <textarea
                                        rows={2}
                                        value={editOrderData.direccion_entrega}
                                        onChange={(e) => setEditOrderData(prev => ({ ...prev, direccion_entrega: e.target.value }))}
                                        className={`w-full px-3 py-2 rounded-xl border font-medium ${inputStyle}`}
                                    />
                                </div>
                            </div>

                            {/* Pago y Montos */}
                            <div className="space-y-3">
                                <span className="font-black text-[#5F2142] dark:text-[#FFC99C] uppercase tracking-wider block text-[11px]">
                                    3. Datos del Pago y Montos
                                </span>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Método</label>
                                        <select
                                            value={editOrderData.metodo_pago}
                                            onChange={(e) => setEditOrderData(prev => ({ ...prev, metodo_pago: e.target.value as any }))}
                                            className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                        >
                                            <option value="pago_movil">Pago Móvil</option>
                                            <option value="binance">Binance Pay</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Monto ($ USD)</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={editOrderData.monto_usd}
                                            onChange={(e) => setEditOrderData(prev => ({ ...prev, monto_usd: e.target.value }))}
                                            className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Equivalente Bs</label>
                                        <div className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/10 font-bold text-gray-700 dark:text-gray-200">
                                            Bs. {((Number(editOrderData.monto_usd) || 0) * bcvRate).toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Referencia / TxID</label>
                                        <input
                                            type="text"
                                            value={editOrderData.referencia_pago}
                                            onChange={(e) => setEditOrderData(prev => ({ ...prev, referencia_pago: e.target.value }))}
                                            className={`w-full px-3 py-2 rounded-xl border font-mono font-bold ${inputStyle}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Banco / Emisor</label>
                                        <input
                                            type="text"
                                            value={editOrderData.banco_emisor}
                                            onChange={(e) => setEditOrderData(prev => ({ ...prev, banco_emisor: e.target.value }))}
                                            placeholder="Ej: Banesco"
                                            className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Notas Administrativas</label>
                                    <input
                                        type="text"
                                        value={editOrderData.notas_admin}
                                        onChange={(e) => setEditOrderData(prev => ({ ...prev, notas_admin: e.target.value }))}
                                        placeholder="Comentarios internos del pedido..."
                                        className={`w-full px-3 py-2 rounded-xl border font-medium ${inputStyle}`}
                                    />
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setEditingOrder(null)}
                                    className="px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-6 py-2.5 rounded-full bg-[#5F2142] hover:bg-[#43142e] text-white font-black shadow-md shadow-[#5F2142]/20"
                                >
                                    {actionLoading ? 'Guardando...' : 'Guardar Cambios de Factura'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 5: CONFIRMACIÓN PARA ELIMINAR FACTURA              */}
            {/* ========================================================= */}
            {deleteOrderConfirmId && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className={`rounded-3xl max-w-sm w-full p-6 text-center ${bgCard} border ${borderDefault} shadow-2xl`}>
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                            <Trash2 size={22} />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 dark:text-white mb-1">¿Eliminar Factura?</h4>
                        <p className="text-xs text-gray-500 mb-6">Esta acción borrará definitivamente este registro de venta del sistema.</p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => setDeleteOrderConfirmId(null)}
                                className="px-5 py-2.5 rounded-full border border-gray-300 dark:border-white/10 text-xs font-bold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDeleteOrder(deleteOrderConfirmId)}
                                disabled={actionLoading}
                                className="px-6 py-2.5 rounded-full bg-red-600 text-white text-xs font-black shadow-md shadow-red-600/20"
                            >
                                {actionLoading ? 'Eliminando...' : 'Sí, eliminar factura'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE PRODUCT CONFIRMATION MODAL */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className={`rounded-3xl max-w-sm w-full p-6 text-center ${bgCard} border ${borderDefault} shadow-2xl`}>
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                            <Trash2 size={22} />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 dark:text-white mb-1">¿Eliminar producto?</h4>
                        <p className="text-xs text-gray-500 mb-6">Esta acción quitará el producto de la sección de la tienda.</p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-5 py-2.5 rounded-full border border-gray-300 dark:border-white/10 text-xs font-bold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDeleteProduct(deleteConfirmId)}
                                disabled={actionLoading}
                                className="px-6 py-2.5 rounded-full bg-red-600 text-white text-xs font-black"
                            >
                                {actionLoading ? 'Eliminando...' : 'Sí, eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
