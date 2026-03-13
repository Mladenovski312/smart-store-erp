import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({ request: { headers: request.headers } });

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

    // Refresh session cookies — auth gate is handled by admin/page.tsx (shows LoginPage when unauthenticated)
    await supabase.auth.getUser();

    return response;
}

// Only run middleware on /admin routes
export const config = {
    matcher: ['/admin/:path*'],
};
