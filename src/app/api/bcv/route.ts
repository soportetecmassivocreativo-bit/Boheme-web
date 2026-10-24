import { NextResponse } from 'next/server';
import { getLiveBcvData, setCustomBcvRate, formatBs } from '@/lib/bcv';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true' || searchParams.get('refresh') === '1' || searchParams.get('force') === 'true';

    try {
        const data = await getLiveBcvData(forceRefresh);
        return NextResponse.json({
            success: true,
            rate: data.rate,
            exactRate: data.exactRate,
            rawRate: data.rawRate,
            fechaValor: data.fechaValor,
            source: data.source,
            lastUpdated: data.lastUpdated,
            formattedRate: data.formattedRate,
            isManual: data.isManual
        });
    } catch {
        return NextResponse.json({ error: 'Error al consultar tasa BCV' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));

        // Allow on-demand refresh trigger via POST
        if (body.refresh === true) {
            const data = await getLiveBcvData(true);
            return NextResponse.json({
                success: true,
                message: 'Tasa BCV sincronizada exitosamente desde la página oficial',
                rate: data.rate,
                exactRate: data.exactRate,
                rawRate: data.rawRate,
                fechaValor: data.fechaValor,
                source: data.source,
                lastUpdated: data.lastUpdated,
                formattedRate: data.formattedRate
            });
        }

        // Setting a manual rate requires admin authentication
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'No autorizado para modificar la tasa' }, { status: 401 });
        }

        const newRate = Number(body.rate);
        if (!newRate || newRate <= 0) {
            return NextResponse.json({ error: 'Tasa inválida' }, { status: 400 });
        }

        const updatedData = setCustomBcvRate(newRate);
        return NextResponse.json({
            success: true,
            rate: updatedData.rate,
            formattedRate: updatedData.formattedRate,
            fechaValor: updatedData.fechaValor,
            source: updatedData.source,
            lastUpdated: updatedData.lastUpdated
        });
    } catch {
        return NextResponse.json({ error: 'Error al procesar solicitud' }, { status: 500 });
    }
}
