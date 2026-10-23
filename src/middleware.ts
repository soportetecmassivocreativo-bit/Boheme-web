import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET || 'boheme-boutique-admin-secret-key-2026-secure-jwt'
);

const ADMIN_COOKIE_NAME = 'boheme_admin_token';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only process /admin routes
    if (!pathname.startsWith('/admin')) {
        return NextResponse.next();
    }

    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    let isAuthenticated = false;

    if (token) {
        try {
            await jwtVerify(token, JWT_SECRET);
            isAuthenticated = true;
        } catch {
            isAuthenticated = false;
        }
    }

    // If on login page and already authenticated, redirect to /admin
    if (pathname === '/admin/login') {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.next();
    }

    // If attempting to access any other /admin route without valid auth, redirect to login
    if (!isAuthenticated) {
        const loginUrl = new URL('/admin/login', request.url);
        // Include return url for after login
        if (pathname !== '/admin') {
            loginUrl.searchParams.set('redirect', pathname);
        }
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*']
};
