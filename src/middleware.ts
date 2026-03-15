import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const response = NextResponse.next({ request: { headers: request.headers } });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    for (const { name, value, options } of cookiesToSet) {
                        request.cookies.set(name, value);
                        response.cookies.set(name, value, options);
                    }
                },
            },
        }
    );

    // Verify user is authenticated — block unauthenticated access to /admin routes
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // Return the response with refreshed cookies but redirect to home
        // Admin page.tsx will show LoginPage, but this blocks API/SSR data leaks
        const loginUrl = new URL('/admin', request.url);
        loginUrl.searchParams.set('unauthorized', '1');
        return NextResponse.rewrite(loginUrl, { headers: response.headers });
    }

    return response;
}

// Only run middleware on /admin routes
export const config = {
    matcher: ['/admin/:path*'],
};
