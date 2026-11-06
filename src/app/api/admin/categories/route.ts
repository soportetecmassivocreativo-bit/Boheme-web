import { NextRequest, NextResponse } from 'next/server';
import {
    CATEGORIES,
    loadCategoriesFromDisk,
    addCustomSubcategory,
    deleteCustomSubcategory,
    normalizeCategorySlug
} from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    loadCategoriesFromDisk(true);
    return NextResponse.json(
        { categories: CATEGORIES },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const sectionSlug = normalizeCategorySlug(String(body.sectionSlug || 'accesorios-medicos'));
        const name = String(body.name || '').trim();

        if (!name) {
            return NextResponse.json(
                { error: 'El nombre de la categoría es obligatorio.' },
                { status: 400 }
            );
        }

        const created = await addCustomSubcategory(sectionSlug, name);
        if (!created) {
            return NextResponse.json(
                { error: 'No se pudo crear la categoría.' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            subcategory: created,
            subcategories: CATEGORIES[sectionSlug]?.subcategories || [],
            categories: CATEGORIES
        });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Error al crear la categoría.' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const sectionSlug = normalizeCategorySlug(String(body.sectionSlug || 'accesorios-medicos'));
        const subcategoryId = Number(body.subcategoryId);

        if (!subcategoryId) {
            return NextResponse.json(
                { error: 'ID de categoría inválido.' },
                { status: 400 }
            );
        }

        const deleted = await deleteCustomSubcategory(sectionSlug, subcategoryId);
        return NextResponse.json({
            deleted,
            subcategories: CATEGORIES[sectionSlug]?.subcategories || [],
            categories: CATEGORIES
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Error al eliminar la categoría.' },
            { status: 500 }
        );
    }
}
