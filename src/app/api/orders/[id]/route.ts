import { NextResponse } from 'next/server';
import { updateOrderStatus, deleteOrder } from '@/lib/db';
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
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { estado_pago, notas_admin } = body;

        const updated = await updateOrderStatus(id, estado_pago, notas_admin);
        if (!updated) {
            return NextResponse.json({ error: 'Factura/pedido no encontrado.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, order: updated });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Error al actualizar estatus de pago: ' + error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: RouteProps) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;
        const deleted = await deleteOrder(id);

        if (!deleted) {
            return NextResponse.json({ error: 'No se pudo eliminar el registro.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Pedido eliminado con éxito.' });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Error al eliminar pedido: ' + error.message },
            { status: 500 }
        );
    }
}
