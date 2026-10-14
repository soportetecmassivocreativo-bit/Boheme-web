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
    const { products } = await fetchCategoryProducts(categoria, subcategoriaId);

    return (
        <main className="min-h-screen flex flex-col bg-white pt-20">
            {/* Header Navbar */}
            <Navbar />

            {/* Category Banner */}
            <div className="bg-[#FFF9F5] border-b border-[#FFC99C]/40 py-12 relative overflow-hidden">
                <div className="absolute top-0 right-10 w-72 h-72 bg-[#FFC99C]/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="inline-block washi-tape text-xs font-black text-[#5F2142] px-3.5 py-1 tracking-wider uppercase mb-3 -rotate-1 shadow-sm">
                        ★ COLECCIÓN BOHEME 2025 ★
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#5F2142] capitalize tracking-tight flex items-center gap-3">
                        {category.title}
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
                        {/* "Todos" Filter Link */}
                        <Link
                            href={`/categorias/${categoria}`}
                            className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 border uppercase tracking-wider ${
                                !subcategoriaId
                                    ? 'bg-[#5F2142] text-[#FFC99C] border-[#5F2142] shadow-md -rotate-1 scale-105'
                                    : 'bg-white text-[#5F2142] border-[#FFC99C]/50 hover:border-[#D86A33] hover:text-[#D86A33] hover:scale-105'
                            }`}
                        >
                            ✦ Todos
                        </Link>

                        {/* Dynamic Subcategory Filter Links */}
                        {category.subcategories.map((sub) => {
                            const isActive = subcategoriaId === sub.id;
                            return (
                                <Link
                                    key={sub.id}
                                    href={`/categorias/${categoria}?subcategoria=${sub.id}`}
                                    className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 border uppercase tracking-wider ${
                                        isActive
                                            ? 'bg-[#D86A33] text-white border-[#D86A33] shadow-md rotate-1 scale-105'
                                            : 'bg-white text-[#5F2142] border-[#FFC99C]/50 hover:border-[#D86A33] hover:text-[#D86A33] hover:scale-105'
                                    }`}
                                >
                                    {sub.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Products Grid or Empty Fallback State */}
                {products.length === 0 ? (
                    <div className="text-center py-20 bg-[#FFF9F5] rounded-3xl border-2 border-dashed border-[#FFC99C]/60 shadow-sm space-y-4 max-w-lg mx-auto">
                        <span className="text-4xl">🌸</span>
                        <h2 className="text-xl text-[#5F2142] font-bold">
                            No disponible por el momento
                        </h2>
                        <p className="text-sm text-gray-500 font-light">
                            Estamos preparando nuevos diseños increíbles para esta sección.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <Footer />
        </main>
    );
}
