import { NextResponse } from 'next/server';
import { 
    createAdminToken, 
    ADMIN_COOKIE_NAME, 
    DEFAULT_ADMIN_EMAIL, 
    DEFAULT_ADMIN_PASSWORD 
} from '@/lib/auth';
import { getSiteSettingsSync } from '@/lib/settings';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPassword = (password || '').trim();
        const settings = getSiteSettingsSync();
        const usersList = Array.isArray(settings.usuarios) && settings.usuarios.length > 0
            ? settings.usuarios
            : [
                {
                    id: 'user-admin-principal',
                    nombre: 'Administrador Principal BOHEME',
                    email: DEFAULT_ADMIN_EMAIL,
                    password: DEFAULT_ADMIN_PASSWORD,
                    rol: 'super_admin' as const,
                    activo: true,
                    createdAt: '2026-01-01T00:00:00.000Z'
                }
            ];

        // Handle common email aliases/typos (cioadmin vs ceoadmin)
        const normalizeEmailForMatch = (e: string) => {
            const low = (e || '').trim().toLowerCase();
            if (low === 'cioadmin@boheme.com' || low === 'ceoadmin@boheme.com') {
                return 'ceoadmin@boheme.com';
            }
            return low;
        };

        const targetNormalizedEmail = normalizeEmailForMatch(cleanEmail);

        const matchedUser = usersList.find(u => {
            const uEmail = (u.email || '').trim().toLowerCase();
            const uNorm = normalizeEmailForMatch(uEmail);
            const emailMatch = uEmail === cleanEmail || uNorm === targetNormalizedEmail;
            if (!emailMatch) return false;

            const uPass = (u.password || '').trim();
            // Accept exact match or case-insensitive match (for mobile auto-capitalization)
            const passwordMatch = uPass === cleanPassword || uPass.toLowerCase() === cleanPassword.toLowerCase();
            return passwordMatch;
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
