import { NextResponse } from 'next/server';
import { fetchOrders, createOrder } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { consumeNextInvoiceNumber } from '@/lib/settings';

export async function GET() {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const orders = await fetchOrders();
        return NextResponse.json({ success: true, orders });
    } catch (error: any) {
        return NextResponse.json({ error: 'Error al obtener facturas: ' + error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate basic fields
        if (!body.cliente_nombre || !body.cliente_cedula || !body.monto_usd) {
            return NextResponse.json(
                { error: 'Faltan datos requeridos del cliente o monto.' },
                { status: 400 }
            );
        }

        const invoiceNumber = body.numero_factura || consumeNextInvoiceNumber();
        const newOrder = await createOrder({
            ...body,
            numero_factura: invoiceNumber
        });
        return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Error al registrar pedido: ' + error.message },
            { status: 500 }
        );
    }
}
