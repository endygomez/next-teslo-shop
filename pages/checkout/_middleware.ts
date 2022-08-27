import { NextFetchEvent, NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
/* import { jwtVerify } from 'jose'; */

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest, event: NextFetchEvent) {

    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const { origin } = req.nextUrl;

    if (!session) {
        const requestedPage = req.page.name;
        return NextResponse.redirect(`${origin}/auth/login?p=${ requestedPage }`)
    }

    return NextResponse.next();

    /* const { token = '' } = request.cookies;
    try {
        await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET_SEED))
        return NextResponse.next();
    } catch (error) {

        return NextResponse.redirect(new URL(`/auth/login?p=${request.page.name}`, request.url))
    } */
}

// See "Matching Paths" below to learn more
/* export const config = {
    matcher: '/about/:path*',
} */