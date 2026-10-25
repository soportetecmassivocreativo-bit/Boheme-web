import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getSiteSettingsSync } from '@/lib/settings';

export async function GET() {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    const settings = getSiteSettingsSync();
    const matched = (settings.usuarios || []).find(
        u => (session.id && u.id === session.id) || u.email.trim().toLowerCase() === session.email.trim().toLowerCase()
    );

    if (matched) {
        return NextResponse.json({
            authenticated: true,
            user: {
                id: matched.id,
                email: matched.email,
                role: 'admin',
                userRole: matched.rol,
                name: matched.nombre
            }
        });
    }

    return NextResponse.json({ authenticated: true, user: session });
}
