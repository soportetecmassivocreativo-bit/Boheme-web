import { NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings } from '@/lib/settings';
import { getAdminSession, createAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

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

        const response = NextResponse.json({ success: true, settings: updated });

        // If the currently logged-in user was modified, refresh their session cookie seamlessly
        const currentMatched = (updated.usuarios || []).find(
            u => (session.id && u.id === session.id) || u.email.trim().toLowerCase() === session.email.trim().toLowerCase()
        ) || (updated.usuarios || [])[0];

        if (currentMatched) {
            const newToken = await createAdminToken({
                id: currentMatched.id,
                email: currentMatched.email.trim().toLowerCase(),
                role: 'admin',
                userRole: currentMatched.rol,
                name: currentMatched.nombre
            });
            response.cookies.set({
                name: ADMIN_COOKIE_NAME,
                value: newToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            });
        }

        return response;
    } catch {
        return NextResponse.json({ error: 'Error al guardar configuraciones' }, { status: 500 });
    }
}
