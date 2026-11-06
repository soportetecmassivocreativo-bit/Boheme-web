import { NextResponse } from 'next/server';
import { fetchOrders, fetchPaginatedOrders, createOrder } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { consumeNextInvoiceNumber } from '@/lib/settings';

export async function GET(request: Request) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const pageParam = searchParams.get('page');
        const limitParam = searchParams.get('limit');
        const statusParam = searchParams.get('status') || undefined;
        const searchParam = searchParams.get('search') || undefined;

        if (pageParam || limitParam) {
            const { orders, pagination } = await fetchPaginatedOrders({
                page: pageParam ? parseInt(pageParam, 10) : 1,
                limit: limitParam ? parseInt(limitParam, 10) : 25,
                status: statusParam,
                search: searchParam
            });
            return NextResponse.json({ success: true, orders, pagination });
        }

        const orders = await fetchOrders();
        return NextResponse.json({
            success: true,
            orders,
            pagination: {
                page: 1,
                limit: orders.length || 1,
                totalItems: orders.length,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false
            }
        });
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
