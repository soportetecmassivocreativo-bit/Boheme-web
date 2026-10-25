'use client';

import { useState, useEffect, useRef } from 'react';
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
    ChevronDown,
    ChevronUp,
    Settings,
    DollarSign,
    RefreshCw,
    Sliders,
    Wallet,
    Save,
    UploadCloud,
    FolderUp,
    Star,
    Upload,
    Scissors,
    ClipboardList,
    Printer,
    PackageCheck,
    CheckCheck,
    RotateCcw,
    ArrowRight,
    BarChart3,
    Download,
    Hash,
    FileSpreadsheet,
    EyeOff,
    Shield,
    Key
} from 'lucide-react';
import { Product, CATEGORIES, Order, OrderItem } from '@/lib/db';
import { parseImages } from '@/lib/utils';
import { SiteSettings, ExtraPaymentAccount, ExtraPaymentType, AdminUser, AdminUserRole } from '@/lib/settings';
import {
    generateInvoicePdf,
    generateBillingReportPdf,
    generateWorkshopReportPdf,
    generateStockReportPdf,
    exportToCsv
} from '@/lib/pdfGenerator';
import {
    WORKSHOP_STAGES,
    WorkshopProductType,
    determineItemWorkshopType,
    getOrderWorkshopType,
    getWorkshopTypeLabel,
    getOrderWorkflowSteps,
    getDefaultWorkshopStatus,
    getStageInfo
} from '@/lib/workshop';

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

type AdminTab = 'dashboard' | 'facturado' | 'taller' | 'productos' | 'reportes' | 'configuracion';

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
    const [activeSubcategory, setActiveSubcategory] = useState<number | 'all'>('all');
    const [productSearch, setProductSearch] = useState('');
    const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<Record<string | number, boolean>>({});
    const [minimizedProductIds, setMinimizedProductIds] = useState<Record<string, boolean>>({});

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
    const [formStock, setFormStock] = useState<number | string>(20);
    const [formCategory, setFormCategory] = useState('gorros');
    const [formSubcategory, setFormSubcategory] = useState<number | undefined>(70);
    const [formImages, setFormImages] = useState<string[]>([]);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [showManualUrlInput, setShowManualUrlInput] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Taller & Pedidos Module State
    const [tallerTab, setTallerTab] = useState<'activos' | 'cerrados' | 'todos'>('activos');
    const [filterTallerType, setFilterTallerType] = useState<string>('all');
    const [filterTallerStage, setFilterTallerStage] = useState<string>('all');
    const [filterTallerDelivery, setFilterTallerDelivery] = useState<'all' | 'local' | 'nacional'>('all');
    const [tallerSearch, setTallerSearch] = useState<string>('');
    const [selectedWorkshopOrder, setSelectedWorkshopOrder] = useState<Order | null>(null);
    const [editingWorkshopNotesOrder, setEditingWorkshopNotesOrder] = useState<Order | null>(null);
    const [workshopNotesInput, setWorkshopNotesInput] = useState<string>('');
    const [editingGuideOrder, setEditingGuideOrder] = useState<Order | null>(null);
    const [guideNumberInput, setGuideNumberInput] = useState<string>('');
    const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});

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
        metodo_pago: 'pago_movil' | 'binance' | string;
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
    const [configSubTab, setConfigSubTab] = useState<'pagos' | 'correlativo_pdf' | 'usuarios' | 'facturas' | 'productos' | 'bcv' | 'tienda'>('pagos');

    // Current Logged-In User Session & User Management Modal State
    const [currentUser, setCurrentUser] = useState<{
        id: string;
        email: string;
        name: string;
        userRole?: string;
    }>({
        id: 'user-admin-principal',
        email: 'admin@boheme.com',
        name: 'Administrador Principal BOHEME',
        userRole: 'super_admin'
    });
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [userFormNombre, setUserFormNombre] = useState('');
    const [userFormEmail, setUserFormEmail] = useState('');
    const [userFormPassword, setUserFormPassword] = useState('');
    const [userFormRol, setUserFormRol] = useState<AdminUserRole>('admin');
    const [userFormCargo, setUserFormCargo] = useState('');
    const [userFormTelefono, setUserFormTelefono] = useState('');
    const [userFormActivo, setUserFormActivo] = useState(true);
    const [showUserPasswords, setShowUserPasswords] = useState<Record<string, boolean>>({});
    const [deleteUserConfirm, setDeleteUserConfirm] = useState<AdminUser | null>(null);

    // Reports Module Sub-Tabs & Filters
    const [reportType, setReportType] = useState<'facturado' | 'taller' | 'stock'>('facturado');
    const [reportDateFrom, setReportDateFrom] = useState<string>('');
    const [reportDateTo, setReportDateTo] = useState<string>('');
    const [reportPayStatus, setReportPayStatus] = useState<'all' | 'verificada' | 'por_verificar' | 'rechazada'>('all');
    const [reportPayMethod, setReportPayMethod] = useState<string>('all');
    const [reportWorkshopStatus, setReportWorkshopStatus] = useState<'todos' | 'activos' | 'cerrados'>('todos');
    const [reportWorkshopStage, setReportWorkshopStage] = useState<string>('all');
    const [reportWorkshopDelivery, setReportWorkshopDelivery] = useState<'all' | 'local' | 'nacional'>('all');
    const [reportStockSection, setReportStockSection] = useState<string>('all');
    const [reportStockSubcategory, setReportStockSubcategory] = useState<'all' | number>('all');
    const [reportStockFilter, setReportStockFilter] = useState<'all' | 'in_stock' | 'low_stock'>('all');

    // Modal / Form to Add or Edit Extra Bank / Payment Account
    const [isExtraAccountModalOpen, setIsExtraAccountModalOpen] = useState(false);
    const [editingExtraAccountId, setEditingExtraAccountId] = useState<string | null>(null);
    const [extraAccTipo, setExtraAccTipo] = useState<ExtraPaymentType>('transferencia');
    const [extraAccNombreMetodo, setExtraAccNombreMetodo] = useState('');
    const [extraAccBanco, setExtraAccBanco] = useState('');
    const [extraAccTitular, setExtraAccTitular] = useState('BOHEME');
    const [extraAccCedula, setExtraAccCedula] = useState('V-24.354.847');
    const [extraAccTelefono, setExtraAccTelefono] = useState('');
    const [extraAccCuentaOCorreo, setExtraAccCuentaOCorreo] = useState('');
    const [extraAccTipoCuenta, setExtraAccTipoCuenta] = useState('Corriente');
    const [extraAccMoneda, setExtraAccMoneda] = useState<'BS' | 'USD'>('BS');
    const [extraAccInstrucciones, setExtraAccInstrucciones] = useState('');

    // Site & Payment Settings (Manipulación de Cuentas, Correlativo, PDFs y Tienda sin código)
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
        cuentasAdicionales: [],
        correlativo: {
            prefijo: 'BHM-',
            proximoNumero: 1003,
            digitosMinimos: 4,
            sufijo: ''
        },
        pdfConfig: {
            nombreEmpresa: 'BOHEME • Indumentaria & Equipos Médicos',
            rifEmpresa: 'V-24.354.847',
            direccionFiscal: 'Municipio Miranda (Coro) y Municipio Colina (La Vela), Estado Falcón, Venezuela',
            telefonoContacto: '0412-1409976',
            emailContacto: 'worldglobalweb724@gmail.com',
            colorPrimario: '#5F2142',
            colorAcento: '#D86A33',
            mostrarLogo: true,
            mostrarTasaBcv: true,
            mostrarFirmas: true,
            mostrarSelloAgua: true,
            encabezadoFactura: 'FACTURA / COMPROBANTE DE COMPRA',
            piePaginaFactura: 'Gracias por tu compra en BOHEME. Entregas locales en Municipio Miranda y Municipio Colina, y envíos nacionales garantizados.',
            encabezadoReporte: 'REPORTE OFICIAL DE GESTIÓN ADMINISTRATIVA',
            piePaginaReporte: 'Documento generado por el Panel Administrativo de BOHEME • Uso Interno y Contable.',
            tamanoPapel: 'letter',
            orientacionReporte: 'portrait'
        },
        tienda: {
            nombreTienda: 'BOHEME',
            telefonoWhatsapp: '584121409976',
            mensajeWhatsappIntro: '¡Hola! He formalizado mi pedido en la web de BOHEME.',
            instagram: '@boheme_ve',
            direccionFisica: 'Municipio Miranda (Coro) y Municipio Colina (La Vela), Estado Falcón, Venezuela',
            monedaPrincipal: 'USD'
        },
        usuarios: [
            {
                id: 'user-admin-principal',
                nombre: 'Administrador Principal BOHEME',
                email: 'admin@boheme.com',
                password: 'boheme2026',
                rol: 'super_admin',
                cargo: 'Gerencia & Administración General',
                telefono: '0412-1409976',
                activo: true,
                createdAt: '2026-01-01T00:00:00.000Z'
            }
        ],
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

        // Load Settings (Cuentas de pago, usuarios y tienda)
        try {
            const resS = await fetch('/api/settings');
            const dataS = await resS.json();
            if (dataS && dataS.settings) setSettings(dataS.settings);
        } catch {}

        // Load Active Admin Session User
        try {
            const resMe = await fetch('/api/admin/me');
            const dataMe = await resMe.json();
            if (dataMe && dataMe.user) {
                setCurrentUser({
                    id: dataMe.user.id || 'user-admin-principal',
                    email: dataMe.user.email || 'admin@boheme.com',
                    name: dataMe.user.name || 'Administrador Principal BOHEME',
                    userRole: dataMe.user.userRole || 'super_admin'
                });
            }
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
    const openCreateProductModal = (preselectedSubcategoryId?: number) => {
        setEditingProduct(null);
        setFormName('');
        setFormDescription('');
        setFormPrice(8);
        setFormStock(20);
        setFormCategory(activeSection);
        const catInfo = CATEGORIES[activeSection];
        const defaultSubId = preselectedSubcategoryId !== undefined
            ? preselectedSubcategoryId
            : (activeSubcategory !== 'all' ? activeSubcategory : catInfo?.subcategories[0]?.id);
        setFormSubcategory(defaultSubId);
        
        // Start fresh so admin can drop/select images directly
        setFormImages([]);
        setNewImageUrl('');
        setShowManualUrlInput(false);
        setIsProductModalOpen(true);
    };

    const openEditProductModal = (product: Product) => {
        setEditingProduct(product);
        setFormName(product.name);
        setFormDescription(product.description || '');
        setFormPrice(product.price);
        setFormStock(product.stock !== undefined ? product.stock : 20);
        setFormCategory(product.categoria_slug);
        setFormSubcategory(product.subcategoria_id);
        const imgs = parseImages(product.image_url);
        setFormImages(imgs.length > 0 ? imgs.slice(0, 10) : []);
        setNewImageUrl('');
        setShowManualUrlInput(false);
        setIsProductModalOpen(true);
    };

    const handleSetCoverImage = (index: number) => {
        if (index === 0) return;
        setFormImages(prev => {
            const copy = [...prev];
            const [selected] = copy.splice(index, 1);
            return [selected, ...copy];
        });
        showToast('✓ Portada principal actualizada');
    };

    const handleFilesSelected = async (fileList: FileList | File[]) => {
        const rawFiles = Array.from(fileList);
        const imageFiles = rawFiles.filter(f => f.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            alert('Por favor selecciona únicamente archivos de imagen válidos (PNG, JPG, WEBP, etc.).');
            return;
        }

        const remainingSlots = 10 - formImages.length;
        if (remainingSlots <= 0) {
            alert('Has alcanzado el límite máximo de 10 imágenes para este producto. Elimina alguna para agregar nuevas.');
            return;
        }

        const filesToProcess = imageFiles.slice(0, remainingSlots);
        if (imageFiles.length > remainingSlots) {
            alert(`Solo se procesarán ${remainingSlots} imagen(es) para no exceder el límite máximo de 10.`);
        }

        setIsUploadingImages(true);

        try {
            const formData = new FormData();
            filesToProcess.forEach(f => formData.append('files', f));

            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                if (data.urls && data.urls.length > 0) {
                    setFormImages(prev => [...prev, ...data.urls]);
                    showToast(`✓ ${data.urls.length} foto(s) agregada(s) exitosamente`);
                    setIsUploadingImages(false);
                    return;
                }
            }
            throw new Error('Upload fallback');
        } catch {
            // Robust fallback to FileReader base64
            try {
                const readers = filesToProcess.map(file => new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                }));

                const base64List = await Promise.all(readers);
                setFormImages(prev => [...prev, ...base64List]);
                showToast(`✓ ${base64List.length} foto(s) cargada(s) desde tu dispositivo`);
            } catch {
                alert('No se pudieron procesar las imágenes seleccionadas.');
            }
        } finally {
            setIsUploadingImages(false);
        }
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
            stock: Number(formStock) >= 0 ? Number(formStock) : 20,
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

    const handleChangeProductSubcategory = async (product: Product, newSubcategoryId: number) => {
        try {
            const res = await fetch(`/api/admin/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subcategoria_id: newSubcategoryId })
            });
            if (res.ok) {
                const subName = CATEGORIES[product.categoria_slug]?.subcategories.find(s => s.id === newSubcategoryId)?.name || 'General';
                setProducts(prev => prev.map(p => p.id === product.id ? { ...p, subcategoria_id: newSubcategoryId } : p));
                showToast(`✓ Categoría actualizada a: ${subName}`);
            } else {
                alert('Error al actualizar la categoría del producto');
            }
        } catch {
            alert('Error de conexión al actualizar categoría');
        }
    };

    const toggleCategoryCollapsed = (catKey: string | number) => {
        setCollapsedCategoryIds(prev => ({
            ...prev,
            [catKey]: !prev[catKey]
        }));
    };

    const toggleProductMinimized = (productId: string) => {
        setMinimizedProductIds(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    const minimizeAllProducts = (list: Product[]) => {
        const next: Record<string, boolean> = { ...minimizedProductIds };
        list.forEach(p => { next[p.id] = true; });
        setMinimizedProductIds(next);
    };

    const maximizeAllProducts = () => {
        setMinimizedProductIds({});
        setCollapsedCategoryIds({});
    };

    const collapseAllCategories = (subcats: { id: number }[]) => {
        const next: Record<string | number, boolean> = {};
        subcats.forEach(s => { next[s.id] = true; });
        next['unassigned'] = true;
        setCollapsedCategoryIds(next);
    };

    const expandAllCategories = () => {
        setCollapsedCategoryIds({});
    };

    const selectOnlyProductToMaximize = (targetProductId: string, list: Product[]) => {
        if (!targetProductId) return;
        const target = list.find(p => p.id === targetProductId);
        const nextMin: Record<string, boolean> = {};
        list.forEach(p => {
            nextMin[p.id] = p.id !== targetProductId;
        });
        setMinimizedProductIds(nextMin);
        if (target && target.subcategoria_id !== undefined) {
            setCollapsedCategoryIds(prev => ({
                ...prev,
                [target.subcategoria_id!]: false
            }));
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
    // SETTINGS ACTIONS (Cuentas de pago, correlativo, PDFs y tienda)
    // ==========================================
    const handleSaveSettings = async (e?: React.FormEvent, customSettings?: SiteSettings) => {
        if (e) e.preventDefault();
        setIsSavingSettings(true);
        const payload = customSettings || settings;
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const data = await res.json();
                if (data.settings) setSettings(data.settings);
                showToast('✓ Configuraciones del sistema guardadas con éxito');
            } else {
                alert('Error al guardar configuraciones');
            }
        } catch {
            alert('Error de conexión al guardar configuraciones');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const openAddExtraAccountModal = () => {
        setEditingExtraAccountId(null);
        setExtraAccTipo('transferencia');
        setExtraAccNombreMetodo('');
        setExtraAccBanco('');
        setExtraAccTitular('BOHEME');
        setExtraAccCedula('V-24.354.847');
        setExtraAccTelefono('');
        setExtraAccCuentaOCorreo('');
        setExtraAccTipoCuenta('Corriente');
        setExtraAccMoneda('BS');
        setExtraAccInstrucciones('');
        setIsExtraAccountModalOpen(true);
    };

    const openEditExtraAccountModal = (acc: ExtraPaymentAccount) => {
        setEditingExtraAccountId(acc.id);
        setExtraAccTipo(acc.tipo);
        setExtraAccNombreMetodo(acc.nombreMetodo);
        setExtraAccBanco(acc.bancoOPlataforma);
        setExtraAccTitular(acc.titular);
        setExtraAccCedula(acc.cedulaORif || '');
        setExtraAccTelefono(acc.telefono || '');
        setExtraAccCuentaOCorreo(acc.numeroCuentaOCorreo);
        setExtraAccTipoCuenta(acc.tipoCuenta || '');
        setExtraAccMoneda(acc.moneda);
        setExtraAccInstrucciones(acc.instrucciones || '');
        setIsExtraAccountModalOpen(true);
    };

    const handleSaveExtraAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!extraAccNombreMetodo.trim() || !extraAccBanco.trim()) {
            alert('Por favor ingresa el nombre del método y el banco o plataforma.');
            return;
        }
        const currentList = settings.cuentasAdicionales || [];
        let nextList: ExtraPaymentAccount[];

        if (editingExtraAccountId) {
            nextList = currentList.map(c => c.id === editingExtraAccountId ? {
                ...c,
                tipo: extraAccTipo,
                nombreMetodo: extraAccNombreMetodo.trim(),
                bancoOPlataforma: extraAccBanco.trim(),
                titular: extraAccTitular.trim() || 'BOHEME',
                cedulaORif: extraAccCedula.trim() || undefined,
                telefono: extraAccTelefono.trim() || undefined,
                numeroCuentaOCorreo: extraAccCuentaOCorreo.trim(),
                tipoCuenta: extraAccTipoCuenta.trim() || undefined,
                moneda: extraAccMoneda,
                instrucciones: extraAccInstrucciones.trim() || undefined
            } : c);
        } else {
            const newAcc: ExtraPaymentAccount = {
                id: `acc-${Date.now()}`,
                tipo: extraAccTipo,
                nombreMetodo: extraAccNombreMetodo.trim(),
                bancoOPlataforma: extraAccBanco.trim(),
                titular: extraAccTitular.trim() || 'BOHEME',
                cedulaORif: extraAccCedula.trim() || undefined,
                telefono: extraAccTelefono.trim() || undefined,
                numeroCuentaOCorreo: extraAccCuentaOCorreo.trim(),
                tipoCuenta: extraAccTipoCuenta.trim() || undefined,
                moneda: extraAccMoneda,
                instrucciones: extraAccInstrucciones.trim() || undefined,
                activo: true
            };
            nextList = [...currentList, newAcc];
        }

        const updatedSettings: SiteSettings = {
            ...settings,
            cuentasAdicionales: nextList
        };
        setSettings(updatedSettings);
        setIsExtraAccountModalOpen(false);
        await handleSaveSettings(undefined, updatedSettings);
    };

    const handleDeleteExtraAccount = async (id: string) => {
        const nextList = (settings.cuentasAdicionales || []).filter(c => c.id !== id);
        const updatedSettings: SiteSettings = {
            ...settings,
            cuentasAdicionales: nextList
        };
        setSettings(updatedSettings);
        await handleSaveSettings(undefined, updatedSettings);
    };

    const handleToggleExtraAccountActive = async (id: string) => {
        const nextList = (settings.cuentasAdicionales || []).map(c =>
            c.id === id ? { ...c, activo: !c.activo } : c
        );
        const updatedSettings: SiteSettings = {
            ...settings,
            cuentasAdicionales: nextList
        };
        setSettings(updatedSettings);
        await handleSaveSettings(undefined, updatedSettings);
    };

    // ==========================================
    // USER MANAGEMENT ACTIONS (Crear, Modificar y Eliminar incluso el usuario en uso)
    // ==========================================
    const isCurrentActiveUser = (u: AdminUser) =>
        u.id === currentUser.id || u.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase();

    const getRoleBadgeInfo = (rol: AdminUserRole) => {
        switch (rol) {
            case 'super_admin':
                return { label: 'Super Administrador', color: 'bg-[#5F2142] text-[#FFC99C]' };
            case 'admin':
                return { label: 'Administrador', color: 'bg-[#D86A33]/15 text-[#D86A33]' };
            case 'facturacion':
                return { label: 'Facturación & Cobranza', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' };
            case 'taller':
                return { label: 'Taller & Producción', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' };
            default:
                return { label: 'Administrador', color: 'bg-gray-100 text-gray-800' };
        }
    };

    const openCreateUserModal = () => {
        setEditingUserId(null);
        setUserFormNombre('');
        setUserFormEmail('');
        setUserFormPassword('');
        setUserFormRol('admin');
        setUserFormCargo('');
        setUserFormTelefono('');
        setUserFormActivo(true);
        setIsUserModalOpen(true);
    };

    const openEditUserModal = (user: AdminUser) => {
        setEditingUserId(user.id);
        setUserFormNombre(user.nombre);
        setUserFormEmail(user.email);
        setUserFormPassword(user.password);
        setUserFormRol(user.rol || 'admin');
        setUserFormCargo(user.cargo || '');
        setUserFormTelefono(user.telefono || '');
        setUserFormActivo(user.activo !== false);
        setIsUserModalOpen(true);
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanEmail = userFormEmail.trim().toLowerCase();
        const cleanNombre = userFormNombre.trim();
        const cleanPassword = userFormPassword.trim();

        if (!cleanNombre || !cleanEmail || !cleanPassword) {
            alert('Por favor completa el nombre, correo electrónico y contraseña del usuario.');
            return;
        }

        const currentUsers = settings.usuarios || [];
        const duplicateEmail = currentUsers.find(
            u => u.email.trim().toLowerCase() === cleanEmail && u.id !== editingUserId
        );
        if (duplicateEmail) {
            alert(`Ya existe un usuario registrado con el correo "${cleanEmail}".`);
            return;
        }

        let nextUsers: AdminUser[];
        if (editingUserId) {
            nextUsers = currentUsers.map(u =>
                u.id === editingUserId
                    ? {
                        ...u,
                        nombre: cleanNombre,
                        email: cleanEmail,
                        password: cleanPassword,
                        rol: userFormRol,
                        cargo: userFormCargo.trim() || undefined,
                        telefono: userFormTelefono.trim() || undefined,
                        activo: userFormActivo
                    }
                    : u
            );
        } else {
            const newUser: AdminUser = {
                id: `user-${Date.now()}`,
                nombre: cleanNombre,
                email: cleanEmail,
                password: cleanPassword,
                rol: userFormRol,
                cargo: userFormCargo.trim() || undefined,
                telefono: userFormTelefono.trim() || undefined,
                activo: userFormActivo,
                createdAt: new Date().toISOString()
            };
            nextUsers = [...currentUsers, newUser];
        }

        const updatedSettings: SiteSettings = {
            ...settings,
            usuarios: nextUsers
        };
        setSettings(updatedSettings);
        setIsUserModalOpen(false);
        await handleSaveSettings(undefined, updatedSettings);

        // If the edited user is the currently logged-in user, sync local currentUser state immediately
        if (editingUserId) {
            const editedObj = nextUsers.find(u => u.id === editingUserId);
            if (editedObj && (editingUserId === currentUser.id || editedObj.email === currentUser.email.toLowerCase())) {
                setCurrentUser({
                    id: editedObj.id,
                    email: editedObj.email,
                    name: editedObj.nombre,
                    userRole: editedObj.rol
                });
                showToast(`✓ Tu usuario activo (${editedObj.email}) ha sido actualizado`);
            } else {
                showToast('✓ Usuario actualizado correctamente');
            }
        } else {
            showToast(`✓ Nuevo usuario "${cleanNombre}" creado con éxito`);
        }
    };

    const handleToggleUserActive = async (user: AdminUser) => {
        const currentUsers = settings.usuarios || [];
        if (user.activo && currentUsers.filter(u => u.activo !== false).length <= 1) {
            alert('Debe quedar al menos 1 usuario activo en el sistema para poder ingresar al panel.');
            return;
        }
        const nextUsers = currentUsers.map(u =>
            u.id === user.id ? { ...u, activo: !u.activo } : u
        );
        const updatedSettings: SiteSettings = {
            ...settings,
            usuarios: nextUsers
        };
        setSettings(updatedSettings);
        await handleSaveSettings(undefined, updatedSettings);
    };

    const handleConfirmDeleteUser = async (user: AdminUser) => {
        const currentUsers = settings.usuarios || [];
        if (currentUsers.length <= 1) {
            alert('⚠️ No puedes eliminar el único usuario del sistema. Crea primero otro usuario antes de eliminar el actual para no perder el acceso al panel.');
            setDeleteUserConfirm(null);
            return;
        }

        const deletingCurrentActive = isCurrentActiveUser(user);
        const nextUsers = currentUsers.filter(u => u.id !== user.id);
        const updatedSettings: SiteSettings = {
            ...settings,
            usuarios: nextUsers
        };
        setSettings(updatedSettings);
        setDeleteUserConfirm(null);
        await handleSaveSettings(undefined, updatedSettings);

        if (deletingCurrentActive) {
            showToast('✓ Usuario en uso eliminado. Cerrando sesión...');
            await handleLogout();
        } else {
            showToast(`✓ Usuario "${user.nombre}" eliminado del sistema`);
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
    // TALLER & PEDIDOS HANDLERS
    // ==========================================
    const handleUpdateWorkshopStatus = async (orderId: string, newStatus: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado_taller: newStatus })
            });
            if (res.ok) {
                showToast(`✓ Estatus en taller: ${getStageInfo(newStatus).label}`);
                loadData();
            } else {
                alert('Error al actualizar estatus de taller.');
            }
        } catch {
            alert('Error de conexión con el servidor.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleCloseOrder = async (order: Order, close: boolean) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    pedido_cerrado: close, 
                    fecha_cierre: close ? new Date().toISOString() : undefined,
                    ...(close && order.estado_taller !== 'entregado' && order.estado_taller !== 'enviado' ? { estado_taller: 'entregado' } : {})
                })
            });
            if (res.ok) {
                showToast(close ? `✓ Pedido ${order.numero_factura} marcado como CERRADO` : `✓ Pedido ${order.numero_factura} reabierto en taller`);
                loadData();
            } else {
                alert('Error al cambiar estatus de cierre.');
            }
        } catch {
            alert('Error de conexión.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveWorkshopNotes = async (orderId: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notas_taller: workshopNotesInput.trim() })
            });
            if (res.ok) {
                showToast('✓ Bitácora de taller actualizada');
                setEditingWorkshopNotesOrder(null);
                loadData();
            } else {
                alert('Error al guardar notas de taller');
            }
        } catch {
            alert('Error de conexión');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveGuideNumber = async (orderId: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ numero_guia_envio: guideNumberInput.trim() })
            });
            if (res.ok) {
                showToast('✓ Número de guía de envío guardado');
                setEditingGuideOrder(null);
                loadData();
            } else {
                alert('Error al guardar número de guía');
            }
        } catch {
            alert('Error de conexión');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePrintWorkshopSheet = (order: Order) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Por favor habilita las ventanas emergentes en tu navegador para imprimir la orden de trabajo.');
            return;
        }
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ficha Técnica Taller - ${order.numero_factura}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 28px; color: #111; line-height: 1.4; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #5F2142; padding-bottom: 12px; margin-bottom: 16px; }
                    .title { font-size: 20px; font-weight: 900; color: #5F2142; }
                    .badge { display: inline-block; padding: 4px 10px; background: #FFF4EB; border: 1px solid #D86A33; color: #D86A33; border-radius: 9999px; font-weight: bold; font-size: 12px; }
                    .section { margin-bottom: 16px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
                    .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #5F2142; margin-bottom: 8px; border-bottom: 1px dashed #eee; padding-bottom: 4px; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; }
                    .item-card { border: 1px solid #ddd; border-radius: 6px; padding: 10px; margin-bottom: 8px; background: #fafafa; }
                    .checklist { display: flex; gap: 14px; margin-top: 14px; font-size: 11px; font-weight: bold; flex-wrap: wrap; }
                    .box { width: 14px; height: 14px; border: 1.5px solid #333; display: inline-block; vertical-align: middle; margin-right: 4px; border-radius: 2px; }
                    @media print { button { display: none; } body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="title">BOHEME • FICHA TÉCNICA DE PRODUCCIÓN & TALLER</div>
                        <div style="font-size: 12px; color: #666;">Orden de Fabricación y Confección • Factura ${order.numero_factura}</div>
                    </div>
                    <div>
                        <span class="badge">${order.tipo_entrega === 'nacional' ? `ENVÍO NACIONAL (${order.empresa_envio || 'MRW'})` : 'ENTREGA LOCAL (MCPIO. MIRANDA / MCPIO. COLINA)'}</span>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Datos del Cliente & Destino</div>
                    <div class="grid">
                        <div><strong>Cliente:</strong> ${order.cliente_nombre} ${order.cliente_apellido}</div>
                        <div><strong>Cédula:</strong> ${order.cliente_cedula}</div>
                        <div><strong>Teléfono:</strong> ${order.cliente_telefono}</div>
                        <div><strong>Fecha de Pedido:</strong> ${new Date(order.created_at).toLocaleDateString()}</div>
                        <div style="grid-column: span 2;"><strong>Dirección / Destino:</strong> ${order.direccion_entrega} ${order.ciudad ? `(${order.ciudad}, ${order.estado})` : ''}</div>
                        ${order.numero_guia_envio ? `<div><strong>Guía de Envío:</strong> ${order.numero_guia_envio}</div>` : ''}
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Prendas y Especificaciones de Personalización</div>
                    ${order.items.map((it, idx) => `
                        <div class="item-card">
                            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px;">
                                <span>${idx + 1}. ${it.name} (Cantidad: ${it.quantity})</span>
                                <span style="color: #5F2142;">${it.is_personalizado ? '★ PERSONALIZADO' : 'ESTÁNDAR'}</span>
                            </div>
                            ${it.nombre_personalizado ? `<div style="font-size: 12px; margin-top: 4px;"><strong>• Nombre a bordar / imprimir:</strong> <span style="font-size: 14px; color: #5F2142; font-weight: 900; background: #fff3e6; padding: 1px 4px; border-radius: 3px;">${it.nombre_personalizado}</span></div>` : ''}
                            ${it.especialidad_personalizada ? `<div style="font-size: 12px;"><strong>• Especialidad / Profesión:</strong> ${it.especialidad_personalizada}</div>` : ''}
                            ${it.color_preferencia ? `<div style="font-size: 12px;"><strong>• Color de tela / bordado:</strong> ${it.color_preferencia}</div>` : ''}
                            ${it.detalles_personalizados ? `<div style="font-size: 12px;"><strong>• Notas adicionales:</strong> ${it.detalles_personalizados}</div>` : ''}
                        </div>
                    `).join('')}
                </div>

                ${order.notas_taller ? `
                    <div class="section">
                        <div class="section-title">Bitácora / Notas de Taller</div>
                        <div style="font-size: 12px;">${order.notas_taller}</div>
                    </div>
                ` : ''}

                <div class="section">
                    <div class="section-title">Control de Estaciones y Calidad</div>
                    <div class="checklist">
                        <div><span class="box"></span> 1. Diseño Aprobado</div>
                        <div><span class="box"></span> 2. Imprenta / Sublimado</div>
                        <div><span class="box"></span> 3. Confección / Costura</div>
                        <div><span class="box"></span> 4. Acabado & Limpieza</div>
                        <div><span class="box"></span> 5. Embalaje</div>
                        <div><span class="box"></span> 6. Despacho / Entrega</div>
                    </div>
                    <div style="margin-top: 28px; display: flex; justify-content: space-between; font-size: 11px; color: #555;">
                        <div>Firma Responsable Taller: _____________________</div>
                        <div>Firma Control de Calidad: _____________________</div>
                    </div>
                </div>

                <script>window.onload = function() { window.print(); };</script>
            </body>
            </html>
        `;
        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    const toggleOrderExpanded = (orderId: string) => {
        setExpandedOrderIds(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const selectOnlyOrderToView = (orderId: string) => {
        setExpandedOrderIds({
            [orderId]: true
        });
    };

    const expandAllWorkshopOrders = () => {
        const all: Record<string, boolean> = {};
        orders.forEach(o => { all[o.id] = true; });
        setExpandedOrderIds(all);
    };

    const collapseAllWorkshopOrders = () => {
        setExpandedOrderIds({});
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

    // Taller & Pedidos Filter and Metrics
    const totalTallerActivos = orders.filter(o => !o.pedido_cerrado).length;
    const totalTallerCerrados = orders.filter(o => o.pedido_cerrado).length;
    const totalTallerPorDisenar = orders.filter(o => !o.pedido_cerrado && (o.estado_taller === 'por_disenar' || o.estado_taller === 'diseno_aprobado')).length;
    const totalTallerEnImprenta = orders.filter(o => !o.pedido_cerrado && o.estado_taller === 'en_imprenta').length;
    const totalTallerPorCoser = orders.filter(o => !o.pedido_cerrado && o.estado_taller === 'por_coser').length;
    const totalTallerPorEntregar = orders.filter(o => !o.pedido_cerrado && (o.estado_taller === 'por_entregar' || o.estado_taller === 'por_embalar' || o.estado_taller === 'por_enviar' || o.estado_taller === 'enviado')).length;

    const filteredTallerOrders = orders.filter(order => {
        // 1. Tab filter (activos vs cerrados vs todos)
        if (tallerTab === 'activos' && order.pedido_cerrado) return false;
        if (tallerTab === 'cerrados' && !order.pedido_cerrado) return false;

        // 2. Type filter
        if (filterTallerType !== 'all') {
            const orderType = getOrderWorkshopType(order);
            if (orderType !== filterTallerType) return false;
        }

        // 3. Stage filter
        if (filterTallerStage !== 'all') {
            const currentStage = order.estado_taller || getDefaultWorkshopStatus(order.items, order.tipo_entrega);
            if (currentStage !== filterTallerStage) return false;
        }

        // 4. Delivery filter (local vs nacional)
        if (filterTallerDelivery !== 'all') {
            if (order.tipo_entrega !== filterTallerDelivery) return false;
        }

        // 5. Search text
        if (tallerSearch.trim()) {
            const q = tallerSearch.toLowerCase();
            const matchesText = 
                order.numero_factura.toLowerCase().includes(q) ||
                order.cliente_nombre.toLowerCase().includes(q) ||
                order.cliente_apellido.toLowerCase().includes(q) ||
                order.cliente_cedula.toLowerCase().includes(q) ||
                order.cliente_telefono.toLowerCase().includes(q) ||
                (order.notas_taller && order.notas_taller.toLowerCase().includes(q)) ||
                (order.numero_guia_envio && order.numero_guia_envio.toLowerCase().includes(q)) ||
                order.items.some(it => 
                    it.name.toLowerCase().includes(q) ||
                    (it.nombre_personalizado && it.nombre_personalizado.toLowerCase().includes(q)) ||
                    (it.especialidad_personalizada && it.especialidad_personalizada.toLowerCase().includes(q))
                );
            if (!matchesText) return false;
        }

        return true;
    });

    // All products in active section (used for subcategory pill counts)
    const allSectionProducts = products.filter(p => p.categoria_slug === activeSection);

    // Filter products by active section and optional subcategory (NO "TODOS" section)
    const sectionProducts = allSectionProducts.filter(p => {
        const matchesSubcategory = activeSubcategory === 'all' || Number(p.subcategoria_id) === Number(activeSubcategory);
        const matchesSearch = !productSearch.trim() || 
            p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
            (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()));
        return matchesSubcategory && matchesSearch;
    });

    // Theme Classes
    const bgMain = isDark ? 'dark admin-dark-mode bg-[#130d13] text-white' : 'bg-[#FFF9F5] text-gray-900';
    const bgSidebar = isDark ? 'bg-[#1b121b] border-[#362132] text-white' : 'bg-white border-gray-200';
    const bgCard = isDark ? 'bg-[#201520] border-[#3e273b] text-white' : 'bg-white border-gray-200';
    const bgSubCard = isDark ? 'bg-[#170e17] border-[#382234] text-white' : 'bg-[#FFF9F5] border-[#FFC99C]/50';
    const borderDefault = isDark ? 'border-[#382234]' : 'border-gray-200';
    const inputStyle = isDark 
        ? 'bg-[#170e17] border-[#382234] text-white focus:border-[#D86A33] placeholder-white/60' 
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
                    <img src={isDark ? '/logo-white.png' : '/logo-wine.png'} alt="BOHEME" className="h-8 w-auto object-contain" />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-xl border border-gray-200 dark:border-white/10"
                    >
                        {isDark ? <Sun size={17} className="text-white" /> : <Moon size={17} className="text-[#5F2142]" />}
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
                            <img src={isDark ? '/logo-white.png' : '/logo-wine.png'} alt="BOHEME" className="h-9 w-auto object-contain" />
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
                            onClick={() => { setActiveTab('taller'); setSidebarOpen(false); }}
                            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                                activeTab === 'taller'
                                    ? 'bg-[#5F2142] text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-[#FFF4EB] dark:hover:bg-white/5'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Scissors size={16} />
                                <span>Taller y Pedidos</span>
                            </div>
                            {totalTallerActivos > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-[#D86A33] text-white text-[10px] font-bold animate-pulse">
                                    {totalTallerActivos}
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
                            onClick={() => { setActiveTab('reportes'); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                                activeTab === 'reportes'
                                    ? 'bg-[#5F2142] text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-[#FFF4EB] dark:hover:bg-white/5'
                            }`}
                        >
                            <BarChart3 size={16} />
                            <span>Módulo de Reportes</span>
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
                            <span>Configuraciones</span>
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

                                                        {/* Acciones: PDF, Ver, Editar, Eliminar */}
                                                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                                            <div className="inline-flex items-center gap-1.5">
                                                                <button
                                                                    onClick={() => generateInvoicePdf(order, settings.pdfConfig, bcvRate)}
                                                                    className="px-2.5 py-1.5 rounded-xl bg-[#FFF4EB] dark:bg-white/10 border border-[#D86A33]/40 text-[#D86A33] hover:bg-[#D86A33] hover:text-white font-black transition-all text-xs inline-flex items-center gap-1"
                                                                    title="Generar / Descargar PDF de esta factura"
                                                                >
                                                                    <Printer size={12} />
                                                                    <span>PDF</span>
                                                                </button>
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
                {/* TAB: TALLER Y PEDIDOS (Gestión de Producción y Despacho)  */}
                {/* ========================================================= */}
                {activeTab === 'taller' && (
                    <div className="space-y-6">
                        {/* Header & Sub-Tabs */}
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-white/10">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-2xl bg-[#5F2142] text-white flex items-center justify-center shadow-md shadow-[#5F2142]/20">
                                        <Scissors size={20} />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-black text-[#5F2142] dark:text-[#FFC99C] tracking-tight">
                                            Taller & Producción de Pedidos
                                        </h1>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            Alimentado directamente de Facturado. Confección, corte, bordado y despacho.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* View Switcher: Activos vs Cerrados vs Todos */}
                            <div className="flex items-center gap-2 self-stretch sm:self-auto overflow-x-auto pb-1 sm:pb-0">
                                <div className="flex p-1 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setTallerTab('activos')}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                                            tallerTab === 'activos'
                                                ? 'bg-[#5F2142] text-white shadow-xs'
                                                : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                                        }`}
                                    >
                                        <Scissors size={13} />
                                        <span>En Producción</span>
                                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${tallerTab === 'activos' ? 'bg-[#D86A33] text-white' : 'bg-gray-200 dark:bg-white/10'}`}>
                                            {totalTallerActivos}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setTallerTab('cerrados')}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                                            tallerTab === 'cerrados'
                                                ? 'bg-[#5F2142] text-white shadow-xs'
                                                : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                                        }`}
                                    >
                                        <CheckCheck size={13} />
                                        <span>Historial Cerrados</span>
                                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${tallerTab === 'cerrados' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-white/10'}`}>
                                            {totalTallerCerrados}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setTallerTab('todos')}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                                            tallerTab === 'todos'
                                                ? 'bg-[#5F2142] text-white shadow-xs'
                                                : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                                        }`}
                                    >
                                        <Layers size={13} />
                                        <span>Todos ({orders.length})</span>
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => loadData()}
                                    className="p-2.5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-[#D86A33] text-gray-600 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-white/5"
                                    title="Actualizar datos del taller"
                                >
                                    <RefreshCw size={15} />
                                </button>
                            </div>
                        </div>

                        {/* ========================================================= */}
                        {/* KPI SUMMARY CARDS (REPORTE VISUAL DEL TALLER)             */}
                        {/* ========================================================= */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div className={`p-4 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs`}>
                                <div className="flex items-center justify-between text-gray-400 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider">Activos en Taller</span>
                                    <Scissors size={14} className="text-[#D86A33]" />
                                </div>
                                <div className="text-2xl font-black text-[#5F2142] dark:text-[#FFC99C]">
                                    {totalTallerActivos}
                                </div>
                                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Pedidos en curso</div>
                            </div>

                            <div className={`p-4 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs`}>
                                <div className="flex items-center justify-between text-gray-400 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider">Por Diseñar</span>
                                    <Sparkles size={14} className="text-amber-500" />
                                </div>
                                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                                    {totalTallerPorDisenar}
                                </div>
                                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Arte & aprobación</div>
                            </div>

                            <div className={`p-4 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs`}>
                                <div className="flex items-center justify-between text-gray-400 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider">En Imprenta</span>
                                    <Printer size={14} className="text-purple-500" />
                                </div>
                                <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                                    {totalTallerEnImprenta}
                                </div>
                                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Sublimación / corte</div>
                            </div>

                            <div className={`p-4 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs`}>
                                <div className="flex items-center justify-between text-gray-400 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider">Por Coser</span>
                                    <div className="text-sm">🧵</div>
                                </div>
                                <div className="text-2xl font-black text-pink-600 dark:text-pink-400">
                                    {totalTallerPorCoser}
                                </div>
                                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Mesa de costura</div>
                            </div>

                            <div className={`p-4 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs`}>
                                <div className="flex items-center justify-between text-gray-400 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider">Por Despachar</span>
                                    <Truck size={14} className="text-cyan-500" />
                                </div>
                                <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                                    {totalTallerPorEntregar}
                                </div>
                                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Entrega local o agencia</div>
                            </div>

                            <div className={`p-4 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs`}>
                                <div className="flex items-center justify-between text-gray-400 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider">Cerrados</span>
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                </div>
                                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                    {totalTallerCerrados}
                                </div>
                                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Pedidos completados</div>
                            </div>
                        </div>

                        {/* ========================================================= */}
                        {/* MULTI-FILTER & SEARCH BAR                                */}
                        {/* ========================================================= */}
                        <div className={`p-4 sm:p-5 rounded-3xl ${bgCard} border ${borderDefault} shadow-sm space-y-3`}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {/* Filtro por Tipo de Producto */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                                        Tipo de Producto:
                                    </label>
                                    <select
                                        value={filterTallerType}
                                        onChange={(e) => setFilterTallerType(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${inputStyle}`}
                                    >
                                        <option value="all">Todos los Tipos de Producto</option>
                                        <option value="gorros_personalizados">🧢 Gorritos Personalizados</option>
                                        <option value="gorros_especiales">🧢 Gorros Especiales</option>
                                        <option value="gorros_basicos">🧢 Gorritos Básicos</option>
                                        <option value="lanyards_personalizados">🎀 Lanyards Personalizados</option>
                                        <option value="productos_personalizados">✨ Productos Personalizados</option>
                                        <option value="resto_nacional">📦 Stock Tienda (Envío Nacional)</option>
                                        <option value="resto_local">🏠 Stock Tienda (Entrega Local)</option>
                                    </select>
                                </div>

                                {/* Filtro por Etapa de Taller */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                                        Etapa de Taller:
                                    </label>
                                    <select
                                        value={filterTallerStage}
                                        onChange={(e) => setFilterTallerStage(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${inputStyle}`}
                                    >
                                        <option value="all">Todas las Etapas</option>
                                        {Object.values(WORKSHOP_STAGES).map(st => (
                                            <option key={st.key} value={st.key}>{st.icon} {st.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro por Modalidad de Entrega */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                                        Modalidad de Entrega:
                                    </label>
                                    <select
                                        value={filterTallerDelivery}
                                        onChange={(e) => setFilterTallerDelivery(e.target.value as any)}
                                        className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${inputStyle}`}
                                    >
                                        <option value="all">Todas las Modalidades</option>
                                        <option value="local">🏠 Entrega Local (Mcpio. Miranda / Mcpio. Colina)</option>
                                        <option value="nacional">🚚 Envío Nacional (MRW, Zoom, etc.)</option>
                                    </select>
                                </div>

                                {/* Búsqueda de Texto en Vivo */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                                        Buscar en Taller:
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={tallerSearch}
                                            onChange={(e) => setTallerSearch(e.target.value)}
                                            placeholder="# Factura, cliente, bordado..."
                                            className={`w-full pl-8 pr-7 py-2 rounded-xl border text-xs font-medium outline-none ${inputStyle}`}
                                        />
                                        <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                                        {tallerSearch && (
                                            <button
                                                type="button"
                                                onClick={() => setTallerSearch('')}
                                                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-black dark:hover:text-white"
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ========================================================= */}
                        {/* ORDERS WORKSHOP CARDS (FICHAS DE TALLER)                  */}
                        {/* ========================================================= */}
                        {filteredTallerOrders.length === 0 ? (
                            <div className={`p-12 text-center rounded-3xl ${bgCard} border ${borderDefault} shadow-xs`}>
                                <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-white/5 text-[#D86A33] flex items-center justify-center mx-auto mb-3">
                                    <Scissors size={28} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">
                                    No se encontraron pedidos en esta vista
                                </h3>
                                <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
                                    Prueba cambiando los filtros de etapa de taller o realiza una nueva búsqueda.
                                </p>
                                <button
                                    onClick={() => {
                                        setFilterTallerType('all');
                                        setFilterTallerStage('all');
                                        setFilterTallerDelivery('all');
                                        setTallerSearch('');
                                    }}
                                    className="px-5 py-2 rounded-full border border-gray-200 dark:border-white/10 text-xs font-bold hover:border-[#D86A33]"
                                >
                                    Restablecer Filtros
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Barra de controles de minimización / expansión masiva */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 pb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-gray-700 dark:text-gray-300">
                                            Pedidos ({filteredTallerOrders.length}):
                                        </span>
                                        <span className="text-[11px] text-gray-400 font-medium">
                                            Haz clic sobre cualquier pedido para visualizarlo o minimizarlo
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={collapseAllWorkshopOrders}
                                            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#5F2142] text-xs font-bold text-gray-600 dark:text-gray-300 inline-flex items-center gap-1.5 transition-all bg-white dark:bg-neutral-800 shadow-2xs"
                                            title="Minimizar todos los pedidos de la lista"
                                        >
                                            <ChevronUp size={13} />
                                            <span>Minimizar Todos</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={expandAllWorkshopOrders}
                                            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#D86A33] text-xs font-bold text-gray-600 dark:text-gray-300 inline-flex items-center gap-1.5 transition-all bg-white dark:bg-neutral-800 shadow-2xs"
                                            title="Expandir y visualizar todos los pedidos"
                                        >
                                            <ChevronDown size={13} />
                                            <span>Expandir Todos</span>
                                        </button>
                                    </div>
                                </div>

                                {filteredTallerOrders.map((order) => {
                                    const isExpanded = Boolean(expandedOrderIds[order.id]);
                                    const workshopType = getOrderWorkshopType(order);
                                    const steps = getOrderWorkflowSteps(order);
                                    const currentStageKey = order.estado_taller || steps[0];
                                    const currentStage = getStageInfo(currentStageKey);
                                    const currentIndex = steps.indexOf(currentStageKey);
                                    const nextStageKey = currentIndex >= 0 && currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
                                    
                                    // WhatsApp direct customer link
                                    const waPhone = (order.cliente_telefono || '').replace(/\D/g, '');
                                    const waTarget = waPhone.startsWith('58') ? waPhone : `58${waPhone.startsWith('0') ? waPhone.slice(1) : waPhone}`;
                                    const waText = encodeURIComponent(`¡Hola ${order.cliente_nombre}! Te escribimos del Taller de BOHEME respecto a tu pedido #${order.numero_factura}.`);

                                    const totalPrendas = order.items.reduce((sum, it) => sum + it.quantity, 0);

                                    return (
                                        <div
                                            key={order.id}
                                            className={`rounded-3xl ${bgCard} border ${
                                                order.pedido_cerrado
                                                    ? 'border-gray-200 dark:border-white/5 opacity-85'
                                                    : isExpanded
                                                        ? 'border-[#D86A33]/50 ring-2 ring-[#D86A33]/15 shadow-md'
                                                        : borderDefault
                                            } shadow-xs overflow-hidden transition-all`}
                                        >
                                            {/* BARRA DE RESUMEN (CABECERA CLICKEABLE PARA MINIMIZAR / EXPANDIR) */}
                                            <div
                                                onClick={() => toggleOrderExpanded(order.id)}
                                                className={`p-3.5 sm:p-4.5 transition-colors cursor-pointer select-none ${
                                                    isExpanded 
                                                        ? 'border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/2' 
                                                        : 'hover:bg-gray-50/70 dark:hover:bg-white/2'
                                                } flex flex-col lg:flex-row lg:items-center justify-between gap-3`}
                                            >
                                                {/* Left Info Column */}
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                                                    {/* Chevron expand/collapse icon */}
                                                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                                                        isExpanded 
                                                            ? 'bg-[#5F2142] text-white shadow-2xs' 
                                                            : 'bg-gray-100 dark:bg-white/10 text-gray-500 hover:bg-[#5F2142] hover:text-white'
                                                    }`}>
                                                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                                    </div>

                                                    {/* Factura # */}
                                                    <span className="font-mono font-black text-sm text-[#5F2142] dark:text-[#FFC99C] px-3 py-1 rounded-xl bg-[#5F2142]/10 dark:bg-[#FFC99C]/10 border border-[#5F2142]/20">
                                                        #{order.numero_factura}
                                                    </span>

                                                    {/* Cliente */}
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-black text-xs sm:text-sm text-gray-900 dark:text-white">
                                                            {order.cliente_nombre} {order.cliente_apellido}
                                                        </span>
                                                        <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                                                            ({order.cliente_cedula})
                                                        </span>
                                                    </div>

                                                    {/* Fecha */}
                                                    <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                                                        <Clock size={11} />
                                                        {new Date(order.created_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}
                                                    </span>

                                                    {/* Modalidad de Entrega */}
                                                    {order.tipo_entrega === 'nacional' ? (
                                                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1">
                                                            <Truck size={10} /> Envío Nacional ({order.empresa_envio || 'MRW'})
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-300 dark:border-purple-800 flex items-center gap-1">
                                                            <Store size={10} /> Entrega Local (Mcpio. Miranda / Mcpio. Colina)
                                                        </span>
                                                    )}

                                                    {/* Resumen de Prendas */}
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hidden md:inline-block">
                                                        {totalPrendas} prenda(s) • {getWorkshopTypeLabel(workshopType)}
                                                    </span>
                                                </div>

                                                {/* Right Status & Selection Column */}
                                                <div className="flex items-center gap-2 self-end lg:self-auto" onClick={(e) => e.stopPropagation()}>
                                                    {/* Estatus Actual */}
                                                    <span className={`text-xs font-black px-3 py-1 rounded-xl border flex items-center gap-1.5 ${currentStage.badgeBg}`}>
                                                        <span>{currentStage.icon}</span>
                                                        <span>{currentStage.label}</span>
                                                    </span>

                                                    {/* Estatus Pago */}
                                                    {normalizeStatus(order.estado_pago) === 'verificada' ? (
                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                                            ✓ Pago OK
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                                            ⏳ Pago Pend.
                                                        </span>
                                                    )}

                                                    {/* Imprimir Ficha */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePrintWorkshopSheet(order)}
                                                        className="p-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#5F2142] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                                        title="Imprimir Ficha de Taller"
                                                    >
                                                        <Printer size={14} />
                                                    </button>

                                                    {/* Botón Seleccionar / Visualizar */}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleOrderExpanded(order.id)}
                                                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all inline-flex items-center gap-1.5 ${
                                                            isExpanded
                                                                ? 'bg-[#5F2142] text-white shadow-xs'
                                                                : 'bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:border-[#D86A33]'
                                                        }`}
                                                    >
                                                        <Eye size={12} />
                                                        <span>{isExpanded ? 'Minimizar ▲' : 'Visualizar ▼'}</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* CONTENIDO DETALLADO (VISIBLE SOLO AL EXPANDIR / SELECCIONAR) */}
                                            {isExpanded && (
                                                <div className="animate-fadeIn">
                                                    {/* ACTION BAR: CERRAR / REABRIR PEDIDO */}
                                                    <div className="px-4 sm:px-5 py-2.5 bg-gray-50/80 dark:bg-white/3 border-b border-gray-100 dark:border-white/10 flex items-center justify-between gap-3 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-400 font-medium">Estado del pedido:</span>
                                                            {order.pedido_cerrado ? (
                                                                <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                                    <CheckCircle2 size={13} /> Pedido Cerrado / Finalizado
                                                                </span>
                                                            ) : (
                                                                <span className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                                    <Scissors size={13} /> En Producción Activa
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div>
                                                            {order.pedido_cerrado ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleCloseOrder(order, false)}
                                                                    disabled={actionLoading}
                                                                    className="px-3.5 py-1.5 rounded-xl border border-gray-300 dark:border-white/10 hover:border-[#D86A33] text-gray-700 dark:text-gray-200 font-bold text-xs inline-flex items-center gap-1.5 bg-white dark:bg-neutral-800"
                                                                >
                                                                    <RotateCcw size={12} />
                                                                    <span>Reabrir en Taller</span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleCloseOrder(order, true)}
                                                                    disabled={actionLoading}
                                                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs inline-flex items-center gap-1.5 transition-all"
                                                                >
                                                                    <CheckCheck size={13} />
                                                                    <span>Marcar como Pedido Cerrado</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* CLIENT & COURIER BAR */}
                                                    <div className="px-4 sm:px-5 py-3.5 bg-white dark:bg-transparent border-b border-gray-100 dark:border-white/10 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                                            <div>
                                                                <span className="text-gray-400 font-semibold">Cliente: </span>
                                                                <strong className="text-gray-900 dark:text-white font-black">
                                                                    {order.cliente_nombre} {order.cliente_apellido}
                                                                </strong>
                                                                <span className="text-gray-400 font-normal ml-1">({order.cliente_cedula})</span>
                                                            </div>

                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-gray-400 font-semibold">Telf:</span>
                                                                <span className="font-bold text-[#5F2142] dark:text-[#FFC99C]">{order.cliente_telefono}</span>
                                                                <a
                                                                    href={`https://wa.me/${waTarget}?text=${waText}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-2.5 py-0.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold text-[10px] inline-flex items-center gap-1 transition-all shadow-2xs"
                                                                    title="Abrir chat de WhatsApp con el cliente"
                                                                >
                                                                    WhatsApp Cliente
                                                                </a>
                                                            </div>

                                                            <div>
                                                                <span className="text-gray-400 font-semibold">Destino: </span>
                                                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                                                    {order.direccion_entrega} {order.ciudad ? `(${order.ciudad}, ${order.estado})` : ''}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Envío Nacional: Número de Guía */}
                                                        {order.tipo_entrega === 'nacional' && (
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {order.numero_guia_envio ? (
                                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200">
                                                                        <Truck size={13} className="text-cyan-600" />
                                                                        <span className="font-mono font-bold text-xs">Guía: {order.numero_guia_envio}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => { setEditingGuideOrder(order); setGuideNumberInput(order.numero_guia_envio || ''); }}
                                                                            className="text-cyan-600 hover:text-cyan-900 ml-1"
                                                                            title="Editar guía de envío"
                                                                        >
                                                                            <Edit2 size={11} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => { setEditingGuideOrder(order); setGuideNumberInput(''); }}
                                                                        className="px-2.5 py-1 rounded-xl border border-dashed border-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 font-bold text-[11px] inline-flex items-center gap-1"
                                                                    >
                                                                        <Plus size={11} /> Registrar Guía MRW/Zoom
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* BODY: ITEMS LIST + PERSONALIZATION HIGHLIGHT */}
                                                    <div className="p-4 sm:p-5 space-y-4">
                                                        <div>
                                                            <span className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">
                                                                Prendas a Confeccionar & Detalles de Taller ({order.items.length}):
                                                            </span>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {order.items.map((item, itIdx) => {
                                                                    const itemType = determineItemWorkshopType(item, order.tipo_entrega);
                                                                    const hasCustom = item.is_personalizado || item.nombre_personalizado || item.especialidad_personalizada || item.detalles_personalizados;

                                                                    return (
                                                                        <div
                                                                            key={itIdx}
                                                                            className={`p-3.5 rounded-2xl border ${
                                                                                hasCustom
                                                                                    ? 'border-[#D86A33]/40 bg-[#FFF9F5] dark:bg-white/3'
                                                                                    : 'border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/1'
                                                                            } space-y-2.5`}
                                                                        >
                                                                            <div className="flex items-start justify-between gap-2">
                                                                                <div className="flex items-center gap-2.5">
                                                                                    <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10 overflow-hidden shrink-0 border border-gray-300 dark:border-white/10">
                                                                                        {item.image_url ? (
                                                                                            <img src={parseImages(item.image_url)[0]} alt={item.name} className="w-full h-full object-cover" />
                                                                                        ) : (
                                                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                                                                                                BHM
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="font-black text-gray-900 dark:text-white text-xs leading-tight">
                                                                                            {item.quantity}x {item.name}
                                                                                        </div>
                                                                                        <span className="text-[10px] text-gray-400 font-semibold">
                                                                                            ${item.price} c/u • Ref: {item.categoria_slug || 'General'}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>

                                                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-[#5F2142]/10 text-[#5F2142] dark:text-[#FFC99C] shrink-0">
                                                                                    {getWorkshopTypeLabel(itemType)}
                                                                                </span>
                                                                            </div>

                                                                            {/* PERSONALIZATION CALLOUT BOX (CRITICAL FOR WORKSHOP) */}
                                                                            {hasCustom && (
                                                                                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1 text-xs">
                                                                                    {item.nombre_personalizado && (
                                                                                        <div className="flex items-baseline gap-1.5">
                                                                                            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider shrink-0">
                                                                                                Bordado / Nombre:
                                                                                            </span>
                                                                                            <span className="font-black text-[#5F2142] dark:text-[#FFC99C] text-sm bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-700 shadow-2xs">
                                                                                                {item.nombre_personalizado}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                    {item.especialidad_personalizada && (
                                                                                        <div className="flex items-baseline gap-1.5 text-[11px]">
                                                                                            <span className="font-bold text-gray-500 shrink-0">Especialidad:</span>
                                                                                            <span className="font-bold text-gray-900 dark:text-white">{item.especialidad_personalizada}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {item.color_preferencia && (
                                                                                        <div className="flex items-baseline gap-1.5 text-[11px]">
                                                                                            <span className="font-bold text-gray-500 shrink-0">Telas / Hilos:</span>
                                                                                            <span className="font-medium text-gray-800 dark:text-gray-200">{item.color_preferencia}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {item.detalles_personalizados && (
                                                                                        <div className="flex items-baseline gap-1.5 text-[11px]">
                                                                                            <span className="font-bold text-gray-500 shrink-0">Observaciones:</span>
                                                                                            <span className="font-medium text-gray-700 dark:text-gray-300">{item.detalles_personalizados}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* ========================================================= */}
                                                        {/* WORKFLOW PIPELINE (STEPPER INTERACTIVO DE 1 CLIC)         */}
                                                        {/* ========================================================= */}
                                                        <div className="pt-2">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                                                                    Flujo de Producción & Despacho:
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 font-medium">
                                                                    Haz clic en cualquier fase para avanzar o cambiar estatus
                                                                </span>
                                                            </div>

                                                            <div className="p-3 sm:p-4 rounded-2xl bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/10 space-y-3">
                                                                {/* Horizontal Stepper Chips */}
                                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                                    {steps.map((stepKey, sIdx) => {
                                                                        const stInfo = getStageInfo(stepKey);
                                                                        const isPassed = sIdx < currentIndex;
                                                                        const isCurrent = sIdx === currentIndex;

                                                                        return (
                                                                            <button
                                                                                key={stepKey}
                                                                                type="button"
                                                                                onClick={() => handleUpdateWorkshopStatus(order.id, stepKey)}
                                                                                disabled={actionLoading}
                                                                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                                                                                    isCurrent
                                                                                        ? 'bg-[#5F2142] text-white shadow-md ring-2 ring-[#D86A33] scale-105'
                                                                                        : isPassed
                                                                                            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-200'
                                                                                            : 'bg-white dark:bg-neutral-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-[#5F2142] hover:text-[#5F2142]'
                                                                                }`}
                                                                                title={`Cambiar a: ${stInfo.label}`}
                                                                            >
                                                                                <span>{stInfo.icon}</span>
                                                                                <span>{stInfo.label}</span>
                                                                                {isPassed && <Check size={11} className="text-emerald-700 dark:text-emerald-300 ml-0.5" />}
                                                                                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#D86A33] animate-ping" />}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>

                                                                {/* Stepper Footer Controls */}
                                                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-white/10 text-xs">
                                                                    <div className="text-gray-500 font-medium">
                                                                        Fase actual: <strong className="text-[#5F2142] dark:text-[#FFC99C]">{currentStage.label}</strong> ({currentStage.description})
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        {nextStageKey ? (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleUpdateWorkshopStatus(order.id, nextStageKey)}
                                                                                disabled={actionLoading}
                                                                                className="px-3.5 py-1.5 rounded-xl bg-[#D86A33] hover:bg-[#c25925] text-white font-black text-xs shadow-xs inline-flex items-center gap-1.5 transition-all"
                                                                            >
                                                                                <span>Avanzar a {getStageInfo(nextStageKey).label}</span>
                                                                                <ArrowRight size={13} />
                                                                            </button>
                                                                        ) : !order.pedido_cerrado ? (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleToggleCloseOrder(order, true)}
                                                                                disabled={actionLoading}
                                                                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs inline-flex items-center gap-1.5 transition-all"
                                                                            >
                                                                                <CheckCheck size={13} />
                                                                                <span>¡Producción Completa! Cerrar Pedido</span>
                                                                            </button>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* ========================================================= */}
                                                        {/* WORKSHOP NOTES / BITÁCORA STRIP                          */}
                                                        {/* ========================================================= */}
                                                        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                                                            <div className="flex-1 flex items-start sm:items-center gap-2">
                                                                <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider shrink-0">
                                                                    Bitácora:
                                                                </span>
                                                                {order.notas_taller ? (
                                                                    <span className="italic text-gray-700 dark:text-gray-300 font-medium bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-xl">
                                                                        "{order.notas_taller}"
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400 italic">Sin notas de taller registradas.</span>
                                                                )}
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingWorkshopNotesOrder(order);
                                                                    setWorkshopNotesInput(order.notas_taller || '');
                                                                }}
                                                                className="px-3 py-1 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#5F2142] text-xs font-bold text-gray-600 dark:text-gray-300 inline-flex items-center gap-1 shrink-0"
                                                            >
                                                                <Edit2 size={11} />
                                                                <span>{order.notas_taller ? 'Modificar Bitácora' : '+ Agregar Nota'}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 2: AGREGAR PRODUCTOS (Por Sección y Categoría)        */}
                {/* ========================================================= */}
                {activeTab === 'productos' && (() => {
                    const currentCatInfo = CATEGORIES[activeSection];
                    const subcats = currentCatInfo?.subcategories || [];
                    const selectedSubcatObj = activeSubcategory !== 'all'
                        ? subcats.find(s => s.id === Number(activeSubcategory))
                        : undefined;

                    // Group already-created products by their specified subcategory
                    const subcatGroups = (activeSubcategory === 'all' ? subcats : subcats.filter(s => s.id === Number(activeSubcategory)))
                        .map(sub => ({
                            sub,
                            items: sectionProducts.filter(p => Number(p.subcategoria_id) === sub.id)
                        }))
                        .filter(g => activeSubcategory !== 'all' || g.items.length > 0);

                    const unassignedItems = activeSubcategory === 'all'
                        ? sectionProducts.filter(p => !subcats.some(s => s.id === Number(p.subcategoria_id)))
                        : [];

                    return (
                        <div className="space-y-6">
                            {/* Section Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-black text-[#5F2142] dark:text-[#FFC99C] tracking-tight">
                                        Agregar Productos
                                    </h1>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        Organizado por sección y por la categoría especificada al momento de la creación. Hasta 10 imágenes por producto.
                                    </p>
                                </div>

                                <button
                                    onClick={() => openCreateProductModal(activeSubcategory !== 'all' ? Number(activeSubcategory) : undefined)}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white font-black text-xs sm:text-sm transition-all hover:scale-105 shadow-md shadow-[#D86A33]/25"
                                >
                                    <Plus size={16} />
                                    <span>
                                        + Nuevo en {currentCatInfo?.title}
                                        {selectedSubcatObj ? ` (${selectedSubcatObj.name})` : ''}
                                    </span>
                                </button>
                            </div>

                            {/* Section Selector Buttons (NO "TODOS") */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                {SECTIONS.map((sec) => {
                                    const isSelected = activeSection === sec.slug;
                                    const count = products.filter(p => p.categoria_slug === sec.slug).length;
                                    const secSubcatsCount = CATEGORIES[sec.slug]?.subcategories.length || 0;
                                    return (
                                        <button
                                            key={sec.slug}
                                            onClick={() => {
                                                setActiveSection(sec.slug);
                                                setActiveSubcategory('all');
                                            }}
                                            className={`p-3.5 rounded-2xl border text-left transition-all ${
                                                isSelected
                                                    ? 'bg-[#5F2142] text-white border-[#5F2142] shadow-md scale-105'
                                                    : `${bgCard} ${borderDefault} text-gray-700 dark:text-gray-300 hover:border-[#D86A33]`
                                            }`}
                                        >
                                            <div className="text-lg mb-1">{sec.icon}</div>
                                            <div className="font-black text-xs leading-tight line-clamp-1">{sec.label}</div>
                                            <div className={`text-[10px] mt-0.5 font-bold ${isSelected ? 'text-[#FFC99C]' : 'text-gray-400'}`}>
                                                {count} productos • {secSubcatsCount} categorías
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Subcategories / Categorías Especificadas de la Sección Activa */}
                            {subcats.length > 0 && (
                                <div className={`p-4 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs space-y-3`}>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Layers size={15} className="text-[#D86A33]" />
                                            <span className="text-xs font-black uppercase tracking-wider text-[#5F2142] dark:text-[#FFC99C]">
                                                Categorías de {currentCatInfo?.title}:
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-gray-400 font-medium">
                                            Filtra los productos creados o selecciona una categoría para crear uno nuevo
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setActiveSubcategory('all')}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                                                activeSubcategory === 'all'
                                                    ? 'bg-[#5F2142] text-white border-[#5F2142] shadow-xs'
                                                    : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-[#D86A33]'
                                            }`}
                                        >
                                            <span>✦ Todas las categorías de {currentCatInfo?.title}</span>
                                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                                activeSubcategory === 'all' ? 'bg-[#D86A33] text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                                            }`}>
                                                {allSectionProducts.length}
                                            </span>
                                        </button>

                                        {subcats.map(sub => {
                                            const isSubActive = activeSubcategory !== 'all' && Number(activeSubcategory) === sub.id;
                                            const subCount = allSectionProducts.filter(p => Number(p.subcategoria_id) === sub.id).length;
                                            return (
                                                <button
                                                    key={sub.id}
                                                    type="button"
                                                    onClick={() => setActiveSubcategory(sub.id)}
                                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                                                        isSubActive
                                                            ? 'bg-[#D86A33] text-white border-[#D86A33] shadow-xs scale-105'
                                                            : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-[#D86A33]'
                                                    }`}
                                                >
                                                    <span>{sub.name}</span>
                                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                                        isSubActive
                                                            ? 'bg-white/25 text-white'
                                                            : subCount > 0
                                                                ? 'bg-[#5F2142]/10 text-[#5F2142] dark:bg-[#FFC99C]/15 dark:text-[#FFC99C]'
                                                                : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                                                    }`}>
                                                        {subCount}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Search & Minimize / Maximize Control Bar */}
                            <div className={`p-4 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs space-y-3`}>
                                <div className="flex items-center gap-3">
                                    <Search size={17} className="text-gray-400 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder={`Buscar producto en ${currentCatInfo?.title}${selectedSubcatObj ? ` › ${selectedSubcatObj.name}` : ''}...`}
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className={`w-full outline-none text-xs sm:text-sm font-medium ${isDark ? 'bg-transparent text-white' : 'bg-transparent text-gray-900'}`}
                                    />
                                    {activeSubcategory !== 'all' && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveSubcategory('all')}
                                            className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0 hover:bg-gray-200"
                                        >
                                            Ver todas las categorías
                                        </button>
                                    )}
                                </div>

                                {/* Minimize / Maximize Products & Categories Toolbar */}
                                {sectionProducts.length > 0 && (
                                    <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 text-xs">
                                        <div className="flex items-center gap-2 flex-1 max-w-md">
                                            <Eye size={14} className="text-[#D86A33] shrink-0" />
                                            <select
                                                defaultValue=""
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        selectOnlyProductToMaximize(e.target.value, sectionProducts);
                                                    }
                                                }}
                                                className={`w-full px-3 py-1.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${inputStyle}`}
                                            >
                                                <option value="">Seleccionar producto para visualizar (minimiza el resto)...</option>
                                                {sectionProducts.map(p => {
                                                    const scName = subcats.find(s => s.id === Number(p.subcategoria_id))?.name || 'General';
                                                    return (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name} ({scName}) — ${p.price.toFixed(2)}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => minimizeAllProducts(sectionProducts)}
                                                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#5F2142] text-gray-700 dark:text-gray-200 font-bold text-[11px] inline-flex items-center gap-1 bg-gray-50 dark:bg-white/5 transition-all"
                                                title="Minimizar las filas de todos los productos"
                                            >
                                                <ChevronUp size={13} />
                                                <span>Minimizar Productos ▲</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={maximizeAllProducts}
                                                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#D86A33] text-[#5F2142] dark:text-[#FFC99C] font-black text-[11px] inline-flex items-center gap-1 bg-gray-50 dark:bg-white/5 transition-all"
                                                title="Maximizar todos los productos y categorías"
                                            >
                                                <ChevronDown size={13} />
                                                <span>Maximizar Productos ▼</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => collapseAllCategories(subcats)}
                                                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#5F2142] text-gray-600 dark:text-gray-300 font-bold text-[11px] inline-flex items-center gap-1 bg-white dark:bg-neutral-800 transition-all"
                                                title="Contraer todos los bloques de categoría"
                                            >
                                                <ChevronUp size={13} />
                                                <span>Minimizar Categorías</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={expandAllCategories}
                                                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#D86A33] text-gray-600 dark:text-gray-300 font-bold text-[11px] inline-flex items-center gap-1 bg-white dark:bg-neutral-800 transition-all"
                                                title="Expandir todos los bloques de categoría"
                                            >
                                                <ChevronDown size={13} />
                                                <span>Maximizar Categorías</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Products Grouped by Category Specified at Creation */}
                            {sectionProducts.length === 0 ? (
                                <div className={`rounded-3xl ${bgCard} border ${borderDefault} shadow-xs p-14 text-center text-gray-500`}>
                                    <p className="font-bold text-sm text-gray-700 dark:text-gray-200">
                                        No hay productos creados en {currentCatInfo?.title}
                                        {selectedSubcatObj ? ` › Categoría "${selectedSubcatObj.name}"` : ''}.
                                    </p>
                                    <button
                                        onClick={() => openCreateProductModal(activeSubcategory !== 'all' ? Number(activeSubcategory) : undefined)}
                                        className="mt-3 px-5 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white font-black text-xs shadow-xs"
                                    >
                                        + Crear Producto en {selectedSubcatObj ? selectedSubcatObj.name : currentCatInfo?.title}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {subcatGroups.map(({ sub, items }) => {
                                        const isCatCollapsed = Boolean(collapsedCategoryIds[sub.id]);
                                        return (
                                            <div key={sub.id} className={`rounded-3xl ${bgCard} border ${borderDefault} shadow-xs overflow-hidden transition-all`}>
                                                {/* Category Group Header */}
                                                <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/60 dark:bg-white/3 flex flex-wrap items-center justify-between gap-3">
                                                    <div
                                                        onClick={() => toggleCategoryCollapsed(sub.id)}
                                                        className="flex flex-wrap items-center gap-2 cursor-pointer select-none"
                                                        title={isCatCollapsed ? 'Haz clic para maximizar esta categoría' : 'Haz clic para minimizar esta categoría'}
                                                    >
                                                        <span className="px-3 py-1 rounded-full bg-[#5F2142] text-[#FFC99C] text-[11px] font-black uppercase tracking-wider">
                                                            {currentCatInfo?.title}
                                                        </span>
                                                        <span className="text-[#D86A33] font-black">›</span>
                                                        <h3 className="font-black text-sm sm:text-base text-[#5F2142] dark:text-[#FFC99C]">
                                                            Categoría: <span className="text-[#D86A33]">{sub.name}</span>
                                                        </h3>
                                                        <span className="px-2.5 py-0.5 rounded-full bg-[#D86A33]/10 text-[#D86A33] text-xs font-black">
                                                            {items.length} {items.length === 1 ? 'producto creado' : 'productos creados'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCategoryCollapsed(sub.id)}
                                                            className={`px-3 py-1.5 rounded-xl font-black text-[11px] inline-flex items-center gap-1 transition-all border ${
                                                                isCatCollapsed
                                                                    ? 'bg-[#5F2142] text-white border-[#5F2142] shadow-2xs'
                                                                    : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:border-[#D86A33]'
                                                            }`}
                                                        >
                                                            {isCatCollapsed ? (
                                                                <>
                                                                    <ChevronDown size={13} />
                                                                    <span>Maximizar ▼</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ChevronUp size={13} />
                                                                    <span>Minimizar ▲</span>
                                                                </>
                                                            )}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => openCreateProductModal(sub.id)}
                                                            className="px-3.5 py-1.5 rounded-xl bg-[#D86A33] hover:bg-[#c25925] text-white text-[11px] font-black inline-flex items-center gap-1 shadow-2xs transition-all"
                                                        >
                                                            <Plus size={13} />
                                                            <span>Agregar en {sub.name}</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {!isCatCollapsed && (
                                                    items.length === 0 ? (
                                                        <div className="p-8 text-center text-xs text-gray-400">
                                                            Aún no hay productos en la categoría <strong>{sub.name}</strong>.
                                                        </div>
                                                    ) : (
                                                        <div className="overflow-x-auto divide-y divide-gray-100 dark:divide-white/10">
                                                            <table className="w-full text-left border-collapse text-xs">
                                                                <thead>
                                                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50/40 dark:bg-white/2">
                                                                        <th className="py-3 px-5">Producto Creado & Fotos</th>
                                                                        <th className="py-3 px-5">Sección & Categoría Especificada</th>
                                                                        <th className="py-3 px-5 text-center">Stock</th>
                                                                        <th className="py-3 px-5">Precio ($ / Bs.)</th>
                                                                        <th className="py-3 px-5 text-right">Acciones</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                                    {items.map(p => {
                                                                        const imgs = parseImages(p.image_url);
                                                                        const firstImg = imgs[0] || '/cat_gorros.png';
                                                                        const pSubcats = CATEGORIES[p.categoria_slug]?.subcategories || [];
                                                                        const isProdMinimized = Boolean(minimizedProductIds[p.id]);

                                                                        if (isProdMinimized) {
                                                                            return (
                                                                                <tr
                                                                                    key={p.id}
                                                                                    className="bg-gray-50/40 dark:bg-white/2 hover:bg-gray-100/60 dark:hover:bg-white/5 transition-colors"
                                                                                >
                                                                                    <td className="py-2 px-5">
                                                                                        <div
                                                                                            onClick={() => toggleProductMinimized(p.id)}
                                                                                            className="flex items-center gap-2.5 cursor-pointer"
                                                                                        >
                                                                                            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/10 overflow-hidden shrink-0 border border-gray-200 dark:border-white/10">
                                                                                                <img src={firstImg} alt={p.name} className="w-full h-full object-cover" />
                                                                                            </div>
                                                                                            <span className="font-black text-gray-900 dark:text-white text-xs">
                                                                                                {p.name}
                                                                                            </span>
                                                                                        </div>
                                                                                    </td>

                                                                                    <td className="py-2 px-5 whitespace-nowrap">
                                                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#D86A33]/15 text-[#D86A33]">
                                                                                            ✦ {sub.name}
                                                                                        </span>
                                                                                    </td>

                                                                                    <td className="py-2 px-5 text-center whitespace-nowrap">
                                                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                                                            {p.stock !== undefined ? p.stock : 20} uds
                                                                                        </span>
                                                                                    </td>

                                                                                    <td className="py-2 px-5 whitespace-nowrap font-black text-xs text-[#5F2142] dark:text-[#FFC99C]">
                                                                                        ${p.price.toFixed(2)} USD
                                                                                    </td>

                                                                                    <td className="py-2 px-5 text-right whitespace-nowrap">
                                                                                        <div className="inline-flex items-center gap-1.5">
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => toggleProductMinimized(p.id)}
                                                                                                className="px-2.5 py-1 rounded-xl bg-[#5F2142] text-white text-[10px] font-black inline-flex items-center gap-1 shadow-2xs hover:bg-[#481831] transition-all"
                                                                                                title="Maximizar detalles de este producto"
                                                                                            >
                                                                                                <ChevronDown size={11} />
                                                                                                <span>Maximizar ▼</span>
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => openEditProductModal(p)}
                                                                                                className="w-7 h-7 rounded-full border border-gray-200 dark:border-white/10 hover:border-[#D86A33] hover:text-[#D86A33] flex items-center justify-center transition-all bg-white dark:bg-transparent"
                                                                                                title="Editar producto"
                                                                                            >
                                                                                                <Edit2 size={12} />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => setDeleteConfirmId(p.id)}
                                                                                                className="w-7 h-7 rounded-full border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 flex items-center justify-center transition-all bg-white dark:bg-transparent"
                                                                                                title="Eliminar producto"
                                                                                            >
                                                                                                <Trash2 size={12} />
                                                                                            </button>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        }

                                                                        return (
                                                                            <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                                                                <td className="py-3.5 px-5">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden shrink-0 relative flex items-center justify-center border border-gray-200 dark:border-white/10">
                                                                                            <img src={firstImg} alt={p.name} className="w-full h-full object-cover" />
                                                                                            {imgs.length > 1 && (
                                                                                                <span className="absolute bottom-0 right-0 bg-[#5F2142] text-white text-[9px] font-black px-1 rounded-tl">
                                                                                                    +{imgs.length}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                        <div>
                                                                                            <div className="font-black text-gray-900 dark:text-white text-xs sm:text-sm">{p.name}</div>
                                                                                            <div className="text-[11px] text-gray-500 line-clamp-1 max-w-md">{p.description}</div>
                                                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#5F2142]/10 text-[#5F2142] dark:bg-[#FFC99C]/10 dark:text-[#FFC99C]">
                                                                                                    {CATEGORIES[p.categoria_slug]?.title}
                                                                                                </span>
                                                                                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#D86A33]/15 text-[#D86A33]">
                                                                                                    ✦ {sub.name}
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>

                                                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                                                    <div className="space-y-1">
                                                                                        <span className="block text-[10px] font-bold uppercase text-gray-400">
                                                                                            {CATEGORIES[p.categoria_slug]?.title} › Categoría:
                                                                                        </span>
                                                                                        <select
                                                                                            value={p.subcategoria_id || ''}
                                                                                            onChange={(e) => handleChangeProductSubcategory(p, Number(e.target.value))}
                                                                                            className={`px-3 py-1.5 rounded-xl border text-xs font-black outline-none cursor-pointer transition-all hover:border-[#D86A33] ${inputStyle}`}
                                                                                            title="Cambiar categoría especificada de este producto"
                                                                                        >
                                                                                            {pSubcats.map(sc => (
                                                                                                <option key={sc.id} value={sc.id}>
                                                                                                    {sc.name}
                                                                                                </option>
                                                                                            ))}
                                                                                        </select>
                                                                                    </div>
                                                                                </td>

                                                                                <td className="py-3.5 px-5 text-center whitespace-nowrap">
                                                                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                                                        {p.stock !== undefined ? p.stock : 20} uds
                                                                                    </span>
                                                                                </td>

                                                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                                                    <div className="font-black text-sm text-[#5F2142] dark:text-[#FFC99C]">
                                                                                        ${p.price.toFixed(2)} USD
                                                                                    </div>
                                                                                    <div className="text-[10px] font-bold text-[#D86A33]">
                                                                                        {(p.price * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                                                                                    </div>
                                                                                </td>

                                                                                <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                                                                    <div className="inline-flex items-center gap-2">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => toggleProductMinimized(p.id)}
                                                                                            className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#5F2142] text-gray-600 dark:text-gray-300 text-[10px] font-black inline-flex items-center gap-1 bg-white dark:bg-neutral-800 transition-all"
                                                                                            title="Minimizar este producto"
                                                                                        >
                                                                                            <ChevronUp size={12} />
                                                                                            <span>Minimizar ▲</span>
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => openEditProductModal(p)}
                                                                                            className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 hover:border-[#D86A33] hover:text-[#D86A33] flex items-center justify-center transition-all bg-white dark:bg-transparent"
                                                                                            title="Editar producto y categoría"
                                                                                        >
                                                                                            <Edit2 size={13} />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => setDeleteConfirmId(p.id)}
                                                                                            className="w-8 h-8 rounded-full border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 flex items-center justify-center transition-all bg-white dark:bg-transparent"
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
                                                    )
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Fallback block if any product in this section has no subcategory assigned */}
                                    {unassignedItems.length > 0 && (
                                        <div className={`rounded-3xl ${bgCard} border ${borderDefault} shadow-xs overflow-hidden`}>
                                            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between">
                                                <h3 className="font-black text-sm text-[#5F2142] dark:text-[#FFC99C]">
                                                    {currentCatInfo?.title} › Sin categoría específica asignada ({unassignedItems.length})
                                                </h3>
                                                <span className="text-[11px] text-amber-600 font-bold">
                                                    Selecciona una categoría en el desplegable de cada fila
                                                </span>
                                            </div>
                                            <div className="overflow-x-auto divide-y divide-gray-100 dark:divide-white/10">
                                                <table className="w-full text-left border-collapse text-xs">
                                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                        {unassignedItems.map(p => {
                                                            const imgs = parseImages(p.image_url);
                                                            const firstImg = imgs[0] || '/cat_gorros.png';
                                                            const pSubcats = CATEGORIES[p.categoria_slug]?.subcategories || [];
                                                            return (
                                                                <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                                                                    <td className="py-3.5 px-5">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden shrink-0">
                                                                                <img src={firstImg} alt={p.name} className="w-full h-full object-cover" />
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-black text-gray-900 dark:text-white">{p.name}</div>
                                                                                <div className="text-[11px] text-gray-500 line-clamp-1">{p.description}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3.5 px-5">
                                                                        <select
                                                                            value={p.subcategoria_id || ''}
                                                                            onChange={(e) => handleChangeProductSubcategory(p, Number(e.target.value))}
                                                                            className={`px-3 py-1.5 rounded-xl border text-xs font-black outline-none ${inputStyle}`}
                                                                        >
                                                                            <option value="">-- Asignar categoría --</option>
                                                                            {pSubcats.map(sc => (
                                                                                <option key={sc.id} value={sc.id}>{sc.name}</option>
                                                                            ))}
                                                                        </select>
                                                                    </td>
                                                                    <td className="py-3.5 px-5 font-black text-[#5F2142] dark:text-[#FFC99C]">
                                                                        ${p.price.toFixed(2)}
                                                                    </td>
                                                                    <td className="py-3.5 px-5 text-right">
                                                                        <button
                                                                            onClick={() => openEditProductModal(p)}
                                                                            className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 hover:border-[#D86A33] inline-flex items-center justify-center mr-2"
                                                                        >
                                                                            <Edit2 size={13} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setDeleteConfirmId(p.id)}
                                                                            className="w-8 h-8 rounded-full border border-red-200 text-red-600 inline-flex items-center justify-center"
                                                                        >
                                                                            <Trash2 size={13} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })()}

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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                onClick={() => setActiveTab('facturado')}
                                className={`p-6 rounded-3xl ${bgCard} border ${borderDefault} text-left hover:scale-[1.01] transition-all flex items-center justify-between`}
                            >
                                <div>
                                    <h4 className="font-black text-lg text-[#5F2142] dark:text-[#FFC99C]">Ir a Facturado</h4>
                                    <p className="text-xs text-gray-500 mt-1">Verifica pagos recibidos y emite facturas en PDF.</p>
                                </div>
                                <ChevronRight size={20} className="text-[#D86A33]" />
                            </button>

                            <button
                                onClick={() => setActiveTab('reportes')}
                                className={`p-6 rounded-3xl ${bgCard} border ${borderDefault} text-left hover:scale-[1.01] transition-all flex items-center justify-between`}
                            >
                                <div>
                                    <h4 className="font-black text-lg text-[#5F2142] dark:text-[#FFC99C]">Módulo de Reportes</h4>
                                    <p className="text-xs text-gray-500 mt-1">Genera reportes PDF y Excel de Facturado, Taller y Stock.</p>
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
                {/* TAB: MÓDULO DE REPORTES (Facturado, Taller, Stock)        */}
                {/* ========================================================= */}
                {activeTab === 'reportes' && (() => {
                    // 1. Filtered Orders for Reporte de Facturado
                    const repFacturadoOrders = orders.filter(o => {
                        const d = new Date(o.created_at);
                        if (reportDateFrom) {
                            const from = new Date(reportDateFrom + 'T00:00:00');
                            if (d < from) return false;
                        }
                        if (reportDateTo) {
                            const to = new Date(reportDateTo + 'T23:59:59');
                            if (d > to) return false;
                        }
                        if (reportPayStatus !== 'all') {
                            if (normalizeStatus(o.estado_pago) !== reportPayStatus) return false;
                        }
                        if (reportPayMethod !== 'all') {
                            if (o.metodo_pago !== reportPayMethod) return false;
                        }
                        return true;
                    });

                    // 2. Filtered Orders for Reporte de Taller
                    const repTallerOrders = orders.filter(o => {
                        if (reportWorkshopStatus === 'activos' && o.pedido_cerrado) return false;
                        if (reportWorkshopStatus === 'cerrados' && !o.pedido_cerrado) return false;
                        if (reportWorkshopStage !== 'all') {
                            const st = o.estado_taller || getDefaultWorkshopStatus(o.items, o.tipo_entrega);
                            if (st !== reportWorkshopStage) return false;
                        }
                        if (reportWorkshopDelivery !== 'all') {
                            if (o.tipo_entrega !== reportWorkshopDelivery) return false;
                        }
                        return true;
                    });

                    // 3. Filtered Products for Reporte de Productos en Stock
                    const repStockProducts = products.filter(p => {
                        if (reportStockSection !== 'all' && p.categoria_slug !== reportStockSection) return false;
                        if (reportStockSubcategory !== 'all' && Number(p.subcategoria_id) !== Number(reportStockSubcategory)) return false;
                        const qty = p.stock !== undefined ? Number(p.stock) : 20;
                        if (reportStockFilter === 'in_stock' && qty <= 0) return false;
                        if (reportStockFilter === 'low_stock' && qty > 5) return false;
                        return true;
                    });

                    return (
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-[#5F2142] text-white flex items-center justify-center shadow-md shadow-[#5F2142]/20">
                                        <BarChart3 size={22} />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-black text-[#5F2142] dark:text-[#FFC99C] tracking-tight">
                                            Centro de Reportes Oficiales
                                        </h1>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            Genera y descarga reportes en PDF y Excel/CSV de Facturado, Taller y Productos en Stock.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('configuracion');
                                        setConfigSubTab('correlativo_pdf');
                                    }}
                                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${borderDefault} ${bgCard} text-xs font-black text-[#5F2142] dark:text-[#FFC99C] hover:border-[#D86A33] transition-all`}
                                >
                                    <Settings size={14} className="text-[#D86A33]" />
                                    <span>Personalizar Diseño de PDFs y Correlativo</span>
                                </button>
                            </div>

                            {/* Selector of the 3 Report Types */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    {
                                        id: 'facturado',
                                        title: '1. Reporte de Facturado',
                                        subtitle: 'Ventas, ingresos en $ y Bs., métodos de pago y estatus',
                                        count: `${repFacturadoOrders.length} facturas`,
                                        icon: FileText
                                    },
                                    {
                                        id: 'taller',
                                        title: '2. Reporte de Taller y Pedidos',
                                        subtitle: 'Producción, etapas de confección, entregas y cierres',
                                        count: `${repTallerOrders.length} pedidos`,
                                        icon: Scissors
                                    },
                                    {
                                        id: 'stock',
                                        title: '3. Reporte de Productos en Stock',
                                        subtitle: 'Inventario por sección, cantidades y valoración USD/Bs',
                                        count: `${repStockProducts.length} productos`,
                                        icon: Package
                                    }
                                ].map(card => {
                                    const Icon = card.icon;
                                    const active = reportType === card.id;
                                    return (
                                        <button
                                            key={card.id}
                                            type="button"
                                            onClick={() => setReportType(card.id as any)}
                                            className={`p-5 rounded-3xl border-2 text-left transition-all flex flex-col justify-between ${
                                                active
                                                    ? 'bg-[#5F2142] text-white border-[#5F2142] shadow-xl shadow-[#5F2142]/20 scale-[1.01]'
                                                    : `${bgCard} ${borderDefault} hover:border-[#D86A33]`
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                                                    active ? 'bg-white/15 text-[#FFC99C]' : 'bg-[#FFF4EB] dark:bg-white/10 text-[#D86A33]'
                                                }`}>
                                                    <Icon size={20} />
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                                    active ? 'bg-[#D86A33] text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                                                }`}>
                                                    {card.count}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-black text-base">{card.title}</div>
                                                <div className={`text-xs mt-1 ${active ? 'text-white/80' : 'text-gray-500'}`}>
                                                    {card.subtitle}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* ========================================== */}
                            {/* REPORT 1: REPORTE DE FACTURADO             */}
                            {/* ========================================== */}
                            {reportType === 'facturado' && (
                                <div className="space-y-5">
                                    {/* Filters & Export Bar */}
                                    <div className={`p-5 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs space-y-4`}>
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/10">
                                            <div>
                                                <h3 className="font-black text-base text-[#5F2142] dark:text-[#FFC99C]">
                                                    Parámetros del Reporte de Facturado
                                                </h3>
                                                <p className="text-xs text-gray-500">Filtra las facturas por rango de fecha, estatus o método de pago antes de exportar.</p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const filterDesc = `Estatus: ${reportPayStatus.toUpperCase()} | Método: ${reportPayMethod.toUpperCase()} ${reportDateFrom ? `| Desde: ${reportDateFrom}` : ''} ${reportDateTo ? `| Hasta: ${reportDateTo}` : ''}`;
                                                        generateBillingReportPdf(repFacturadoOrders, filterDesc, settings.pdfConfig, bcvRate);
                                                    }}
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white text-xs font-black shadow-md shadow-[#D86A33]/25 transition-all hover:scale-105"
                                                >
                                                    <Printer size={15} />
                                                    <span>Generar PDF de Facturado</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        exportToCsv(
                                                            'Reporte_Facturado_BOHEME',
                                                            ['Factura', 'Fecha', 'Cliente', 'Cedula', 'Telefono', 'Metodo Pago', 'Referencia', 'Estatus', 'Monto USD', 'Tasa BCV', 'Monto Bs'],
                                                            repFacturadoOrders.map(o => [
                                                                o.numero_factura,
                                                                new Date(o.created_at).toLocaleDateString('es-VE'),
                                                                `${o.cliente_nombre} ${o.cliente_apellido}`,
                                                                o.cliente_cedula,
                                                                o.cliente_telefono,
                                                                o.nombre_metodo_pago || o.metodo_pago,
                                                                o.referencia_pago,
                                                                normalizeStatus(o.estado_pago),
                                                                o.monto_usd.toFixed(2),
                                                                o.tasa_bcv,
                                                                o.monto_bs.toFixed(2)
                                                            ])
                                                        );
                                                    }}
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-all"
                                                >
                                                    <FileSpreadsheet size={15} />
                                                    <span>Exportar Excel / CSV</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                            <div>
                                                <label className="block font-black text-gray-500 uppercase text-[10px] mb-1">Fecha Desde</label>
                                                <input
                                                    type="date"
                                                    value={reportDateFrom}
                                                    onChange={(e) => setReportDateFrom(e.target.value)}
                                                    className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-black text-gray-500 uppercase text-[10px] mb-1">Fecha Hasta</label>
                                                <input
                                                    type="date"
                                                    value={reportDateTo}
                                                    onChange={(e) => setReportDateTo(e.target.value)}
                                                    className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-black text-gray-500 uppercase text-[10px] mb-1">Estatus de Factura</label>
                                                <select
                                                    value={reportPayStatus}
                                                    onChange={(e) => setReportPayStatus(e.target.value as any)}
                                                    className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                                >
                                                    <option value="all">Todos los Estatus</option>
                                                    <option value="verificada">Solo Verificadas ✓</option>
                                                    <option value="por_verificar">Solo Por Verificar ⏳</option>
                                                    <option value="rechazada">Solo Rechazadas ✕</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block font-black text-gray-500 uppercase text-[10px] mb-1">Método de Pago</label>
                                                <select
                                                    value={reportPayMethod}
                                                    onChange={(e) => setReportPayMethod(e.target.value)}
                                                    className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                                >
                                                    <option value="all">Todos los Métodos</option>
                                                    <option value="pago_movil">Pago Móvil</option>
                                                    <option value="binance">Binance Pay</option>
                                                    <option value="transferencia">Transferencia Bancaria</option>
                                                    <option value="zelle">Zelle / Divisas</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Table */}
                                    <div className={`rounded-3xl ${bgCard} border ${borderDefault} shadow-xs overflow-hidden`}>
                                        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                                            <span className="font-black text-sm text-[#5F2142] dark:text-[#FFC99C]">
                                                Vista Previa del Reporte ({repFacturadoOrders.length} facturas)
                                            </span>
                                            <span className="font-black text-sm text-[#D86A33]">
                                                Total: ${repFacturadoOrders.reduce((a, b) => a + b.monto_usd, 0).toFixed(2)} USD ≈ Bs. {repFacturadoOrders.reduce((a, b) => a + b.monto_bs, 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-white/5">
                                                        <th className="py-3 px-4">N° Factura</th>
                                                        <th className="py-3 px-4">Fecha</th>
                                                        <th className="py-3 px-4">Cliente</th>
                                                        <th className="py-3 px-4">Método / Ref</th>
                                                        <th className="py-3 px-4">Estatus</th>
                                                        <th className="py-3 px-4 text-right">Monto ($ USD)</th>
                                                        <th className="py-3 px-4 text-right">PDF Individual</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                    {repFacturadoOrders.map(o => (
                                                        <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                                                            <td className="py-3 px-4 font-mono font-black text-[#5F2142] dark:text-[#FFC99C]">{o.numero_factura}</td>
                                                            <td className="py-3 px-4">{new Date(o.created_at).toLocaleDateString('es-VE')}</td>
                                                            <td className="py-3 px-4 font-bold">{o.cliente_nombre} {o.cliente_apellido}</td>
                                                            <td className="py-3 px-4">{o.nombre_metodo_pago || (o.metodo_pago === 'pago_movil' ? 'Pago Móvil' : 'Binance')} ({o.referencia_pago})</td>
                                                            <td className="py-3 px-4 uppercase font-bold text-[10px]">{normalizeStatus(o.estado_pago)}</td>
                                                            <td className="py-3 px-4 text-right font-black">${o.monto_usd.toFixed(2)}</td>
                                                            <td className="py-3 px-4 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => generateInvoicePdf(o, settings.pdfConfig, bcvRate)}
                                                                    className="px-2.5 py-1 rounded-lg bg-[#FFF4EB] dark:bg-white/10 text-[#D86A33] font-black text-[10px] hover:bg-[#D86A33] hover:text-white transition-all"
                                                                >
                                                                    🖨️ Factura PDF
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ========================================== */}
                            {/* REPORT 2: REPORTE DE TALLER Y PEDIDOS      */}
                            {/* ========================================== */}
                            {reportType === 'taller' && (
                                <div className="space-y-5">
                                    <div className={`p-5 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs space-y-4`}>
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/10">
                                            <div>
                                                <h3 className="font-black text-base text-[#5F2142] dark:text-[#FFC99C]">
                                                    Parámetros del Reporte de Taller y Producción
                                                </h3>
                                                <p className="text-xs text-gray-500">Filtra por estado de cierre, etapa de confección o modalidad de entrega.</p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const filterDesc = `Estado: ${reportWorkshopStatus.toUpperCase()} | Etapa: ${reportWorkshopStage.toUpperCase()} | Entrega: ${reportWorkshopDelivery.toUpperCase()}`;
                                                        generateWorkshopReportPdf(repTallerOrders, filterDesc, settings.pdfConfig);
                                                    }}
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white text-xs font-black shadow-md shadow-[#D86A33]/25 transition-all hover:scale-105"
                                                >
                                                    <Printer size={15} />
                                                    <span>Generar PDF de Taller</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        exportToCsv(
                                                            'Reporte_Taller_BOHEME',
                                                            ['Factura', 'Fecha', 'Cliente', 'Telefono', 'Modalidad Entrega', 'Destino', 'Etapa Taller', 'Estado Cierre', 'Prendas y Personalizacion'],
                                                            repTallerOrders.map(o => [
                                                                o.numero_factura,
                                                                new Date(o.created_at).toLocaleDateString('es-VE'),
                                                                `${o.cliente_nombre} ${o.cliente_apellido}`,
                                                                o.cliente_telefono,
                                                                o.tipo_entrega === 'local' ? 'Local (Miranda/Colina)' : `Nacional (${o.empresa_envio || 'MRW'})`,
                                                                o.direccion_entrega,
                                                                getStageInfo(o.estado_taller || getDefaultWorkshopStatus(o.items, o.tipo_entrega)).label,
                                                                o.pedido_cerrado ? 'CERRADO' : 'ACTIVO',
                                                                o.items.map(i => `${i.quantity}x ${i.name}${i.nombre_personalizado ? ` [Bordado: ${i.nombre_personalizado}]` : ''}`).join(' | ')
                                                            ])
                                                        );
                                                    }}
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-all"
                                                >
                                                    <FileSpreadsheet size={15} />
                                                    <span>Exportar Excel / CSV</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                            <div>
                                                <label className="block font-black text-gray-500 uppercase text-[10px] mb-1">Estado del Pedido</label>
                                                <select
                                                    value={reportWorkshopStatus}
                                                    onChange={(e) => setReportWorkshopStatus(e.target.value as any)}
                                                    className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                                >
                                                    <option value="todos">Todos los Pedidos ({orders.length})</option>
                                                    <option value="activos">Solo Activos en Taller ({totalTallerActivos})</option>
                                                    <option value="cerrados">Solo Pedidos Cerrados ({totalTallerCerrados})</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block font-black text-gray-500 uppercase text-[10px] mb-1">Etapa de Producción</label>
                                                <select
                                                    value={reportWorkshopStage}
                                                    onChange={(e) => setReportWorkshopStage(e.target.value)}
                                                    className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                                >
                                                    <option value="all">Todas las Etapas</option>
                                                    {Object.values(WORKSHOP_STAGES).map(st => (
                                                        <option key={st.key} value={st.key}>{st.icon} {st.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block font-black text-gray-500 uppercase text-[10px] mb-1">Modalidad de Entrega</label>
                                                <select
                                                    value={reportWorkshopDelivery}
                                                    onChange={(e) => setReportWorkshopDelivery(e.target.value as any)}
                                                    className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                                >
                                                    <option value="all">Todas las Entregas</option>
                                                    <option value="local">🏠 Entrega Local (Mcpio. Miranda / Colina)</option>
                                                    <option value="nacional">📦 Envío Nacional (MRW / Zoom / Tealca)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Table */}
                                    <div className={`rounded-3xl ${bgCard} border ${borderDefault} shadow-xs overflow-hidden`}>
                                        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                                            <span className="font-black text-sm text-[#5F2142] dark:text-[#FFC99C]">
                                                Vista Previa de Taller ({repTallerOrders.length} pedidos)
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-white/5">
                                                        <th className="py-3 px-4">Factura</th>
                                                        <th className="py-3 px-4">Cliente</th>
                                                        <th className="py-3 px-4">Prendas & Personalización</th>
                                                        <th className="py-3 px-4">Entrega</th>
                                                        <th className="py-3 px-4">Etapa Actual</th>
                                                        <th className="py-3 px-4">Cierre</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                    {repTallerOrders.map(o => {
                                                        const stInfo = getStageInfo(o.estado_taller || getDefaultWorkshopStatus(o.items, o.tipo_entrega));
                                                        return (
                                                            <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                                                                <td className="py-3 px-4 font-mono font-black text-[#5F2142] dark:text-[#FFC99C]">{o.numero_factura}</td>
                                                                <td className="py-3 px-4 font-bold">{o.cliente_nombre} {o.cliente_apellido}</td>
                                                                <td className="py-3 px-4">
                                                                    {o.items.map((it, i) => (
                                                                        <div key={i}>
                                                                            • {it.quantity}x {it.name}
                                                                            {it.nombre_personalizado && <span className="text-[#D86A33] font-bold"> ({it.nombre_personalizado})</span>}
                                                                        </div>
                                                                    ))}
                                                                </td>
                                                                <td className="py-3 px-4">{o.tipo_entrega === 'local' ? '🏠 Local (Miranda/Colina)' : `📦 ${o.empresa_envio || 'Nacional'}`}</td>
                                                                <td className="py-3 px-4 font-bold">{stInfo.icon} {stInfo.label}</td>
                                                                <td className="py-3 px-4">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${o.pedido_cerrado ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                                        {o.pedido_cerrado ? '✓ Cerrado' : 'Activo'}
                                                                    </span>
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

                            {/* ========================================== */}
                            {/* REPORT 3: REPORTE DE PRODUCTOS EN STOCK    */}
                            {/* ========================================== */}
                            {reportType === 'stock' && (
                                <div className="space-y-5">
                                    <div className={`p-5 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs space-y-4`}>
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/10">
                                            <div>
                                                <h3 className="font-black text-base text-[#5F2142] dark:text-[#FFC99C]">
                                                    Parámetros del Reporte de Productos en Stock
                                                </h3>
                                                <p className="text-xs text-gray-500">Genera el inventario detallado por sección con valoración en Dólares ($) y Bolívares (BCV).</p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const secTitle = reportStockSection === 'all' ? 'Todas las Secciones' : (CATEGORIES[reportStockSection]?.title || reportStockSection);
                                                        generateStockReportPdf(repStockProducts, secTitle, settings.pdfConfig, bcvRate);
                                                    }}
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white text-xs font-black shadow-md shadow-[#D86A33]/25 transition-all hover:scale-105"
                                                >
                                                    <Printer size={15} />
                                                    <span>Generar PDF de Productos en Stock</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        exportToCsv(
                                                            'Reporte_Stock_Productos_BOHEME',
                                                            ['ID', 'Producto', 'Seccion', 'Categoria Especificada', 'Stock Disponible', 'Precio Unit USD', 'Precio Unit Bs BCV', 'Valor Total Stock USD'],
                                                            repStockProducts.map(p => {
                                                                const qty = p.stock !== undefined ? Number(p.stock) : 20;
                                                                const subcatName = CATEGORIES[p.categoria_slug]?.subcategories.find(s => s.id === Number(p.subcategoria_id))?.name || 'General';
                                                                return [
                                                                    p.id,
                                                                    p.name,
                                                                    CATEGORIES[p.categoria_slug]?.title || p.categoria_slug,
                                                                    subcatName,
                                                                    qty,
                                                                    p.price.toFixed(2),
                                                                    (p.price * bcvRate).toFixed(2),
                                                                    (p.price * qty).toFixed(2)
                                                                ];
                                                            })
                                                        );
                                                    }}
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-all"
                                                >
                                                    <FileSpreadsheet size={15} />
                                                    <span>Exportar Excel / CSV</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                            <div>
                                                <label className="block font-black text-gray-500 uppercase text-[10px] mb-1">Filtrar por Sección</label>
                                                <select
                                                    value={reportStockSection}
                                                    onChange={(e) => {
                                                        setReportStockSection(e.target.value);
                                                        setReportStockSubcategory('all');
                                                    }}
                                                    className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                                >
                                                    <option value="all">Todas las Secciones ({products.length} productos)</option>
                                                    {SECTIONS.map(s => (
                                                        <option key={s.slug} value={s.slug}>{s.icon} {s.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block font-black text-gray-500 uppercase text-[10px] mb-1">Filtrar por Categoría</label>
                                                <select
                                                    value={reportStockSubcategory}
                                                    onChange={(e) => setReportStockSubcategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                                    className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                                >
                                                    <option value="all">Todas las Categorías</option>
                                                    {reportStockSection !== 'all'
                                                        ? (CATEGORIES[reportStockSection]?.subcategories || []).map(sc => (
                                                            <option key={sc.id} value={sc.id}>{sc.name}</option>
                                                        ))
                                                        : Object.values(CATEGORIES).flatMap(cat =>
                                                            cat.subcategories.map(sc => (
                                                                <option key={`${cat.id}-${sc.id}`} value={sc.id}>
                                                                    {cat.title} › {sc.name}
                                                                </option>
                                                            ))
                                                        )
                                                    }
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block font-black text-gray-500 uppercase text-[10px] mb-1">Disponibilidad de Stock</label>
                                                <select
                                                    value={reportStockFilter}
                                                    onChange={(e) => setReportStockFilter(e.target.value as any)}
                                                    className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                                >
                                                    <option value="all">Todos los Productos</option>
                                                    <option value="in_stock">Con Stock Disponible (&gt; 0)</option>
                                                    <option value="low_stock">Stock Bajo / Por Agotarse (≤ 5 uds)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Table */}
                                    <div className={`rounded-3xl ${bgCard} border ${borderDefault} shadow-xs overflow-hidden`}>
                                        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                                            <span className="font-black text-sm text-[#5F2142] dark:text-[#FFC99C]">
                                                Vista Previa de Inventario ({repStockProducts.length} productos)
                                            </span>
                                            <span className="font-black text-sm text-[#D86A33]">
                                                Valor Total Stock: ${repStockProducts.reduce((acc, p) => acc + (p.price * (p.stock !== undefined ? Number(p.stock) : 20)), 0).toFixed(2)} USD
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-white/5">
                                                        <th className="py-3 px-4">Producto</th>
                                                        <th className="py-3 px-4">Sección & Categoría Especificada</th>
                                                        <th className="py-3 px-4 text-center">Stock</th>
                                                        <th className="py-3 px-4 text-right">Precio ($ USD)</th>
                                                        <th className="py-3 px-4 text-right">Equivalente (Bs.)</th>
                                                        <th className="py-3 px-4 text-right">Editar Stock</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                    {repStockProducts.map(p => {
                                                        const qty = p.stock !== undefined ? Number(p.stock) : 20;
                                                        const subcatName = CATEGORIES[p.categoria_slug]?.subcategories.find(s => s.id === Number(p.subcategoria_id))?.name || 'General';
                                                        return (
                                                            <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                                                                <td className="py-3 px-4 font-bold">{p.name}</td>
                                                                <td className="py-3 px-4">
                                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                                        <span className="font-bold text-[#5F2142] dark:text-[#FFC99C]">
                                                                            {CATEGORIES[p.categoria_slug]?.title || p.categoria_slug}
                                                                        </span>
                                                                        <span className="text-gray-400">›</span>
                                                                        <span className="px-2 py-0.5 rounded-md bg-[#D86A33]/15 text-[#D86A33] font-black text-[10px]">
                                                                            ✦ {subcatName}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                                                        qty > 5 ? 'bg-emerald-100 text-emerald-800' : qty > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                                                    }`}>
                                                                        {qty} uds
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4 text-right font-black text-[#5F2142] dark:text-[#FFC99C]">${p.price.toFixed(2)}</td>
                                                                <td className="py-3 px-4 text-right">Bs. {(p.price * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                                <td className="py-3 px-4 text-right">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openEditProductModal(p)}
                                                                        className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10 hover:border-[#D86A33] text-xs font-bold"
                                                                    >
                                                                        Ajustar
                                                                    </button>
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
                        </div>
                    );
                })()}

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
                                    Control total sin código: Cuentas bancarias y de pago, correlativo de factura, diseño de PDFs, estatus y tienda.
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
                                { key: 'pagos', label: 'Cuentas Bancarias y de Pago', icon: CreditCard, badge: 2 + (settings.cuentasAdicionales?.length || 0) },
                                { key: 'usuarios', label: 'Usuarios & Accesos', icon: User, badge: (settings.usuarios || []).length },
                                { key: 'correlativo_pdf', label: 'Correlativo & PDFs (Facturas/Reportes)', icon: Printer },
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
                                            {isSavingSettings ? 'Guardando...' : 'Guardar Cuentas Principales'}
                                        </button>
                                    </div>
                                </form>

                                {/* Additional Bank & Payment Accounts Section */}
                                <div className={`p-6 sm:p-7 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs space-y-5`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-white/10">
                                        <div>
                                            <h3 className="font-black text-base text-[#5F2142] dark:text-[#FFC99C] flex items-center gap-2">
                                                <CreditCard size={18} className="text-[#D86A33]" />
                                                <span>Cuentas Bancarias o de Pago Adicionales ({settings.cuentasAdicionales?.length || 0})</span>
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Agrega otras cuentas de Transferencia Bancaria, Pago Móvil secundario, Zelle, Zinli, PayPal o Efectivo para que aparezcan en el Checkout.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={openAddExtraAccountModal}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5F2142] hover:bg-[#43142e] text-white text-xs font-black shadow-md shadow-[#5F2142]/20 transition-all hover:scale-105 shrink-0"
                                        >
                                            <Plus size={15} />
                                            <span>+ Agregar Otra Cuenta Bancaria o de Pago</span>
                                        </button>
                                    </div>

                                    {(!settings.cuentasAdicionales || settings.cuentasAdicionales.length === 0) ? (
                                        <div className={`p-8 rounded-2xl ${bgSubCard} border border-dashed ${borderDefault} text-center space-y-2`}>
                                            <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                                No has agregado cuentas bancarias o métodos de pago adicionales todavía.
                                            </p>
                                            <p className="text-[11px] text-gray-400">
                                                Haz clic en &quot;+ Agregar Otra Cuenta Bancaria o de Pago&quot; para añadir Transferencias Nacionales, otro Pago Móvil, Zelle, Zinli, etc.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {settings.cuentasAdicionales.map(acc => (
                                                <div
                                                    key={acc.id}
                                                    className={`p-5 rounded-2xl border transition-all space-y-3 text-xs ${
                                                        acc.activo
                                                            ? `${bgSubCard} border-[#D86A33]/40`
                                                            : 'bg-gray-100/60 dark:bg-white/5 border-gray-200 dark:border-white/10 opacity-70'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-gray-200/60 dark:border-white/10">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-black text-sm text-[#5F2142] dark:text-[#FFC99C]">
                                                                    {acc.nombreMetodo}
                                                                </span>
                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                                                    acc.moneda === 'BS' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                                                                }`}>
                                                                    {acc.moneda}
                                                                </span>
                                                            </div>
                                                            <div className="text-[11px] text-gray-500 font-bold">
                                                                {acc.bancoOPlataforma} {acc.tipoCuenta ? `• ${acc.tipoCuenta}` : ''}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleExtraAccountActive(acc.id)}
                                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                                                                    acc.activo
                                                                        ? 'bg-emerald-600 text-white'
                                                                        : 'bg-gray-300 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                                                                }`}
                                                            >
                                                                {acc.activo ? 'Activa ✓' : 'Inactiva'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditExtraAccountModal(acc)}
                                                                className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:border-[#D86A33] text-[#D86A33]"
                                                                title="Editar cuenta"
                                                            >
                                                                <Edit2 size={13} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteExtraAccount(acc.id)}
                                                                className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50"
                                                                title="Eliminar cuenta"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1 text-[11px]">
                                                        <div><strong>Titular:</strong> {acc.titular}</div>
                                                        {acc.numeroCuentaOCorreo && <div><strong>Cuenta / Correo / ID:</strong> <span className="font-mono font-bold">{acc.numeroCuentaOCorreo}</span></div>}
                                                        {acc.telefono && <div><strong>Teléfono:</strong> {acc.telefono}</div>}
                                                        {acc.cedulaORif && <div><strong>Cédula / RIF:</strong> {acc.cedulaORif}</div>}
                                                        {acc.instrucciones && <div className="text-gray-500 italic">Nota: {acc.instrucciones}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Live Customer Preview Card */}
                                <div className={`p-6 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs space-y-3`}>
                                    <h4 className="text-xs font-black text-[#5F2142] dark:text-[#FFC99C] uppercase tracking-wider">
                                        Vista Previa en Vivo (Todas las Cuentas Activas en Checkout)
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                                        {settings.pagoMovil.activo && (
                                            <div className={`p-4 rounded-2xl ${bgSubCard} border ${borderDefault} space-y-1.5`}>
                                                <div className="font-bold text-blue-700 dark:text-blue-300">Pago Móvil Principal:</div>
                                                <div><strong>Banco:</strong> {settings.pagoMovil.banco}</div>
                                                <div><strong>Teléfono:</strong> {settings.pagoMovil.telefono}</div>
                                                <div><strong>Cédula:</strong> {settings.pagoMovil.cedula}</div>
                                                <div><strong>Titular:</strong> {settings.pagoMovil.titular}</div>
                                            </div>
                                        )}
                                        {settings.binance.activo && (
                                            <div className={`p-4 rounded-2xl ${bgSubCard} border ${borderDefault} space-y-1.5`}>
                                                <div className="font-bold text-amber-700 dark:text-amber-300">Binance Pay Principal:</div>
                                                <div><strong>Correo:</strong> {settings.binance.email}</div>
                                                {settings.binance.payId && <div><strong>Pay ID:</strong> {settings.binance.payId}</div>}
                                                <div><strong>Titular:</strong> {settings.binance.titular || 'BOHEME'}</div>
                                            </div>
                                        )}
                                        {(settings.cuentasAdicionales || []).filter(c => c.activo).map(c => (
                                            <div key={c.id} className={`p-4 rounded-2xl ${bgSubCard} border ${borderDefault} space-y-1.5`}>
                                                <div className="font-bold text-[#D86A33]">{c.nombreMetodo} ({c.moneda}):</div>
                                                <div><strong>Banco/Red:</strong> {c.bancoOPlataforma}</div>
                                                {c.numeroCuentaOCorreo && <div><strong>Cuenta/Correo:</strong> {c.numeroCuentaOCorreo}</div>}
                                                {c.telefono && <div><strong>Teléfono:</strong> {c.telefono}</div>}
                                                {c.cedulaORif && <div><strong>C.I./RIF:</strong> {c.cedulaORif}</div>}
                                                <div><strong>Titular:</strong> {c.titular}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* SUB-TAB NUEVO: CORRELATIVO DE FACTURA & DISEÑO DE PDFs    */}
                        {/* ========================================================= */}
                        {configSubTab === 'correlativo_pdf' && (
                            <form onSubmit={handleSaveSettings} className="space-y-6">
                                {/* 1. Configuración del Número Correlativo de Factura */}
                                <div className={`p-6 sm:p-8 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs space-y-5`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-white/10">
                                        <div>
                                            <h3 className="font-black text-base text-[#5F2142] dark:text-[#FFC99C] flex items-center gap-2">
                                                <Hash size={18} className="text-[#D86A33]" />
                                                <span>Configuración del Número Correlativo de Factura</span>
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Define el prefijo, la cantidad de dígitos y el próximo número correlativo que se asignará automáticamente a cada nueva factura.
                                            </p>
                                        </div>

                                        {/* Live Correlative Preview Badge */}
                                        <div className="px-4 py-2.5 rounded-2xl bg-[#FFF4EB] dark:bg-white/10 border-2 border-[#D86A33] text-right shrink-0">
                                            <span className="text-[10px] font-black uppercase text-gray-500 block">Próxima Factura a Emitir:</span>
                                            <span className="font-mono font-black text-lg text-[#5F2142] dark:text-[#FFC99C]">
                                                {(settings.correlativo?.prefijo ?? 'BHM-')}
                                                {String(settings.correlativo?.proximoNumero ?? 1003).padStart(Math.max(1, Number(settings.correlativo?.digitosMinimos) || 4), '0')}
                                                {(settings.correlativo?.sufijo ?? '')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                        <div>
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                Prefijo de Factura
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.correlativo?.prefijo ?? 'BHM-'}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    correlativo: { ...(prev.correlativo || { prefijo: 'BHM-', proximoNumero: 1003, digitosMinimos: 4 }), prefijo: e.target.value }
                                                }))}
                                                placeholder="Ej: BHM- o FAC-"
                                                className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold ${inputStyle}`}
                                            />
                                            <span className="text-[10px] text-gray-400 mt-1 block">Ej: BHM-, FAC-, ORD-</span>
                                        </div>

                                        <div>
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                Próximo Número Correlativo *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={settings.correlativo?.proximoNumero ?? 1003}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    correlativo: { ...(prev.correlativo || { prefijo: 'BHM-', proximoNumero: 1003, digitosMinimos: 4 }), proximoNumero: Number(e.target.value) }
                                                }))}
                                                className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-black text-[#D86A33] ${inputStyle}`}
                                            />
                                            <span className="text-[10px] text-gray-400 mt-1 block">Se incrementa +1 en cada compra</span>
                                        </div>

                                        <div>
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                Dígitos Mínimos (Ceros)
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={settings.correlativo?.digitosMinimos ?? 4}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    correlativo: { ...(prev.correlativo || { prefijo: 'BHM-', proximoNumero: 1003, digitosMinimos: 4 }), digitosMinimos: Number(e.target.value) }
                                                }))}
                                                className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                            />
                                            <span className="text-[10px] text-gray-400 mt-1 block">Ej: 4 dígitos = 0001 / 1003</span>
                                        </div>

                                        <div>
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                Sufijo Opcional
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.correlativo?.sufijo ?? ''}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    correlativo: { ...(prev.correlativo || { prefijo: 'BHM-', proximoNumero: 1003, digitosMinimos: 4 }), sufijo: e.target.value }
                                                }))}
                                                placeholder="Opcional (Ej: -2026)"
                                                className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold ${inputStyle}`}
                                            />
                                            <span className="text-[10px] text-gray-400 mt-1 block">Déjalo vacío si no usas sufijo</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Configuración Global de PDFs (Facturas, Reportes de Facturado, Taller y Stock) */}
                                <div className={`p-6 sm:p-8 rounded-3xl ${bgCard} border ${borderDefault} shadow-xs space-y-5`}>
                                    <div className="pb-4 border-b border-gray-100 dark:border-white/10">
                                        <h3 className="font-black text-base text-[#5F2142] dark:text-[#FFC99C] flex items-center gap-2">
                                            <Printer size={18} className="text-[#D86A33]" />
                                            <span>Configuración de Plantillas PDF (Facturas y Todos los Reportes)</span>
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Personaliza el membrete fiscal, colores, firmas, sellos y pies de página de las Facturas PDF y de los Reportes de Facturado, Taller y Stock.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                Nombre o Razón Social en el Membrete PDF *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={settings.pdfConfig?.nombreEmpresa ?? 'BOHEME • Indumentaria & Equipos Médicos'}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    pdfConfig: { ...prev.pdfConfig, nombreEmpresa: e.target.value }
                                                }))}
                                                className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                RIF / Documento Fiscal en PDF *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={settings.pdfConfig?.rifEmpresa ?? 'V-24.354.847'}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    pdfConfig: { ...prev.pdfConfig, rifEmpresa: e.target.value }
                                                }))}
                                                className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                Teléfono de Contacto en PDF
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.pdfConfig?.telefonoContacto ?? '0412-1409976'}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    pdfConfig: { ...prev.pdfConfig, telefonoContacto: e.target.value }
                                                }))}
                                                className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                Correo Electrónico en PDF
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.pdfConfig?.emailContacto ?? 'worldglobalweb724@gmail.com'}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    pdfConfig: { ...prev.pdfConfig, emailContacto: e.target.value }
                                                }))}
                                                className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                Dirección Fiscal / Ubicación en Membrete PDF
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.pdfConfig?.direccionFiscal ?? ''}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    pdfConfig: { ...prev.pdfConfig, direccionFiscal: e.target.value }
                                                }))}
                                                className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Titles & Footers for Invoices vs Reports */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-gray-100 dark:border-white/10">
                                        <div>
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                Título de Encabezado para Facturas PDF
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.pdfConfig?.encabezadoFactura ?? 'FACTURA / COMPROBANTE DE COMPRA'}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    pdfConfig: { ...prev.pdfConfig, encabezadoFactura: e.target.value }
                                                }))}
                                                className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                Título de Encabezado para Reportes PDF
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.pdfConfig?.encabezadoReporte ?? 'REPORTE OFICIAL DE GESTIÓN ADMINISTRATIVA'}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    pdfConfig: { ...prev.pdfConfig, encabezadoReporte: e.target.value }
                                                }))}
                                                className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                Pie de Página / Condiciones en Facturas PDF
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={settings.pdfConfig?.piePaginaFactura ?? ''}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    pdfConfig: { ...prev.pdfConfig, piePaginaFactura: e.target.value }
                                                }))}
                                                className={`w-full px-3.5 py-2 rounded-xl border font-medium ${inputStyle}`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                Pie de Página en Reportes PDF (Facturado / Taller / Stock)
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={settings.pdfConfig?.piePaginaReporte ?? ''}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    pdfConfig: { ...prev.pdfConfig, piePaginaReporte: e.target.value }
                                                }))}
                                                className={`w-full px-3.5 py-2 rounded-xl border font-medium ${inputStyle}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Page Setup, Colors & Visual Checkboxes */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2 border-t border-gray-100 dark:border-white/10">
                                        <div>
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                Tamaño de Papel
                                            </label>
                                            <select
                                                value={settings.pdfConfig?.tamanoPapel ?? 'letter'}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    pdfConfig: { ...prev.pdfConfig, tamanoPapel: e.target.value as any }
                                                }))}
                                                className={`w-full px-3 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                            >
                                                <option value="letter">Carta (Letter)</option>
                                                <option value="a4">A4 Estándar</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                Orientación de Reportes
                                            </label>
                                            <select
                                                value={settings.pdfConfig?.orientacionReporte ?? 'portrait'}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    pdfConfig: { ...prev.pdfConfig, orientacionReporte: e.target.value as any }
                                                }))}
                                                className={`w-full px-3 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                            >
                                                <option value="portrait">Vertical (Portrait)</option>
                                                <option value="landscape">Horizontal (Landscape)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                Color Principal PDF
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={settings.pdfConfig?.colorPrimario ?? '#5F2142'}
                                                    onChange={(e) => setSettings(prev => ({
                                                        ...prev,
                                                        pdfConfig: { ...prev.pdfConfig, colorPrimario: e.target.value }
                                                    }))}
                                                    className="w-10 h-10 rounded-xl border cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={settings.pdfConfig?.colorPrimario ?? '#5F2142'}
                                                    onChange={(e) => setSettings(prev => ({
                                                        ...prev,
                                                        pdfConfig: { ...prev.pdfConfig, colorPrimario: e.target.value }
                                                    }))}
                                                    className={`w-full px-3 py-2 rounded-xl border font-mono font-bold ${inputStyle}`}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                                Color Acento PDF
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={settings.pdfConfig?.colorAcento ?? '#D86A33'}
                                                    onChange={(e) => setSettings(prev => ({
                                                        ...prev,
                                                        pdfConfig: { ...prev.pdfConfig, colorAcento: e.target.value }
                                                    }))}
                                                    className="w-10 h-10 rounded-xl border cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={settings.pdfConfig?.colorAcento ?? '#D86A33'}
                                                    onChange={(e) => setSettings(prev => ({
                                                        ...prev,
                                                        pdfConfig: { ...prev.pdfConfig, colorAcento: e.target.value }
                                                    }))}
                                                    className={`w-full px-3 py-2 rounded-xl border font-mono font-bold ${inputStyle}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual Toggles */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                        {[
                                            { key: 'mostrarLogo', label: 'Mostrar Logo BOHEME' },
                                            { key: 'mostrarTasaBcv', label: 'Mostrar Tasa BCV' },
                                            { key: 'mostrarFirmas', label: 'Líneas de Firma y Sello' },
                                            { key: 'mostrarSelloAgua', label: 'Marca de Agua Fondo' }
                                        ].map(opt => (
                                            <label
                                                key={opt.key}
                                                className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer text-xs font-bold ${bgSubCard} ${borderDefault}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={(settings.pdfConfig as any)?.[opt.key] !== false}
                                                    onChange={(e) => setSettings(prev => ({
                                                        ...prev,
                                                        pdfConfig: { ...prev.pdfConfig, [opt.key]: e.target.checked }
                                                    }))}
                                                    className="w-4 h-4 rounded text-[#D86A33] focus:ring-[#D86A33]"
                                                />
                                                <span>{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {/* Quick Test / Preview Buttons & Save */}
                                    <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {orders[0] && (
                                                <button
                                                    type="button"
                                                    onClick={() => generateInvoicePdf(orders[0], settings.pdfConfig, bcvRate)}
                                                    className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#D86A33] text-xs font-bold inline-flex items-center gap-1.5"
                                                >
                                                    <Printer size={13} className="text-[#D86A33]" />
                                                    <span>Vista Previa Factura PDF</span>
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => generateBillingReportPdf(orders, 'Vista Previa General', settings.pdfConfig, bcvRate)}
                                                className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#D86A33] text-xs font-bold inline-flex items-center gap-1.5"
                                            >
                                                <Printer size={13} className="text-[#D86A33]" />
                                                <span>Vista Previa PDF Facturado</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => generateWorkshopReportPdf(orders, 'Vista Previa Taller', settings.pdfConfig)}
                                                className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#D86A33] text-xs font-bold inline-flex items-center gap-1.5"
                                            >
                                                <Printer size={13} className="text-[#D86A33]" />
                                                <span>Vista Previa PDF Taller</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => generateStockReportPdf(products, 'Todo el Catálogo', settings.pdfConfig, bcvRate)}
                                                className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#D86A33] text-xs font-bold inline-flex items-center gap-1.5"
                                            >
                                                <Printer size={13} className="text-[#D86A33]" />
                                                <span>Vista Previa PDF Stock</span>
                                            </button>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSavingSettings}
                                            className="px-6 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white text-xs font-black shadow-md shadow-[#D86A33]/25 transition-all hover:scale-105"
                                        >
                                            {isSavingSettings ? 'Guardando...' : 'Guardar Correlativo y Configuración PDF'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* ========================================================= */}
                        {/* SUB-TAB: GESTIÓN DE USUARIOS Y ACCESOS (Incluye En Uso)   */}
                        {/* ========================================================= */}
                        {configSubTab === 'usuarios' && (() => {
                            const usersList = settings.usuarios || [];
                            const activeUserRecord = usersList.find(u => isCurrentActiveUser(u)) || usersList[0];

                            return (
                                <div className="space-y-6">
                                    {/* Highlight Card: Usuario en Uso Actualmente + Crear Nuevo Usuario */}
                                    <div className={`p-6 sm:p-7 rounded-3xl ${bgCard} border-2 border-[#D86A33]/40 shadow-xs space-y-4`}>
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            <div className="flex items-start sm:items-center gap-3.5">
                                                <div className="w-12 h-12 rounded-2xl bg-[#5F2142] text-[#FFC99C] flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
                                                    <User size={22} />
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                                                            🟢 Usuario en Uso Actualmente
                                                        </span>
                                                        {activeUserRecord && (
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${getRoleBadgeInfo(activeUserRecord.rol).color}`}>
                                                                {getRoleBadgeInfo(activeUserRecord.rol).label}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="font-black text-base sm:text-lg text-[#5F2142] dark:text-[#FFC99C] mt-1">
                                                        {activeUserRecord?.nombre || currentUser.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        Correo de acceso: <strong className="text-gray-800 dark:text-gray-200 font-mono">{activeUserRecord?.email || currentUser.email}</strong>
                                                        {activeUserRecord?.cargo ? ` • ${activeUserRecord.cargo}` : ''}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                {activeUserRecord && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditUserModal(activeUserRecord)}
                                                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#5F2142] hover:bg-[#43142e] text-white text-xs font-black shadow-xs transition-all"
                                                        >
                                                            <Edit2 size={13} />
                                                            <span>Modificar Usuario en Uso</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteUserConfirm(activeUserRecord)}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-black transition-all"
                                                            title="Eliminar el usuario actualmente en uso"
                                                        >
                                                            <Trash2 size={13} />
                                                            <span>Eliminar Usuario Actual</span>
                                                        </button>
                                                    </>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={openCreateUserModal}
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white text-xs font-black shadow-md shadow-[#D86A33]/25 transition-all hover:scale-105"
                                                >
                                                    <Plus size={15} />
                                                    <span>+ Crear Nuevo Usuario</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Users Directory Table */}
                                    <div className={`rounded-3xl ${bgCard} border ${borderDefault} shadow-xs overflow-hidden`}>
                                        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <h3 className="font-black text-base text-[#5F2142] dark:text-[#FFC99C] flex items-center gap-2">
                                                    <Shield size={17} className="text-[#D86A33]" />
                                                    <span>Usuarios Registrados con Acceso al Panel ({usersList.length})</span>
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    Crea, modifica credenciales (correo, clave, nombre, rol) o elimina cualquier usuario, incluido el que tienes en uso actualmente.
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={openCreateUserModal}
                                                className="px-4 py-2 rounded-full bg-[#D86A33]/15 hover:bg-[#D86A33] text-[#D86A33] hover:text-white text-xs font-black transition-all inline-flex items-center gap-1.5"
                                            >
                                                <Plus size={14} />
                                                <span>Agregar Usuario</span>
                                            </button>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50/60 dark:bg-white/5">
                                                        <th className="py-3.5 px-5">Usuario / Cargo</th>
                                                        <th className="py-3.5 px-5">Correo de Acceso</th>
                                                        <th className="py-3.5 px-5">Contraseña</th>
                                                        <th className="py-3.5 px-5">Rol / Permiso</th>
                                                        <th className="py-3.5 px-5 text-center">Estado</th>
                                                        <th className="py-3.5 px-5 text-right">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                    {usersList.map(u => {
                                                        const isCurrent = isCurrentActiveUser(u);
                                                        const roleInfo = getRoleBadgeInfo(u.rol);
                                                        const showPass = Boolean(showUserPasswords[u.id]);

                                                        return (
                                                            <tr
                                                                key={u.id}
                                                                className={`transition-colors ${
                                                                    isCurrent
                                                                        ? 'bg-[#FFF4EB]/60 dark:bg-[#D86A33]/10 hover:bg-[#FFF4EB]'
                                                                        : 'hover:bg-gray-50/50 dark:hover:bg-white/5'
                                                                }`}
                                                            >
                                                                <td className="py-4 px-5">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <span className="font-black text-sm text-[#5F2142] dark:text-[#FFC99C]">
                                                                            {u.nombre}
                                                                        </span>
                                                                        {isCurrent && (
                                                                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider">
                                                                                En uso actual
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-[11px] text-gray-500 mt-0.5">
                                                                        {u.cargo || 'Administración'}
                                                                        {u.telefono ? ` • Tel: ${u.telefono}` : ''}
                                                                    </div>
                                                                </td>

                                                                <td className="py-4 px-5 font-mono font-bold text-gray-800 dark:text-gray-200">
                                                                    {u.email}
                                                                </td>

                                                                <td className="py-4 px-5">
                                                                    <div className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 px-2.5 py-1 rounded-xl">
                                                                        <Key size={12} className="text-[#D86A33]" />
                                                                        <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                                                                            {showPass ? u.password : '••••••••'}
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setShowUserPasswords(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                                                                            className="text-gray-400 hover:text-[#5F2142] dark:hover:text-white ml-1"
                                                                            title={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                                                        >
                                                                            {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                                                                        </button>
                                                                    </div>
                                                                </td>

                                                                <td className="py-4 px-5">
                                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${roleInfo.color}`}>
                                                                        {roleInfo.label}
                                                                    </span>
                                                                </td>

                                                                <td className="py-4 px-5 text-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleToggleUserActive(u)}
                                                                        className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${
                                                                            u.activo !== false
                                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                                                : 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-400'
                                                                        }`}
                                                                    >
                                                                        {u.activo !== false ? '✓ Activo' : 'Inactivo'}
                                                                    </button>
                                                                </td>

                                                                <td className="py-4 px-5 text-right whitespace-nowrap">
                                                                    <div className="inline-flex items-center gap-1.5">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openEditUserModal(u)}
                                                                            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#5F2142] text-[#5F2142] dark:text-[#FFC99C] font-black text-[11px] inline-flex items-center gap-1 bg-white dark:bg-neutral-800 transition-all"
                                                                        >
                                                                            <Edit2 size={12} />
                                                                            <span>Modificar</span>
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setDeleteUserConfirm(u)}
                                                                            className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/40 hover:bg-red-600 hover:text-white text-red-600 font-black text-[11px] inline-flex items-center gap-1 transition-all"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                            <span>Eliminar</span>
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
                            );
                        })()}

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
                                                onClick={() => {
                                                    setActiveSection(s.slug);
                                                    setActiveSubcategory('all');
                                                }}
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
                                        onClick={() => openCreateProductModal(activeSubcategory !== 'all' ? Number(activeSubcategory) : undefined)}
                                        className="px-5 py-2 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white text-xs font-black shadow-xs shrink-0"
                                    >
                                        + Agregar Producto
                                    </button>
                                </div>

                                {/* Subcategory Filter Bar for Configuraciones -> Productos */}
                                {CATEGORIES[activeSection]?.subcategories && (
                                    <div className={`p-3.5 rounded-2xl ${bgCard} border ${borderDefault} flex flex-wrap items-center gap-2`}>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 mr-1">
                                            Categorías de {CATEGORIES[activeSection]?.title}:
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setActiveSubcategory('all')}
                                            className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all ${
                                                activeSubcategory === 'all'
                                                    ? 'bg-[#5F2142] text-white'
                                                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:border-[#D86A33]'
                                            }`}
                                        >
                                            ✦ Todas ({allSectionProducts.length})
                                        </button>
                                        {CATEGORIES[activeSection].subcategories.map(sub => {
                                            const subCount = allSectionProducts.filter(p => Number(p.subcategoria_id) === sub.id).length;
                                            const isSubActive = activeSubcategory !== 'all' && Number(activeSubcategory) === sub.id;
                                            return (
                                                <button
                                                    key={sub.id}
                                                    type="button"
                                                    onClick={() => setActiveSubcategory(sub.id)}
                                                    className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all ${
                                                        isSubActive
                                                            ? 'bg-[#D86A33] text-white shadow-2xs'
                                                            : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10'
                                                    }`}
                                                >
                                                    {sub.name} ({subCount})
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className={`rounded-3xl ${bgCard} border ${borderDefault} shadow-xs overflow-hidden`}>
                                    <div className="px-5 py-3 border-b border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 bg-gray-50/40 dark:bg-white/2">
                                        <span className="text-xs font-black text-[#5F2142] dark:text-[#FFC99C]">
                                            {CATEGORIES[activeSection]?.title} ({sectionProducts.length} productos)
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => minimizeAllProducts(sectionProducts)}
                                                className="px-2.5 py-1 rounded-xl border border-gray-200 dark:border-white/10 text-[10px] font-black text-gray-600 dark:text-gray-300 inline-flex items-center gap-1 bg-white dark:bg-neutral-800 hover:border-[#5F2142]"
                                            >
                                                <ChevronUp size={11} /> Minimizar Todo ▲
                                            </button>
                                            <button
                                                type="button"
                                                onClick={maximizeAllProducts}
                                                className="px-2.5 py-1 rounded-xl border border-gray-200 dark:border-white/10 text-[10px] font-black text-[#5F2142] dark:text-[#FFC99C] inline-flex items-center gap-1 bg-white dark:bg-neutral-800 hover:border-[#D86A33]"
                                            >
                                                <ChevronDown size={11} /> Maximizar Todo ▼
                                            </button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto divide-y divide-gray-100 dark:divide-white/10">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-white/5">
                                                    <th className="py-3 px-5">Producto Creado</th>
                                                    <th className="py-3 px-5">Sección & Categoría Especificada</th>
                                                    <th className="py-3 px-5 text-center">Stock</th>
                                                    <th className="py-3 px-5">Precio</th>
                                                    <th className="py-3 px-5 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                {sectionProducts.map(p => {
                                                    const imgs = parseImages(p.image_url);
                                                    const pSubcats = CATEGORIES[p.categoria_slug]?.subcategories || [];
                                                    const currentSubName = pSubcats.find(s => s.id === Number(p.subcategoria_id))?.name || 'General';
                                                    const isProdMin = Boolean(minimizedProductIds[p.id]);

                                                    if (isProdMin) {
                                                        return (
                                                            <tr key={p.id} className="bg-gray-50/40 dark:bg-white/2 hover:bg-gray-100/50 dark:hover:bg-white/5">
                                                                <td className="py-2 px-5 font-bold text-gray-900 dark:text-white">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleProductMinimized(p.id)}
                                                                        className="text-left hover:text-[#D86A33] font-black"
                                                                    >
                                                                        {p.name}
                                                                    </button>
                                                                </td>
                                                                <td className="py-2 px-5">
                                                                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#D86A33]/15 text-[#D86A33]">
                                                                        ✦ {currentSubName}
                                                                    </span>
                                                                </td>
                                                                <td className="py-2 px-5 text-center">
                                                                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                                                                        {p.stock !== undefined ? p.stock : 20} uds
                                                                    </span>
                                                                </td>
                                                                <td className="py-2 px-5 font-black text-xs text-[#5F2142] dark:text-[#FFC99C]">
                                                                    ${p.price.toFixed(2)} USD
                                                                </td>
                                                                <td className="py-2 px-5 text-right whitespace-nowrap">
                                                                    <div className="inline-flex items-center gap-1.5">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleProductMinimized(p.id)}
                                                                            className="px-2 py-1 rounded-lg bg-[#5F2142] text-white text-[10px] font-black inline-flex items-center gap-1"
                                                                        >
                                                                            <ChevronDown size={11} /> Maximizar ▼
                                                                        </button>
                                                                        <button
                                                                            onClick={() => openEditProductModal(p)}
                                                                            className="p-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#D86A33] text-[#D86A33]"
                                                                            title="Editar producto"
                                                                        >
                                                                            <Edit2 size={12} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setDeleteConfirmId(p.id)}
                                                                            className="p-1.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50"
                                                                            title="Eliminar producto"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }

                                                    return (
                                                        <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                                                            <td className="py-3 px-5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden shrink-0">
                                                                        <img src={imgs[0] || '/cat_gorros.png'} alt={p.name} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-gray-900 dark:text-white">{p.name}</div>
                                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                                            <span className="text-[10px] text-gray-400 font-bold">{imgs.length} fotos</span>
                                                                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#D86A33]/15 text-[#D86A33]">
                                                                                ✦ {currentSubName}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-5 whitespace-nowrap">
                                                                <div className="space-y-1">
                                                                    <span className="block text-[10px] font-bold uppercase text-gray-400">
                                                                        {CATEGORIES[p.categoria_slug]?.title} › Categoría:
                                                                    </span>
                                                                    <select
                                                                        value={p.subcategoria_id || ''}
                                                                        onChange={(e) => handleChangeProductSubcategory(p, Number(e.target.value))}
                                                                        className={`px-3 py-1 rounded-xl border text-xs font-black outline-none cursor-pointer ${inputStyle}`}
                                                                    >
                                                                        {pSubcats.map(sc => (
                                                                            <option key={sc.id} value={sc.id}>{sc.name}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-5 text-center whitespace-nowrap">
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                                    {p.stock !== undefined ? p.stock : 20} uds
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-5 font-black text-sm text-[#5F2142] dark:text-[#FFC99C]">
                                                                ${p.price.toFixed(2)} USD
                                                            </td>
                                                            <td className="py-3 px-5 text-right whitespace-nowrap">
                                                                <div className="inline-flex items-center gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleProductMinimized(p.id)}
                                                                        className="px-2 py-1 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#5F2142] text-gray-600 dark:text-gray-300 text-[10px] font-black inline-flex items-center gap-1"
                                                                        title="Minimizar este producto"
                                                                    >
                                                                        <ChevronUp size={11} /> Minimizar ▲
                                                                    </button>
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

                            {/* Price, Stock & Category in 3 columns */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                                        Stock Disponible (Uds) *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formStock}
                                        onChange={(e) => setFormStock(e.target.value)}
                                        className={`w-full px-3.5 py-2.5 rounded-2xl border font-bold ${inputStyle}`}
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

                            {/* Dynamic Category / Subcategory of the Section */}
                            {CATEGORIES[formCategory] && CATEGORIES[formCategory].subcategories.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase">
                                        Categoría de {CATEGORIES[formCategory]?.title} *
                                    </label>
                                    <select
                                        value={formSubcategory || ''}
                                        onChange={(e) => setFormSubcategory(e.target.value ? Number(e.target.value) : undefined)}
                                        className={`w-full px-3 py-2.5 rounded-2xl border font-bold ${inputStyle}`}
                                    >
                                        {CATEGORIES[formCategory].subcategories.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {CATEGORIES[formCategory].title} › Categoría: {s.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                        {CATEGORIES[formCategory].subcategories.map(s => {
                                            const isSelected = Number(formSubcategory) === s.id;
                                            return (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => setFormSubcategory(s.id)}
                                                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all border ${
                                                        isSelected
                                                            ? 'bg-[#D86A33] text-white border-[#D86A33] shadow-2xs'
                                                            : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-[#D86A33]'
                                                    }`}
                                                >
                                                    {s.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Image Manager: UP TO 10 IMAGES */}
                            <div className={`p-4 sm:p-5 rounded-3xl ${bgSubCard} border ${borderDefault} space-y-4`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-[#5F2142]/10 dark:bg-[#FFC99C]/10 text-[#5F2142] dark:text-[#FFC99C] flex items-center justify-center">
                                            <ImageIcon size={18} />
                                        </div>
                                        <div>
                                            <label className="block font-black text-sm text-[#5F2142] dark:text-[#FFC99C] uppercase tracking-wider">
                                                Galería de Fotos ({formImages.length} de 10)
                                            </label>
                                            <p className="text-[10px] text-gray-400 font-medium">Sube hasta 10 fotos desde tu computadora o celular</p>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-[#D86A33]/10 text-[#D86A33]">
                                        {10 - formImages.length} disponibles
                                    </span>
                                </div>

                                {/* DROP ZONE / ARRASTRAR O SELECCIONAR DESDE LOCAL (ESTILO FREE PDF CONVERTER) */}
                                {formImages.length < 10 ? (
                                    <div
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setIsDragging(true);
                                        }}
                                        onDragLeave={(e) => {
                                            e.preventDefault();
                                            setIsDragging(false);
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDragging(false);
                                            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                                handleFilesSelected(e.dataTransfer.files);
                                            }
                                        }}
                                        className={`relative rounded-3xl p-6 sm:p-7 text-center transition-all border-2 border-dashed ${
                                            isDragging
                                                ? 'border-[#D86A33] bg-[#D86A33]/15 scale-[1.01] shadow-lg'
                                                : 'border-blue-400/50 dark:border-blue-500/30 bg-gradient-to-b from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-600/10 dark:via-transparent hover:border-[#D86A33] hover:bg-blue-500/15'
                                        }`}
                                    >
                                        {/* Hidden File Input */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    handleFilesSelected(e.target.files);
                                                }
                                                e.target.value = '';
                                            }}
                                        />

                                        {/* Central Graphic: Stack of image file cards like the reference */}
                                        <div className="flex items-center justify-center mb-3">
                                            <div className="relative w-16 h-12 flex items-center justify-center">
                                                <div className="absolute w-10 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/60 border border-blue-300 dark:border-blue-700 -rotate-12 transform shadow-xs flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                    <ImageIcon size={18} />
                                                </div>
                                                <div className="absolute w-10 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/60 border border-purple-300 dark:border-purple-700 rotate-12 transform shadow-xs flex items-center justify-center text-purple-600 dark:text-purple-400">
                                                    <Sparkles size={16} />
                                                </div>
                                                <div className="relative z-10 w-11 h-13 rounded-xl bg-white dark:bg-neutral-800 border-2 border-[#D86A33] shadow-md flex flex-col items-center justify-center text-[#D86A33]">
                                                    <UploadCloud size={20} />
                                                    <span className="text-[7px] font-black uppercase tracking-tighter mt-0.5">FOTO</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Prominent Action Button: CHOOSE FILES / SELECCIONAR FOTOS */}
                                        <div className="inline-flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploadingImages}
                                                className="px-6 py-3 rounded-2xl bg-white dark:bg-neutral-800 text-gray-900 dark:text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg border-2 border-gray-200 dark:border-white/10 hover:border-[#D86A33] inline-flex items-center gap-2 group transition-all"
                                            >
                                                <FolderUp size={18} className="text-[#D86A33] group-hover:scale-110 transition-transform" />
                                                <span>{isUploadingImages ? 'Procesando fotos...' : 'CHOOSE FILES / SELECCIONAR FOTOS'}</span>
                                            </button>
                                        </div>

                                        {/* Helper Text: or drop files here */}
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mt-2.5">
                                            or drop files here (o arrastra tus fotos aquí)
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-semibold mt-1">
                                            Soporta JPG, PNG, WEBP, GIF • Puedes subir varias fotos a la vez
                                        </p>

                                        {/* Uploading Spinner Overlay */}
                                        {isUploadingImages && (
                                            <div className="absolute inset-0 bg-white/85 dark:bg-black/85 rounded-3xl flex flex-col items-center justify-center backdrop-blur-xs z-20">
                                                <RefreshCw size={26} className="animate-spin text-[#D86A33] mb-2" />
                                                <span className="text-xs font-black text-[#5F2142] dark:text-[#FFC99C]">Cargando y optimizando fotos...</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center">
                                        <p className="text-xs text-amber-800 dark:text-amber-300 font-black">
                                            ✓ Límite de 10 fotos alcanzado para este producto
                                        </p>
                                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                                            Si deseas agregar otra foto, primero elimina alguna de la galería de abajo.
                                        </p>
                                    </div>
                                )}

                                {/* Galería de Fotos cargadas */}
                                {formImages.length > 0 && (
                                    <div className="pt-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-black text-gray-700 dark:text-gray-300">
                                                Fotos añadidas ({formImages.length} de 10):
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-semibold">
                                                La foto marcada como <strong className="text-[#D86A33]">★ Portada</strong> será la imagen principal
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                                            {formImages.map((url, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 bg-gray-100 dark:bg-white/5 group shadow-xs transition-all ${
                                                        idx === 0 
                                                            ? 'border-[#D86A33] ring-2 ring-[#D86A33]/30' 
                                                            : 'border-gray-200 dark:border-white/10 hover:border-[#5F2142]'
                                                    }`}
                                                >
                                                    <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                                    
                                                    {/* Badge o botón para asignar Portada */}
                                                    {idx === 0 ? (
                                                        <span className="absolute top-1.5 left-1.5 bg-[#D86A33] text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                                                            ★ Portada
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSetCoverImage(idx)}
                                                            className="absolute bottom-1.5 left-1.5 right-1.5 py-1 px-1 rounded-lg bg-black/80 hover:bg-[#D86A33] text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 shadow-md"
                                                            title="Convertir en portada principal"
                                                        >
                                                            <Star size={10} /> Portada
                                                        </button>
                                                    )}

                                                    {/* Botón Eliminar Foto */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(idx)}
                                                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity shadow-md"
                                                        title="Eliminar esta foto"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Opción secundaria: URL web directa o presets rápidos */}
                                <div className="pt-2 border-t border-gray-100 dark:border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setShowManualUrlInput(!showManualUrlInput)}
                                        className="text-[11px] text-gray-500 hover:text-[#5F2142] dark:hover:text-[#FFC99C] font-bold inline-flex items-center gap-1.5 transition-colors"
                                    >
                                        <span>{showManualUrlInput ? '▼ Ocultar opciones de URL / Presets' : '▶ ¿Deseas pegar una URL web o fotos predeterminadas?'}</span>
                                    </button>

                                    {showManualUrlInput && (
                                        <div className="mt-2 space-y-2.5 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                            {formImages.length < 10 && (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newImageUrl}
                                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                                        placeholder="https://ejemplo.com/foto.jpg o /cat_gorros.png..."
                                                        className={`flex-1 px-3 py-2 rounded-xl border text-xs font-medium ${inputStyle}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddImage(newImageUrl)}
                                                        className="px-4 py-2 rounded-xl bg-[#5F2142] text-white font-bold text-xs hover:bg-[#43142e] transition-colors"
                                                    >
                                                        + Añadir URL
                                                    </button>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                <span className="text-[10px] text-gray-400 font-bold self-center">Fotos predeterminadas:</span>
                                                {PRESET_IMAGES.map((img) => (
                                                    <button
                                                        type="button"
                                                        key={img.url}
                                                        onClick={() => handleAddImage(img.url)}
                                                        className="text-[10px] px-2 py-0.5 rounded-lg border border-gray-300 dark:border-white/10 hover:border-[#D86A33] transition-colors"
                                                    >
                                                        + {img.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
                                    onClick={() => generateInvoicePdf(viewingOrder, settings.pdfConfig, bcvRate)}
                                    className="px-4 py-2 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white text-xs font-black inline-flex items-center gap-1.5 shadow-xs"
                                >
                                    <Printer size={13} />
                                    <span>Imprimir / PDF</span>
                                </button>
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

            {/* MODAL: EDITAR BITÁCORA / NOTAS DE TALLER */}
            {editingWorkshopNotesOrder && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className={`rounded-3xl max-w-md w-full p-6 ${bgCard} border ${borderDefault} shadow-2xl space-y-4`}>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
                            <div>
                                <h4 className="text-base font-black text-[#5F2142] dark:text-[#FFC99C]">
                                    Bitácora de Taller • #{editingWorkshopNotesOrder.numero_factura}
                                </h4>
                                <p className="text-xs text-gray-400">Notas internas para costureras, bordadores o impresores</p>
                            </div>
                            <button
                                onClick={() => setEditingWorkshopNotesOrder(null)}
                                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                                Observaciones de Producción:
                            </label>
                            <textarea
                                rows={4}
                                value={workshopNotesInput}
                                onChange={(e) => setWorkshopNotesInput(e.target.value)}
                                placeholder="Ej: Patrón floral cortado, bordado en hilo blanco listo, pendiente costura de dobladillo..."
                                className={`w-full p-3 rounded-2xl border text-xs font-medium outline-none ${inputStyle}`}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-white/10">
                            <button
                                type="button"
                                onClick={() => setEditingWorkshopNotesOrder(null)}
                                className="px-4 py-2 rounded-full border border-gray-300 dark:border-white/10 text-xs font-bold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSaveWorkshopNotes(editingWorkshopNotesOrder.id)}
                                disabled={actionLoading}
                                className="px-5 py-2 rounded-full bg-[#5F2142] hover:bg-[#43142e] text-white text-xs font-black shadow-md"
                            >
                                {actionLoading ? 'Guardando...' : 'Guardar en Bitácora'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: REGISTRAR GUÍA DE ENVÍO NACIONAL */}
            {editingGuideOrder && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className={`rounded-3xl max-w-sm w-full p-6 ${bgCard} border ${borderDefault} shadow-2xl space-y-4`}>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
                            <div>
                                <h4 className="text-base font-black text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
                                    <Truck size={17} />
                                    <span>Guía de Envío Nacional</span>
                                </h4>
                                <p className="text-xs text-gray-400">
                                    #{editingGuideOrder.numero_factura} • {editingGuideOrder.empresa_envio || 'MRW'}
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingGuideOrder(null)}
                                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                                Número de Guía / Tracking:
                            </label>
                            <input
                                type="text"
                                value={guideNumberInput}
                                onChange={(e) => setGuideNumberInput(e.target.value)}
                                placeholder="Ej: 0204-8849201"
                                className={`w-full px-3 py-2.5 rounded-2xl border text-xs font-mono font-bold outline-none ${inputStyle}`}
                            />
                            <p className="text-[10px] text-gray-400 mt-1">
                                Destino: {editingGuideOrder.direccion_entrega} ({editingGuideOrder.ciudad || ''})
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-white/10">
                            <button
                                type="button"
                                onClick={() => setEditingGuideOrder(null)}
                                className="px-4 py-2 rounded-full border border-gray-300 dark:border-white/10 text-xs font-bold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSaveGuideNumber(editingGuideOrder.id)}
                                disabled={actionLoading}
                                className="px-5 py-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black shadow-md"
                            >
                                {actionLoading ? 'Guardando...' : 'Guardar Guía'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: AGREGAR / EDITAR CUENTA BANCARIA O MÉTODO DE PAGO ADICIONAL */}
            {isExtraAccountModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <div className={`rounded-3xl max-w-lg w-full p-6 sm:p-8 ${bgCard} border ${borderDefault} shadow-2xl space-y-4 my-6 max-h-[92vh] flex flex-col overflow-hidden text-xs`}>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10 shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-[#5F2142] dark:text-[#FFC99C]">
                                    {editingExtraAccountId ? 'Editar Cuenta Bancaria / de Pago' : '+ Agregar Nueva Cuenta Bancaria o de Pago'}
                                </h3>
                                <p className="text-[11px] text-gray-500 font-medium">
                                    Esta cuenta estará disponible para que los clientes realicen su pago al formalizar pedidos.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsExtraAccountModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveExtraAccount} className="flex-1 overflow-y-auto py-2 pr-1 space-y-3.5">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Tipo de Método *
                                    </label>
                                    <select
                                        value={extraAccTipo}
                                        onChange={(e) => {
                                            const val = e.target.value as ExtraPaymentType;
                                            setExtraAccTipo(val);
                                            if (val === 'pago_movil' || val === 'transferencia') {
                                                setExtraAccMoneda('BS');
                                            } else {
                                                setExtraAccMoneda('USD');
                                            }
                                        }}
                                        className={`w-full px-3 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                    >
                                        <option value="transferencia">Transferencia Bancaria</option>
                                        <option value="pago_movil">Pago Móvil Adicional</option>
                                        <option value="zelle">Zelle (USD)</option>
                                        <option value="binance">Binance Pay Secundario</option>
                                        <option value="zinli">Zinli (USD)</option>
                                        <option value="paypal">PayPal (USD)</option>
                                        <option value="efectivo">Efectivo / Divisas</option>
                                        <option value="otro">Otro Método de Pago</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Moneda de Cobro *
                                    </label>
                                    <select
                                        value={extraAccMoneda}
                                        onChange={(e) => setExtraAccMoneda(e.target.value as 'BS' | 'USD')}
                                        className={`w-full px-3 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                    >
                                        <option value="BS">Bolívares (Bs. a Tasa BCV)</option>
                                        <option value="USD">Dólares ($ USD / USDT)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Nombre Visible en Checkout *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={extraAccNombreMetodo}
                                        onChange={(e) => setExtraAccNombreMetodo(e.target.value)}
                                        placeholder="Ej: Transferencia Banesco / Zelle"
                                        className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                    />
                                </div>

                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Banco o Plataforma *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={extraAccBanco}
                                        onChange={(e) => setExtraAccBanco(e.target.value)}
                                        placeholder="Ej: Banesco (0134) / Mercantil / Zelle"
                                        className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                    Número de Cuenta (20 dígitos) / Correo / ID *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={extraAccCuentaOCorreo}
                                    onChange={(e) => setExtraAccCuentaOCorreo(e.target.value)}
                                    placeholder="Ej: 0134-0000-00-0000000000 o pagos@boheme.com"
                                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold ${inputStyle}`}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Titular *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={extraAccTitular}
                                        onChange={(e) => setExtraAccTitular(e.target.value)}
                                        placeholder="BOHEME"
                                        className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                    />
                                </div>

                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Cédula / RIF
                                    </label>
                                    <input
                                        type="text"
                                        value={extraAccCedula}
                                        onChange={(e) => setExtraAccCedula(e.target.value)}
                                        placeholder="V-24.354.847"
                                        className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                    />
                                </div>

                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Teléfono (Si aplica)
                                    </label>
                                    <input
                                        type="text"
                                        value={extraAccTelefono}
                                        onChange={(e) => setExtraAccTelefono(e.target.value)}
                                        placeholder="0414-0000000"
                                        className={`w-full px-3 py-2 rounded-xl border font-bold ${inputStyle}`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Tipo de Cuenta (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={extraAccTipoCuenta}
                                        onChange={(e) => setExtraAccTipoCuenta(e.target.value)}
                                        placeholder="Corriente / Ahorro / Corporativa"
                                        className={`w-full px-3 py-2 rounded-xl border font-medium ${inputStyle}`}
                                    />
                                </div>

                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Nota o Instrucción al Cliente
                                    </label>
                                    <input
                                        type="text"
                                        value={extraAccInstrucciones}
                                        onChange={(e) => setExtraAccInstrucciones(e.target.value)}
                                        placeholder="Ej: Enviar captura con número de referencia"
                                        className={`w-full px-3 py-2 rounded-xl border font-medium ${inputStyle}`}
                                    />
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsExtraAccountModalOpen(false)}
                                    className="px-4 py-2 rounded-full border border-gray-300 dark:border-white/10 font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingSettings}
                                    className="px-6 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white font-black shadow-md shadow-[#D86A33]/25"
                                >
                                    {isSavingSettings ? 'Guardando...' : editingExtraAccountId ? 'Actualizar Cuenta' : 'Guardar Nueva Cuenta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CREAR O MODIFICAR USUARIO DEL SISTEMA */}
            {isUserModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <div className={`rounded-3xl max-w-lg w-full p-6 sm:p-8 ${bgCard} border ${borderDefault} shadow-2xl space-y-4 my-6 max-h-[92vh] flex flex-col overflow-hidden text-xs`}>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10 shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-[#5F2142] dark:text-[#FFC99C]">
                                    {editingUserId ? 'Modificar Usuario del Sistema' : '+ Crear Nuevo Usuario'}
                                </h3>
                                <p className="text-[11px] text-gray-500 font-medium">
                                    {editingUserId && (editingUserId === currentUser.id || userFormEmail.trim().toLowerCase() === currentUser.email.toLowerCase())
                                        ? 'Estás modificando las credenciales del usuario que tienes en uso actualmente.'
                                        : 'Configura las credenciales de acceso y rol dentro del panel administrativo.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsUserModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto py-2 pr-1 space-y-3.5">
                            <div>
                                <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                    Nombre Completo del Usuario *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={userFormNombre}
                                    onChange={(e) => setUserFormNombre(e.target.value)}
                                    placeholder="Ej: Dra. María Gómez / Administración BOHEME"
                                    className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Correo de Acceso (Login) *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={userFormEmail}
                                        onChange={(e) => setUserFormEmail(e.target.value)}
                                        placeholder="usuario@boheme.com"
                                        className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold ${inputStyle}`}
                                    />
                                </div>

                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Contraseña de Acceso *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={userFormPassword}
                                        onChange={(e) => setUserFormPassword(e.target.value)}
                                        placeholder="Ingresa la contraseña..."
                                        className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold ${inputStyle}`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Rol / Nivel de Acceso *
                                    </label>
                                    <select
                                        value={userFormRol}
                                        onChange={(e) => setUserFormRol(e.target.value as AdminUserRole)}
                                        className={`w-full px-3 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                    >
                                        <option value="super_admin">Super Administrador (Control Total)</option>
                                        <option value="admin">Administrador General</option>
                                        <option value="facturacion">Facturación y Cobranza</option>
                                        <option value="taller">Taller y Producción</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Cargo / Departamento
                                    </label>
                                    <input
                                        type="text"
                                        value={userFormCargo}
                                        onChange={(e) => setUserFormCargo(e.target.value)}
                                        placeholder="Ej: Gerencia / Jefe de Taller"
                                        className={`w-full px-3.5 py-2.5 rounded-xl border font-medium ${inputStyle}`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                                <div>
                                    <label className="block font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                                        Teléfono de Contacto (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={userFormTelefono}
                                        onChange={(e) => setUserFormTelefono(e.target.value)}
                                        placeholder="0412-0000000"
                                        className={`w-full px-3.5 py-2.5 rounded-xl border font-bold ${inputStyle}`}
                                    />
                                </div>

                                <div className="pt-4">
                                    <label className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer font-bold ${bgSubCard} ${borderDefault}`}>
                                        <input
                                            type="checkbox"
                                            checked={userFormActivo}
                                            onChange={(e) => setUserFormActivo(e.target.checked)}
                                            className="w-4 h-4 rounded text-[#D86A33] focus:ring-[#D86A33]"
                                        />
                                        <span>Usuario Activo (Permitir inicio de sesión)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsUserModalOpen(false)}
                                    className="px-4 py-2 rounded-full border border-gray-300 dark:border-white/10 font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingSettings}
                                    className="px-6 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white font-black shadow-md shadow-[#D86A33]/25"
                                >
                                    {isSavingSettings ? 'Guardando...' : editingUserId ? 'Guardar Cambios de Usuario' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CONFIRMACIÓN PARA ELIMINAR USUARIO */}
            {deleteUserConfirm && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className={`rounded-3xl max-w-sm w-full p-6 text-center ${bgCard} border ${borderDefault} shadow-2xl`}>
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                            <Trash2 size={22} />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 dark:text-white mb-1">
                            ¿Eliminar usuario {deleteUserConfirm.nombre}?
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                            Correo: <strong className="font-mono text-gray-800 dark:text-gray-200">{deleteUserConfirm.email}</strong>
                        </p>
                        {isCurrentActiveUser(deleteUserConfirm) ? (
                            <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-xl font-bold mb-5">
                                ⚠️ Este es el usuario que tienes en uso actualmente. Si lo eliminas (habiendo otro usuario creado), tu sesión actual se cerrará.
                            </p>
                        ) : (
                            <p className="text-xs text-gray-500 mb-5">
                                Esta acción revocará su acceso al panel administrativo de forma inmediata.
                            </p>
                        )}
                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteUserConfirm(null)}
                                className="px-5 py-2.5 rounded-full border border-gray-300 dark:border-white/10 text-xs font-bold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => handleConfirmDeleteUser(deleteUserConfirm)}
                                disabled={isSavingSettings}
                                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md shadow-red-600/20"
                            >
                                {isSavingSettings ? 'Eliminando...' : 'Sí, eliminar usuario'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
