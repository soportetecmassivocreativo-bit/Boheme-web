import { NextResponse } from 'next/server';
import { fetchAllProducts, fetchPaginatedProducts, createProduct } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pageParam = searchParams.get('page');
        const limitParam = searchParams.get('limit');
        const categoriaParam = searchParams.get('categoria') || undefined;
        const subcategoriaParam = searchParams.get('subcategoria');
        const searchParam = searchParams.get('search') || undefined;

        if (pageParam || limitParam) {
            const { products, pagination } = await fetchPaginatedProducts({
                page: pageParam ? parseInt(pageParam, 10) : 1,
                limit: limitParam ? parseInt(limitParam, 10) : 24,
                categoria_slug: categoriaParam,
                subcategoria_id: subcategoriaParam ? parseInt(subcategoriaParam, 10) : undefined,
                search: searchParam
            });
            return NextResponse.json({ success: true, products, pagination });
        }

        const products = await fetchAllProducts();
        return NextResponse.json({
            success: true,
            products,
            pagination: {
                page: 1,
                limit: products.length || 1,
                totalItems: products.length,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Error al obtener los productos: ' + error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
        }

        const body = await request.json();
        const { name, price, categoria_slug } = body;

        if (!name || price === undefined || !categoria_slug) {
            return NextResponse.json(
                { error: 'El nombre, precio y categoría son obligatorios.' },
                { status: 400 }
            );
        }

        const newProduct = await createProduct(body);
        return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Error al crear el producto: ' + error.message },
            { status: 500 }
        );
    }
}
