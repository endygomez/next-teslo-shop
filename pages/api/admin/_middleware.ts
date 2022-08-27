import { NextFetchEvent, NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest, event: NextFetchEvent) {

    const session: any = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const { origin } = req.nextUrl;

    if (!session) {
        return new Response(JSON.stringify({
            message: 'No autorizado'
        }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    const validRoles = ['admin', 'super-user', 'SEO'];

    if (!validRoles.includes(session.user.role)) {
        return new Response(JSON.stringify({
            message: 'No autorizado'
        }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    return NextResponse.next();
}
