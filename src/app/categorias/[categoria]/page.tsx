import Navbar from '@/components/ui/Navbar';
import ProductCard from '@/components/ui/ProductCard';
import Footer from '@/components/ui/Footer';
import { fetchCategoryProducts, CATEGORIES } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{
        categoria: string;
    }>;
    searchParams: Promise<{
        subcategoria?: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { categoria } = await params;
    const category = CATEGORIES[categoria];
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
    const { subcategoria } = await searchParams;

    const category = CATEGORIES[categoria];
    if (!category) {
        notFound();
    }

    const subcategoriaId = subcategoria ? parseInt(subcategoria, 10) : undefined;
    const { products: allCategoryProducts } = await fetchCategoryProducts(categoria);
    const products = subcategoriaId
        ? allCategoryProducts.filter(p => p.subcategoria_id === subcategoriaId)
        : allCategoryProducts;

    const selectedSubcategoryObj = subcategoriaId
        ? category.subcategories.find(s => s.id === subcategoriaId)
        : undefined;

    // Group already-created products by their specified subcategory
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
                                Categoría: {selectedSubcategoryObj.name}
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
                {/* Subcategories Filter Bar */}
                <div className="mb-10 overflow-x-auto pb-4 scrollbar-thin">
                    <div className="flex space-x-2.5 items-center">
                        {/* "Todas las Categorías" Filter Link */}
                        <Link
                            href={`/categorias/${categoria}`}
                            className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 border uppercase tracking-wider flex items-center gap-1.5 ${
                                !subcategoriaId
                                    ? 'bg-[#5F2142] text-[#FFC99C] border-[#5F2142] shadow-md -rotate-1 scale-105'
                                    : 'bg-white text-[#5F2142] border-[#FFC99C]/50 hover:border-[#D86A33] hover:text-[#D86A33] hover:scale-105'
                            }`}
                        >
                            <span>✦ Todas las Categorías</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${!subcategoriaId ? 'bg-[#D86A33] text-white' : 'bg-[#FFF9F5] text-[#D86A33]'}`}>
                                {allCategoryProducts.length}
                            </span>
                        </Link>

                        {/* Dynamic Subcategory Filter Links */}
                        {category.subcategories.map((sub) => {
                            const isActive = subcategoriaId === sub.id;
                            const count = allCategoryProducts.filter(p => p.subcategoria_id === sub.id).length;
                            return (
                                <Link
                                    key={sub.id}
                                    href={`/categorias/${categoria}?subcategoria=${sub.id}`}
                                    className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 border uppercase tracking-wider flex items-center gap-1.5 ${
                                        isActive
                                            ? 'bg-[#D86A33] text-white border-[#D86A33] shadow-md rotate-1 scale-105'
                                            : 'bg-white text-[#5F2142] border-[#FFC99C]/50 hover:border-[#D86A33] hover:text-[#D86A33] hover:scale-105'
                                    }`}
                                >
                                    <span>{sub.name}</span>
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/25 text-white' : 'bg-[#FFF9F5] text-[#5F2142]'}`}>
                                        {count}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Products Grid Grouped by Category Specified at Creation or Empty Fallback State */}
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
                                            Categoría: <span className="text-[#D86A33]">{sub.name}</span>
                                        </h2>
                                    </div>
                                    <span className="text-xs font-black text-[#5F2142] bg-[#FFF9F5] border border-[#FFC99C] px-3 py-1 rounded-full self-start sm:self-auto">
                                        {items.length} {items.length === 1 ? 'producto disponible' : 'productos disponibles'}
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
            </div>

            {/* Footer */}
            <Footer />
        </main>
    );
}
