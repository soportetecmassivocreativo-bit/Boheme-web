'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface CatalogSearchBarProps {
    categoryTitle: string;
    initialQuery?: string;
}

export default function CatalogSearchBar({ categoryTitle, initialQuery = '' }: CatalogSearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(initialQuery);

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    useEffect(() => {
        const currentUrlQuery = searchParams.get('buscar') || '';
        if (query.trim() === currentUrlQuery.trim()) return;

        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (query.trim()) {
                params.set('buscar', query.trim());
            } else {
                params.delete('buscar');
            }
            params.delete('pagina'); // Reset to page 1 on new search
            const qs = params.toString();
            router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
        }, 250);

        return () => clearTimeout(timer);
    }, [query, pathname, router, searchParams]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (query.trim()) {
            params.set('buscar', query.trim());
        } else {
            params.delete('buscar');
        }
        params.delete('pagina');
        const qs = params.toString();
        router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    };

    const handleClear = () => {
        setQuery('');
        const params = new URLSearchParams(searchParams.toString());
        params.delete('buscar');
        params.delete('pagina');
        const qs = params.toString();
        router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative flex items-center bg-[#FFF9F5] border-2 border-[#FFC99C]/70 focus-within:border-[#D86A33] focus-within:bg-white rounded-2xl px-4 py-3 shadow-xs transition-all">
                <Search size={18} className="text-[#D86A33] shrink-0 mr-3" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Escribe aquí para buscar por descripción o nombre en ${categoryTitle}...`}
                    className="w-full bg-transparent outline-none text-xs sm:text-sm font-medium text-[#5F2142] placeholder-[#5F2142]/50"
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="ml-2 p-1.5 rounded-full bg-white hover:bg-[#FFF4EB] text-[#5F2142] hover:text-[#D86A33] border border-[#FFC99C] transition-colors shrink-0"
                        title="Limpiar búsqueda"
                    >
                        <X size={14} />
                    </button>
                )}
                <button
                    type="submit"
                    className="ml-2.5 px-4 py-1.5 rounded-xl bg-[#5F2142] hover:bg-[#D86A33] text-white text-xs font-black transition-colors shrink-0 cursor-pointer"
                >
                    Buscar
                </button>
            </div>
        </form>
    );
}
