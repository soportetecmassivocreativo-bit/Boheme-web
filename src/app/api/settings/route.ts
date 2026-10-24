import { NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings } from '@/lib/settings';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const settings = await getSiteSettings();
        return NextResponse.json({ success: true, settings });
    } catch {
        return NextResponse.json({ error: 'Error al consultar configuraciones' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const updated = await updateSiteSettings(body);
        return NextResponse.json({ success: true, settings: updated });
    } catch {
        return NextResponse.json({ error: 'Error al guardar configuraciones' }, { status: 500 });
    }
}
