
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    const publicPaths = ['/login', '/unauthorized', '/api/auth/login', '/api/seed', '/register', '/api/auth/register']; // Added API login, seed, and register to public
    if (publicPaths.includes(pathname)) {

        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const role = payload.role as string;

        // Admin protection
        if (pathname.startsWith('/admin') && role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }

        // Add role header for usage in pages/APIs if needed (optional)
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-user-role', role);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

    } catch (error) {
        console.error('Middleware auth error:', error);
        // Token invalid or expired
        return NextResponse.redirect(new URL('/login', req.url));
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // Match all except static files
};
