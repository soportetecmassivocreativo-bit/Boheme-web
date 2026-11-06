import Navbar from '@/components/ui/Navbar';
import ProductCard from '@/components/ui/ProductCard';
import CatalogSearchBar from '@/components/ui/CatalogSearchBar';
import Footer from '@/components/ui/Footer';
import { fetchCategoryProducts, CATEGORIES, normalizeCategorySlug, GORROS_ESPECIALES_SUBCATEGORIES } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Layers, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{
        categoria: string;
    }>;
    searchParams: Promise<{
        subcategoria?: string;
        especial?: string;
        buscar?: string;
        pagina?: string;
        por_pagina?: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { categoria } = await params;
    const normalized = normalizeCategorySlug(categoria);
    const category = CATEGORIES[normalized];
    if (!category) {
        return {
            title: 'Categoría no encontrada | BOHEME',
        };
    }
    return {
        title: `BOHEME | ${category.title}`,
        description: category.description,
    };
}

export default async function CategoriaPage({ params, searchParams }: PageProps) {
    const { categoria } = await params;
    const { subcategoria, especial, buscar, pagina, por_pagina } = await searchParams;

    const normalizedCategoria = normalizeCategorySlug(categoria);
    const category = CATEGORIES[normalizedCategoria];
    if (!category) {
        notFound();
    }

    const subcategoriaId = subcategoria ? parseInt(subcategoria, 10) : undefined;
    const requestedPage = pagina ? Math.max(1, parseInt(pagina, 10) || 1) : 1;
    const itemsPerPage = 12;

    const {
        paginatedProducts: products,
        totalCategoryProducts,
        subcategoryCounts,
        especialCounts,
        pagination
    } = await fetchCategoryProducts(normalizedCategoria, subcategoriaId, {
        page: requestedPage,
        limit: itemsPerPage,
        especial: especial,
        search: buscar
    });

    const selectedSubcategoryObj = subcategoriaId
        ? category.subcategories.find(s => s.id === subcategoriaId)
        : undefined;

    // Group the current page's products by their specified subcategory
    const groupedBySubcategory = category.subcategories
        .map(sub => ({
            sub,
            items: products.filter(p => p.subcategoria_id === sub.id)
        }))
        .filter(g => g.items.length > 0);

    // Products without a matching subcategory id (fallback group)
    const unassignedProducts = products.filter(
        p => !category.subcategories.some(s => s.id === p.subcategoria_id)
    );

    // Helper to build pagination URLs preserving active subcategory and search query
    const buildPageUrl = (targetPage: number) => {
        const paramsObj = new URLSearchParams();
        if (subcategoriaId) paramsObj.set('subcategoria', String(subcategoriaId));
        if (especial) paramsObj.set('especial', especial);
        if (buscar && buscar.trim()) paramsObj.set('buscar', buscar.trim());
        if (targetPage > 1) paramsObj.set('pagina', String(targetPage));
        const qs = paramsObj.toString();
        return `/categorias/${categoria}${qs ? `?${qs}` : ''}`;
    };

    const startItemIdx = pagination.totalItems === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
    const endItemIdx = Math.min(pagination.totalItems, pagination.page * pagination.limit);

    // Page numbers to display
    const pageNumbers: number[] = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <main className="min-h-screen flex flex-col bg-white pt-20">
            {/* Header Navbar */}
            <Navbar />

            {/* Category Banner */}
            <div className="bg-[#FFF9F5] border-b border-[#FFC99C]/40 py-12 relative overflow-hidden">
                <div className="absolute top-0 right-10 w-72 h-72 bg-[#FFC99C]/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="inline-block washi-tape text-xs font-black text-[#5F2142] px-3.5 py-1 tracking-wider uppercase mb-3 -rotate-1 shadow-sm">
                        ★ COLECCIÓN BOHEME ★
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#5F2142] capitalize tracking-tight flex flex-wrap items-center gap-3">
                        <span>{category.title}</span>
                        {selectedSubcategoryObj && (
                            <span className="text-xl md:text-2xl font-black px-4 py-1 rounded-full bg-[#D86A33] text-white shadow-sm">
                                {selectedSubcategoryObj.id === 74 || selectedSubcategoryObj.id === 75 ? selectedSubcategoryObj.name : `Categoría: ${selectedSubcategoryObj.name}`}
                                {especial ? ` › ${especial}` : ''}
                            </span>
                        )}
                        <span className="text-[#D86A33] text-2xl md:text-3xl">✦</span>
                    </h1>
                    <p className="mt-3 text-base md:text-lg text-[#5F2142]/80 max-w-2xl font-light leading-relaxed">
                        {category.description}
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
                {/* Search Bar by Description & Name in all Ecommerce Sections */}
                <CatalogSearchBar categoryTitle={category.title} initialQuery={buscar || ''} />

                {/* Subcategories Filter Bar (Only shown when the section has subcategories and is not Accesorios / Equipos Médicos / Productos Personalizados) */}
                {normalizedCategoria !== 'accesorios-medicos' && normalizedCategoria !== 'equipos-medicos' && normalizedCategoria !== 'productos-personalizados' && category.subcategories.length > 0 && (
                    <div className="mb-8 overflow-x-auto pb-3 scrollbar-thin">
                        <div className="flex space-x-2.5 items-center">
                            {/* "Todas las Categorías" Filter Link */}
                            <Link
                                href={`/categorias/${categoria}${
                                    (() => {
                                        const p = new URLSearchParams();
                                        if (buscar && buscar.trim()) p.set('buscar', buscar.trim());
                                        const qs = p.toString();
                                        return qs ? `?${qs}` : '';
                                    })()
                                }`}
                                onClick={undefined}
                                className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 border uppercase tracking-wider flex items-center gap-1.5 ${
                                    !subcategoriaId
                                        ? 'bg-[#5F2142] text-[#FFC99C] border-[#5F2142] shadow-md -rotate-1 scale-105'
                                        : 'bg-white text-[#5F2142] border-[#FFC99C]/50 hover:border-[#D86A33] hover:text-[#D86A33] hover:scale-105'
                                }`}
                            >
                                <span>✦ Todas las Categorías</span>
                            </Link>

                            {/* Dynamic Subcategory Filter Links */}
                            {category.subcategories.map((sub) => {
                                const isActive = subcategoriaId === sub.id;
                                const subParams = new URLSearchParams();
                                subParams.set('subcategoria', String(sub.id));
                                if (buscar && buscar.trim()) subParams.set('buscar', buscar.trim());

                                return (
                                    <Link
                                        key={sub.id}
                                        href={`/categorias/${categoria}?${subParams.toString()}`}
                                        className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 border uppercase tracking-wider flex items-center gap-1.5 ${
                                            isActive
                                                ? 'bg-[#D86A33] text-white border-[#D86A33] shadow-md rotate-1 scale-105'
                                                : 'bg-white text-[#5F2142] border-[#FFC99C]/50 hover:border-[#D86A33] hover:text-[#D86A33] hover:scale-105'
                                        }`}
                                    >
                                        <span>{sub.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div className="text-center py-20 bg-[#FFF9F5] rounded-3xl border-2 border-dashed border-[#FFC99C]/60 shadow-sm space-y-4 max-w-lg mx-auto">
                        <span className="text-4xl">🌸</span>
                        <h2 className="text-xl text-[#5F2142] font-bold">
                            No disponible por el momento
                        </h2>
                        <p className="text-sm text-gray-500 font-light">
                            Estamos preparando nuevos diseños increíbles para esta categoría.
                        </p>
                    </div>
                ) : (normalizedCategoria === 'accesorios-medicos' || normalizedCategoria === 'equipos-medicos' || normalizedCategoria === 'productos-personalizados') ? (
                    /* Accesorios, Equipos médicos y Productos personalizados: Todos los productos disponibles juntos en una sola vista */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-14">
                        {groupedBySubcategory.map(({ sub, items }) => (
                            <section key={sub.id} className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#FFC99C]/50">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="px-3.5 py-1 rounded-full bg-[#5F2142] text-[#FFC99C] text-xs font-black uppercase tracking-wider">
                                            {category.title}
                                        </span>
                                        <span className="text-[#D86A33] font-black">›</span>
                                        <h2 className="text-xl sm:text-2xl font-black text-[#5F2142]">
                                            {sub.id === 74 || sub.id === 75 ? (
                                                <span className="text-[#D86A33]">{sub.name}</span>
                                            ) : (
                                                <>Categoría: <span className="text-[#D86A33]">{sub.name}</span></>
                                            )}
                                        </h2>
                                    </div>
                                    <span className="text-xs font-black text-[#5F2142] bg-[#FFF9F5] border border-[#FFC99C] px-3 py-1 rounded-full self-start sm:self-auto">
                                        {subcategoryCounts[sub.id] || items.length} {(subcategoryCounts[sub.id] || items.length) === 1 ? 'producto en categoría' : 'productos en categoría'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                    {items.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </section>
                        ))}

                        {unassignedProducts.length > 0 && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between pb-3 border-b-2 border-[#FFC99C]/50">
                                    <h2 className="text-xl sm:text-2xl font-black text-[#5F2142]">
                                        {category.title} • Categoría General
                                    </h2>
                                    <span className="text-xs font-black text-[#5F2142] bg-[#FFF9F5] border border-[#FFC99C] px-3 py-1 rounded-full">
                                        {unassignedProducts.length} productos
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                    {unassignedProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {/* Bottom Pagination Navigation Bar */}
                {pagination.totalItems > 0 && (
                    <div className="mt-14 pt-8 border-t border-[#FFC99C]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs font-bold text-[#5F2142]">
                            Página <strong className="font-black text-[#D86A33]">{pagination.page}</strong> de{' '}
                            <strong className="font-black">{pagination.totalPages}</strong> ({pagination.totalItems} productos en total)
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {pagination.hasPrevPage ? (
                                <Link
                                    href={buildPageUrl(pagination.page - 1)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-[#FFC99C] text-[#5F2142] hover:bg-[#5F2142] hover:text-white text-xs font-black transition-all shadow-2xs"
                                >
                                    <ChevronLeft size={15} />
                                    <span>Anterior</span>
                                </Link>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gray-100 text-gray-400 text-xs font-bold cursor-not-allowed">
                                    <ChevronLeft size={15} />
                                    <span>Anterior</span>
                                </span>
                            )}

                            {pageNumbers.map(num => (
                                <Link
                                    key={num}
                                    href={buildPageUrl(num)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all border ${
                                        num === pagination.page
                                            ? 'bg-[#D86A33] text-white border-[#D86A33] shadow-md scale-105'
                                            : 'bg-white text-[#5F2142] border-[#FFC99C]/60 hover:border-[#D86A33] hover:text-[#D86A33]'
                                    }`}
                                >
                                    {num}
                                </Link>
                            ))}

                            {pagination.hasNextPage ? (
                                <Link
                                    href={buildPageUrl(pagination.page + 1)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#5F2142] hover:bg-[#D86A33] text-white text-xs font-black transition-all shadow-md"
                                >
                                    <span>Siguiente</span>
                                    <ChevronRight size={15} />
                                </Link>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gray-100 text-gray-400 text-xs font-bold cursor-not-allowed">
                                    <span>Siguiente</span>
                                    <ChevronRight size={15} />
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <Footer />
        </main>
    );
}
