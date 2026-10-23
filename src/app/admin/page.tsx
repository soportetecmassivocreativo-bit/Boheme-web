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
    Image as ImageIcon
} from 'lucide-react';
import { Product, CATEGORIES } from '@/lib/db';

const PRESET_IMAGES = [
    { label: 'Gorro Quirúrgico', url: '/cat_gorros.png' },
    { label: 'Accesorios & Lanyards', url: '/cat_accesorios.png' },
    { label: 'Equipos Médicos', url: '/cat_equipos.png' },
    { label: 'Banner Estilo', url: '/hero_bg.png' }
];

export default function AdminDashboardPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Form fields
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formPrice, setFormPrice] = useState<number | string>(8);
    const [formCategory, setFormCategory] = useState('gorros');
    const [formSubcategory, setFormSubcategory] = useState<number | undefined>(70);
    const [formImageUrl, setFormImageUrl] = useState('/cat_gorros.png');

    // Fetch products
    const loadProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/products');
            const data = await res.json();
            if (data.products) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/logout', { method: 'POST' });
            router.push('/admin/login');
            router.refresh();
        } catch {
            router.push('/admin/login');
        }
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setFormName('');
        setFormDescription('');
        setFormPrice(8);
        setFormCategory('gorros');
        setFormSubcategory(70);
        setFormImageUrl('/cat_gorros.png');
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormName(product.name);
        setFormDescription(product.description || '');
        setFormPrice(product.price);
        setFormCategory(product.categoria_slug);
        setFormSubcategory(product.subcategoria_id);
        setFormImageUrl(product.image_url || '/cat_gorros.png');
        setIsModalOpen(true);
    };

    const handleCategoryChangeInForm = (newCat: string) => {
        setFormCategory(newCat);
        const catInfo = CATEGORIES[newCat];
        if (catInfo && catInfo.subcategories.length > 0) {
            setFormSubcategory(catInfo.subcategories[0].id);
        } else {
            setFormSubcategory(undefined);
        }

        // Auto select reasonable default image
        if (newCat === 'gorros') setFormImageUrl('/cat_gorros.png');
        else if (newCat === 'equipos-medicos') setFormImageUrl('/cat_equipos.png');
        else setFormImageUrl('/cat_accesorios.png');
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);

        const payload = {
            name: formName.trim(),
            description: formDescription.trim(),
            price: Number(formPrice),
            categoria_slug: formCategory,
            subcategoria_id: formSubcategory ? Number(formSubcategory) : undefined,
            image_url: formImageUrl.trim()
        };

        try {
            if (editingProduct) {
                // UPDATE
                const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (res.ok) {
                    showToast('✓ Producto actualizado correctamente');
                    setIsModalOpen(false);
                    loadProducts();
                } else {
                    alert(data.error || 'Error al actualizar producto');
                }
            } else {
                // CREATE
                const res = await fetch('/api/admin/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (res.ok) {
                    showToast('✓ Nuevo producto creado exitosamente');
                    setIsModalOpen(false);
                    loadProducts();
                } else {
                    alert(data.error || 'Error al crear producto');
                }
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error de conexión al guardar el producto.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('✓ Producto eliminado con éxito');
                setDeleteConfirmId(null);
                loadProducts();
            } else {
                alert('No se pudo eliminar el producto');
            }
        } catch {
            alert('Error de conexión al eliminar.');
        } finally {
            setActionLoading(false);
        }
    };

    // Filter logic
    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'all' || p.categoria_slug === selectedCategory;
        const matchesSearch = 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    // Counts for metrics
    const countGorros = products.filter(p => p.categoria_slug === 'gorros').length;
    const countLanyards = products.filter(p => p.categoria_slug === 'lanyards').length;
    const countAccesorios = products.filter(p => p.categoria_slug === 'accesorios-medicos').length;
    const countEquipos = products.filter(p => p.categoria_slug === 'equipos-medicos').length;

    return (
        <div className="min-h-screen bg-[#FFF9F5] text-gray-900 flex flex-col">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-50 bg-[#5F2142] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold animate-bounce">
                    <Sparkles size={16} className="text-[#FFC99C]" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Admin Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo & Admin Title */}
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="flex items-center">
                                <img 
                                    src="/logo-wine.png" 
                                    alt="BOHEME" 
                                    className="h-10 w-auto object-contain" 
                                />
                            </Link>
                            <span className="h-6 w-px bg-gray-200 hidden sm:block" />
                            <div className="hidden sm:flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full bg-[#FFF4EB] border border-[#D86A33]/30 text-[#D86A33] text-xs font-black uppercase tracking-wider">
                                    ✦ Admin Panel
                                </span>
                            </div>
                        </div>

                        {/* Actions: View Store & Logout */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                target="_blank"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-gray-700 hover:text-[#5F2142] hover:border-[#5F2142] text-xs sm:text-sm font-bold transition-all bg-white shadow-2xs hover:scale-105"
                            >
                                <Store size={15} className="text-[#D86A33]" />
                                <span>Ver Tienda</span>
                                <ExternalLink size={12} className="text-gray-400" />
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-bold transition-all border border-red-200"
                                title="Cerrar Sesión"
                            >
                                <LogOut size={15} />
                                <span className="hidden sm:inline">Salir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
                {/* Stats Cards Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-3xl border border-[#FFC99C]/50 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Catálogo</span>
                            <div className="w-8 h-8 rounded-full bg-[#FFF4EB] text-[#D86A33] flex items-center justify-center">
                                <Package size={16} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-[#5F2142]">{products.length}</div>
                        <span className="text-[11px] text-gray-400 font-medium">artículos activos</span>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-[#FFC99C]/50 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gorros Quirúrgicos</span>
                            <div className="w-8 h-8 rounded-full bg-[#FFF4EB] text-[#5F2142] flex items-center justify-center">
                                <Layers size={16} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-[#5F2142]">{countGorros}</div>
                        <span className="text-[11px] text-[#D86A33] font-medium">stock & personalizados</span>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-[#FFC99C]/50 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lanyards & Cintas</span>
                            <div className="w-8 h-8 rounded-full bg-[#FFF4EB] text-[#D86A33] flex items-center justify-center">
                                <Package size={16} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-[#5F2142]">{countLanyards}</div>
                        <span className="text-[11px] text-gray-400 font-medium">con portacarnet</span>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-[#FFC99C]/50 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Accesorios & Equipos</span>
                            <div className="w-8 h-8 rounded-full bg-[#FFF4EB] text-[#5F2142] flex items-center justify-center">
                                <Layers size={16} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-[#5F2142]">{countAccesorios + countEquipos}</div>
                        <span className="text-[11px] text-gray-400 font-medium">herramientas clínicas</span>
                    </div>
                </div>

                {/* Controls Bar: Search, Category Filters, and New Product Button */}
                <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs mb-8 space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar producto por nombre o descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm transition-all bg-[#FFF9F5]/40"
                            />
                        </div>

                        {/* Add Product Button */}
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#D86A33] hover:bg-[#c25925] text-white font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#D86A33]/25"
                        >
                            <Plus size={18} />
                            <span>Nuevo Producto</span>
                        </button>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 hidden sm:inline">
                            Filtrar:
                        </span>
                        {[
                            { slug: 'all', label: 'Todos' },
                            { slug: 'gorros', label: 'Gorros' },
                            { slug: 'lanyards', label: 'Lanyards' },
                            { slug: 'accesorios-medicos', label: 'Accesorios' },
                            { slug: 'equipos-medicos', label: 'Equipos' },
                            { slug: 'productos-personalizados', label: 'Personalizados' }
                        ].map((cat) => (
                            <button
                                key={cat.slug}
                                onClick={() => setSelectedCategory(cat.slug)}
                                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                                    selectedCategory === cat.slug
                                        ? 'bg-[#5F2142] text-white shadow-xs scale-105'
                                        : 'bg-[#FFF9F5] text-[#5F2142] hover:bg-[#FFF4EB] border border-[#FFC99C]/40'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Catalog List */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#FFF9F5]/50">
                        <h2 className="font-black text-lg text-[#5F2142] tracking-tight">
                            Productos ({filteredProducts.length})
                        </h2>
                        <span className="text-xs text-gray-500 font-medium">
                            Precios en Dólares ($)
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-16 text-center">
                            <div className="w-8 h-8 border-3 border-[#D86A33]/30 border-t-[#D86A33] rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-sm text-gray-500 font-medium">Cargando productos...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-12 h-12 bg-[#FFF4EB] rounded-full flex items-center justify-center text-[#D86A33] mx-auto mb-3">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="font-bold text-gray-800 text-base mb-1">No se encontraron productos</h3>
                            <p className="text-xs text-gray-500 mb-4">Intenta cambiar la búsqueda o el filtro de categoría.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                                className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-[#5F2142] hover:border-[#5F2142]"
                            >
                                Restablecer filtros
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[11px] font-black text-gray-400 uppercase tracking-wider bg-gray-50/50">
                                        <th className="py-3 px-6">Producto</th>
                                        <th className="py-3 px-6">Categoría</th>
                                        <th className="py-3 px-6">Precio</th>
                                        <th className="py-3 px-6 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {filteredProducts.map((product) => {
                                        const catInfo = CATEGORIES[product.categoria_slug];
                                        const subcat = catInfo?.subcategories.find(s => s.id === product.subcategoria_id);
                                        return (
                                            <tr key={product.id} className="hover:bg-[#FFF9F5]/40 transition-colors">
                                                {/* Product Info with Thumbnail */}
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-14 h-14 rounded-2xl bg-[#FFF9F5] border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                            {product.image_url ? (
                                                                <img 
                                                                    src={product.image_url} 
                                                                    alt={product.name} 
                                                                    className="w-full h-full object-cover" 
                                                                />
                                                            ) : (
                                                                <ImageIcon size={20} className="text-gray-300" />
                                                            )}
                                                        </div>
                                                        <div className="max-w-md">
                                                            <div className="font-black text-gray-900 group-hover:text-[#D86A33]">
                                                                {product.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 line-clamp-1 font-normal">
                                                                {product.description || 'Sin descripción'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Category & Subcategory Badge */}
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <div className="inline-flex flex-col gap-1 items-start">
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFF4EB] text-[#D86A33] border border-[#D86A33]/20">
                                                            {catInfo?.title || product.categoria_slug}
                                                        </span>
                                                        {subcat && (
                                                            <span className="text-[11px] text-gray-400 font-medium">
                                                                {subcat.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Price */}
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <span className="font-black text-base text-[#5F2142]">
                                                        ${product.price.toFixed(2)}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-6 text-right whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            onClick={() => openEditModal(product)}
                                                            className="w-8 h-8 rounded-full border border-gray-200 hover:border-[#D86A33] hover:text-[#D86A33] text-gray-600 flex items-center justify-center transition-all bg-white shadow-2xs hover:scale-105"
                                                            title="Editar Producto"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>

                                                        <button
                                                            onClick={() => setDeleteConfirmId(product.id)}
                                                            className="w-8 h-8 rounded-full border border-red-200 hover:bg-red-50 text-red-600 flex items-center justify-center transition-all bg-white shadow-2xs hover:scale-105"
                                                            title="Eliminar Producto"
                                                        >
                                                            <Trash2 size={14} />
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
            </main>

            {/* Create & Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative my-8">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                            <h3 className="text-xl font-black text-[#5F2142] tracking-tight">
                                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            {/* Product Name */}
                            <div>
                                <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-1.5">
                                    Nombre del Producto *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Ej: Gorro Quirúrgico Flores Boheme"
                                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-1.5">
                                    Descripción
                                </label>
                                <textarea
                                    rows={3}
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="Describe las características, materiales y beneficios..."
                                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium"
                                />
                            </div>

                            {/* Price & Category in 2 columns */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-1.5">
                                        Precio (USD $) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        required
                                        value={formPrice}
                                        onChange={(e) => setFormPrice(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-1.5">
                                        Categoría *
                                    </label>
                                    <select
                                        value={formCategory}
                                        onChange={(e) => handleCategoryChangeInForm(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-2xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium bg-white"
                                    >
                                        <option value="gorros">Gorros Quirúrgicos</option>
                                        <option value="lanyards">Lanyards & Cintas</option>
                                        <option value="accesorios-medicos">Accesorios Médicos</option>
                                        <option value="equipos-medicos">Equipos Médicos</option>
                                        <option value="productos-personalizados">Personalizados</option>
                                    </select>
                                </div>
                            </div>

                            {/* Dynamic Subcategory based on chosen category */}
                            {CATEGORIES[formCategory] && CATEGORIES[formCategory].subcategories.length > 0 && (
                                <div>
                                    <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-1.5">
                                        Subcategoría
                                    </label>
                                    <select
                                        value={formSubcategory || ''}
                                        onChange={(e) => setFormSubcategory(e.target.value ? Number(e.target.value) : undefined)}
                                        className="w-full px-3 py-2.5 rounded-2xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium bg-white"
                                    >
                                        {CATEGORIES[formCategory].subcategories.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Image selector */}
                            <div>
                                <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-1.5">
                                    Imagen del Producto
                                </label>
                                <input
                                    type="text"
                                    value={formImageUrl}
                                    onChange={(e) => setFormImageUrl(e.target.value)}
                                    placeholder="/cat_gorros.png o URL externa"
                                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm font-medium mb-2"
                                />
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <span className="text-[11px] text-gray-400 font-medium">Prediseñadas:</span>
                                    {PRESET_IMAGES.map((img) => (
                                        <button
                                            type="button"
                                            key={img.url}
                                            onClick={() => setFormImageUrl(img.url)}
                                            className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                                                formImageUrl === img.url
                                                    ? 'bg-[#5F2142] text-white border-[#5F2142]'
                                                    : 'bg-[#FFF9F5] text-gray-600 border-gray-200 hover:border-[#D86A33]'
                                            }`}
                                        >
                                            {img.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-6 py-2.5 rounded-full bg-[#5F2142] hover:bg-[#43142e] text-white text-xs font-black transition-all shadow-md shadow-[#5F2142]/20 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Guardando...' : editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                            <Trash2 size={22} />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 mb-1">¿Eliminar producto?</h4>
                        <p className="text-xs text-gray-500 mb-6">
                            Esta acción no se puede deshacer. El producto será removido del catálogo de la tienda.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDeleteProduct(deleteConfirmId)}
                                disabled={actionLoading}
                                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
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
