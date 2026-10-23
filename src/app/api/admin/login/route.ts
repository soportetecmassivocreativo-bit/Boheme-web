import { NextResponse } from 'next/server';
import { 
    createAdminToken, 
    ADMIN_COOKIE_NAME, 
    DEFAULT_ADMIN_EMAIL, 
    DEFAULT_ADMIN_PASSWORD 
} from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        const cleanEmail = (email || '').trim().toLowerCase();
        const expectedEmail = DEFAULT_ADMIN_EMAIL.trim().toLowerCase();

        if (cleanEmail !== expectedEmail || password !== DEFAULT_ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: 'Credenciales inválidas. Verifica tu correo y contraseña.' },
                { status: 401 }
            );
        }

        const session = {
            email: cleanEmail,
            role: 'admin' as const,
            name: 'Administrador BOHEME'
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
