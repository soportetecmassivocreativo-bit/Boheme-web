import { NextResponse } from 'next/server';
import { fetchLiveBcvRate, setCustomBcvRate, formatBs } from '@/lib/bcv';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
    const rate = await fetchLiveBcvRate();
    return NextResponse.json({
        rate,
        formattedRate: formatBs(rate)
    });
}

export async function POST(request: Request) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const newRate = Number(body.rate);
        if (!newRate || newRate <= 0) {
            return NextResponse.json({ error: 'Tasa inválida' }, { status: 400 });
        }

        const updatedRate = setCustomBcvRate(newRate);
        return NextResponse.json({
            success: true,
            rate: updatedRate,
            formattedRate: formatBs(updatedRate)
        });
    } catch {
        return NextResponse.json({ error: 'Error al actualizar tasa' }, { status: 500 });
    }
}
