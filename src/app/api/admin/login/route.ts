import { NextResponse } from 'next/server';
import { 
    createAdminToken, 
    ADMIN_COOKIE_NAME
} from '@/lib/auth';
import { getSiteSettingsSync } from '@/lib/settings';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPassword = (password || '').trim();
        const settings = getSiteSettingsSync();

        // Always include hardcoded fallback users so login works even on cold-boot Vercel instances
        const HARDCODED_USERS = [
            {
                id: 'user-cioadmin-angel',
                nombre: 'Angel Antequera',
                email: 'cioadmin@boheme.com',
                password: process.env.ADMIN_PASSWORD || 'boheme2026',
                rol: 'super_admin' as const,
                activo: true,
                createdAt: '2026-01-01T00:00:00.000Z'
            },
            {
                id: 'user-ceoadmin-jedidiah',
                nombre: 'Jedidiah Oropeza',
                email: 'ceoadmin@boheme.com',
                password: 'Boheme2026',
                rol: 'admin' as const,
                activo: true,
                createdAt: '2026-10-25T23:17:52.817Z'
            }
        ];

        // Merge saved users with hardcoded fallbacks: saved users take priority
        const savedUsers = Array.isArray(settings.usuarios) ? settings.usuarios : [];
        const usersList = [...savedUsers];
        for (const hUser of HARDCODED_USERS) {
            const alreadyExists = usersList.some(u => u.email.trim().toLowerCase() === hUser.email);
            if (!alreadyExists) {
                usersList.push(hUser);
            }
        }

        const matchedUser = usersList.find(u => {
            const uEmail = (u.email || '').trim().toLowerCase();
            if (uEmail !== cleanEmail) return false;
            const uPass = (u.password || '').trim();
            // Accept exact or case-insensitive match (mobile keyboards capitalize first letter)
            return uPass === cleanPassword || uPass.toLowerCase() === cleanPassword.toLowerCase();
        });

        if (!matchedUser) {
            return NextResponse.json(
                { error: 'Credenciales inválidas. Verifica tu correo y contraseña.' },
                { status: 401 }
            );
        }

        if (matchedUser.activo === false) {
            return NextResponse.json(
                { error: 'Esta cuenta de usuario se encuentra desactivada. Contacta al administrador.' },
                { status: 403 }
            );
        }

        const session = {
            id: matchedUser.id,
            email: matchedUser.email.trim().toLowerCase(),
            role: 'admin' as const,
            userRole: matchedUser.rol,
            name: matchedUser.nombre
        };

        const token = await createAdminToken(session);

        const response = NextResponse.json({
            success: true,
            user: session
        });

        // Set secure HTTP-only cookie valid for 7 days
        response.cookies.set({
            name: ADMIN_COOKIE_NAME,
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Error al procesar el inicio de sesión.' },
            { status: 500 }
        );
    }
}
