import { NextResponse } from 'next/server';
import { fetchAllProducts, createProduct } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
    try {
        const products = await fetchAllProducts();
        return NextResponse.json({ success: true, products });
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
