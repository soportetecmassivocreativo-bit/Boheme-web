import { NextResponse } from 'next/server';
import { updateProduct, deleteProduct, fetchProductById } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

interface RouteProps {
    params: Promise<{
        id: string;
    }>;
}

export async function PUT(request: Request, { params }: RouteProps) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const updated = await updateProduct(id, body);
        if (!updated) {
            return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, product: updated });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Error al actualizar el producto: ' + error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: RouteProps) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
        }

        const { id } = await params;
        const deleted = await deleteProduct(id);

        if (!deleted) {
            return NextResponse.json({ error: 'Producto no encontrado o no se pudo eliminar.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Producto eliminado con éxito.' });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Error al eliminar el producto: ' + error.message },
            { status: 500 }
        );
    }
}
