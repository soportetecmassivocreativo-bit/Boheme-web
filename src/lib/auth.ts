import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET || 'boheme-boutique-admin-secret-key-2026-secure-jwt'
);

export const ADMIN_COOKIE_NAME = 'boheme_admin_token';

// Default Admin credentials (can be customized via environment variables)
export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@boheme.com';
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'boheme2026';

export interface AdminSession {
    email: string;
    role: 'admin';
    name: string;
}

/**
 * Sign a JWT token for the admin session valid for 7 days
 */
export async function createAdminToken(session: AdminSession): Promise<string> {
    return await new SignJWT({ ...session })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);
}

/**
 * Verify an admin JWT token
 */
export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return {
            email: String(payload.email || DEFAULT_ADMIN_EMAIL),
            role: 'admin',
            name: String(payload.name || 'Administrador BOHEME')
        };
    } catch {
        return null;
    }
}

/**
 * Get current admin session from server cookies
 */
export async function getAdminSession(): Promise<AdminSession | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
        if (!token) return null;
        return await verifyAdminToken(token);
    } catch {
        return null;
    }
}
